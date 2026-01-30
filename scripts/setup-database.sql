-- =========================================
-- Mavala AI Chatbot - Database Setup
-- =========================================
-- Run this SQL in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query)

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- =========================================
-- 1. CREATE TABLES
-- =========================================

-- Table: chunks
-- Stores chunked content (blogs, products, quiz data) with embeddings
CREATE TABLE IF NOT EXISTS chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,           -- 'blog', 'quiz', 'product'
  source_id text,                 -- blog slug, product handle, etc.
  section text,                   -- category/concern type
  content text NOT NULL,          -- Chunk text content
  embedding vector(1536) NOT NULL, -- OpenAI embedding (text-embedding-3-small)
  metadata jsonb,                 -- Extra data (product links, tags, etc.)
  created_at timestamptz DEFAULT now()
);

-- Table: qa_cache
-- Caches question-answer pairs for semantic matching
CREATE TABLE IF NOT EXISTS qa_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  q_embedding vector(1536) NOT NULL,
  answer text NOT NULL,
  products jsonb,                 -- Recommended product handles/data
  hits int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_hit_at timestamptz DEFAULT now()
);

-- =========================================
-- 2. CREATE INDEXES
-- =========================================

-- Index for chunks table (vector similarity search)
-- Using IVFFlat for approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON chunks
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Index for qa_cache table (semantic cache lookup)
CREATE INDEX IF NOT EXISTS qa_cache_embedding_idx ON qa_cache
USING ivfflat (q_embedding vector_cosine_ops) WITH (lists = 50);

-- Additional indexes for filtering
CREATE INDEX IF NOT EXISTS chunks_source_idx ON chunks(source);
CREATE INDEX IF NOT EXISTS chunks_source_id_idx ON chunks(source_id);

-- =========================================
-- 3. CREATE RPC FUNCTIONS
-- =========================================

-- Function: match_chunks
-- Retrieves relevant chunks via cosine similarity
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1536),
  match_count int DEFAULT 6
) RETURNS TABLE(
  id uuid,
  source text,
  source_id text,
  section text,
  content text,
  metadata jsonb,
  similarity float
) LANGUAGE sql STABLE AS $$
  SELECT
    c.id,
    c.source,
    c.source_id,
    c.section,
    c.content,
    c.metadata,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM chunks c
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count
$$;

-- Function: match_questions
-- Semantic cache lookup for similar questions
CREATE OR REPLACE FUNCTION match_questions(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
) RETURNS TABLE (
  id uuid,
  question text,
  answer text,
  products jsonb,
  hits int,
  last_hit_at timestamptz,
  similarity float
) LANGUAGE sql STABLE AS $$
  SELECT
    id, question, answer, products, hits, last_hit_at,
    1 - (q_embedding <=> query_embedding) AS similarity
  FROM qa_cache
  WHERE 1 - (q_embedding <=> query_embedding) > match_threshold
  ORDER BY q_embedding <=> query_embedding
  LIMIT match_count
$$;

-- Function: upsert_qa_cache
-- Prevents duplicate cache entries (0.98+ similarity = duplicate)
CREATE OR REPLACE FUNCTION upsert_qa_cache(
  p_question text,
  p_q_embedding vector(1536),
  p_answer text,
  p_products jsonb DEFAULT '[]'::jsonb
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_existing_id uuid;
  v_similarity float;
BEGIN
  -- Check if a very similar question exists (0.98+ similarity = duplicate)
  SELECT id, 1 - (q_embedding <=> p_q_embedding) INTO v_existing_id, v_similarity
  FROM qa_cache
  WHERE 1 - (q_embedding <=> p_q_embedding) > 0.98
  ORDER BY q_embedding <=> p_q_embedding
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- Update existing entry
    UPDATE qa_cache
    SET 
      answer = p_answer,
      products = p_products,
      last_hit_at = now()
    WHERE id = v_existing_id;
  ELSE
    -- Insert new entry
    INSERT INTO qa_cache (question, q_embedding, answer, products)
    VALUES (p_question, p_q_embedding, p_answer, p_products);
  END IF;
END;
$$;

-- Function: increment_cache_hit
-- Updates hits counter and last_hit_at timestamp
CREATE OR REPLACE FUNCTION increment_cache_hit(
  cache_id uuid
) RETURNS void LANGUAGE sql AS $$
  UPDATE qa_cache
  SET 
    hits = hits + 1,
    last_hit_at = now()
  WHERE id = cache_id;
$$;

-- =========================================
-- 4. ROW LEVEL SECURITY (Optional)
-- =========================================

-- Enable RLS on tables
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access to chunks (for semantic search)
CREATE POLICY "Allow public read on chunks" ON chunks
  FOR SELECT USING (true);

-- Allow public read access to qa_cache (for cache lookup)
CREATE POLICY "Allow public read on qa_cache" ON qa_cache
  FOR SELECT USING (true);

-- Service role can do everything (for ingestion and cache inserts)
-- Note: Service role bypasses RLS by default

-- =========================================
-- ✅ SETUP COMPLETE!
-- =========================================
-- Next steps:
-- 1. Configure .env.local with your Supabase credentials
-- 2. Run: npm run ingest (to load content)
-- 3. Run: npm run dev (to start the app)

-- Verification queries:
-- SELECT count(*) FROM chunks;
-- SELECT count(*) FROM qa_cache;
-- SELECT source, count(*) FROM chunks GROUP BY source;
