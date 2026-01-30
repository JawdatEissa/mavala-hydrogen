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
const REQUIRE_AUTH_IN_PRODUCTION = true;

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
  "hand-cream": {
    handle: "hand-cream",
    title: "HAND CREAM",
    price: "$24.95",
    image: "/images/hand-cream/01_hand-cream.jpg",
    category: "Hand care",
  },
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
  "anti-spot-cream-for-hands": {
    handle: "anti-spot-cream-for-hands",
    title: "ANTI-SPOT CREAM FOR HANDS",
    price: "$39.95",
    image: "/images/anti-spot-cream-for-hands/01_cream.jpg",
    category: "Hand care",
  },
  "barrier-base-coat": {
    handle: "barrier-base-coat",
    title: "BARRIER-BASE COAT",
    price: "$19.95",
    image: "/images/barrier-base-coat/01_base.jpg",
    category: "Nail Repair",
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

    // Generate response
    const answer = await generateChatResponse(question, contextBlocks);

    // Extract product recommendations
    const contextProducts = extractProductsFromContext(chunks);
    const productHandles = getProductHandles();
    const responseProducts = extractProductHandles(answer, productHandles);

    // Combine and deduplicate product handles
    let allProductHandles = [
      ...new Set([...contextProducts, ...responseProducts]),
    ].slice(0, 3);

    // If no products found, suggest defaults based on question topic
    if (allProductHandles.length === 0) {
      const questionLower = question.toLowerCase();
      if (
        questionLower.includes("nail") ||
        questionLower.includes("brittle") ||
        questionLower.includes("weak") ||
        questionLower.includes("strengthen")
      ) {
        allProductHandles = [
          "mavala-scientifique-1",
          "mava-strong",
          "cuticle-oil",
        ];
      } else if (
        questionLower.includes("skin") ||
        questionLower.includes("dry") ||
        questionLower.includes("moistur")
      ) {
        allProductHandles = [
          "featherlight-cream",
          "healthy-glow-serum",
          "hand-cream",
        ];
      } else if (
        questionLower.includes("cuticle") ||
        questionLower.includes("hand")
      ) {
        allProductHandles = ["cuticle-oil", "cuticle-cream", "hand-cream"];
      } else {
        // General beauty - show popular products
        allProductHandles = [
          "mavala-scientifique-1",
          "hand-cream",
          "healthy-glow-serum",
        ];
      }
      console.log(
        "[api/chat] Using default product suggestions:",
        allProductHandles,
      );
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
