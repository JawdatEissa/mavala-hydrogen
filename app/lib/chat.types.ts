/**
 * Mavala AI Chatbot - Type Definitions
 *
 * This file contains all TypeScript types for the chatbot feature,
 * including message types, API responses, and database models.
 */

// =========================================
// Message Types
// =========================================

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: number;
  meta?: {
    cached?: boolean;
    error?: boolean;
    products?: SuggestedProduct[];
  };
}

// =========================================
// Product Suggestion Types
// =========================================

export interface SuggestedProduct {
  handle: string;
  title: string;
  image: string;
  price: string;
  category?: string;
}

// =========================================
// API Request/Response Types
// =========================================

export interface ChatRequest {
  question: string;
  sessionId?: string;
}

export interface ChatResponse {
  answer: string;
  cached: boolean;
  suggestedProducts?: SuggestedProduct[];
  error?: string;
}

// =========================================
// Database Types (Supabase)
// =========================================

export interface ChunkRecord {
  id: string;
  source: "blog" | "quiz" | "product";
  source_id: string | null;
  section: string | null;
  content: string;
  embedding: number[];
  metadata: ChunkMetadata | null;
  created_at: string;
}

export interface ChunkMetadata {
  title?: string;
  tags?: string[];
  categories?: string[];
  relatedProducts?: string[];
  url?: string;
}

export interface QACacheRecord {
  id: string;
  question: string;
  q_embedding: number[];
  answer: string;
  products: SuggestedProduct[] | null;
  hits: number;
  created_at: string;
  last_hit_at: string;
}

// =========================================
// Retrieval Types
// =========================================

export interface RetrievedChunk {
  id: string;
  source: string;
  source_id: string | null;
  section: string | null;
  content: string;
  similarity: number;
  metadata?: ChunkMetadata;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  bestSimilarity: number;
  isRelevant: boolean;
}

export interface CacheHit {
  hit: boolean;
  answer?: string;
  products?: SuggestedProduct[];
  id?: string;
}

// =========================================
// Ingestion Types
// =========================================

export interface BlogContent {
  slug: string;
  title: string;
  categories: string[];
  tags: string[];
  textBlocks: string[];
  productLinks: string[];
}

export interface ProductContent {
  handle: string;
  title: string;
  description: string;
  category: string;
  ingredients?: string;
  howToUse?: string;
  concerns?: string[];
}

export interface QuizContent {
  id: string;
  type: string;
  question: string;
  options?: string[];
  relatedConcerns?: string[];
}

// =========================================
// Rate Limiting
// =========================================

export interface RateLimitBucket {
  timestamp: number;
  count: number;
}

// =========================================
// Constants
// =========================================

export const CHAT_CONSTANTS = {
  // Embedding model
  EMBEDDING_MODEL: "text-embedding-3-small",
  EMBEDDING_DIMENSIONS: 1536,

  // Chat model
  CHAT_MODEL_PRIMARY: "gpt-4o-mini",
  CHAT_MODEL_FALLBACK: "gpt-4o-mini",
  MAX_OUTPUT_TOKENS: 300,
  TEMPERATURE: 0.3,

  // Retrieval settings
  MAX_CHUNKS: 10,  // Increased to get more diverse chunks
  MIN_SIMILARITY: 0.15,  // Even lower threshold to catch more relevant content
  CACHE_HIT_THRESHOLD: 0.88,
  DUPLICATE_THRESHOLD: 0.98,

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 60_000,
  RATE_LIMIT_MAX_CALLS: 20,

  // Chunking settings (for ingestion)
  CHUNK_SIZE_TOKENS: 600,
  CHUNK_OVERLAP_TOKENS: 100,
} as const;
