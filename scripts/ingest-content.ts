/**
 * Mavala AI Chatbot - Content Ingestion Script
 *
 * This script processes and ingests content from:
 * - Blog posts (app/data/blogs.json)
 * - Products (app/data/products/all_products_new.json)
 * - Quiz data (app/lib/quizData.ts)
 *
 * Usage:
 *   npx tsx scripts/ingest-content.ts
 *
 * Options:
 *   --clear    Clear existing chunks before ingesting
 *   --blogs    Only ingest blogs
 *   --products Only ingest products
 *   --quiz     Only ingest quiz data
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { encoding_for_model } from "tiktoken";

// =========================================
// Configuration
// =========================================

const CHUNK_SIZE_TOKENS = 600;
const CHUNK_OVERLAP_TOKENS = 100;
const EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 10; // Process embeddings in batches

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: path.join(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !OPENAI_API_KEY) {
  console.error("❌ Missing required environment variables");
  console.error("   SUPABASE_URL:", !!SUPABASE_URL);
  console.error("   SUPABASE_SERVICE_ROLE:", !!SUPABASE_SERVICE_ROLE);
  console.error("   OPENAI_API_KEY:", !!OPENAI_API_KEY);
  process.exit(1);
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const encoder = encoding_for_model("gpt-4");

// =========================================
// Types
// =========================================

interface ContentBlock {
  type: string;
  content?: string;
  html?: string;
  items?: string[];
  links?: Array<{ text: string; href: string }>;
}

interface BlogPost {
  slug: string;
  metadata: {
    title: string;
    categories: string[];
    tags: string[];
    excerpt: string;
  };
  content_blocks: ContentBlock[];
}

interface Product {
  slug: string;
  title: string;
  tagline?: string;
  main_description?: string;
  key_ingredients?: string;
  how_to_use?: string;
  note?: string;
  categories: string[];
  price?: string;
  price_from?: string;
  local_images?: string[];
}

interface ChunkData {
  source: string;
  source_id: string;
  section: string | null;
  content: string;
  metadata: Record<string, unknown>;
}

// =========================================
// Utility Functions
// =========================================

/**
 * Count tokens in a string
 */
function countTokens(text: string): number {
  return encoder.encode(text).length;
}

/**
 * Chunk text by token count with overlap
 */
function chunkByTokens(
  text: string,
  maxTokens: number = CHUNK_SIZE_TOKENS,
  overlap: number = CHUNK_OVERLAP_TOKENS
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentTokens = 0;

  for (const word of words) {
    const wordTokens = countTokens(word + " ");
    if (currentTokens + wordTokens > maxTokens && currentChunk.length > 0) {
      // Save current chunk
      chunks.push(currentChunk.join(" "));

      // Start new chunk with overlap
      const overlapWords: string[] = [];
      let overlapTokens = 0;
      for (let i = currentChunk.length - 1; i >= 0; i--) {
        const wTokens = countTokens(currentChunk[i] + " ");
        if (overlapTokens + wTokens > overlap) break;
        overlapWords.unshift(currentChunk[i]);
        overlapTokens += wTokens;
      }
      currentChunk = overlapWords;
      currentTokens = overlapTokens;
    }
    currentChunk.push(word);
    currentTokens += wordTokens;
  }

  // Add final chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
}

/**
 * Clean and normalize text
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim();
}

/**
 * Extract text content from HTML (simple version)
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generate embeddings for texts in batches
 */
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const normalizedBatch = batch.map((t) => cleanText(t));

    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: normalizedBatch,
      });
      embeddings.push(...response.data.map((d) => d.embedding));
      console.log(
        `   📊 Generated embeddings ${i + 1}-${Math.min(i + BATCH_SIZE, texts.length)} of ${texts.length}`
      );
    } catch (error) {
      console.error(`   ❌ Error generating embeddings:`, error);
      // Push empty embeddings for failed batch
      embeddings.push(...batch.map(() => []));
    }

    // Small delay to avoid rate limits
    if (i + BATCH_SIZE < texts.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return embeddings;
}

// =========================================
// Blog Processing
// =========================================

function processBlog(blog: BlogPost): ChunkData[] {
  const chunks: ChunkData[] = [];

  // Extract all text content from content blocks
  const textParts: string[] = [];
  const productLinks: string[] = [];

  // Add title and excerpt
  textParts.push(`Title: ${blog.metadata.title}`);
  if (blog.metadata.excerpt) {
    textParts.push(blog.metadata.excerpt);
  }

  // Process content blocks
  for (const block of blog.content_blocks) {
    if (block.type === "paragraph" && block.content) {
      textParts.push(cleanText(block.content));

      // Extract product links
      if (block.links) {
        for (const link of block.links) {
          if (
            link.href.includes("/all-products/") ||
            link.href.includes("/products/")
          ) {
            const handle = link.href.split("/").pop();
            if (handle) productLinks.push(handle);
          }
        }
      }
    } else if (block.type === "heading" && block.content) {
      textParts.push(cleanText(block.content));
    } else if (block.type === "list" && block.items) {
      textParts.push(block.items.map((item) => `• ${cleanText(item)}`).join(" "));
    }
  }

  // Join and chunk the text
  const fullText = textParts.join("\n\n");
  const textChunks = chunkByTokens(fullText);

  // Create chunk data
  for (let i = 0; i < textChunks.length; i++) {
    let chunkContent = textChunks[i];

    // Add product links to last chunk
    if (i === textChunks.length - 1 && productLinks.length > 0) {
      chunkContent += `\n[Related Products: ${[...new Set(productLinks)].join(", ")}]`;
    }

    chunks.push({
      source: "blog",
      source_id: blog.slug,
      section: blog.metadata.tags.join(", ") || null,
      content: chunkContent,
      metadata: {
        title: blog.metadata.title,
        tags: blog.metadata.tags,
        categories: blog.metadata.categories,
        relatedProducts: [...new Set(productLinks)],
        chunkIndex: i,
        totalChunks: textChunks.length,
      },
    });
  }

  return chunks;
}

async function ingestBlogs(): Promise<number> {
  console.log("\n📚 Processing blogs...");

  const blogsPath = path.join(process.cwd(), "app/data/blogs.json");
  if (!fs.existsSync(blogsPath)) {
    console.log("   ⚠️ No blogs.json found");
    return 0;
  }

  const blogsData = JSON.parse(fs.readFileSync(blogsPath, "utf-8"));
  const blogs: BlogPost[] = blogsData.blogs || [];

  console.log(`   Found ${blogs.length} blogs`);

  const allChunks: ChunkData[] = [];
  for (const blog of blogs) {
    const chunks = processBlog(blog);
    allChunks.push(...chunks);
    console.log(`   ✓ ${blog.slug}: ${chunks.length} chunks`);
  }

  // Generate embeddings
  console.log(`\n   Generating embeddings for ${allChunks.length} chunks...`);
  const embeddings = await generateEmbeddings(allChunks.map((c) => c.content));

  // Insert into database
  const records = allChunks.map((chunk, i) => ({
    source: chunk.source,
    source_id: chunk.source_id,
    section: chunk.section,
    content: chunk.content,
    embedding: embeddings[i],
    metadata: chunk.metadata,
  }));

  // Filter out chunks with empty embeddings
  const validRecords = records.filter((r) => r.embedding && r.embedding.length > 0);

  if (validRecords.length > 0) {
    const { error } = await supabase.from("chunks").insert(validRecords);
    if (error) {
      console.error("   ❌ Error inserting blog chunks:", error);
      return 0;
    }
  }

  console.log(`   ✅ Inserted ${validRecords.length} blog chunks`);
  return validRecords.length;
}

// =========================================
// Product Processing
// =========================================

function processProduct(product: Product): ChunkData[] {
  const chunks: ChunkData[] = [];

  // Build product text
  const textParts: string[] = [];

  textParts.push(`Product: ${product.title}`);
  if (product.tagline) {
    textParts.push(`Tagline: ${product.tagline}`);
  }
  if (product.main_description) {
    textParts.push(`Description: ${cleanText(product.main_description)}`);
  }
  if (product.key_ingredients) {
    textParts.push(`Key Ingredients: ${cleanText(product.key_ingredients)}`);
  }
  if (product.how_to_use) {
    textParts.push(`How to Use: ${cleanText(product.how_to_use)}`);
  }
  if (product.note) {
    textParts.push(`Note: ${cleanText(product.note)}`);
  }

  const fullText = textParts.join("\n\n");

  // Only chunk if text is long enough
  if (countTokens(fullText) < 50) {
    return chunks;
  }

  const textChunks = chunkByTokens(fullText);

  for (let i = 0; i < textChunks.length; i++) {
    chunks.push({
      source: "product",
      source_id: product.slug,
      section: product.categories.join(", ") || null,
      content: textChunks[i],
      metadata: {
        title: product.title,
        handle: product.slug,
        categories: product.categories,
        price: product.price || product.price_from || null,
        image: product.local_images?.[0] || null,
        chunkIndex: i,
        totalChunks: textChunks.length,
      },
    });
  }

  return chunks;
}

async function ingestProducts(): Promise<number> {
  console.log("\n🛍️ Processing products...");

  const productsPath = path.join(
    process.cwd(),
    "app/data/products/all_products_new.json"
  );
  if (!fs.existsSync(productsPath)) {
    console.log("   ⚠️ No products file found");
    return 0;
  }

  const products: Product[] = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
  console.log(`   Found ${products.length} products`);

  const allChunks: ChunkData[] = [];
  let processed = 0;

  for (const product of products) {
    const chunks = processProduct(product);
    if (chunks.length > 0) {
      allChunks.push(...chunks);
      processed++;
    }
  }

  console.log(`   Processed ${processed} products with content`);

  // Generate embeddings
  console.log(`\n   Generating embeddings for ${allChunks.length} chunks...`);
  const embeddings = await generateEmbeddings(allChunks.map((c) => c.content));

  // Insert into database
  const records = allChunks.map((chunk, i) => ({
    source: chunk.source,
    source_id: chunk.source_id,
    section: chunk.section,
    content: chunk.content,
    embedding: embeddings[i],
    metadata: chunk.metadata,
  }));

  // Filter out chunks with empty embeddings
  const validRecords = records.filter((r) => r.embedding && r.embedding.length > 0);

  if (validRecords.length > 0) {
    // Insert in smaller batches to avoid size limits
    const insertBatchSize = 50;
    for (let i = 0; i < validRecords.length; i += insertBatchSize) {
      const batch = validRecords.slice(i, i + insertBatchSize);
      const { error } = await supabase.from("chunks").insert(batch);
      if (error) {
        console.error("   ❌ Error inserting product chunks:", error);
      }
    }
  }

  console.log(`   ✅ Inserted ${validRecords.length} product chunks`);
  return validRecords.length;
}

// =========================================
// Quiz Data Processing
// =========================================

async function ingestQuizData(): Promise<number> {
  console.log("\n❓ Processing quiz data...");

  // Create knowledge chunks about skin concerns and recommendations
  const skinConcerns = [
    {
      concern: "Wrinkles",
      description:
        "Wrinkles are lines and creases that form in the skin as we age. They are most commonly found on the face, neck, and hands. Mavala ANTI-AGE NUTRITION line helps reduce the appearance of fine lines and wrinkles. The NUTRITION ULTIMATE CREAM and NUTRITION ESSENTIAL SERUM provide intensive anti-aging care.",
      relatedProducts: ["nutrition-ultimate-cream", "nutrition-essential-serum", "nutrition-absolute-night-balm"],
    },
    {
      concern: "Tightness",
      description:
        "Skin tightness is often a sign of dehydration or lack of moisture. Mavala MULTI-MOISTURIZING products help restore moisture balance. The FEATHERLIGHT CREAM provides lightweight hydration, while the MULTI-MOISTURIZING INTENSIVE SERUM delivers deep moisture.",
      relatedProducts: ["featherlight-cream", "multi-moisturizing-serum", "multi-moisturizing-kit"],
    },
    {
      concern: "Dry Skin",
      description:
        "Dry skin lacks sufficient moisture and natural oils, leading to roughness and flaking. Mavala offers the MULTI-MOISTURIZING range for hydration. For hands, the HAND CREAM and MAVA+ HAND CREAM provide intensive nourishment.",
      relatedProducts: ["featherlight-cream", "hand-cream", "mava-hand-cream-1", "sleeping-mask"],
    },
    {
      concern: "Dullness",
      description:
        "Dull skin lacks radiance and appears tired or lifeless. Mavala HEALTHY GLOW products restore luminosity. The VITALIZING HEALTHY GLOW SERUM and CREAM bring back your skin's natural radiance. The MICRO-PEEL helps remove dead skin cells.",
      relatedProducts: ["healthy-glow-serum", "healthy-glow-cream", "micro-peel", "healthy-glow-kit"],
    },
    {
      concern: "Imperfections",
      description:
        "Skin imperfections include blemishes, uneven texture, and enlarged pores. Mavala PERFECTING line helps minimize imperfections. The HYDRA-MATT FLUID controls shine, while PURIFYING MASK deep cleanses pores.",
      relatedProducts: ["hydra-matt-fluid", "purifying-mask", "foaming-cleanser"],
    },
    {
      concern: "Dark Spots",
      description:
        "Dark spots or hyperpigmentation can be caused by sun exposure, aging, or hormonal changes. The ANTI-SPOT CREAM FOR HANDS helps even out skin tone on hands. For face, the HEALTHY GLOW range helps brighten and even skin.",
      relatedProducts: ["anti-spot-cream-for-hands", "healthy-glow-serum", "micro-peel"],
    },
    {
      concern: "Lack of Radiance",
      description:
        "Skin that lacks radiance appears dull and tired. Mavala VITALIZING HEALTHY GLOW products restore natural radiance. The ALPINE MICRO-MIST refreshes and revitalizes skin throughout the day.",
      relatedProducts: ["healthy-glow-serum", "healthy-glow-cream", "micro-mist"],
    },
    {
      concern: "Eye Care",
      description:
        "The delicate eye area needs special care. Mavala EYE CONTOUR DOUBLE CREAM provides intensive treatment for fine lines around eyes. The EYE CONTOUR GEL reduces puffiness and dark circles.",
      relatedProducts: ["eye-contour-double-cream", "eye-contour-gel", "eye-base"],
    },
  ];

  const nailConcerns = [
    {
      concern: "Brittle Nails",
      description:
        "Brittle nails are weak, prone to breaking, peeling, or splitting. This can be caused by frequent exposure to water, harsh chemicals, or nutritional deficiencies. Mavala nail strengthening treatments like MAVALA SCIENTIFIQUE and MAVA-STRONG help fortify and harden weak nails. These penetrating nail hardeners strengthen the nail structure from within.",
      relatedProducts: ["mavala-scientifique-1", "mava-strong", "mava-flex-1"],
    },
    {
      concern: "Weak Nails",
      description:
        "Weak nails need strengthening treatments to prevent breaking and peeling. MAVALA SCIENTIFIQUE is a penetrating nail hardener that bonds the nail layers together. MAVA-STRONG fortifies soft, delicate nails. For flexibility, MAVA-FLEX helps nails that are too rigid and tend to snap.",
      relatedProducts: ["mavala-scientifique-1", "mava-strong", "mava-flex-1", "mavaderma"],
    },
    {
      concern: "Nail Biting",
      description:
        "Nail biting is a common habit that can damage nails and cuticles. MAVALA STOP is a bitter-tasting solution that helps discourage nail biting and thumb sucking. Apply it to nails and the bitter taste will help break the habit.",
      relatedProducts: ["mavala-stop", "mavala-stop-pen"],
    },
    {
      concern: "Damaged Cuticles",
      description:
        "Cuticles protect the nail matrix from infection. Damaged or dry cuticles can be painful and unsightly. Mavala CUTICLE OIL nourishes and softens cuticles, CUTICLE CREAM provides deep moisture, and CUTICLE REMOVER gently removes excess cuticle tissue.",
      relatedProducts: ["cuticle-oil", "cuticle-cream", "cuticle-remover", "cuticle-care"],
    },
    {
      concern: "Yellow Nails",
      description:
        "Yellow or discolored nails can be caused by nail polish staining, fungal infections, or health conditions. MAVA-WHITE is a whitening treatment that helps restore natural nail color. LIGHTENING SCRUB MASK exfoliates and brightens nails.",
      relatedProducts: ["mava-white", "lightening-nail-scrub", "barrier-base-coat"],
    },
    {
      concern: "Nail Growth",
      description:
        "To promote healthy nail growth, MAVADERMA stimulates nail growth with a gentle massaging action. It helps nails grow stronger and faster. Combine with cuticle oil for best results.",
      relatedProducts: ["mavaderma", "cuticle-oil", "mava-strong"],
    },
  ];

  const allChunks: ChunkData[] = [];

  // Create chunks for skin concerns
  for (const concern of skinConcerns) {
    const content = `Skin Concern: ${concern.concern}\n\n${concern.description}\n\n[Related Products: ${concern.relatedProducts.join(", ")}]`;
    allChunks.push({
      source: "quiz",
      source_id: `skin-concern-${concern.concern.toLowerCase().replace(/\s+/g, "-")}`,
      section: "Skin Care",
      content,
      metadata: {
        concernType: "skin",
        concern: concern.concern,
        relatedProducts: concern.relatedProducts,
      },
    });
  }

  // Create chunks for nail concerns
  for (const concern of nailConcerns) {
    const content = `Nail Concern: ${concern.concern}\n\n${concern.description}\n\n[Related Products: ${concern.relatedProducts.join(", ")}]`;
    allChunks.push({
      source: "quiz",
      source_id: `nail-concern-${concern.concern.toLowerCase().replace(/\s+/g, "-")}`,
      section: "Nail Care",
      content,
      metadata: {
        concernType: "nail",
        concern: concern.concern,
        relatedProducts: concern.relatedProducts,
      },
    });
  }

  // Add general Mavala knowledge
  const generalKnowledge = [
    {
      id: "mavala-brand",
      content:
        "Mavala is a Swiss beauty brand founded in 1958, specializing in nail care, hand care, eye care, and skincare products. Known for their professional-quality nail treatments and toxic-free nail polishes, Mavala has been a trusted name in beauty for over 60 years. All Mavala nail polishes are 13-Free, meaning they are formulated without 13 harmful chemicals including Formaldehyde, Toluene, and Phthalate (DBP).\n\n[Related Products: mavala-scientifique-1, mava-strong, 10ml-bottles]",
      section: "Brand",
      relatedProducts: ["mavala-scientifique-1", "mava-strong", "10ml-bottles"],
    },
    {
      id: "nail-polish-application",
      content:
        "For the best nail polish application: 1) Start with clean, dry nails. 2) Apply a BARRIER-BASE COAT to protect your nails and help polish adhere better. 3) Apply two thin coats of nail polish, allowing each coat to dry. 4) Finish with a top coat for shine and protection. Mavala offers a wide range of nail colors in the 10ML SIZE BOTTLES and mini nail polish collections.\n\n[Related Products: barrier-base-coat, 10ml-bottles, bio-colors]",
      section: "How To",
      relatedProducts: ["barrier-base-coat", "10ml-bottles", "bio-colors"],
    },
    {
      id: "nail-care-routine",
      content:
        "A good nail care routine includes: regularly moisturizing cuticles with CUTICLE OIL, avoiding harsh chemicals, wearing COTTON GLOVES when doing housework, keeping nails at a manageable length, using MAVALA SCIENTIFIQUE or MAVA-STRONG for nail strengthening if needed. For dry cuticles, apply CUTICLE CREAM regularly.\n\n[Related Products: cuticle-oil, cuticle-cream, mavala-scientifique-1, mava-strong, cotton-gloves]",
      section: "How To",
      relatedProducts: ["cuticle-oil", "cuticle-cream", "mavala-scientifique-1", "mava-strong"],
    },
    {
      id: "strengthen-weak-nails",
      content:
        "How to strengthen weak nails: Use MAVALA SCIENTIFIQUE, a penetrating nail hardener that bonds the keratin layers of the nail together. For soft, delicate nails, MAVA-STRONG fortifies and reinforces. For nails that are too rigid and snap easily, MAVA-FLEX adds flexibility. Apply CUTICLE OIL daily to keep cuticles healthy. MAVADERMA stimulates nail growth with its gentle massage action.\n\n[Related Products: mavala-scientifique-1, mava-strong, mava-flex-1, mavaderma, cuticle-oil]",
      section: "How To",
      relatedProducts: ["mavala-scientifique-1", "mava-strong", "mava-flex-1", "mavaderma", "cuticle-oil"],
    },
    {
      id: "hand-care-routine",
      content:
        "For beautiful hands: Apply HAND CREAM regularly to keep skin soft and moisturized. For intensive care, MAVA+ HAND CREAM provides deep nourishment. To prevent and treat age spots, use ANTI-SPOT CREAM FOR HANDS daily. Wear COTTON GLOVES after applying hand cream overnight for best results.\n\n[Related Products: hand-cream, mava-hand-cream-1, anti-spot-cream-for-hands, cotton-gloves]",
      section: "How To",
      relatedProducts: ["hand-cream", "mava-hand-cream-1", "anti-spot-cream-for-hands", "cotton-gloves"],
    },
    {
      id: "skincare-routine",
      content:
        "A complete skincare routine: Start with CARESS CLEANSING MILK or PERFECTING FOAMING CLEANSER to remove makeup. Apply CARESS TONING LOTION to refresh skin. For daytime, use VITALIZING HEALTHY GLOW CREAM for radiance or MULTI-MOISTURIZING FEATHERLIGHT CREAM for hydration. At night, apply ANTI-AGE NUTRITION ABSOLUTE NIGHT BALM for anti-aging benefits.\n\n[Related Products: cleansing-milk, foaming-cleanser, caress-toning-lotion, healthy-glow-cream, featherlight-cream, nutrition-absolute-night-balm]",
      section: "How To",
      relatedProducts: ["cleansing-milk", "foaming-cleanser", "healthy-glow-cream", "featherlight-cream"],
    },
  ];

  for (const item of generalKnowledge) {
    allChunks.push({
      source: "quiz",
      source_id: item.id,
      section: item.section,
      content: item.content,
      metadata: {
        type: "general_knowledge",
        relatedProducts: item.relatedProducts || [],
      },
    });
  }

  console.log(`   Created ${allChunks.length} quiz/knowledge chunks`);

  // Generate embeddings
  console.log(`\n   Generating embeddings...`);
  const embeddings = await generateEmbeddings(allChunks.map((c) => c.content));

  // Insert into database
  const records = allChunks.map((chunk, i) => ({
    source: chunk.source,
    source_id: chunk.source_id,
    section: chunk.section,
    content: chunk.content,
    embedding: embeddings[i],
    metadata: chunk.metadata,
  }));

  const validRecords = records.filter((r) => r.embedding && r.embedding.length > 0);

  if (validRecords.length > 0) {
    const { error } = await supabase.from("chunks").insert(validRecords);
    if (error) {
      console.error("   ❌ Error inserting quiz chunks:", error);
      return 0;
    }
  }

  console.log(`   ✅ Inserted ${validRecords.length} quiz/knowledge chunks`);
  return validRecords.length;
}

// =========================================
// Main Execution
// =========================================

async function clearChunks(): Promise<void> {
  console.log("\n🗑️ Clearing existing chunks...");
  const { error } = await supabase
    .from("chunks")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    console.error("   ❌ Error clearing chunks:", error);
  } else {
    console.log("   ✅ Chunks cleared");
  }
}

async function main() {
  console.log("🚀 Mavala AI Chatbot - Content Ingestion");
  console.log("=========================================");

  const args = process.argv.slice(2);
  const shouldClear = args.includes("--clear");
  const onlyBlogs = args.includes("--blogs");
  const onlyProducts = args.includes("--products");
  const onlyQuiz = args.includes("--quiz");
  const ingestAll = !onlyBlogs && !onlyProducts && !onlyQuiz;

  if (shouldClear) {
    await clearChunks();
  }

  let totalChunks = 0;

  if (ingestAll || onlyBlogs) {
    totalChunks += await ingestBlogs();
  }

  if (ingestAll || onlyProducts) {
    totalChunks += await ingestProducts();
  }

  if (ingestAll || onlyQuiz) {
    totalChunks += await ingestQuizData();
  }

  // Verify
  const { count } = await supabase
    .from("chunks")
    .select("*", { count: "exact", head: true });

  console.log("\n=========================================");
  console.log(`✅ Ingestion complete!`);
  console.log(`   Total chunks added this run: ${totalChunks}`);
  console.log(`   Total chunks in database: ${count}`);
  console.log("=========================================\n");

  // Clean up encoder
  encoder.free();
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
