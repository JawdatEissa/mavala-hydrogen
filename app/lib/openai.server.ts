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

Be helpful but brief. No lengthy introductions or closings.`;

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
- BARRIER-BASE COAT: Protects nails before polish application

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

  return `### User Question
${question.trim()}

### Available Context
${contextSection}

### Instructions
- Answer the question helpfully using the context above
- ALWAYS recommend specific Mavala products when relevant
- Mention product names in CAPS (e.g., MAVALA SCIENTIFIQUE)
- Be friendly, helpful, and concise
- For nail concerns: suggest nail treatments from the context
- For skin concerns: suggest skincare products from the context`;
}

/**
 * Generate a chat response
 */
export async function generateChatResponse(
  question: string,
  contextBlocks: string[]
): Promise<string> {
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

    const answer = response.choices[0]?.message?.content?.trim();

    if (!answer) {
      console.warn("[generateChatResponse] Empty response from model");
      return "I apologize, but I couldn't generate a response. Please try rephrasing your question.";
    }

    return answer;
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

      return (
        response.choices[0]?.message?.content?.trim() ||
        "I apologize, but I couldn't generate a response. Please try again."
      );
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
  "barrier base coat": "barrier-base-coat",
  
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
  "featherlight cream": "featherlight-cream",
  "nourishing cream": "nourishing-cream",
  
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
  "10ml bottles": "10ml-bottles",
  "10ml": "10ml-bottles",
  "nail polish": "10ml-bottles",
  
  // Top & Base Coats
  "colorfix": "colorfix-1",
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
  
  // If shades are mentioned but no collection found yet, add generic nail polish
  if (mentionsShades && found.length === 0) {
    if (availableHandles.includes("10ml-bottles")) {
      found.push("10ml-bottles");
    }
  }

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
