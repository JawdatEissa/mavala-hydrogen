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
const SYSTEM_PROMPT = `You are Mavala's AI Beauty Assistant, an expert on nail care, skincare, and beauty products from Mavala Switzerland.

Your role:
- Answer questions about Mavala products, nail care, skincare routines, and beauty tips
- ALWAYS recommend specific Mavala products when relevant to the question
- Provide helpful, accurate information based on the provided context
- Be friendly, professional, and helpful

IMPORTANT Guidelines:
- Use the provided context to answer questions. The context contains product information and recommendations.
- ALWAYS include product recommendations when the question is about a concern or routine
- When you see [Related Products: ...] in the context, mention those products by name in your answer
- Keep responses helpful and actionable (use bullet points for steps or multiple products)
- Mention product names in CAPS (e.g., MAVALA SCIENTIFIQUE, CUTICLE OIL)

Product Recommendation Format:
- When recommending products, briefly explain WHY each product helps
- Example: "For weak nails, I recommend MAVALA SCIENTIFIQUE - it's a penetrating nail hardener that bonds nail layers together for stronger nails."

If no relevant context is found, still try to give helpful general advice about nail care or skincare, and suggest the user browse the relevant product category.`;

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
`;

/**
 * Build the prompt with context
 */
function buildPrompt(question: string, contextBlocks: string[]): string {
  // If we have context, use it; otherwise use fallback knowledge
  const contextSection =
    contextBlocks.length > 0
      ? contextBlocks.map((b, i) => `Context ${i + 1}:\n${b}`).join("\n\n")
      : `No specific product matches found. Use this general knowledge:\n${FALLBACK_KNOWLEDGE}`;

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

  for (const handle of availableHandles) {
    // Check if handle appears in text (products often have handles like "serum-foundation")
    const handleWords = handle.split("-").join(" ");
    if (
      normalizedText.includes(handle) ||
      normalizedText.includes(handleWords)
    ) {
      found.push(handle);
    }
  }

  // Return unique handles, max 3
  return [...new Set(found)].slice(0, 3);
}
