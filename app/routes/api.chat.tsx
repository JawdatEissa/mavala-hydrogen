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
let getCustomerSession: typeof import("~/lib/auth.server").getCustomerSession;
let getRateLimitIdentifier: typeof import("~/lib/auth.server").getRateLimitIdentifier;

let modulesLoaded = false;
let moduleError: Error | null = null;

async function loadModules() {
  if (modulesLoaded) return;
  try {
    const openaiModule = await import("~/lib/openai.server");
    const supabaseModule = await import("~/lib/supabase.server");
    const authModule = await import("~/lib/auth.server");

    embedText = openaiModule.embedText;
    generateChatResponse = openaiModule.generateChatResponse;
    extractProductHandles = openaiModule.extractProductHandles;
    retrieveChunks = supabaseModule.retrieveChunks;
    checkSemanticCache = supabaseModule.checkSemanticCache;
    upsertCache = supabaseModule.upsertCache;
    incrementCacheHit = supabaseModule.incrementCacheHit;
    getCustomerSession = authModule.getCustomerSession;
    getRateLimitIdentifier = authModule.getRateLimitIdentifier;

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
  // === NAIL REPAIR ===
  "mavala-scientifique-1": {
    handle: "mavala-scientifique-1",
    title: "MAVALA SCIENTIFIQUE",
    price: "$29.95",
    image: "/images/mavala-scientifique-1/01_scientifique.jpg",
    category: "Nail Repair",
  },
  "mava-strong": {
    handle: "mava-strong",
    title: "MAVA-STRONG",
    price: "$29.95",
    image: "/images/mava-strong/01_mava-strong.jpg",
    category: "Nail Repair",
  },
  "mava-flex-1": {
    handle: "mava-flex-1",
    title: "MAVA-FLEX",
    price: "$29.95",
    image: "/images/mava-flex-1/01_mava-flex.jpg",
    category: "Nail Repair",
  },
  "mavala-stop": {
    handle: "mavala-stop",
    title: "MAVALA STOP",
    price: "$24.95",
    image: "/images/mavala-stop/01_stop.jpg",
    category: "Nail Repair",
  },
  mavaderma: {
    handle: "mavaderma",
    title: "MAVADERMA",
    price: "$29.95",
    image: "/images/mavaderma/01_mavaderma.jpg",
    category: "Nail Repair",
  },
  "barrier-base-coat": {
    handle: "barrier-base-coat",
    title: "BARRIER-BASE COAT",
    price: "$19.95",
    image: "/images/barrier-base-coat/01_barrier-base-coat.jpg",
    category: "Nail Repair",
  },

  // === NAIL POLISH REMOVERS ===
  "blue-nail-polish-remover": {
    handle: "blue-nail-polish-remover",
    title: "BLUE NAIL POLISH REMOVER",
    price: "$14.95",
    image: "/images/blue-nail-polish-remover/01_blue-remover.jpg",
    category: "Nail Polish Removers",
  },
  "crystal-nail-polish-remover": {
    handle: "crystal-nail-polish-remover",
    title: "CRYSTAL NAIL POLISH REMOVER",
    price: "$14.95",
    image: "/images/crystal-nail-polish-remover/01_crystal-remover.jpg",
    category: "Nail Polish Removers",
  },
  "pink-nail-polish-remover": {
    handle: "pink-nail-polish-remover",
    title: "PINK NAIL POLISH REMOVER",
    price: "$14.95",
    image: "/images/pink-nail-polish-remover/01_pink-remover.jpg",
    category: "Nail Polish Removers",
  },
  "nail-polish-remover-pads": {
    handle: "nail-polish-remover-pads",
    title: "NAIL POLISH REMOVER PADS",
    price: "$9.95",
    image: "/images/nail-polish-remover-pads/01_pads.jpg",
    category: "Nail Polish Removers",
  },

  // === CUTICLE CARE ===
  "cuticle-oil": {
    handle: "cuticle-oil",
    title: "CUTICLE OIL",
    price: "$24.95",
    image: "/images/cuticle-oil/01_cuticle-oil.jpg",
    category: "Cuticle Care",
  },
  "cuticle-cream": {
    handle: "cuticle-cream",
    title: "CUTICLE CREAM",
    price: "$24.95",
    image: "/images/cuticle-cream/01_cuticle-cream.jpg",
    category: "Cuticle Care",
  },
  "cuticle-remover": {
    handle: "cuticle-remover",
    title: "CUTICLE REMOVER",
    price: "$19.95",
    image: "/images/cuticle-remover/01_cuticle-remover.jpg",
    category: "Cuticle Care",
  },

  // === HAND CARE ===
  "hand-cream": {
    handle: "hand-cream",
    title: "HAND CREAM",
    price: "$24.95",
    image: "/images/hand-cream/01_hand-cream.jpg",
    category: "Hand care",
  },
  "anti-spot-cream-for-hands": {
    handle: "anti-spot-cream-for-hands",
    title: "ANTI-SPOT CREAM FOR HANDS",
    price: "$39.95",
    image: "/images/anti-spot-cream-for-hands/01_anti-spot.jpg",
    category: "Hand care",
  },

  // === SKINCARE ===
  "healthy-glow-serum": {
    handle: "healthy-glow-serum",
    title: "VITALIZING HEALTHY GLOW SERUM",
    price: "$79.95",
    image: "/images/healthy-glow-serum/01_serum.jpg",
    category: "Skincare",
  },
  "featherlight-cream": {
    handle: "featherlight-cream",
    title: "MULTI-MOISTURIZING FEATHERLIGHT CREAM",
    price: "$59.95",
    image: "/images/featherlight-cream/01_cream.jpg",
    category: "Skincare",
  },
  "nourishing-cream": {
    handle: "nourishing-cream",
    title: "NOURISHING CREAM",
    price: "$49.95",
    image: "/images/nourishing-cream/01_cream.jpg",
    category: "Skincare",
  },
  "beauty-enhancing-micro-peel": {
    handle: "beauty-enhancing-micro-peel",
    title: "BEAUTY ENHANCING MICRO-PEEL",
    price: "$49.95",
    image: "/images/beauty-enhancing-micro-peel/01_micro-peel.jpg",
    category: "Skincare",
  },
  "sleeping-mask-baby-skin-radiance": {
    handle: "sleeping-mask-baby-skin-radiance",
    title: "SLEEPING MASK 'BABY SKIN' RADIANCE",
    price: "$59.95",
    image: "/images/sleeping-mask-baby-skin-radiance/01_sleeping-mask.jpg",
    category: "Skincare",
  },
  "chrono-biological-care": {
    handle: "chrono-biological-care",
    title: "CHRONO-BIOLOGICAL CARE",
    price: "$89.95",
    image: "/images/chrono-biological-care/01_chrono.jpg",
    category: "Skincare",
  },
  "anti-age-nutrition-mask": {
    handle: "anti-age-nutrition-mask",
    title: "ANTI-AGE NUTRITION MASK",
    price: "$59.95",
    image: "/images/anti-age-nutrition-mask/01_mask.jpg",
    category: "Skincare",
  },
  "clean-comfort": {
    handle: "clean-comfort",
    title: "CLEAN & COMFORT",
    price: "$39.95",
    image: "/images/clean-comfort/01_clean-comfort.jpg",
    category: "Skincare",
  },
  "aqua-plus-multi-moisturizing": {
    handle: "aqua-plus-multi-moisturizing",
    title: "AQUA PLUS MULTI-MOISTURIZING",
    price: "$49.95",
    image: "/images/aqua-plus-multi-moisturizing/01_aqua-plus.jpg",
    category: "Skincare",
  },

  // === MAKEUP REMOVERS ===
  "bi-phase-make-up-remover": {
    handle: "bi-phase-make-up-remover",
    title: "TOTAL BI-PHASE MAKEUP REMOVER",
    price: "$29.95",
    image: "/images/bi-phase-make-up-remover/01_remover.jpg",
    category: "Makeup Removers",
  },
  "eye-make-up-remover-lotion": {
    handle: "eye-make-up-remover-lotion",
    title: "EYE MAKEUP REMOVER LOTION",
    price: "$24.95",
    image: "/images/eye-make-up-remover-lotion/01_lotion.jpg",
    category: "Makeup Removers",
  },
  "remover-gel": {
    handle: "remover-gel",
    title: "REMOVER GEL",
    price: "$24.95",
    image: "/images/remover-gel/01_gel.jpg",
    category: "Makeup Removers",
  },
  "remover-pads": {
    handle: "remover-pads",
    title: "EYE MAKEUP REMOVER PADS",
    price: "$14.95",
    image: "/images/remover-pads/01_pads.jpg",
    category: "Makeup Removers",
  },

  // === NAIL POLISH COLLECTIONS ===
  "grey-shades": {
    handle: "grey-shades",
    title: "GREY SHADES",
    price: "from $9.95",
    image: "/images/grey-shades/01_grey.jpg",
    category: "Nail Colour",
  },
  "red-shades": {
    handle: "red-shades",
    title: "RED SHADES",
    price: "from $9.95",
    image: "/images/red-shades/01_red.jpg",
    category: "Nail Colour",
  },
  "pink-shades": {
    handle: "pink-shades",
    title: "PINK SHADES",
    price: "from $9.95",
    image: "/images/pink-shades/01_pink.jpg",
    category: "Nail Colour",
  },
  "nude-shades": {
    handle: "nude-shades",
    title: "NUDE SHADES",
    price: "from $9.95",
    image: "/images/nude-shades/01_nude.jpg",
    category: "Nail Colour",
  },
  "blue-shades": {
    handle: "blue-shades",
    title: "BLUE SHADES",
    price: "from $9.95",
    image: "/images/blue-shades/01_blue.jpg",
    category: "Nail Colour",
  },
  "purple-shades": {
    handle: "purple-shades",
    title: "PURPLE SHADES",
    price: "from $9.95",
    image: "/images/purple-shades/01_purple.jpg",
    category: "Nail Colour",
  },

  // === TOP & BASE COATS ===
  "colorfix": {
    handle: "colorfix",
    title: "COLORFIX TOP COAT",
    price: "$21.95",
    image: "/images/colorfix/01_Colorfix.png",
    category: "Manicure Essentials",
  },
  "gel-finish-top-coat": {
    handle: "gel-finish-top-coat",
    title: "GEL FINISH TOP COAT",
    price: "$29.95",
    image: "/images/gel-finish-top-coat/01_gel-finish.jpg",
    category: "Manicure Essentials",
  },
  "star-top-coat": {
    handle: "star-top-coat",
    title: "STAR TOP COAT",
    price: "$29.95",
    image: "/images/star-top-coat/Star+Top+Coat.png",
    category: "Manicure Essentials",
  },

  // === FOOT CARE ===
  "foot-bath-salts": {
    handle: "foot-bath-salts",
    title: "SOOTHING FOOT BATH SALTS",
    price: "$24.95",
    image: "/images/foot-bath-salts/01_salts.jpg",
    category: "Foot Care",
  },
  "repairing-night-cream-for-feet": {
    handle: "repairing-night-cream-for-feet",
    title: "REPAIRING NIGHT CREAM FOR FEET",
    price: "$29.95",
    image: "/images/repairing-night-cream-for-feet/01_cream.jpg",
    category: "Foot Care",
  },
  "conditioning-foot-moisturiser": {
    handle: "conditioning-foot-moisturiser",
    title: "CONDITIONING MOISTURISER FOR FEET",
    price: "$29.95",
    image: "/images/conditioning-foot-moisturiser/01_moisturiser.jpg",
    category: "Foot Care",
  },

  // === EYE BEAUTY ===
  "double-lash": {
    handle: "double-lash",
    title: "DOUBLE-LASH",
    price: "$39.95",
    image: "/images/double-lash/01_double-lash.jpg",
    category: "Eyebrows & Lashes",
  },
  "double-brow": {
    handle: "double-brow",
    title: "DOUBLE-BROW",
    price: "$39.95",
    image: "/images/double-brow/01_double-brow.jpg",
    category: "Eyebrows & Lashes",
  },
  "creamy-mascara": {
    handle: "creamy-mascara",
    title: "CREAMY MASCARA",
    price: "$29.95",
    image: "/images/creamy-mascara/01_mascara.jpg",
    category: "Eyebrows & Lashes",
  },

  // === LIP PRODUCTS ===
  "lip-balm": {
    handle: "lip-balm",
    title: "LIP BALM",
    price: "$14.95",
    image: "/images/lip-balm/01_balm.jpg",
    category: "Lip balm",
  },
  "mavala-lipstick": {
    handle: "mavala-lipstick",
    title: "MAVALA LIPSTICK",
    price: "$29.95",
    image: "/images/mavala-lipstick/01_lipstick.jpg",
    category: "Lip Colour",
  },

  // === MORE SHADE COLLECTIONS ===
  "brown-shades": {
    handle: "brown-shades",
    title: "BROWN SHADES",
    price: "from $9.95",
    image: "/images/brown-shades/01_brown.jpg",
    category: "Nail Colour",
  },
  "coral-shades": {
    handle: "coral-shades",
    title: "CORAL SHADES",
    price: "from $9.95",
    image: "/images/coral-shades/01_coral.jpg",
    category: "Nail Colour",
  },
  "burgundy-shades": {
    handle: "burgundy-shades",
    title: "BURGUNDY SHADES",
    price: "from $9.95",
    image: "/images/burgundy-shades/01_burgundy.jpg",
    category: "Nail Colour",
  },
  "green-shades": {
    handle: "green-shades",
    title: "GREEN SHADES",
    price: "from $9.95",
    image: "/images/green-shades/01_green.jpg",
    category: "Nail Colour",
  },
  "black-shades": {
    handle: "black-shades",
    title: "BLACK SHADES",
    price: "from $9.95",
    image: "/images/black-shades/01_black.jpg",
    category: "Nail Colour",
  },
  "white-shades": {
    handle: "white-shades",
    title: "WHITE SHADES",
    price: "from $9.95",
    image: "/images/white-shades/01_white.jpg",
    category: "Nail Colour",
  },
  "orange-shades": {
    handle: "orange-shades",
    title: "ORANGE SHADES",
    price: "from $9.95",
    image: "/images/orange-shades/01_orange.jpg",
    category: "Nail Colour",
  },
  "gold-shades": {
    handle: "gold-shades",
    title: "GOLD SHADES",
    price: "from $9.95",
    image: "/images/gold-shades/01_gold.jpg",
    category: "Nail Colour",
  },
  "yellow-shades": {
    handle: "yellow-shades",
    title: "YELLOW SHADES",
    price: "from $9.95",
    image: "/images/yellow-shades/01_yellow.jpg",
    category: "Nail Colour",
  },
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

      return json(response);
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

    return json(response);
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
