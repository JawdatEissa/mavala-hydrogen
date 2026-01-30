/**
 * Mavala AI Chatbot - Supabase Client
 *
 * Server-side Supabase client for vector storage and retrieval.
 * This file should only be imported in server-side code (.server.ts files or loaders/actions).
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  RetrievedChunk,
  RetrievalResult,
  CacheHit,
  SuggestedProduct,
  CHAT_CONSTANTS,
} from "./chat.types";

// =========================================
// Environment Variables
// =========================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables"
  );
}

// =========================================
// Supabase Clients
// =========================================

/**
 * Public Supabase client (uses anon key, RLS enforced)
 * Safe for read operations
 */
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || "",
  SUPABASE_ANON_KEY || "",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Admin Supabase client (uses service role, bypasses RLS)
 * Use only for server-side operations that need full access
 */
export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE || SUPABASE_ANON_KEY || "",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// =========================================
// Retrieval Functions
// =========================================

/**
 * Retrieve relevant content chunks using vector similarity search
 */
export async function retrieveChunks(
  queryEmbedding: number[],
  maxChunks: number = 6,
  minSimilarity: number = 0.25
): Promise<RetrievalResult> {
  try {
    console.log(
      "[retrieveChunks] Calling match_chunks RPC with embedding length:",
      queryEmbedding.length
    );

    const { data, error } = await supabase.rpc("match_chunks", {
      query_embedding: queryEmbedding,
      match_count: maxChunks,
    });

    if (error) {
      console.error("[retrieveChunks] RPC error:", error);
      return { chunks: [], bestSimilarity: 0, isRelevant: false };
    }

    if (!Array.isArray(data) || data.length === 0) {
      console.warn("[retrieveChunks] No matching chunks found");
      return { chunks: [], bestSimilarity: 0, isRelevant: false };
    }

    console.log("[retrieveChunks] Retrieved", data.length, "chunks");

    // Get best similarity score
    const bestSimilarity =
      typeof data[0]?.similarity === "number" ? data[0].similarity : 0;
    const isRelevant = bestSimilarity >= minSimilarity;

    console.log(
      `[retrieveChunks] Best similarity: ${bestSimilarity.toFixed(3)}, Relevant: ${isRelevant}`
    );

    if (!isRelevant) {
      return { chunks: [], bestSimilarity, isRelevant: false };
    }

    // Map to RetrievedChunk type
    const chunks: RetrievedChunk[] = data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      source: row.source as string,
      source_id: row.source_id as string | null,
      section: row.section as string | null,
      content: row.content as string,
      similarity: row.similarity as number,
      metadata: row.metadata as RetrievedChunk["metadata"],
    }));

    return { chunks, bestSimilarity, isRelevant: true };
  } catch (e) {
    console.error("[retrieveChunks] Error:", e);
    return { chunks: [], bestSimilarity: 0, isRelevant: false };
  }
}

// =========================================
// Semantic Cache Functions
// =========================================

/**
 * Check semantic cache for similar questions
 */
export async function checkSemanticCache(
  queryEmbedding: number[],
  threshold: number = 0.9
): Promise<CacheHit> {
  try {
    const { data, error } = await supabase.rpc("match_questions", {
      query_embedding: queryEmbedding,
      match_threshold: 0.7, // Get candidates, enforce threshold ourselves
      match_count: 5,
    });

    if (error || !Array.isArray(data) || data.length === 0) {
      console.log(
        "[checkSemanticCache] No cache match found:",
        error?.message || "no results"
      );
      return { hit: false };
    }

    const best = data[0];
    const similarity =
      typeof best?.similarity === "number" ? best.similarity : 0;

    console.log(
      "[checkSemanticCache] Best match similarity:",
      similarity,
      "threshold:",
      threshold
    );

    if (similarity >= threshold && best?.answer) {
      return {
        hit: true,
        answer: best.answer as string,
        products: (best.products as SuggestedProduct[]) ?? [],
        id: best.id as string,
      };
    }

    return { hit: false };
  } catch (e) {
    console.warn("[checkSemanticCache] Error:", e);
    return { hit: false };
  }
}

/**
 * Insert or update cache entry (best-effort, non-blocking)
 */
export async function upsertCache(
  question: string,
  embedding: number[],
  answer: string,
  products: SuggestedProduct[] = []
): Promise<void> {
  try {
    // Try upsert function first
    const { error } = await supabaseAdmin.rpc("upsert_qa_cache", {
      p_question: question,
      p_q_embedding: embedding,
      p_answer: answer,
      p_products: products,
    });

    if (error) {
      // Fallback to regular insert
      console.warn(
        "[upsertCache] Upsert failed, using regular insert:",
        error.message
      );
      await supabaseAdmin.from("qa_cache").insert({
        question,
        q_embedding: embedding,
        answer,
        products,
      });
    } else {
      console.log(
        "[upsertCache] Successfully cached question:",
        question.slice(0, 50)
      );
    }
  } catch (e) {
    console.warn("[upsertCache] Cache insert failed:", e);
    // Best-effort - don't throw
  }
}

/**
 * Increment cache hit counter
 */
export async function incrementCacheHit(cacheId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin.rpc("increment_cache_hit", {
      cache_id: cacheId,
    });
    if (error) {
      console.warn("[incrementCacheHit] Failed:", error.message);
    }
  } catch (e) {
    console.warn("[incrementCacheHit] Error:", e);
  }
}

// =========================================
// Ingestion Functions (for scripts)
// =========================================

/**
 * Insert chunks into the database (used by ingestion script)
 */
export async function insertChunks(
  chunks: Array<{
    source: string;
    source_id: string | null;
    section: string | null;
    content: string;
    embedding: number[];
    metadata: Record<string, unknown> | null;
  }>
): Promise<{ success: boolean; count: number }> {
  try {
    const { data, error } = await supabaseAdmin.from("chunks").insert(chunks);

    if (error) {
      console.error("[insertChunks] Error:", error);
      return { success: false, count: 0 };
    }

    console.log("[insertChunks] Inserted", chunks.length, "chunks");
    return { success: true, count: chunks.length };
  } catch (e) {
    console.error("[insertChunks] Error:", e);
    return { success: false, count: 0 };
  }
}

/**
 * Clear all chunks (use with caution - for re-ingestion)
 */
export async function clearChunks(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("chunks")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (error) {
      console.error("[clearChunks] Error:", error);
      return false;
    }

    console.log("[clearChunks] All chunks cleared");
    return true;
  } catch (e) {
    console.error("[clearChunks] Error:", e);
    return false;
  }
}

/**
 * Get chunk count for verification
 */
export async function getChunkCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("chunks")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("[getChunkCount] Error:", error);
      return 0;
    }

    return count ?? 0;
  } catch (e) {
    console.error("[getChunkCount] Error:", e);
    return 0;
  }
}
