/**
 * Generate Comprehensive Product Knowledge for AI Chatbot
 * 
 * This script generates a structured knowledge base from all products
 * that can be ingested into the vector database for better AI responses.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Product interface
interface Product {
  slug: string;
  title: string;
  price?: string;
  price_from?: string;
  tagline?: string;
  main_description?: string;
  key_ingredients?: string;
  how_to_use?: string;
  categories?: string[];
  local_images?: string[];
}

// Load products
const productsPath = path.join(__dirname, '../app/data/products/all_products_new.json');
const products: Product[] = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Load shades if available
let shades: any[] = [];
try {
  const shadesPath = path.join(__dirname, '../app/data/products/shade-list.json');
  shades = JSON.parse(fs.readFileSync(shadesPath, 'utf-8'));
} catch (e) {
  console.log('No shade list found, continuing without shades');
}

// Category descriptions for context
const categoryDescriptions: Record<string, string> = {
  'Nail Colour': 'Mavala nail polishes in various colors and finishes. 13-Free formula, toxic-free, cruelty-free.',
  'Nail Polish Collections': 'Themed nail polish collections with coordinated shades.',
  'Nail Repair': 'Products to strengthen, harden, and repair damaged or weak nails.',
  'Nail Care': 'General nail care products for healthy nail maintenance.',
  'Cuticle Care': 'Products for softening, nourishing, and maintaining cuticles.',
  'Manicure Essentials': 'Essential tools and products for professional manicures.',
  'Nail Polish Removers': 'Gentle nail polish removers that don\'t damage nails.',
  'Hand care': 'Hand creams, treatments, and products for soft, youthful hands.',
  'Foot Care': 'Foot creams, treatments, and pedicure products.',
  'Skincare': 'Face skincare products including serums, creams, and treatments.',
  'Complexion': 'Foundation, concealer, and complexion-perfecting products.',
  'Eye Colour': 'Eyeshadows, eyeliners, and eye makeup products.',
  'Eyebrows & Lashes': 'Mascara, brow products, and lash treatments.',
  'Lip Colour': 'Lipsticks, lip glosses, and lip color products.',
  'Lip balm': 'Nourishing lip balms and treatments.',
  'Makeup Removers': 'Gentle makeup removers for face, eyes, and lips.',
  'Hair & Body': 'Hair and body care products.',
  'Gift Sets': 'Curated gift sets combining multiple Mavala products.',
};

// Problem-solution mappings for common concerns
const problemSolutions: Record<string, { keywords: string[], products: string[] }> = {
  'weak_nails': {
    keywords: ['weak nails', 'brittle nails', 'breaking nails', 'soft nails', 'strengthen nails', 'nail hardener'],
    products: ['mavala-scientifique-1', 'mava-strong', 'mava-flex-1', 'barrier-base-coat']
  },
  'dry_cuticles': {
    keywords: ['dry cuticles', 'hard cuticles', 'cuticle care', 'cuticle softener'],
    products: ['cuticle-oil', 'cuticle-cream', 'cuticle-remover']
  },
  'nail_growth': {
    keywords: ['nail growth', 'grow nails', 'slow nail growth', 'stimulate growth'],
    products: ['mavaderma', 'mavala-scientifique-1']
  },
  'nail_biting': {
    keywords: ['nail biting', 'stop biting nails', 'nail biter'],
    products: ['mavala-stop']
  },
  'remove_polish': {
    keywords: ['remove nail polish', 'nail polish remover', 'take off polish', 'remover'],
    products: ['blue-nail-polish-remover', 'crystal-nail-polish-remover', 'pink-nail-polish-remover', 'nail-polish-remover-pads']
  },
  'dry_hands': {
    keywords: ['dry hands', 'rough hands', 'hand cream', 'hand moisturizer'],
    products: ['hand-cream', 'anti-spot-cream-for-hands']
  },
  'dry_skin': {
    keywords: ['dry skin', 'dehydrated skin', 'moisturizer', 'hydration'],
    products: ['featherlight-cream', 'healthy-glow-serum', 'nourishing-cream']
  },
  'remove_makeup': {
    keywords: ['remove makeup', 'makeup remover', 'eye makeup remover', 'cleanser'],
    products: ['bi-phase-make-up-remover', 'eye-make-up-remover-lotion', 'remover-gel', 'remover-pads', 'make-up-remover-cotton-pads']
  },
  'nail_polish': {
    keywords: ['nail polish', 'nail color', 'nail colour', 'nail lacquer', 'manicure'],
    products: ['5ml-bottles', '10ml-bottles']
  },
  'base_coat': {
    keywords: ['base coat', 'nail base', 'protect nails'],
    products: ['barrier-base-coat', 'colorfix-1', '002-base-coat']
  },
  'top_coat': {
    keywords: ['top coat', 'shine', 'glossy finish', 'protect polish'],
    products: ['colorfix-1', 'gel-finish-top-coat', 'mavala-top-coat-1', 'speed-dry-silicium-top-coat', 'matte-top-coat']
  },
  'foot_care': {
    keywords: ['foot care', 'dry feet', 'cracked heels', 'pedicure'],
    products: ['foot-bath-salts', 'smoothing-scrub-cream', 'repairing-night-cream-for-feet']
  }
};

// Generate knowledge chunks
interface KnowledgeChunk {
  source: string;
  source_id: string;
  section: string;
  content: string;
  relatedProducts: string[];
}

const knowledgeChunks: KnowledgeChunk[] = [];

// 1. Generate category overviews
console.log('Generating category overviews...');
const productsByCategory = new Map<string, Product[]>();
products.forEach(p => {
  (p.categories || ['Uncategorized']).forEach(cat => {
    if (!productsByCategory.has(cat)) {
      productsByCategory.set(cat, []);
    }
    productsByCategory.get(cat)!.push(p);
  });
});

productsByCategory.forEach((categoryProducts, category) => {
  const description = categoryDescriptions[category] || `Mavala ${category} products.`;
  const productList = categoryProducts.map(p => `- ${p.title} (${p.slug}): ${p.tagline || p.main_description?.substring(0, 100) || ''}`).join('\n');
  
  knowledgeChunks.push({
    source: 'product-catalog',
    source_id: `category-${category.toLowerCase().replace(/\s+/g, '-')}`,
    section: category,
    content: `MAVALA ${category.toUpperCase()} PRODUCTS\n\n${description}\n\nProducts in this category:\n${productList}\n\n[Related Products: ${categoryProducts.slice(0, 5).map(p => p.slug).join(', ')}]`,
    relatedProducts: categoryProducts.slice(0, 5).map(p => p.slug)
  });
});

// 2. Generate individual product knowledge
console.log('Generating individual product knowledge...');
products.forEach(product => {
  const price = product.price || product.price_from || 'Check website for price';
  const categories = (product.categories || []).join(', ');
  
  let content = `PRODUCT: ${product.title}\n`;
  content += `Handle: ${product.slug}\n`;
  content += `Price: ${price}\n`;
  content += `Category: ${categories}\n\n`;
  
  if (product.tagline) {
    content += `${product.tagline}\n\n`;
  }
  
  if (product.main_description) {
    content += `Description: ${product.main_description}\n\n`;
  }
  
  if (product.key_ingredients) {
    content += `Key Ingredients: ${product.key_ingredients}\n\n`;
  }
  
  if (product.how_to_use) {
    content += `How to Use: ${product.how_to_use}\n\n`;
  }
  
  content += `[Related Products: ${product.slug}]`;
  
  knowledgeChunks.push({
    source: 'product',
    source_id: product.slug,
    section: categories || 'Products',
    content: content,
    relatedProducts: [product.slug]
  });
});

// 3. Generate problem-solution knowledge
console.log('Generating problem-solution knowledge...');
Object.entries(problemSolutions).forEach(([problemId, { keywords, products: productSlugs }]) => {
  const matchedProducts = productSlugs.map(slug => {
    const product = products.find(p => p.slug === slug);
    if (product) {
      return `- ${product.title} (${product.slug}): ${product.tagline || product.main_description?.substring(0, 100) || ''}`;
    }
    return null;
  }).filter(Boolean);
  
  if (matchedProducts.length > 0) {
    const keywordList = keywords.join(', ');
    knowledgeChunks.push({
      source: 'problem-solution',
      source_id: problemId,
      section: 'Solutions',
      content: `SOLUTION FOR: ${keywordList}\n\nRecommended Mavala Products:\n${matchedProducts.join('\n')}\n\n[Related Products: ${productSlugs.join(', ')}]`,
      relatedProducts: productSlugs
    });
  }
});

// 4. Generate nail polish shade knowledge
console.log('Generating nail polish shade knowledge...');
if (shades.length > 0) {
  // Group shades by collection/category
  const shadeCollections = new Map<string, any[]>();
  shades.forEach(shade => {
    const collection = shade.collection || shade.category || 'Classic';
    if (!shadeCollections.has(collection)) {
      shadeCollections.set(collection, []);
    }
    shadeCollections.get(collection)!.push(shade);
  });
  
  shadeCollections.forEach((collectionShades, collection) => {
    const shadeList = collectionShades.map(s => `- ${s.name || s.title} (#${s.number || s.code || 'N/A'})`).join('\n');
    knowledgeChunks.push({
      source: 'nail-shades',
      source_id: `shades-${collection.toLowerCase().replace(/\s+/g, '-')}`,
      section: 'Nail Colour',
      content: `MAVALA NAIL POLISH - ${collection.toUpperCase()} COLLECTION\n\nAvailable shades:\n${shadeList}\n\nAll Mavala nail polishes are 13-Free, toxic-free, and cruelty-free.`,
      relatedProducts: ['5ml-bottles', '10ml-bottles']
    });
  });
} else {
  // Extract shade names from nail polish products
  const nailPolishProducts = products.filter(p => 
    p.categories?.includes('Nail Colour') || 
    p.categories?.includes('Nail Polish Collections')
  );
  
  nailPolishProducts.forEach(product => {
    if (product.local_images && product.local_images.length > 1) {
      // Extract shade names from image filenames
      const shadeNames = product.local_images
        .map(img => {
          const filename = img.split('\\').pop() || img.split('/').pop() || '';
          const match = filename.match(/\d+_(.+)\.(jpg|png)/i);
          if (match) {
            return match[1].replace(/\+/g, ' ').replace(/nail\s*(shade|plate)/i, '').trim();
          }
          return null;
        })
        .filter(Boolean)
        .filter(name => name && name.length > 1);
      
      if (shadeNames.length > 0) {
        knowledgeChunks.push({
          source: 'nail-shades',
          source_id: `shades-${product.slug}`,
          section: 'Nail Colour',
          content: `MAVALA NAIL POLISH - ${product.title}\n\nAvailable shades include: ${shadeNames.join(', ')}\n\n${product.tagline || ''}\n\n[Related Products: ${product.slug}]`,
          relatedProducts: [product.slug]
        });
      }
    }
  });
}

// 5. Generate FAQ-style knowledge
console.log('Generating FAQ knowledge...');
const faqs = [
  {
    question: 'What nail polish remover should I use?',
    answer: 'Mavala offers several gentle nail polish removers: BLUE NAIL POLISH REMOVER (with acetone, quick removal), CRYSTAL NAIL POLISH REMOVER (acetone-free, gentle formula), PINK NAIL POLISH REMOVER (with acetone and conditioning agents), and NAIL POLISH REMOVER PADS (convenient on-the-go pads).',
    products: ['blue-nail-polish-remover', 'crystal-nail-polish-remover', 'pink-nail-polish-remover', 'nail-polish-remover-pads']
  },
  {
    question: 'How do I remove eye makeup?',
    answer: 'For eye makeup removal, Mavala offers: TOTAL BI-PHASE MAKEUP REMOVER (dual-phase for waterproof makeup), EYE MAKEUP REMOVER LOTION (gentle liquid formula), REMOVER GEL (gel formula for sensitive eyes), and EYE MAKEUP REMOVER PADS (pre-soaked convenient pads).',
    products: ['bi-phase-make-up-remover', 'eye-make-up-remover-lotion', 'remover-gel', 'remover-pads']
  },
  {
    question: 'What products help with weak or brittle nails?',
    answer: 'For weak or brittle nails, try: MAVALA SCIENTIFIQUE (penetrating nail hardener), MAVA-STRONG (for soft, delicate nails), MAVA-FLEX (for dry, brittle nails), and BARRIER-BASE COAT (protective base coat).',
    products: ['mavala-scientifique-1', 'mava-strong', 'mava-flex-1', 'barrier-base-coat']
  },
  {
    question: 'What skincare products does Mavala offer?',
    answer: 'Mavala skincare includes: VITALIZING HEALTHY GLOW SERUM (brightening serum), MULTI-MOISTURIZING FEATHERLIGHT CREAM (lightweight moisturizer), and various face treatments from Switzerland.',
    products: ['healthy-glow-serum', 'featherlight-cream']
  },
  {
    question: 'What nail polish colors are available?',
    answer: 'Mavala offers over 200 nail polish shades in various collections including classic colors, seasonal collections, and special finishes. Available in 5ml and 10ml bottles. All polishes are 13-Free, toxic-free, and cruelty-free.',
    products: ['5ml-bottles', '10ml-bottles']
  },
  {
    question: 'How do I care for my cuticles?',
    answer: 'For cuticle care, use: CUTICLE OIL (nourishing oil to soften cuticles), CUTICLE CREAM (moisturizing cream), and CUTICLE REMOVER (gel to safely remove excess cuticle).',
    products: ['cuticle-oil', 'cuticle-cream', 'cuticle-remover']
  },
  {
    question: 'What products help with nail growth?',
    answer: 'To stimulate nail growth, try: MAVADERMA (massage brush to stimulate nail growth), MAVALA SCIENTIFIQUE (strengthens while promoting healthy growth), and maintain healthy cuticles with CUTICLE OIL.',
    products: ['mavaderma', 'mavala-scientifique-1', 'cuticle-oil']
  },
  {
    question: 'How do I stop biting my nails?',
    answer: 'MAVALA STOP is the perfect solution for nail biting. It has a bitter taste that discourages nail biting and thumb sucking. Apply to clean, dry nails daily for best results.',
    products: ['mavala-stop']
  }
];

faqs.forEach((faq, index) => {
  knowledgeChunks.push({
    source: 'faq',
    source_id: `faq-${index + 1}`,
    section: 'FAQ',
    content: `Q: ${faq.question}\n\nA: ${faq.answer}\n\n[Related Products: ${faq.products.join(', ')}]`,
    relatedProducts: faq.products
  });
});

// Output summary
console.log('\n=== KNOWLEDGE BASE SUMMARY ===');
console.log(`Total chunks: ${knowledgeChunks.length}`);
console.log(`Categories: ${productsByCategory.size}`);
console.log(`Products: ${products.length}`);
console.log(`Problem-solutions: ${Object.keys(problemSolutions).length}`);
console.log(`FAQs: ${faqs.length}`);

// Save to file for ingestion
const outputPath = path.join(__dirname, '../app/data/product-knowledge.json');
fs.writeFileSync(outputPath, JSON.stringify(knowledgeChunks, null, 2));
console.log(`\nKnowledge base saved to: ${outputPath}`);

// Also output a compact version for reference
const compactPath = path.join(__dirname, '../app/data/product-summary.txt');
let compactContent = '# MAVALA PRODUCT CATALOG SUMMARY\n\n';

productsByCategory.forEach((categoryProducts, category) => {
  compactContent += `## ${category} (${categoryProducts.length} products)\n`;
  categoryProducts.forEach(p => {
    compactContent += `- ${p.title} [${p.slug}] - ${p.price || p.price_from || 'N/A'}\n`;
  });
  compactContent += '\n';
});

fs.writeFileSync(compactPath, compactContent);
console.log(`Product summary saved to: ${compactPath}`);
