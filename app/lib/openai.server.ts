/**
 * Mavala AI Chatbot - OpenAI Client
 *
 * Server-side OpenAI client for embeddings and chat completions.
 * This file should only be imported in server-side code (.server.ts files or loaders/actions).
 */

import OpenAI from "openai";
import { CHAT_CONSTANTS } from "./chat.types";

// =========================================
// Environment Variables
// =========================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn("[OpenAI] Missing OPENAI_API_KEY environment variable");
}

// =========================================
// OpenAI Client
// =========================================

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY || "",
});

// =========================================
// Embedding Functions
// =========================================

/**
 * Generate embedding for a text string
 */
export async function embedText(text: string): Promise<number[]> {
  try {
    // Normalize whitespace
    const normalizedText = text.replace(/\s+/g, " ").trim();

    if (!normalizedText) {
      console.warn("[embedText] Empty text provided");
      return [];
    }

    const response = await openai.embeddings.create({
      model: CHAT_CONSTANTS.EMBEDDING_MODEL,
      input: normalizedText,
    });

    const embedding = response.data[0]?.embedding;

    if (!embedding || embedding.length !== CHAT_CONSTANTS.EMBEDDING_DIMENSIONS) {
      console.error("[embedText] Invalid embedding response");
      return [];
    }

    return embedding;
  } catch (e) {
    console.error("[embedText] Error:", e);
    return [];
  }
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  try {
    // Normalize all texts
    const normalizedTexts = texts
      .map((t) => t.replace(/\s+/g, " ").trim())
      .filter((t) => t.length > 0);

    if (normalizedTexts.length === 0) {
      console.warn("[embedTexts] No valid texts provided");
      return [];
    }

    const response = await openai.embeddings.create({
      model: CHAT_CONSTANTS.EMBEDDING_MODEL,
      input: normalizedTexts,
    });

    return response.data.map((d) => d.embedding);
  } catch (e) {
    console.error("[embedTexts] Error:", e);
    return [];
  }
}

// =========================================
// Chat Completion Functions
// =========================================

/**
 * System prompt for the Mavala beauty assistant
 */
const SYSTEM_PROMPT = `You are Mavala's AI Beauty Assistant. Be concise and helpful.

Guidelines:
- Keep responses SHORT (2-4 sentences max for explanations, then bullet points)
- When asked about nail polish colors, list 3-5 specific shade names (e.g., "217 NEW YORK", "453 CHRISTIANA")
- For product questions, give 2-3 relevant recommendations max
- Use bullet points for lists
- Mention product names in CAPS

For nail polish shade questions:
- List the specific shade names from the context (number + name format)
- Keep it simple: "Here are some grey shades: [list]"
- Don't over-explain - the user wants shade names, not tutorials

Be helpful but brief. No lengthy introductions or closings.

IMPORTANT: At the END of your response, you MUST include a JSON array of recommended product handles.
Format: <<<PRODUCTS:["handle1","handle2","handle3"]>>>
- Include 3 products if possible (minimum 1, maximum 3)
- Use ONLY handles from the Available Products list provided
- Choose the most relevant products based on the user's question and your response
- This array determines which products are shown to the user, so make sure it matches your recommendations`;

/**
 * Available product handles for LLM to recommend
 * This list is provided to the LLM so it knows which products it can recommend
 */
const AVAILABLE_PRODUCT_HANDLES = [
  "black-shades",
  "blue-shades",
  "brown-shades",
  "burgundy-shades",
  "coral-shades",
  "cream-colors",
  "cube",
  "delightful",
  "gold-shades",
  "green-shades",
  "grey-shades",
  "nude-shades",
  "orange-shades",
  "pearl-colors",
  "pink-shades",
  "purple-shades",
  "red-shades",
  "sparkly-shades",
  "star-top-coat",
  "the-basics",
  "white-shades",
  "yellow-shades",
  "a-rose-by-any-other-name",
  "cuticle-care",
  "extra-soft-foot-care",
  "french-manicure-kit",
  "gift-card",
  "healthy-glow-kit",
  "lash-party",
  "magic-tree",
  "mini-colors-collection-set",
  "mini-manicure-coffret",
  "multi-moisturizing-kit",
  "nutri-elixir-kit-e6dml",
  "perfect-manicure",
  "post-artificial-kit",
  "professional-manicure-tray",
  "anti-spot-cream-for-hands",
  "cotton-gloves",
  "hand-cream",
  "mava-clear",
  "mava-hand-cream-1",
  "prebiotic-hand-cream",
  "rejuvinating-mask",
  "repairing-night-cream",
  "baby-nail-scissors",
  "clippers",
  "colorfix",
  "cuticle-nippers",
  "emery-boards",
  "french-manicure-stickers",
  "gel-finish-top-coat",
  "hoofstick",
  "manicure-bowl",
  "manicure-pill",
  "manicure-sticks",
  "mavadry",
  "mavadry-spray",
  "mavala-002-protective-base-coat",
  "mini-emery-boards",
  "nail-brush",
  "nail-buffer-kit",
  "nail-nippers",
  "nail-white-crayon",
  "oil-seal-dryer",
  "pedi-pads",
  "ridge-filler",
  "scissors",
  "straight-cuticle-scissors",
  "thinner-for-nail-polish",
  "toenail-nippers",
  "hydra-base-coat",
  "mava-flex-1",
  "mava-strong",
  "mava-white",
  "mavaderma",
  "mavala-scientifique-1",
  "mavala-scientifique-k",
  "mavala-stop",
  "mavala-stop-pen",
  "nail-shield",
  "nailactan-1",
  "bb-cream",
  "dream-foundation",
  "kabuki-brush",
  "magic-powder",
  "mavalia-concealer",
  "pressed-powder",
  "serum-foundation",
  "wet-and-dry-powder",
  "bi-phase-make-up-remover",
  "caress-toning-lotion",
  "cleansing-milk",
  "eye-make-up-remover-lotion",
  "foaming-cleanser",
  "make-up-remover-cotton-pads",
  "makeup-corrector",
  "micellar-water",
  "perfecting-toning-lotion",
  "remover-gel",
  "remover-pads",
  "bio-colors",
  "blush-colors",
  "bubble-gum",
  "charming",
  "chili-spice",
  "chill-relax",
  "color-block",
  "color-vibe",
  "cosmic",
  "cyber-chic",
  "dash-splash",
  "delight",
  "digital-art",
  "eclectic-colors",
  "first-class",
  "flower-magic",
  "heritage",
  "i-love-mini-colors",
  "iconic",
  "neo-nudes",
  "new-look",
  "pastel-fiesta",
  "poolside",
  "pop-wave",
  "prismatic",
  "retro",
  "select",
  "sofuture",
  "solaris",
  "tandem",
  "terra-topia",
  "timeless",
  "twist-shine",
  "whisper",
  "yummy",
  "blue-nail-polish-remover",
  "correcteur-pen",
  "crystal-nail-polish-remover",
  "nail-polish-remover-pads",
  "pink-nail-polish-remover",
  "chronobiological-cream",
  "chronobiological-serum",
  "eye-base",
  "eye-contour-double-cream",
  "eye-contour-gel",
  "featherlight-cream",
  "healthy-glow-cream",
  "healthy-glow-serum",
  "hydra-matt-fluid",
  "micro-mist",
  "micro-peel",
  "multi-moisturizing-serum",
  "nutrition-absolute-night-balm",
  "nutrition-essential-serum",
  "nutrition-ultimate-cream",
  "purifying-mask",
  "sleeping-mask",
  "sleeping-mask-baby-skin",
  "snow-mask",
  "time-release-system",
  "concentrated-foot-bath",
  "conditioning-foot-moisturiser",
  "deodorising-foot-gel",
  "foot-bath-salts",
  "hydro-repairing-foot-care",
  "refreshing-foot-gel",
  "revitalising-leg-emulsion",
  "smoothing-foot-scrub",
  "talcum-powder",
  "cosmetic-pencil-sharpener",
  "duo-satin-eye-shadow-powder",
  "eye-shadow-crayon",
  "khol-kajal-eye-contour-pencil",
  "liquid-eye-liner",
  "satin-eyelid-powder",
  "silky-eye-shadow-waterproof",
  "soft-khol-pencil",
  "creamy-mascara",
  "double-brow",
  "double-lash",
  "eyebrow-pencil",
  "straight-tweezers",
  "vl-mascara-waterproof",
  "waterproof-mascara",
  "cuticle-cream",
  "cuticle-oil",
  "cuticle-remover",
  "lightening-nail-scrub",
  "mavapen",
  "lip-balm",
  "tinted-lip-balm",
  "lip-gloss",
  "lip-liner-pencil",
  "lip-shine",
  "mavala-lipstick",
  "mavalip-lipstick",
  "tanoa-oil-tiare",
  "mava-med"
]

/**
 * Default product knowledge fallback when database has no matches
 */
const FALLBACK_KNOWLEDGE = `
Mavala Key Products:
- MAVALA SCIENTIFIQUE: Penetrating nail hardener for weak, brittle nails
- MAVA-STRONG: Fortifies soft, delicate nails  
- CUTICLE OIL: Nourishes and softens cuticles
- HAND CREAM: Moisturizes and protects hands
- HEALTHY GLOW SERUM: Vitalizing serum for radiant skin
- FEATHERLIGHT CREAM: Multi-moisturizing cream for dry skin
- MAVALA STOP: Bitter solution to stop nail biting
- HYDRA-BASE COAT: Anti-drying base for dry, brittle and/or devitalized nails (Barrier-Base is now Hydra-Base)

Mavala Nail Polish Shades by Color:
- GREY/SILVER: 217 NEW YORK, 453 CHRISTIANA, 123 EDINBURGH, 151 MARRON GLACÉ, 402 DETROIT
- RED: 2 MADRID, 3 PARIS, 50 TORONTO, 185 MOSCOW, 306 CUZCO
- PINK: 168 SOUTH BEACH PINK, 172 VEGAS PINK, 157 BLUSH PINK, 303 BALI
- NUDE/BEIGE: 12 BERLIN, 165 VANILLA, 366 GLAMOUR, 395 RIMINI
- BLUE: 115 SKY BLUE, 158 SMOKY BLUE, 167 CYCLADES BLUE, 181 BLUE MINT
- PURPLE: 239 BARCELONA, 467 WHISPERWOOD, 152 MAUVE CENDRÉ
`;

/**
 * Check if question is about nail polish colors/shades
 */
function isShadeQuestion(question: string): boolean {
  const lowerQ = question.toLowerCase();
  return (
    (lowerQ.includes('shade') || lowerQ.includes('color') || lowerQ.includes('colour')) &&
    (lowerQ.includes('nail') || lowerQ.includes('polish'))
  ) || lowerQ.includes('grey') || lowerQ.includes('gray') || lowerQ.includes('red nail') ||
    lowerQ.includes('pink nail') || lowerQ.includes('blue nail') || lowerQ.includes('nude nail');
}

/**
 * Build the prompt with context
 */
function buildPrompt(question: string, contextBlocks: string[]): string {
  // If we have context, use it; otherwise use fallback knowledge
  let contextSection =
    contextBlocks.length > 0
      ? contextBlocks.map((b, i) => `Context ${i + 1}:\n${b}`).join("\n\n")
      : `No specific product matches found. Use this general knowledge:\n${FALLBACK_KNOWLEDGE}`;
  
  // If it's a shade question and the context doesn't seem to have shade info, add fallback
  if (isShadeQuestion(question) && !contextSection.toLowerCase().includes('shade')) {
    contextSection += `\n\nAdditional shade information:\n${FALLBACK_KNOWLEDGE}`;
  }

  // Create product handle reference for the LLM
  const productHandleReference = `
### Available Products (use these handles for recommendations)
Nail Repair: mavala-scientifique-1, mava-strong, mava-flex-1, mavala-stop, mavaderma, hydra-base-coat
Nail Polish Removers: blue-nail-polish-remover, crystal-nail-polish-remover, pink-nail-polish-remover, nail-polish-remover-pads
Cuticle Care: cuticle-oil, cuticle-cream, cuticle-remover
Hand Care: hand-cream, anti-spot-cream-for-hands
Skincare: healthy-glow-serum, featherlight-cream, micro-peel, sleeping-mask-baby-skin, chronobiological-cream, nutrition-ultimate-cream, multi-moisturizing-serum, sleeping-mask, hydra-matt-fluid, purifying-mask, perfecting-toning-lotion
Makeup Removers: bi-phase-make-up-remover, eye-make-up-remover-lotion, remover-gel, remover-pads
Nail Polish: grey-shades, red-shades, pink-shades, nude-shades, blue-shades, purple-shades, brown-shades, coral-shades, burgundy-shades, green-shades, black-shades, white-shades, orange-shades, gold-shades, yellow-shades
Top & Base Coats: colorfix, gel-finish-top-coat, star-top-coat
Foot Care: foot-bath-salts, repairing-night-cream-for-feet, conditioning-foot-moisturiser
Eye Beauty: double-lash, double-brow, creamy-mascara
Lip Products: lip-balm, mavala-lipstick`;

  return `### User Question
${question.trim()}

### Available Context
${contextSection}
${productHandleReference}

### Instructions
- Answer the question helpfully using the context above
- ALWAYS recommend specific Mavala products when relevant
- Mention product names in CAPS (e.g., MAVALA SCIENTIFIQUE)
- Be friendly, helpful, and concise
- For nail concerns: suggest nail treatments from the context
- For skin concerns: suggest skincare products from the context
- REMEMBER: End your response with <<<PRODUCTS:["handle1","handle2","handle3"]>>> using handles from the Available Products list above`;
}

/**
 * Response type for chat generation with product recommendations
 */
export interface ChatGenerationResult {
  answer: string;
  llmRecommendedProducts: string[];
}

/**
 * Parse LLM-recommended products from the response
 * Extracts the <<<PRODUCTS:[...]>>> array from the end of the response
 */
function parseLLMRecommendedProducts(rawResponse: string): { cleanAnswer: string; products: string[] } {
  // Match the products array pattern: <<<PRODUCTS:["handle1","handle2"]>>>
  const productPattern = /<<<PRODUCTS:\s*(\[[^\]]*\])\s*>>>/;
  const match = rawResponse.match(productPattern);
  
  let products: string[] = [];
  let cleanAnswer = rawResponse;
  
  if (match) {
    // Remove the products marker from the answer
    cleanAnswer = rawResponse.replace(productPattern, '').trim();
    
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        // Validate that products are valid handles and limit to 3
        products = parsed
          .filter((p): p is string => typeof p === 'string' && p.length > 0)
          .slice(0, 3);
        console.log("[parseLLMRecommendedProducts] Extracted products:", products);
      }
    } catch (e) {
      console.warn("[parseLLMRecommendedProducts] Failed to parse products JSON:", e);
    }
  } else {
    console.log("[parseLLMRecommendedProducts] No products marker found in response");
  }
  
  return { cleanAnswer, products };
}

/**
 * Generate a chat response with product recommendations
 */
export async function generateChatResponse(
  question: string,
  contextBlocks: string[]
): Promise<ChatGenerationResult> {
  try {
    const prompt = buildPrompt(question, contextBlocks);

    const response = await openai.chat.completions.create({
      model: CHAT_CONSTANTS.CHAT_MODEL_PRIMARY,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: CHAT_CONSTANTS.MAX_OUTPUT_TOKENS,
      temperature: CHAT_CONSTANTS.TEMPERATURE,
    });

    const rawAnswer = response.choices[0]?.message?.content?.trim();

    if (!rawAnswer) {
      console.warn("[generateChatResponse] Empty response from model");
      return {
        answer: "I apologize, but I couldn't generate a response. Please try rephrasing your question.",
        llmRecommendedProducts: [],
      };
    }

    // Parse the products from the response
    const { cleanAnswer, products } = parseLLMRecommendedProducts(rawAnswer);

    return {
      answer: cleanAnswer,
      llmRecommendedProducts: products,
    };
  } catch (e) {
    console.error("[generateChatResponse] Error:", e);

    // Try fallback model
    try {
      const prompt = buildPrompt(question, contextBlocks);

      const response = await openai.chat.completions.create({
        model: CHAT_CONSTANTS.CHAT_MODEL_FALLBACK,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: CHAT_CONSTANTS.MAX_OUTPUT_TOKENS,
        temperature: CHAT_CONSTANTS.TEMPERATURE,
      });

      const rawAnswer = response.choices[0]?.message?.content?.trim() ||
        "I apologize, but I couldn't generate a response. Please try again.";
      
      const { cleanAnswer, products } = parseLLMRecommendedProducts(rawAnswer);

      return {
        answer: cleanAnswer,
        llmRecommendedProducts: products,
      };
    } catch (fallbackError) {
      console.error("[generateChatResponse] Fallback also failed:", fallbackError);
      throw new Error("AI service temporarily unavailable");
    }
  }
}

// =========================================
// Product Extraction
// =========================================

// Map of product names/titles to their handles for better matching
const PRODUCT_NAME_TO_HANDLE: Record<string, string> = {
  // Nail Repair
  "mavala scientifique": "mavala-scientifique-1",
  "scientifique": "mavala-scientifique-1",
  "mava strong": "mava-strong",
  "mava-strong": "mava-strong",
  "mava flex": "mava-flex-1",
  "mava-flex": "mava-flex-1",
  "mavala stop": "mavala-stop",
  "mavaderma": "mavaderma",
  "hydra base coat": "hydra-base-coat",
  "hydra-base": "hydra-base-coat",
  "barrier base coat": "hydra-base-coat",
  
  // Nail Polish Removers
  "blue nail polish remover": "blue-nail-polish-remover",
  "blue remover": "blue-nail-polish-remover",
  "crystal nail polish remover": "crystal-nail-polish-remover",
  "crystal remover": "crystal-nail-polish-remover",
  "pink nail polish remover": "pink-nail-polish-remover",
  "pink remover": "pink-nail-polish-remover",
  "nail polish remover pads": "nail-polish-remover-pads",
  "remover pads": "nail-polish-remover-pads",
  
  // Cuticle Care
  "cuticle oil": "cuticle-oil",
  "cuticle cream": "cuticle-cream",
  "cuticle remover": "cuticle-remover",
  
  // Hand Care
  "hand cream": "hand-cream",
  "anti spot cream": "anti-spot-cream-for-hands",
  "anti-spot cream": "anti-spot-cream-for-hands",
  
  // Skincare
  "healthy glow serum": "healthy-glow-serum",
  "healthy glow": "healthy-glow-serum",
  "featherlight cream": "featherlight-cream",
  "featherlight": "featherlight-cream",
  "micro peel": "micro-peel",
  "micro-peel": "micro-peel",
  "beauty enhancing micro peel": "micro-peel",
  "beauty enhancing micro-peel": "micro-peel",
  "sleeping mask baby skin": "sleeping-mask-baby-skin",
  "baby skin": "sleeping-mask-baby-skin",
  "baby skin radiance": "sleeping-mask-baby-skin",
  "sleeping mask": "sleeping-mask",
  "multi moisturizing sleeping mask": "sleeping-mask",
  "chrono biological": "chronobiological-cream",
  "chrono-biological": "chronobiological-cream",
  "chronobiological cream": "chronobiological-cream",
  "chronobiological day cream": "chronobiological-cream",
  "anti age nutrition": "nutrition-ultimate-cream",
  "anti-age nutrition": "nutrition-ultimate-cream",
  "nutrition ultimate cream": "nutrition-ultimate-cream",
  "nutrition cream": "nutrition-ultimate-cream",
  "multi moisturizing serum": "multi-moisturizing-serum",
  "intensive serum": "multi-moisturizing-serum",
  "hydra matt fluid": "hydra-matt-fluid",
  "hydra-matt fluid": "hydra-matt-fluid",
  "hydra matt": "hydra-matt-fluid",
  "mattifying fluid": "hydra-matt-fluid",
  "purifying mask": "purifying-mask",
  "pore detox": "purifying-mask",
  "toning lotion": "perfecting-toning-lotion",
  "perfecting toning lotion": "perfecting-toning-lotion",
  
  // Makeup Removers
  "bi phase makeup remover": "bi-phase-make-up-remover",
  "bi-phase makeup remover": "bi-phase-make-up-remover",
  "eye makeup remover lotion": "eye-make-up-remover-lotion",
  "eye make up remover": "eye-make-up-remover-lotion",
  "remover gel": "remover-gel",
  "eye makeup remover pads": "remover-pads",
  
  // Nail Polish
  "mini color": "i-love-mini-colors",
  "mini colors": "i-love-mini-colors",
  "5ml": "i-love-mini-colors",
  
  // Top & Base Coats
  "colorfix": "colorfix",
  "gel finish top coat": "gel-finish-top-coat",
  
  // Foot Care
  "foot bath salts": "foot-bath-salts",
  "repairing night cream for feet": "repairing-night-cream-for-feet",
};

// Color to shade collection mapping
const COLOR_TO_SHADE_COLLECTION: Record<string, string> = {
  "grey": "grey-shades",
  "gray": "grey-shades",
  "silver": "grey-shades",
  "red": "red-shades",
  "pink": "pink-shades",
  "nude": "nude-shades",
  "beige": "nude-shades",
  "blue": "blue-shades",
  "purple": "purple-shades",
  "violet": "purple-shades",
  "mauve": "purple-shades",
  "green": "green-shades",
  "brown": "brown-shades",
  "burgundy": "burgundy-shades",
  "coral": "coral-shades",
  "orange": "orange-shades",
  "gold": "gold-shades",
  "yellow": "yellow-shades",
  "black": "black-shades",
  "white": "white-shades",
};

// Known nail polish shade names (partial list for detection)
const SHADE_NAMES = [
  "new york", "christiana", "edinburgh", "detroit", "marron glacé",
  "madrid", "paris", "toronto", "moscow", "cuzco", "ankara", "beijing",
  "south beach pink", "vegas pink", "blush pink", "bali", "berlin",
  "vanilla", "glamour", "rimini", "sky blue", "smoky blue", "cyclades blue",
  "blue mint", "barcelona", "whisperwood", "mauve cendré", "st tropez",
  "hong kong", "cairo", "baghdad", "athens", "hanoi", "riyadh", "minsk",
  "bruxelles", "inverness", "sirocco city", "tbilisi", "basel", "saigon"
];

/**
 * Extract product handles mentioned in the response or context
 * This helps identify which products to suggest alongside the answer
 */
export function extractProductHandles(
  text: string,
  availableHandles: string[]
): string[] {
  const found: string[] = [];

  // Normalize text for matching
  const normalizedText = text.toLowerCase();

  // Check for color mentions and map to shade collections
  for (const [color, collection] of Object.entries(COLOR_TO_SHADE_COLLECTION)) {
    if (normalizedText.includes(color) && availableHandles.includes(collection)) {
      if (!found.includes(collection)) {
        found.push(collection);
      }
    }
  }
  
  // Check if text mentions specific shade names
  let mentionsShades = false;
  for (const shade of SHADE_NAMES) {
    if (normalizedText.includes(shade)) {
      mentionsShades = true;
      break;
    }
  }
  
  // Also check for shade number patterns like "217 NEW YORK"
  const shadeNumberPattern = /\b\d{1,3}\s+[A-Z]/i;
  if (shadeNumberPattern.test(text)) {
    mentionsShades = true;
  }
  
  // If shades are mentioned but no collection found yet, we'll let the
  // LLM recommend specific shade collections based on the question

  // First, check for known product names and map to handles
  for (const [name, handle] of Object.entries(PRODUCT_NAME_TO_HANDLE)) {
    if (normalizedText.includes(name) && availableHandles.includes(handle)) {
      if (!found.includes(handle)) {
        found.push(handle);
      }
    }
  }

  // Then check for handle matches directly
  for (const handle of availableHandles) {
    // Check if handle appears in text (products often have handles like "serum-foundation")
    const handleWords = handle.split("-").join(" ");
    if (
      normalizedText.includes(handle) ||
      normalizedText.includes(handleWords)
    ) {
      if (!found.includes(handle)) {
        found.push(handle);
      }
    }
  }

  // Return unique handles, max 5 (we'll slice to 3 later after combining)
  return [...new Set(found)].slice(0, 5);
}
