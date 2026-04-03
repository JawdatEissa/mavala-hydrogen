/**
 * Mavala AI Chatbot - Chat API Route
 *
 * This is a Remix resource route that handles chat requests.
 * It performs:
 * 1. Authentication check (when enabled)
 * 2. Rate limiting
 * 3. Semantic cache lookup
 * 4. Context retrieval from Supabase
 * 5. Response generation with OpenAI
 * 6. Product recommendation extraction
 * 7. Cache storage
 */

import { json, type ActionFunctionArgs } from "@remix-run/node";
import {
  parseChatAnonUses,
  serializeChatAnonUses,
  type ChatAnonPayload,
} from "~/lib/chat-anon-cookie.server";
import {
  getCustomerSession,
  getRateLimitIdentifier,
  type CustomerSession,
} from "~/lib/auth.server";
import type {
  ChatRequest,
  ChatResponse,
  SuggestedProduct,
} from "~/lib/chat.types";
import { CHAT_CONSTANTS } from "~/lib/chat.types";
import { findRelevantProducts } from "~/lib/product-mappings";

// Lazy imports to catch initialization errors
let embedText: typeof import("~/lib/openai.server").embedText;
let generateChatResponse: typeof import("~/lib/openai.server").generateChatResponse;
let extractProductHandles: typeof import("~/lib/openai.server").extractProductHandles;
let retrieveChunks: typeof import("~/lib/supabase.server").retrieveChunks;
let checkSemanticCache: typeof import("~/lib/supabase.server").checkSemanticCache;
let upsertCache: typeof import("~/lib/supabase.server").upsertCache;
let incrementCacheHit: typeof import("~/lib/supabase.server").incrementCacheHit;

let modulesLoaded = false;
let moduleError: Error | null = null;

async function loadModules() {
  if (modulesLoaded) return;
  try {
    const openaiModule = await import("~/lib/openai.server");
    const supabaseModule = await import("~/lib/supabase.server");

    embedText = openaiModule.embedText;
    generateChatResponse = openaiModule.generateChatResponse;
    extractProductHandles = openaiModule.extractProductHandles;
    retrieveChunks = supabaseModule.retrieveChunks;
    checkSemanticCache = supabaseModule.checkSemanticCache;
    upsertCache = supabaseModule.upsertCache;
    incrementCacheHit = supabaseModule.incrementCacheHit;

    modulesLoaded = true;
  } catch (err) {
    moduleError = err as Error;
    console.error("[api/chat] Failed to load modules:", err);
  }
}

// =========================================
// Configuration
// =========================================

// Set to true to require authentication in production
// For development, authentication is bypassed
// TODO: Set back to true once login is integrated
const REQUIRE_AUTH_IN_PRODUCTION = false;

const ANON_CHAT_MAX_TURNS = 5;

async function headersAfterAnonSuccess(
  customerSession: CustomerSession | null,
  anonUses: ChatAnonPayload | null,
): Promise<Headers | undefined> {
  if (customerSession || anonUses === null) {
    return undefined;
  }
  const h = new Headers();
  h.append(
    "Set-Cookie",
    await serializeChatAnonUses(anonUses.count + 1),
  );
  return h;
}

// =========================================
// Rate Limiting (In-Memory)
// =========================================

const rateLimitBuckets = new Map<
  string,
  { timestamp: number; count: number }
>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(identifier);

  if (!bucket || now - bucket.timestamp > CHAT_CONSTANTS.RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(identifier, { timestamp: now, count: 1 });
    return false; // Not rate limited
  }

  bucket.count += 1;
  return bucket.count > CHAT_CONSTANTS.RATE_LIMIT_MAX_CALLS; // Rate limited if over
}

// Note: getClientIdentifier moved to auth.server.ts as getRateLimitIdentifier

// =========================================
// Product Lookup (hardcoded for serverless reliability)
// =========================================

// Key products with their details for recommendations
const PRODUCT_CATALOG: Record<string, SuggestedProduct> = {
  "black-shades": {
    handle: "black-shades",
    title: "BLACK SHADES",
    price: "$11.95",
    image: "/images/black-shades/01_Black.png",
    category: "Nail Colour",
  },
  "blue-shades": {
    handle: "blue-shades",
    title: "BLUE SHADES",
    price: "$11.95",
    image: "/images/blue-shades/01_Blues.png",
    category: "Nail Colour",
  },
  "brown-shades": {
    handle: "brown-shades",
    title: "BROWN SHADES",
    price: "$11.95",
    image: "/images/brown-shades/01_Browns.png",
    category: "Nail Colour",
  },
  "burgundy-shades": {
    handle: "burgundy-shades",
    title: "BURGUNDY SHADES",
    price: "from $11.95",
    image: "/images/burgundy-shades/01_Burgundy.png",
    category: "Nail Colour",
  },
  "coral-shades": {
    handle: "coral-shades",
    title: "CORAL SHADES",
    price: "from $11.95",
    image: "/images/coral-shades/01_Corals.png",
    category: "Nail Colour",
  },
  "cream-colors": {
    handle: "cream-colors",
    title: "CREAM COLOR's",
    price: "$11.95",
    image: "/images/cream-colors/01_Cream.png",
    category: "Nail Colour",
  },
  "cube": {
    handle: "cube",
    title: "4 COLOR'S CUBE",
    price: "$39.95",
    image: "/images/cube/01_Cube+4+Color's+picture+3.png",
    category: "Nail Colour",
  },
  "delightful": {
    handle: "delightful",
    title: "DELIGHTFUL KIT",
    price: "$19.95",
    image: "/images/delightful/01_Delightful+Kits.png",
    category: "Nail Colour",
  },
  "gold-shades": {
    handle: "gold-shades",
    title: "GOLD SHADES",
    price: "$11.95",
    image: "/images/gold-shades/01_Gold.png",
    category: "Nail Colour",
  },
  "green-shades": {
    handle: "green-shades",
    title: "GREEN SHADES",
    price: "$11.95",
    image: "/images/green-shades/01_set-of-3-Green-minis.png",
    category: "Nail Colour",
  },
  "grey-shades": {
    handle: "grey-shades",
    title: "GREY SHADES",
    price: "$11.95",
    image: "/images/grey-shades/01_Greys.png",
    category: "Nail Colour",
  },
  "nude-shades": {
    handle: "nude-shades",
    title: "NUDE SHADES",
    price: "from $11.95",
    image: "/images/nude-shades/01_Nudes.png",
    category: "Nail Colour",
  },
  "orange-shades": {
    handle: "orange-shades",
    title: "ORANGE SHADES",
    price: "$11.95",
    image: "/images/orange-shades/01_Oranges.png",
    category: "Nail Colour",
  },
  "pearl-colors": {
    handle: "pearl-colors",
    title: "PEARL COLOR's",
    price: "$11.95",
    image: "/images/pearl-colors/01_Pearl.png",
    category: "Nail Colour",
  },
  "pink-shades": {
    handle: "pink-shades",
    title: "PINK SHADES",
    price: "from $11.95",
    image: "/images/pink-shades/01_set-of-3-Pink-minis.png",
    category: "Nail Colour",
  },
  "purple-shades": {
    handle: "purple-shades",
    title: "PURPLE SHADES",
    price: "from $11.95",
    image: "/images/purple-shades/01_Purples.png",
    category: "Nail Colour",
  },
  "red-shades": {
    handle: "red-shades",
    title: "RED SHADES",
    price: "from $11.95",
    image: "/images/red-shades/01_Reds.png",
    category: "Nail Colour",
  },
  "sparkly-shades": {
    handle: "sparkly-shades",
    title: "SPARKLY SHADES",
    price: "$11.95",
    image: "/images/sparkly-shades/01_set-of-3-Sparkle-minis.png",
    category: "Nail Colour",
  },
  "star-top-coat": {
    handle: "star-top-coat",
    title: "STAR TOP COAT",
    price: "$29.95",
    image: "/images/star-top-coat/Star+Top+Coat.png",
    category: "Nail Colour",
  },
  "the-basics": {
    handle: "the-basics",
    title: "THE BASICS",
    price: "$11.95",
    image: "/images/the-basics/01_set-of-3-Clear-minis.png",
    category: "Nail Colour",
  },
  "white-shades": {
    handle: "white-shades",
    title: "WHITE SHADES",
    price: "$11.95",
    image: "/images/white-shades/01_Whites.png",
    category: "Nail Colour",
  },
  "yellow-shades": {
    handle: "yellow-shades",
    title: "YELLOW SHADES",
    price: "$11.95",
    image: "/images/yellow-shades/01_set-of-3-Yellow-minis.png",
    category: "Nail Colour",
  },
  "a-rose-by-any-other-name": {
    handle: "a-rose-by-any-other-name",
    title: "A ROSE BY ANY OTHER NAME",
    price: "$39.95",
    image: "/images/a-rose-by-any-other-name/01_A+rose+by+any+other+name+gift+set+front.png",
    category: "Gift Sets",
  },
  "cuticle-care": {
    handle: "cuticle-care",
    title: "CUTICLE CARE KIT",
    price: "$49.95",
    image: "/images/cuticle-care/01_Nail+Care+Kit+Cuticle.png",
    category: "Gift Sets",
  },
  "extra-soft-foot-care": {
    handle: "extra-soft-foot-care",
    title: "EXTRA SOFT FOOT CARE DUO PACK",
    price: "$49.95",
    image: "/images/extra-soft-foot-care/01_Extra+Soft+Foot+Care+Duo.png",
    category: "Gift Sets",
  },
  "french-manicure-kit": {
    handle: "french-manicure-kit",
    title: "FRENCH MANICURE KIT",
    price: "$29.95",
    image: "/images/french-manicure-kit/01_French+Manicure+-+White.png",
    category: "Gift Sets",
  },
  "gift-card": {
    handle: "gift-card",
    title: "GIFT CARD",
    price: "from $25.00",
    image: "/images/gift-card/01_Mavala-Gift-Card.png",
    category: "Gift Sets",
  },
  "healthy-glow-kit": {
    handle: "healthy-glow-kit",
    title: "THE ESSENTIALS HEALTHY GLOW KIT",
    price: "$71.95",
    image: "/images/healthy-glow-kit/01_Essentials+Kit+-+Healthy+Glow.png",
    category: "Gift Sets",
  },
  "lash-party": {
    handle: "lash-party",
    title: "LASH PARTY POUCH",
    price: "$69.95",
    image: "/images/lash-party/01_Lash+Party+Pouch.png",
    category: "Gift Sets",
  },
  "magic-tree": {
    handle: "magic-tree",
    title: "CHRISTMAS MAGIC TREE KIT",
    price: "$39.95",
    image: "/images/magic-tree/01_929293+Swiss+Marmot+Kit.png",
    category: "Gift Sets",
  },
  "mini-colors-collection-set": {
    handle: "mini-colors-collection-set",
    title: "MINI COLOR'S COLLECTION SET",
    price: "$54.95",
    image: "/images/mini-colors-collection-set/01_Coffret+6+vernis+-+So+Future.png",
    category: "Gift Sets",
  },
  "mini-manicure-coffret": {
    handle: "mini-manicure-coffret",
    title: "MINI MANICURE COFFRET",
    price: "$54.95",
    image: "/images/mini-manicure-coffret/01_Mavala+Mini+Manicure+Coffret+small.png",
    category: "Gift Sets",
  },
  "multi-moisturizing-kit": {
    handle: "multi-moisturizing-kit",
    title: "THE ESSENTIALS MULTI-MOISTURIZING KIT",
    price: "$69.95",
    image: "/images/multi-moisturizing-kit/01_Essentials+Kit+-+Multi-moisturizing.png",
    category: "Gift Sets",
  },
  "nutri-elixir-kit-e6dml": {
    handle: "nutri-elixir-kit-e6dml",
    title: "CHRONOBIOLOGY THE SECRET OF YOUTH KIT",
    price: "$74.95",
    image: "/images/nutri-elixir-kit-e6dml/01.webp",
    category: "Gift Sets",
  },
  "perfect-manicure": {
    handle: "perfect-manicure",
    title: "PERFECT MANICURE KIT",
    price: "$49.95",
    image: "/images/perfect-manicure/01_Nail+Care+Kit+Perfect.png",
    category: "Gift Sets",
  },
  "post-artificial-kit": {
    handle: "post-artificial-kit",
    title: "POST ARTIFICIAL NAILS KIT",
    price: "$39.95",
    image: "/images/post-artificial-kit/01_Nail+Care+Kit+Post+artificial.png",
    category: "Gift Sets",
  },
  "professional-manicure-tray": {
    handle: "professional-manicure-tray",
    title: "PROFESSIONAL MANICURE TRAY",
    price: "$399.95",
    image: "/images/professional-manicure-tray/01_Professional+Manicure+Tray.png",
    category: "Gift Sets",
  },
  "anti-spot-cream-for-hands": {
    handle: "anti-spot-cream-for-hands",
    title: "ANTI-SPOT CREAM FOR HANDS",
    price: "$39.95",
    image: "/images/anti-spot-cream-for-hands/01_Anti-Spot-cream-for-hands.png",
    category: "Hand care",
  },
  "cotton-gloves": {
    handle: "cotton-gloves",
    title: "COTTON GLOVES",
    price: "$19.95",
    image: "/images/cotton-gloves/01_Cotton+gloves+square.png",
    category: "Hand care",
  },
  "hand-cream": {
    handle: "hand-cream",
    title: "HAND CREAM",
    price: "$28.95",
    image: "/images/hand-cream/01_Mavala-hand-cream.png",
    category: "Hand care",
  },
  "mava-clear": {
    handle: "mava-clear",
    title: "MAVA-CLEAR",
    price: "from $9.95",
    image: "/images/mava-clear/01_MAVA-CLEAR+Tube.png",
    category: "Hand care",
  },
  "mava-hand-cream-1": {
    handle: "mava-hand-cream-1",
    title: "MAVA+ HAND CREAM",
    price: "$33.95",
    image: "/images/mava-hand-cream-1/01_MAVA+.png",
    category: "Hand care",
  },
  "prebiotic-hand-cream": {
    handle: "prebiotic-hand-cream",
    title: "PREBIOTIC HAND CREAM",
    price: "$30.95",
    image: "/images/prebiotic-hand-cream/01_Prebiotic+Hand+Cream+50ml+A.png",
    category: "Hand care",
  },
  "rejuvinating-mask": {
    handle: "rejuvinating-mask",
    title: "REJUVENATING MASK",
    price: "$59.95",
    image: "/images/rejuvinating-mask/01_9092301A.png",
    category: "Hand care",
  },
  "repairing-night-cream": {
    handle: "repairing-night-cream",
    title: "REPAIRING NIGHT CREAM",
    price: "$79.95",
    image: "/images/repairing-night-cream/01_Repairing+Night+Cream.png",
    category: "Hand care",
  },
  "baby-nail-scissors": {
    handle: "baby-nail-scissors",
    title: "BABY NAIL SCISSORS",
    price: "$59.95",
    image: "/images/baby-nail-scissors/01_71041+Baby+Nail+Scissors+curved.png",
    category: "Manicure Essentials",
  },
  "clippers": {
    handle: "clippers",
    title: "NAIL CLIPPERS",
    price: "$17.95",
    image: "/images/clippers/01_71401+Nail+Clippers.png",
    category: "Manicure Essentials",
  },
  "colorfix": {
    handle: "colorfix",
    title: "COLORFIX",
    price: "from $21.95",
    image: "/images/colorfix/01_Colorfix.png",
    category: "Manicure Essentials",
  },
  "cuticle-nippers": {
    handle: "cuticle-nippers",
    title: "CUTICLE NIPPERS",
    price: "$74.95",
    image: "/images/cuticle-nippers/01_71101+Cuticle+Nippers.png",
    category: "Manicure Essentials",
  },
  "emery-boards": {
    handle: "emery-boards",
    title: "EMERY BOARDS",
    price: "from $4.95",
    image: "/images/emery-boards/01_9090612+Emery+Boards.png",
    category: "Manicure Essentials",
  },
  "french-manicure-stickers": {
    handle: "french-manicure-stickers",
    title: "FRENCH MANICURE STICKER GUIDES",
    price: "$9.95",
    image: "/images/french-manicure-stickers/01_Sticker+guides.png",
    category: "Manicure Essentials",
  },
  "gel-finish-top-coat": {
    handle: "gel-finish-top-coat",
    title: "GEL FINISH TOP COAT",
    price: "$29.95",
    image: "/images/gel-finish-top-coat/00.png",
    category: "Manicure Essentials",
  },
  "hoofstick": {
    handle: "hoofstick",
    title: "HOOFSTICK",
    price: "$10.95",
    image: "/images/hoofstick/01_90655+Hoofstick+copy.png",
    category: "Manicure Essentials",
  },
  "manicure-bowl": {
    handle: "manicure-bowl",
    title: "MANICURE BOWL",
    price: "$49.95",
    image: "/images/manicure-bowl/01_9090653White.png",
    category: "Manicure Essentials",
  },
  "manicure-pill": {
    handle: "manicure-pill",
    title: "MANICURE PILL",
    price: "from $9.95",
    image: "/images/manicure-pill/01_Manicure+Pills.png",
    category: "Manicure Essentials",
  },
  "manicure-sticks": {
    handle: "manicure-sticks",
    title: "MANICURE STICKS",
    price: "from $11.95",
    image: "/images/manicure-sticks/01_9090613+Manicure+sticks.png",
    category: "Manicure Essentials",
  },
  "mavadry": {
    handle: "mavadry",
    title: "MAVADRY",
    price: "from $21.95",
    image: "/images/mavadry/01_Mava-Dry.png",
    category: "Manicure Essentials",
  },
  "mavadry-spray": {
    handle: "mavadry-spray",
    title: "MAVADRY SPRAY",
    price: "$29.95",
    image: "/images/mavadry-spray/01_Mavadry+Spray.png",
    category: "Manicure Essentials",
  },
  "mavala-002-protective-base-coat": {
    handle: "mavala-002-protective-base-coat",
    title: "MAVALA 002 PROTECTIVE BASE COAT",
    price: "from $21.95",
    image: "/images/mavala-002-protective-base-coat/01_Mavala+002+with+silicium.png",
    category: "Manicure Essentials",
  },
  "mini-emery-boards": {
    handle: "mini-emery-boards",
    title: "MINI EMERY BOARDS EMOJI",
    price: "$4.95",
    image: "/images/mini-emery-boards/01_Mini+Emery+Boards+Happy.png",
    category: "Manicure Essentials",
  },
  "nail-brush": {
    handle: "nail-brush",
    title: "NAIL BRUSH",
    price: "$11.95",
    image: "/images/nail-brush/01_Mavala+Nail+Brush.png",
    category: "Manicure Essentials",
  },
  "nail-buffer-kit": {
    handle: "nail-buffer-kit",
    title: "NAIL BUFFER KIT",
    price: "$39.95",
    image: "/images/nail-buffer-kit/01_Nail+Buffer+Kit+Award+winner.png",
    category: "Manicure Essentials",
  },
  "nail-nippers": {
    handle: "nail-nippers",
    title: "NAIL NIPPERS",
    price: "$74.95",
    image: "/images/nail-nippers/01_Nail+Nipper.png",
    category: "Manicure Essentials",
  },
  "nail-white-crayon": {
    handle: "nail-white-crayon",
    title: "NAIL WHITE CRAYON",
    price: "$14.95",
    image: "/images/nail-white-crayon/01.png",
    category: "Manicure Essentials",
  },
  "oil-seal-dryer": {
    handle: "oil-seal-dryer",
    title: "OIL SEAL DRYER",
    price: "$29.95",
    image: "/images/oil-seal-dryer/01_Oil+Seal+Dryer.png",
    category: "Manicure Essentials",
  },
  "pedi-pads": {
    handle: "pedi-pads",
    title: "PEDI-PADS",
    price: "$9.95",
    image: "/images/pedi-pads/01_Pedi-Pads.png",
    category: "Manicure Essentials",
  },
  "ridge-filler": {
    handle: "ridge-filler",
    title: "RIDGE FILLER",
    price: "from $21.95",
    image: "/images/ridge-filler/Ridge+Filler+5ml.png",
    category: "Manicure Essentials",
  },
  "scissors": {
    handle: "scissors",
    title: "NAIL SCISSORS",
    price: "$59.95",
    image: "/images/scissors/01_71001+Nail+Scissors+straight+copy.png",
    category: "Manicure Essentials",
  },
  "straight-cuticle-scissors": {
    handle: "straight-cuticle-scissors",
    title: "CUTICLE SCISSORS",
    price: "$59.95",
    image: "/images/straight-cuticle-scissors/01_9071021+Cuticle+Scissors+Straight.png",
    category: "Manicure Essentials",
  },
  "thinner-for-nail-polish": {
    handle: "thinner-for-nail-polish",
    title: "THINNER FOR NAIL POLISH",
    price: "$18.95",
    image: "/images/thinner-for-nail-polish/01_Thinner.png",
    category: "Manicure Essentials",
  },
  "toenail-nippers": {
    handle: "toenail-nippers",
    title: "TOENAIL NIPPERS",
    price: "$89.95",
    image: "/images/toenail-nippers/01_71301+Toenail+nippers.png",
    category: "Manicure Essentials",
  },
  "hydra-base-coat": {
    handle: "hydra-base-coat",
    title: "HYDRA-BASE COAT",
    price: "$34.95",
    image: "/images/hydra-base-coat/01.webp",
    category: "Nail Repair",
  },
  "mava-flex-1": {
    handle: "mava-flex-1",
    title: "MAVA-FLEX",
    price: "$37.95",
    image: "/images/mava-flex-1/01_Mavaflex.png",
    category: "Nail Repair",
  },
  "mava-strong": {
    handle: "mava-strong",
    title: "MAVA-STRONG",
    price: "$34.95",
    image: "/images/mava-strong/01_Mava-Strong-1.png",
    category: "Nail Repair",
  },
  "mava-white": {
    handle: "mava-white",
    title: "MAVA-WHITE",
    price: "$29.95",
    image: "/images/mava-white/00_Mava-White.png",
    category: "Nail Repair",
  },
  "mavaderma": {
    handle: "mavaderma",
    title: "MAVADERMA",
    price: "from $27.95",
    image: "/images/mavaderma/01_Mavaderma.png",
    category: "Nail Repair",
  },
  "mavala-scientifique-1": {
    handle: "mavala-scientifique-1",
    title: "MAVALA SCIENTIFIQUE",
    price: "from $24.95",
    image: "/images/mavala-scientifique-1/01.png",
    category: "Nail Repair",
  },
  "mavala-scientifique-k": {
    handle: "mavala-scientifique-k",
    title: "MAVALA SCIENTIFIQUE K+",
    price: "from $37.95",
    image: "/images/mavala-scientifique-k/01.png",
    category: "Nail Repair",
  },
  "mavala-stop": {
    handle: "mavala-stop",
    title: "MAVALA STOP",
    price: "from $21.95",
    image: "/images/mavala-stop/01.webp",
    category: "Nail Repair",
  },
  "mavala-stop-pen": {
    handle: "mavala-stop-pen",
    title: "MAVALA STOP PEN",
    price: "$37.95",
    image: "/images/mavala-stop-pen/Mavala+Stop-Pen+A-F-esp.png",
    category: "Nail Repair",
  },
  "nail-shield": {
    handle: "nail-shield",
    title: "NAIL SHIELD",
    price: "from $27.95",
    image: "/images/nail-shield/Nail+Shield+2x5ml.png",
    category: "Nail Repair",
  },
  "nailactan-1": {
    handle: "nailactan-1",
    title: "NAILACTAN",
    price: "$39.95",
    image: "/images/nailactan-1/01.png",
    category: "Nail Repair",
  },
  "nailactan-jar": {
    handle: "nailactan-jar",
    title: "NAILACTAN JAR",
    price: "23.10 €",
    image: "/images/nailactan-jar/01.png",
    category: "Nail Repair",
  },
  "bb-cream": {
    handle: "bb-cream",
    title: "BB CREAM",
    price: "$49.95",
    image: "/images/bb-cream/01_90512A+(with+reflection).png",
    category: "Complexion",
  },
  "dream-foundation": {
    handle: "dream-foundation",
    title: "DREAM FOUNDATION",
    price: "$59.95",
    image: "/images/dream-foundation/01_dream-foundation.png",
    category: "Complexion",
  },
  "kabuki-brush": {
    handle: "kabuki-brush",
    title: "KABUKI BRUSH",
    price: "$39.95",
    image: "/images/kabuki-brush/01_Kabuki+brush+award.png",
    category: "Complexion",
  },
  "magic-powder": {
    handle: "magic-powder",
    title: "MAGIC POWDER",
    price: "$54.95",
    image: "/images/magic-powder/01_Magic+Powder+compact+open+RGB.png",
    category: "Complexion",
  },
  "mavalia-concealer": {
    handle: "mavalia-concealer",
    title: "PERFECT CONCEALER",
    price: "$34.95",
    image: "/images/mavalia-concealer/01_Perfect+Concealer.png",
    category: "Complexion",
  },
  "pressed-powder": {
    handle: "pressed-powder",
    title: "PRESSED POWDER",
    price: "$69.95",
    image: "/images/pressed-powder/01_pressed-powder.png",
    category: "Complexion",
  },
  "serum-foundation": {
    handle: "serum-foundation",
    title: "SERUM FOUNDATION",
    price: "$54.95",
    image: "/images/serum-foundation/01_SERUM+FOUNDATION+Award+Winner.png",
    category: "Complexion",
  },
  "wet-and-dry-powder": {
    handle: "wet-and-dry-powder",
    title: "WET AND DRY POWDER",
    price: "$79.95",
    image: "/images/wet-and-dry-powder/01_Wet-and-Dry-Powder.png",
    category: "Complexion",
  },
  "bi-phase-make-up-remover": {
    handle: "bi-phase-make-up-remover",
    title: "TOTAL BI-PHASE MAKEUP REMOVER",
    price: "$25.95",
    image: "/images/bi-phase-make-up-remover/01_Total+Bi-Phase.png",
    category: "Makeup Removers",
  },
  "caress-toning-lotion": {
    handle: "caress-toning-lotion",
    title: "CARESS TONING LOTION",
    price: "from $19.95",
    image: "/images/caress-toning-lotion/01_9058601F-A.png",
    category: "Makeup Removers",
  },
  "cleansing-milk": {
    handle: "cleansing-milk",
    title: "CARESS CLEANSING MILK",
    price: "$30.95",
    image: "/images/cleansing-milk/01_9058501F-A.png",
    category: "Makeup Removers",
  },
  "eye-make-up-remover-lotion": {
    handle: "eye-make-up-remover-lotion",
    title: "REMOVER LOTION",
    price: "$25.95",
    image: "/images/eye-make-up-remover-lotion/01_Eye-Make-up-remover-lotion.png",
    category: "Makeup Removers",
  },
  "foaming-cleanser": {
    handle: "foaming-cleanser",
    title: "PERFECTING FOAMING CLEANSER",
    price: "from $22.95",
    image: "/images/foaming-cleanser/01_9054201F-A.png",
    category: "Makeup Removers",
  },
  "make-up-remover-cotton-pads": {
    handle: "make-up-remover-cotton-pads",
    title: "MAKE-UP REMOVER COTTON PADS",
    price: "from $7.95",
    image: "/images/make-up-remover-cotton-pads/01_Makeup-remover-cotton-pads.png",
    category: "Makeup Removers",
  },
  "makeup-corrector": {
    handle: "makeup-corrector",
    title: "MAKEUP CORRECTOR PEN",
    price: "$29.95",
    image: "/images/makeup-corrector/01_Makeup+corrector+pen.png",
    category: "Makeup Removers",
  },
  "micellar-water": {
    handle: "micellar-water",
    title: "ALPINE SOFTNESS MICELLAR WATER",
    price: "from $19.95",
    image: "/images/micellar-water/01_Clean+&+Comfort+Micellar+Water+200ml.png",
    category: "Makeup Removers",
  },
  "perfecting-toning-lotion": {
    handle: "perfecting-toning-lotion",
    title: "PERFECTING TONING LOTION",
    price: "from $19.95",
    image: "/images/perfecting-toning-lotion/01_9054401F-A.png",
    category: "Makeup Removers",
  },
  "remover-gel": {
    handle: "remover-gel",
    title: "REMOVER GEL",
    price: "$19.95",
    image: "/images/remover-gel/01_Remover-Gel.png",
    category: "Makeup Removers",
  },
  "remover-pads": {
    handle: "remover-pads",
    title: "EYE MAKEUP REMOVER PADS",
    price: "$29.95",
    image: "/images/remover-pads/01_9093420.png",
    category: "Makeup Removers",
  },
  "bio-colors": {
    handle: "bio-colors",
    title: "BIO COLORS",
    price: "$12.95",
    image: "/images/bio-colors/01_MINI+Bio-Color+Showcard+A.png",
    category: "Nail Polish Collections",
  },
  "blush-colors": {
    handle: "blush-colors",
    title: "BLUSH COLOR'S",
    price: "$11.95",
    image: "/images/blush-colors/01_Blush+Colors+Glosscar+Awards+Full+Showcard.png",
    category: "Nail Polish Collections",
  },
  "bubble-gum": {
    handle: "bubble-gum",
    title: "BUBBLE GUM",
    price: "$11.95",
    image: "/images/bubble-gum/01_Bubble+Gum.png",
    category: "Nail Polish Collections",
  },
  "charming": {
    handle: "charming",
    title: "CHARMING",
    price: "from $11.95",
    image: "/images/charming/01_Charming+Color's+Showcard+S.jpg",
    category: "Nail Polish Collections",
  },
  "chili-spice": {
    handle: "chili-spice",
    title: "CHILI & SPICE",
    price: "$11.95",
    image: "/images/chili-spice/01_Chili+&+Spice+Collection-1.jpg",
    category: "Nail Polish Collections",
  },
  "chill-relax": {
    handle: "chill-relax",
    title: "CHILL & RELAX",
    price: "from $11.95",
    image: "/images/chill-relax/01_Chill+and+Relax+Color's+Showcard+A.png",
    category: "Nail Polish Collections",
  },
  "color-block": {
    handle: "color-block",
    title: "COLOR BLOCK",
    price: "from $11.95",
    image: "/images/color-block/01_Color+Block+Collection+Showcard+A.png",
    category: "Nail Polish Collections",
  },
  "color-vibe": {
    handle: "color-vibe",
    title: "COLOR VIBE",
    price: "from $11.95",
    image: "/images/color-vibe/01_Color+Vibe+Collection+Showcard+A.jpg",
    category: "Nail Polish Collections",
  },
  "cosmic": {
    handle: "cosmic",
    title: "COSMIC",
    price: "from $11.95",
    image: "/images/cosmic/01_Cosmic+Collection+Showcard+A.jpg",
    category: "Nail Polish Collections",
  },
  "cyber-chic": {
    handle: "cyber-chic",
    title: "CYBER CHIC",
    price: "from $11.95",
    image: "/images/cyber-chic/01_Cyber+Chic+showcard.png",
    category: "Nail Polish Collections",
  },
  "dash-splash": {
    handle: "dash-splash",
    title: "DASH & SPLASH",
    price: "from $11.95",
    image: "/images/dash-splash/01_Dash+and+Splash+Collection.png",
    category: "Nail Polish Collections",
  },
  "delight": {
    handle: "delight",
    title: "DELIGHT",
    price: "from $11.95",
    image: "/images/delight/01_Mini+Color+Delight+Showcard+A.jpg",
    category: "Nail Polish Collections",
  },
  "digital-art": {
    handle: "digital-art",
    title: "DIGITAL ART",
    price: "from $11.95",
    image: "/images/digital-art/01_Digital+Art+Colors+Showcard+A.jpg",
    category: "Nail Polish Collections",
  },
  "eclectic-colors": {
    handle: "eclectic-colors",
    title: "ECLECTIC",
    price: "from $11.95",
    image: "/images/eclectic-colors/01_Eclectic+Collection-1.png",
    category: "Nail Polish Collections",
  },
  "first-class": {
    handle: "first-class",
    title: "FIRST CLASS",
    price: "from $11.95",
    image: "/images/first-class/01_First+Class+Collection-1.jpg",
    category: "Nail Polish Collections",
  },
  "flower-magic": {
    handle: "flower-magic",
    title: "FLOWER MAGIC",
    price: "from $11.95",
    image: "/images/flower-magic/01_Flower+Magic+Color's+Showcard+A.jpg",
    category: "Nail Polish Collections",
  },
  "heritage": {
    handle: "heritage",
    title: "HERITAGE",
    price: "from $11.95",
    image: "/images/heritage/01_Heritage+Showcard.jpg",
    category: "Nail Polish Collections",
  },
  "i-love-mini-colors": {
    handle: "i-love-mini-colors",
    title: "I LOVE MINI COLOR'S",
    price: "from $11.95",
    image: "/images/i-love-mini-colors/01_I+_3+Mini+Collection-1.png",
    category: "Nail Polish Collections",
  },
  "iconic": {
    handle: "iconic",
    title: "ICONIC",
    price: "from $11.95",
    image: "/images/iconic/01_Zag+and+Mavala+image+4.jpg",
    category: "Nail Polish Collections",
  },
  "neo-nudes": {
    handle: "neo-nudes",
    title: "NEO NUDES",
    price: "$11.95",
    image: "/images/neo-nudes/01_2.+Post+Neo+Nude+Collection+-+Post+2.jpg",
    category: "Nail Polish Collections",
  },
  "new-look": {
    handle: "new-look",
    title: "NEW LOOK",
    price: "$11.95",
    image: "/images/new-look/01_New+Look+Color's+Showcard.png",
    category: "Nail Polish Collections",
  },
  "pastel-fiesta": {
    handle: "pastel-fiesta",
    title: "PASTEL FIESTA",
    price: "from $11.95",
    image: "/images/pastel-fiesta/01_Pastel+Fiesta+Collection+Showcard+A.jpg",
    category: "Nail Polish Collections",
  },
  "poolside": {
    handle: "poolside",
    title: "POOLSIDE",
    price: "from $11.95",
    image: "/images/poolside/01_Poolside+Color's+Glosscar+Award.jpg",
    category: "Nail Polish Collections",
  },
  "pop-wave": {
    handle: "pop-wave",
    title: "POP WAVE",
    price: "$11.95",
    image: "/images/pop-wave/01_Pop+Wave+Colors+Showcard.jpg",
    category: "Nail Polish Collections",
  },
  "prismatic": {
    handle: "prismatic",
    title: "PRISMATIC",
    price: "from $11.95",
    image: "/images/prismatic/01_Prismatic+Collection+Showcard+A.jpg",
    category: "Nail Polish Collections",
  },
  "retro": {
    handle: "retro",
    title: "RETRO",
    price: "$11.95",
    image: "/images/retro/01_Retro+Color's+Showcard.png",
    category: "Nail Polish Collections",
  },
  "select": {
    handle: "select",
    title: "SELECT",
    price: "from $11.95",
    image: "/images/select/01_Select+Collection-1.png",
    category: "Nail Polish Collections",
  },
  "sofuture": {
    handle: "sofuture",
    title: "SO FUTURE",
    price: "from $11.95",
    image: "/images/sofuture/01_So+Future+Color's+Showcard+A.jpg",
    category: "Nail Polish Collections",
  },
  "solaris": {
    handle: "solaris",
    title: "SOLARIS",
    price: "from $11.95",
    image: "/images/solaris/01_Solaris+Showcard.jpg",
    category: "Nail Polish Collections",
  },
  "tandem": {
    handle: "tandem",
    title: "TANDEM",
    price: "from $11.95",
    image: "/images/tandem/01_Tandem+Color's+Showcard+A.png",
    category: "Nail Polish Collections",
  },
  "terra-topia": {
    handle: "terra-topia",
    title: "TERRA TOPIA COLORS",
    price: "$11.95",
    image: "/images/terra-topia/01_Terra-Topia+Color's+Showcard+A.jpg",
    category: "Nail Polish Collections",
  },
  "timeless": {
    handle: "timeless",
    title: "TIMELESS COLORS",
    price: "from $11.95",
    image: "/images/timeless/01_Timeless+Colors+Showcard+A.jpg",
    category: "Nail Polish Collections",
  },
  "twist-shine": {
    handle: "twist-shine",
    title: "TWIST & SHINE",
    price: "from $11.95",
    image: "/images/twist-shine/01_Twist+&+Shine+Collection+Collection.jpg",
    category: "Nail Polish Collections",
  },
  "whisper": {
    handle: "whisper",
    title: "WHISPER COLORS",
    price: "$11.95",
    image: "/images/whisper/01_Whisper+Collection+Showcard+A.jpg",
    category: "Nail Polish Collections",
  },
  "yummy": {
    handle: "yummy",
    title: "YUMMY COLORS",
    price: "from $11.95",
    image: "/images/yummy/01_Yummy+Colors+Showcard.jpg",
    category: "Nail Polish Collections",
  },
  "blue-nail-polish-remover": {
    handle: "blue-nail-polish-remover",
    title: "BLUE NAIL POLISH REMOVER",
    price: "from $7.95",
    image: "/images/blue-nail-polish-remover/01.png",
    category: "Nail Polish Removers",
  },
  "correcteur-pen": {
    handle: "correcteur-pen",
    title: "CORRECTEUR PEN",
    price: "$25.95",
    image: "/images/correcteur-pen/01_Correcteur-Pen.png",
    category: "Nail Polish Removers",
  },
  "crystal-nail-polish-remover": {
    handle: "crystal-nail-polish-remover",
    title: "CRYSTAL NAIL POLISH REMOVER",
    price: "from $11.95",
    image: "/images/crystal-nail-polish-remover/01_90926.20.png",
    category: "Nail Polish Removers",
  },
  "nail-polish-remover-pads": {
    handle: "nail-polish-remover-pads",
    title: "NAIL POLISH REMOVER PADS",
    price: "$14.95",
    image: "/images/nail-polish-remover-pads/01_Nail-Polish-remover-pads.png",
    category: "Nail Polish Removers",
  },
  "pink-nail-polish-remover": {
    handle: "pink-nail-polish-remover",
    title: "PINK NAIL POLISH REMOVER",
    price: "from $11.95",
    image: "/images/pink-nail-polish-remover/01_Nail+Polish+Remover+Pink+100ml.png",
    category: "Nail Polish Removers",
  },
  "chronobiological-cream": {
    handle: "chronobiological-cream",
    title: "CHRONOBIOLOGICAL DAY CREAM",
    price: "$74.95",
    image: "/images/chronobiological-cream/01_9056101A.png",
    category: "Skincare",
  },
  "chronobiological-serum": {
    handle: "chronobiological-serum",
    title: "CHRONOBIOLOGICAL DAY SERUM",
    price: "$79.95",
    image: "/images/chronobiological-serum/01_9056001A.png",
    category: "Skincare",
  },
  "eye-base": {
    handle: "eye-base",
    title: "EYE BASE",
    price: "$25.95",
    image: "/images/eye-base/01_Eye+Base.png",
    category: "Skincare",
  },
  "eye-contour-double-cream": {
    handle: "eye-contour-double-cream",
    title: "EYE CONTOUR DOUBLE CREAM",
    price: "$42.95",
    image: "/images/eye-contour-double-cream/01_Eye+Contour+Double+Cream+Web.png",
    category: "Skincare",
  },
  "eye-contour-gel": {
    handle: "eye-contour-gel",
    title: "EYE CONTOUR GEL",
    price: "$39.95",
    image: "/images/eye-contour-gel/01_Eye-Contour-Gel.png",
    category: "Skincare",
  },
  "featherlight-cream": {
    handle: "featherlight-cream",
    title: "MULTI-MOISTURIZING FEATHERLIGHT CREAM",
    price: "$59.95",
    image: "/images/featherlight-cream/01_9052201A.png",
    category: "Skincare",
  },
  "healthy-glow-cream": {
    handle: "healthy-glow-cream",
    title: "VITALIZING HEALTHY GLOW DAY CREAM",
    price: "$64.95",
    image: "/images/healthy-glow-cream/01_9053401A.png",
    category: "Skincare",
  },
  "healthy-glow-serum": {
    handle: "healthy-glow-serum",
    title: "VITALIZING HEALTHY GLOW SERUM",
    price: "$71.95",
    image: "/images/healthy-glow-serum/01_9053301A.png",
    category: "Skincare",
  },
  "hydra-matt-fluid": {
    handle: "hydra-matt-fluid",
    title: "PERFECTING HYDRA-MATT FLUID",
    price: "$49.95",
    image: "/images/hydra-matt-fluid/01_9053901A.png",
    category: "Skincare",
  },
  "micro-mist": {
    handle: "micro-mist",
    title: "VITALIZING ALPINE MICRO-MIST",
    price: "from $21.95",
    image: "/images/micro-mist/01_9053601+Skin+Vitality+Micro-Mist.png",
    category: "Skincare",
  },
  "micro-peel": {
    handle: "micro-peel",
    title: "BEAUTY ENHANCING MICRO-PEEL",
    price: "$34.95",
    image: "/images/micro-peel/01_9053701A.png",
    category: "Skincare",
  },
  "multi-moisturizing-serum": {
    handle: "multi-moisturizing-serum",
    title: "MULTI-MOISTURIZING INTENSIVE SERUM",
    price: "$69.95",
    image: "/images/multi-moisturizing-serum/01_9052101A.png",
    category: "Skincare",
  },
  "nutrition-absolute-night-balm": {
    handle: "nutrition-absolute-night-balm",
    title: "ANTI-AGE NUTRITION ABSOLUTE NIGHT BALM",
    price: "$69.95",
    image: "/images/nutrition-absolute-night-balm/01_Nutri-Elixir+Balm+Boxed+Glosscar+Award.png",
    category: "Skincare",
  },
  "nutrition-essential-serum": {
    handle: "nutrition-essential-serum",
    title: "ANTI-AGE NUTRITION ESSENTIAL SERUM",
    price: "$71.95",
    image: "/images/nutrition-essential-serum/01_Nutri-Elixir+Serum+Boxed.png",
    category: "Skincare",
  },
  "nutrition-ultimate-cream": {
    handle: "nutrition-ultimate-cream",
    title: "ANTI-AGE NUTRITION ULTIMATE CREAM",
    price: "$64.95",
    image: "/images/nutrition-ultimate-cream/01_Nutri-Elixir+Cream+Boxed.png",
    category: "Skincare",
  },
  "purifying-mask": {
    handle: "purifying-mask",
    title: "PERFECTING PURIFYING MASK",
    price: "$39.95",
    image: "/images/purifying-mask/01_9054001A.png",
    category: "Skincare",
  },
  "sleeping-mask": {
    handle: "sleeping-mask",
    title: "MULTI-MOISTURIZING SLEEPING MASK",
    price: "$69.95",
    image: "/images/sleeping-mask/01_9052301A.png",
    category: "Skincare",
  },
  "sleeping-mask-baby-skin": {
    handle: "sleeping-mask-baby-skin",
    title: "SLEEPING MASK \"BABY SKIN\" RADIANCE",
    price: "$67.95",
    image: "/images/sleeping-mask-baby-skin/01_9053501A.png",
    category: "Skincare",
  },
  "snow-mask": {
    handle: "snow-mask",
    title: "MULTI-MOISTURIZING SNOW MASK",
    price: "from $49.95",
    image: "/images/snow-mask/01_9052401A.png",
    category: "Skincare",
  },
  "time-release-system": {
    handle: "time-release-system",
    title: "TIME RELEASE SYSTEM NIGHT CARE",
    price: "$84.95",
    image: "/images/time-release-system/01_9055501A.png",
    category: "Skincare",
  },
  "concentrated-foot-bath": {
    handle: "concentrated-foot-bath",
    title: "CONCENTRATED FOOT BATH",
    price: "from $31.95",
    image: "/images/concentrated-foot-bath/01_9077501.png",
    category: "Foot Care",
  },
  "conditioning-foot-moisturiser": {
    handle: "conditioning-foot-moisturiser",
    title: "CONDITIONING MOISTURISER FOR FEET",
    price: "from $34.95",
    image: "/images/conditioning-foot-moisturiser/01_9077801.png",
    category: "Foot Care",
  },
  "deodorising-foot-gel": {
    handle: "deodorising-foot-gel",
    title: "DEODORISING FOOT GEL",
    price: "from $31.95",
    image: "/images/deodorising-foot-gel/01_9077001.png",
    category: "Foot Care",
  },
  "foot-bath-salts": {
    handle: "foot-bath-salts",
    title: "SOOTHING FOOT BATH SALTS",
    price: "$42.95",
    image: "/images/foot-bath-salts/01_9077401.png",
    category: "Foot Care",
  },
  "hydro-repairing-foot-care": {
    handle: "hydro-repairing-foot-care",
    title: "HYDRO-REPAIRING FOOT CARE",
    price: "$34.95",
    image: "/images/hydro-repairing-foot-care/01_9077901A.png",
    category: "Foot Care",
  },
  "refreshing-foot-gel": {
    handle: "refreshing-foot-gel",
    title: "REFRESHING FOOT GEL",
    price: "from $31.95",
    image: "/images/refreshing-foot-gel/01_9077201.png",
    category: "Foot Care",
  },
  "revitalising-leg-emulsion": {
    handle: "revitalising-leg-emulsion",
    title: "REVITALISING EMULSION FOR LEGS",
    price: "from $34.95",
    image: "/images/revitalising-leg-emulsion/01_9078001.png",
    category: "Foot Care",
  },
  "smoothing-foot-scrub": {
    handle: "smoothing-foot-scrub",
    title: "SMOOTHING SCRUB CREAM FOR FEET",
    price: "from $34.95",
    image: "/images/smoothing-foot-scrub/01_9077701.png",
    category: "Foot Care",
  },
  "talcum-powder": {
    handle: "talcum-powder",
    title: "FOOT TALCUM POWDER",
    price: "from $34.95",
    image: "/images/talcum-powder/01_9077101.png",
    category: "Foot Care",
  },
  "cosmetic-pencil-sharpener": {
    handle: "cosmetic-pencil-sharpener",
    title: "COSMETIC PENCIL SHARPENER",
    price: "$19.95",
    image: "/images/cosmetic-pencil-sharpener/01_Crayon.png",
    category: "Eye Colour",
  },
  "duo-satin-eye-shadow-powder": {
    handle: "duo-satin-eye-shadow-powder",
    title: "DUO SATIN EYELID POWDER",
    price: "$36.95",
    image: "/images/duo-satin-eye-shadow-powder/01_small-Eye-Shadow-Powder-DUO-Satin.png",
    category: "Eye Colour",
  },
  "eye-shadow-crayon": {
    handle: "eye-shadow-crayon",
    title: "EYE SHADOW CRAYON",
    price: "$26.95",
    image: "/images/eye-shadow-crayon/01_crayon-lumiere.png",
    category: "Eye Colour",
  },
  "khol-kajal-eye-contour-pencil": {
    handle: "khol-kajal-eye-contour-pencil",
    title: "KHOL-KAJAL EYE CONTOUR PENCIL",
    price: "$19.95",
    image: "/images/khol-kajal-eye-contour-pencil/01_khol-kajal-crayon.png",
    category: "Eye Colour",
  },
  "liquid-eye-liner": {
    handle: "liquid-eye-liner",
    title: "LIQUID EYE LINER",
    price: "$29.95",
    image: "/images/liquid-eye-liner/01_Liquid+Eye+Liner+Web.png",
    category: "Eye Colour",
  },
  "satin-eyelid-powder": {
    handle: "satin-eyelid-powder",
    title: "SATIN EYELID POWDER",
    price: "$29.95",
    image: "/images/satin-eyelid-powder/01_small-Satin-Eyelid-Powder-A.png",
    category: "Eye Colour",
  },
  "silky-eye-shadow-waterproof": {
    handle: "silky-eye-shadow-waterproof",
    title: "SILKY EYE SHADOW WATERPROOF",
    price: "$29.95",
    image: "/images/silky-eye-shadow-waterproof/01_9093700+-+Silky+Eye+Shadows.png",
    category: "Eye Colour",
  },
  "soft-khol-pencil": {
    handle: "soft-khol-pencil",
    title: "SOFT KHOL EYE CONTOUR PENCIL",
    price: "$19.95",
    image: "/images/soft-khol-pencil/01_Mavala+Soft+Khol+Pencils.png",
    category: "Eye Colour",
  },
  "creamy-mascara": {
    handle: "creamy-mascara",
    title: "CREAMY MASCARA",
    price: "$29.95",
    image: "/images/creamy-mascara/01_Creamy+Mascara+A.png",
    category: "Eyebrows & Lashes",
  },
  "double-brow": {
    handle: "double-brow",
    title: "DOUBLE-BROW",
    price: "$39.95",
    image: "/images/double-brow/01_Double-Brow.png",
    category: "Eyebrows & Lashes",
  },
  "double-lash": {
    handle: "double-lash",
    title: "DOUBLE-LASH",
    price: "$39.95",
    image: "/images/double-lash/01_Double-lash.png",
    category: "Eyebrows & Lashes",
  },
  "eyebrow-pencil": {
    handle: "eyebrow-pencil",
    title: "EYEBROW PENCIL",
    price: "$23.95",
    image: "/images/eyebrow-pencil/01_eye-lite.png",
    category: "Eyebrows & Lashes",
  },
  "straight-tweezers": {
    handle: "straight-tweezers",
    title: "GOLD TIP TWEEZERS",
    price: "$29.95",
    image: "/images/straight-tweezers/01_71721+Tweezers+claw+gold+tips+award.png",
    category: "Eyebrows & Lashes",
  },
  "vl-mascara-waterproof": {
    handle: "vl-mascara-waterproof",
    title: "VL MASCARA WATERPROOF",
    price: "$33.95",
    image: "/images/vl-mascara-waterproof/01_VL+Waterproof+Mascara+A.png",
    category: "Eyebrows & Lashes",
  },
  "waterproof-mascara": {
    handle: "waterproof-mascara",
    title: "WATERPROOF MASCARA",
    price: "$29.95",
    image: "/images/waterproof-mascara/01_Waterproof+Mascara+A.png",
    category: "Eyebrows & Lashes",
  },
  "cuticle-cream": {
    handle: "cuticle-cream",
    title: "CUTICLE CREAM",
    price: "$27.95",
    image: "/images/cuticle-cream/01_Cuticle+Cream.png",
    category: "Cuticle Care",
  },
  "cuticle-oil": {
    handle: "cuticle-oil",
    title: "CUTICLE OIL",
    price: "from $21.95",
    image: "/images/cuticle-oil/01_Cuticle+Oil.png",
    category: "Cuticle Care",
  },
  "cuticle-remover": {
    handle: "cuticle-remover",
    title: "CUTICLE REMOVER",
    price: "from $21.95",
    image: "/images/cuticle-remover/Cuticle-remover-5ml.png",
    category: "Cuticle Care",
  },
  "lightening-nail-scrub": {
    handle: "lightening-nail-scrub",
    title: "LIGHTENING SCRUB MASK",
    price: "$34.95",
    image: "/images/lightening-nail-scrub/01.png",
    category: "Cuticle Care",
  },
  "mavapen": {
    handle: "mavapen",
    title: "MAVAPEN",
    price: "$29.95",
    image: "/images/mavapen/Mavapen.png",
    category: "Cuticle Care",
  },
  "lip-balm": {
    handle: "lip-balm",
    title: "LIP BALM",
    price: "$19.95",
    image: "/images/lip-balm/01_Lip-Balm-SPF15.png",
    category: "Lip balm",
  },
  "tinted-lip-balm": {
    handle: "tinted-lip-balm",
    title: "TINTED LIP BALM",
    price: "$17.95",
    image: "/images/tinted-lip-balm/01_Tinted+Lip+Balm+4+shades.png",
    category: "Lip balm",
  },
  "lip-gloss": {
    handle: "lip-gloss",
    title: "LIP GLOSS",
    price: "$25.95",
    image: "/images/lip-gloss/01_90960+Lip+Gloss+Square.png",
    category: "Lip Colour",
  },
  "lip-liner-pencil": {
    handle: "lip-liner-pencil",
    title: "LIP LINER PENCIL",
    price: "$17.95",
    image: "/images/lip-liner-pencil/01_Lip-Liner-Pencil.png",
    category: "Lip Colour",
  },
  "lip-shine": {
    handle: "lip-shine",
    title: "LIP-SHINE LIPSTICK",
    price: "$35.95",
    image: "/images/lip-shine/01_Lip-Shine+with+box.png",
    category: "Lip Colour",
  },
  "mavala-lipstick": {
    handle: "mavala-lipstick",
    title: "MAVALA LIPSTICK",
    price: "$35.95",
    image: "/images/mavala-lipstick/01_Wild+Poppy+Award.png",
    category: "Lip Colour",
  },
  "mavalip-lipstick": {
    handle: "mavalip-lipstick",
    title: "MAVALIP LIPSTICK",
    price: "$25.95",
    image: "/images/mavalip-lipstick/01_Mavalip.png",
    category: "Lip Colour",
  },
  "tanoa-oil-tiare": {
    handle: "tanoa-oil-tiare",
    title: "TANOA HAIR & BODY OIL",
    price: "$29.95",
    image: "/images/tanoa-oil-tiare/01.png",
    category: "Hair & Body",
  },
  "mava-med": {
    handle: "mava-med",
    title: "MAVA-MED",
    price: "$29.95",
    image: "/images/mava-med/01_mava-med.png",
    category: "Nail Care",
  }
};

// All product handles for matching
const productHandlesCache: string[] = Object.keys(PRODUCT_CATALOG);

function getProductHandles(): string[] {
  return productHandlesCache;
}

// Get product details for suggestions
function getProductDetails(handles: string[]): SuggestedProduct[] {
  if (handles.length === 0) return [];

  const suggestions: SuggestedProduct[] = [];

  for (const handle of handles.slice(0, 3)) {
    const product = PRODUCT_CATALOG[handle];
    if (product) {
      suggestions.push(product);
    }
  }

  return suggestions;
}

// Extract product handles from context chunks
function extractProductsFromContext(
  chunks: Array<{ content: string; metadata?: { relatedProducts?: string[] } }>,
): string[] {
  const handles: string[] = [];

  for (const chunk of chunks) {
    // Check metadata for related products
    if (chunk.metadata?.relatedProducts) {
      handles.push(...chunk.metadata.relatedProducts);
    }

    // Also check for [Related Products: ...] in content
    const match = chunk.content.match(/\[Related Products: ([^\]]+)\]/);
    if (match) {
      const products = match[1].split(",").map((p) => p.trim());
      handles.push(...products);
    }
  }

  return [...new Set(handles)]; // Deduplicate
}

// =========================================
// API Handler
// =========================================

export async function action({ request }: ActionFunctionArgs) {
  // Only allow POST
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Load modules lazily (catches initialization errors)
    await loadModules();

    if (moduleError) {
      console.error("[api/chat] Module initialization error:", moduleError);
      return json(
        { error: "Service temporarily unavailable. Please try again later." },
        { status: 503 },
      );
    }

    // Authentication check
    const customerSession = await getCustomerSession(request);

    let anonUses: ChatAnonPayload | null = null;
    if (!customerSession) {
      anonUses = await parseChatAnonUses(request);
      if (anonUses.count >= ANON_CHAT_MAX_TURNS) {
        return json(
          {
            error:
              "You've used your free messages. Sign in or create an account to continue.",
            code: "CHAT_LIMIT_REACHED",
          },
          { status: 403 },
        );
      }
    }

    // In production, require authentication if configured
    if (
      REQUIRE_AUTH_IN_PRODUCTION &&
      process.env.NODE_ENV === "production" &&
      !customerSession
    ) {
      return json(
        {
          error: "Please sign in to use the Mavala Beauty Assistant.",
          code: "AUTH_REQUIRED",
        },
        { status: 401 },
      );
    }

    // Rate limiting - use customer ID if available, otherwise IP
    const rateLimitId = getRateLimitIdentifier(request, customerSession);
    if (checkRateLimit(rateLimitId)) {
      return json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    // Parse request body
    let body: ChatRequest;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const question = body.question?.trim();

    if (!question) {
      return json({ error: "Question is required" }, { status: 400 });
    }

    if (question.length > 500) {
      return json(
        { error: "Question is too long (max 500 characters)" },
        { status: 400 },
      );
    }

    console.log(
      `[api/chat] Processing question: "${question.slice(0, 100)}..."`,
    );

    // Generate question embedding
    const questionEmbedding = await embedText(question);

    if (!questionEmbedding || questionEmbedding.length === 0) {
      console.error("[api/chat] Failed to generate embedding");
      return json(
        { error: "Failed to process your question. Please try again." },
        { status: 500 },
      );
    }

    // Check semantic cache
    const cacheResult = await checkSemanticCache(
      questionEmbedding,
      CHAT_CONSTANTS.CACHE_HIT_THRESHOLD,
    );

    if (cacheResult.hit && cacheResult.id) {
      console.log("[api/chat] Cache HIT - returning cached response");

      // Increment hit counter (non-blocking)
      incrementCacheHit(cacheResult.id).catch(() => {});

      const response: ChatResponse = {
        answer: cacheResult.answer!,
        cached: true,
        suggestedProducts: cacheResult.products || [],
      };

      const anonHeaders = await headersAfterAnonSuccess(
        customerSession,
        anonUses,
      );
      return json(response, anonHeaders ? { headers: anonHeaders } : undefined);
    }

    // Retrieve relevant context
    const { chunks, bestSimilarity, isRelevant } = await retrieveChunks(
      questionEmbedding,
      CHAT_CONSTANTS.MAX_CHUNKS,
      CHAT_CONSTANTS.MIN_SIMILARITY,
    );

    console.log(
      `[api/chat] Retrieved ${
        chunks.length
      } chunks, best similarity: ${bestSimilarity.toFixed(3)}`,
    );

    // Build context blocks for the LLM
    // Even if similarity is low, we still try to help with whatever context we have
    const contextBlocks = chunks.map((chunk) => chunk.content);

    // Log for debugging
    if (!isRelevant) {
      console.log(
        `[api/chat] Low similarity (${bestSimilarity.toFixed(
          3,
        )}) - will still try to help with ${chunks.length} chunks`,
      );
    }

    // Generate response (now returns both answer and LLM-recommended products)
    const { answer, llmRecommendedProducts } = await generateChatResponse(question, contextBlocks);

    // Extract additional product recommendations as fallbacks
    const contextProducts = extractProductsFromContext(chunks);
    const productHandles = getProductHandles();
    const responseProducts = extractProductHandles(answer, productHandles);

    // Also check for products mentioned in the user's question
    const questionProducts = extractProductHandles(question, productHandles);

    // Prioritize: 1) LLM explicitly recommended, 2) Products in AI response, 3) Products in question, 4) Products from context
    // The LLM's explicit recommendations take highest priority
    let allProductHandles: string[] = [];
    
    // First, use LLM-recommended products (highest priority)
    if (llmRecommendedProducts.length > 0) {
      // Validate that the handles exist in our catalog
      const validLLMProducts = llmRecommendedProducts.filter(handle => productHandles.includes(handle));
      allProductHandles = validLLMProducts.slice(0, 3);
      console.log("[api/chat] Using LLM-recommended products:", allProductHandles);
    }
    
    // If LLM didn't provide enough, supplement with extracted products
    if (allProductHandles.length < 3) {
      const remainingSlots = 3 - allProductHandles.length;
      const supplementalProducts = [
        ...new Set([
          ...responseProducts,
          ...questionProducts,
          ...contextProducts,
        ]),
      ].filter(handle => !allProductHandles.includes(handle));
      
      allProductHandles = [
        ...allProductHandles,
        ...supplementalProducts.slice(0, remainingSlots),
      ];
    }

    // If still no products found, use smart keyword mapping
    if (allProductHandles.length === 0) {
      // Use the smart mapping system
      const mappedProducts = findRelevantProducts(question);
      if (mappedProducts.length > 0) {
        allProductHandles = mappedProducts.slice(0, 3);
        console.log(
          "[api/chat] Using keyword-mapped products:",
          allProductHandles,
        );
      } else {
        // Fallback to general popular products
        allProductHandles = [
          "mavala-scientifique-1",
          "cuticle-oil",
          "hand-cream",
        ];
        console.log("[api/chat] Using fallback products:", allProductHandles);
      }
    }

    // Get product details for suggestions
    const suggestedProducts = getProductDetails(allProductHandles);

    // Cache the response (non-blocking)
    upsertCache(question, questionEmbedding, answer, suggestedProducts).catch(
      () => {},
    );

    const response: ChatResponse = {
      answer,
      cached: false,
      suggestedProducts,
    };

    const anonHeaders = await headersAfterAnonSuccess(
      customerSession,
      anonUses,
    );
    return json(response, anonHeaders ? { headers: anonHeaders } : undefined);
  } catch (error) {
    console.error("[api/chat] Unexpected error:", error);

    return json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Something went wrong. Please try again."
            : (error as Error)?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Loader for GET requests (not used for chat, but provides info)
export async function loader() {
  return json({
    service: "Mavala AI Chatbot",
    status: "ok",
    usage: "POST with { question: string }",
  });
}
