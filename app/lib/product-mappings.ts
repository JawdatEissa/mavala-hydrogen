/**
 * Smart Product Mapping System
 * 
 * Maps user intents, keywords, and concerns to relevant product handles.
 * Used by the chatbot to provide accurate product recommendations.
 */

// =========================================
// Category-Based Product Mappings
// =========================================

export const CATEGORY_PRODUCTS: Record<string, string[]> = {
  // NAIL CARE - Penetrating Nail Care
  "nail strengthening": ["mavala-scientifique-1", "mava-strong", "mava-flex-1", "barrier-base-coat"],
  "weak nails": ["mavala-scientifique-1", "mava-strong", "barrier-base-coat"],
  "brittle nails": ["mava-flex-1", "mavala-scientifique-1", "cuticle-oil"],
  "soft nails": ["mava-strong", "mavala-scientifique-1"],
  "nail hardener": ["mavala-scientifique-1", "mava-strong"],
  "nail growth": ["mavaderma", "mavala-scientifique-1", "cuticle-oil"],
  "nail biting": ["mavala-stop"],
  "stop biting": ["mavala-stop"],
  
  // NAIL CARE - Cuticle Care
  "cuticle": ["cuticle-oil", "cuticle-cream", "cuticle-remover"],
  "cuticle oil": ["cuticle-oil"],
  "cuticle cream": ["cuticle-cream"],
  "cuticle remover": ["cuticle-remover"],
  "dry cuticles": ["cuticle-oil", "cuticle-cream"],
  "hard cuticles": ["cuticle-remover", "cuticle-oil"],
  
  // NAIL CARE - Nail Camouflage
  "nail camouflage": ["mava-white", "mavala-scientifique-1"],
  "yellow nails": ["mava-white", "barrier-base-coat"],
  "stained nails": ["mava-white", "barrier-base-coat"],
  "nail whitening": ["mava-white"],
  
  // NAIL CARE - Nail Beauty / Base & Top Coats
  "base coat": ["barrier-base-coat", "002-base-coat", "protective-base-coat"],
  "top coat": ["colorfix", "gel-finish-top-coat", "star-top-coat"],
  "nail shine": ["colorfix", "gel-finish-top-coat", "star-top-coat"],
  "matte finish": ["matte-top-coat"],
  "quick dry": ["speed-dry-silicium-top-coat", "mavadry"],
  
  // NAIL CARE - Manicure Instruments
  "manicure tools": ["emery-boards", "nail-file-1", "nail-scissors-1", "clippers", "cuticle-nippers"],
  "nail file": ["emery-boards", "nail-file-1", "sapphire-nail-file", "glass-nail-file"],
  "nail scissors": ["nail-scissors-1", "baby-nail-scissors"],
  "nail clippers": ["clippers"],
  
  // NAIL CARE - Nail Polish Removers
  "nail polish remover": ["blue-nail-polish-remover", "crystal-nail-polish-remover", "pink-nail-polish-remover", "nail-polish-remover-pads"],
  "remover": ["blue-nail-polish-remover", "crystal-nail-polish-remover", "pink-nail-polish-remover"],
  "acetone": ["blue-nail-polish-remover", "pink-nail-polish-remover"],
  "acetone free": ["crystal-nail-polish-remover"],
  "gentle remover": ["crystal-nail-polish-remover"],
  
  // NAIL POLISH - By Color
  "grey nail polish": ["grey-shades"],
  "gray nail polish": ["grey-shades"],
  "red nail polish": ["red-shades"],
  "pink nail polish": ["pink-shades"],
  "nude nail polish": ["nude-shades"],
  "blue nail polish": ["blue-shades"],
  "purple nail polish": ["purple-shades"],
  "green nail polish": ["green-shades"],
  "brown nail polish": ["brown-shades"],
  "black nail polish": ["black-shades"],
  "white nail polish": ["white-shades"],
  "coral nail polish": ["coral-shades"],
  "orange nail polish": ["orange-shades"],
  "gold nail polish": ["gold-shades"],
  "burgundy nail polish": ["burgundy-shades"],
  
  // HAND CARE
  "hand cream": ["hand-cream", "mava-hand-cream-1"],
  "dry hands": ["hand-cream", "mava-hand-cream-1", "cotton-gloves"],
  "hand moisturizer": ["hand-cream", "mava-hand-cream-1"],
  "age spots": ["anti-spot-cream-for-hands"],
  "hand spots": ["anti-spot-cream-for-hands"],
  "hand protection": ["hand-cream", "cotton-gloves"],
  
  // FOOT CARE
  "foot care": ["foot-bath-salts", "repairing-night-cream-for-feet", "conditioning-foot-moisturiser"],
  "dry feet": ["repairing-night-cream-for-feet", "conditioning-foot-moisturiser"],
  "cracked heels": ["repairing-night-cream-for-feet", "foot-scrub-mask"],
  "foot cream": ["repairing-night-cream-for-feet", "conditioning-foot-moisturiser"],
  "foot bath": ["foot-bath-salts", "concentrated-foot-bath"],
  "foot odor": ["deodorising-foot-gel"],
  "pedicure": ["foot-bath-salts", "foot-scrub-mask", "repairing-night-cream-for-feet"],
  
  // SKINCARE - Cleansing
  "cleanser": ["cleansing-milk", "foaming-cleanser"],
  "cleansing": ["cleansing-milk", "foaming-cleanser", "cleansing-gel"],
  "toner": ["caress-toning-lotion"],
  "makeup remover": ["bi-phase-make-up-remover", "eye-make-up-remover-lotion", "remover-gel", "remover-pads"],
  "eye makeup remover": ["eye-make-up-remover-lotion", "remover-gel", "remover-pads"],
  
  // SKINCARE - Moisturizing
  "moisturizer": ["featherlight-cream", "nourishing-cream", "chronobiological-cream"],
  "face cream": ["featherlight-cream", "nourishing-cream", "chronobiological-cream"],
  "dry skin": ["nourishing-cream", "featherlight-cream"],
  "hydration": ["featherlight-cream", "healthy-glow-serum"],
  "serum": ["healthy-glow-serum", "chronobiological-serum"],
  
  // SKINCARE - Anti-Aging
  "anti aging": ["chronobiological-cream", "chronobiological-serum", "nutrition-absolute-night-balm"],
  "anti-aging": ["chronobiological-cream", "chronobiological-serum", "nutrition-absolute-night-balm"],
  "wrinkles": ["chronobiological-cream", "chronobiological-serum"],
  "night cream": ["nutrition-absolute-night-balm", "nourishing-cream"],
  
  // EYE BEAUTY - Eye Colour
  "eyeshadow": ["duo-satin-eye-shadow-powder", "eye-shadow-crayon"],
  "eye shadow": ["duo-satin-eye-shadow-powder", "eye-shadow-crayon"],
  "eyeliner": ["khol-kajal-eye-contour-pencil", "eye-liner-pencil"],
  "eye pencil": ["khol-kajal-eye-contour-pencil", "eye-liner-pencil"],
  
  // EYE BEAUTY - Eyebrows & Lashes
  "mascara": ["creamy-mascara", "mascara-volume-longueur"],
  "lashes": ["double-lash", "creamy-mascara"],
  "lash growth": ["double-lash"],
  "eyebrow": ["double-brow", "eyebrow-pencil", "eyebrow-gel"],
  "brow": ["double-brow", "eyebrow-pencil", "eyebrow-gel"],
  "brow growth": ["double-brow"],
  
  // FACE & LIPS - Complexion
  "foundation": ["serum-foundation", "fluid-foundation"],
  "concealer": ["cover-stick-concealer"],
  "powder": ["silk-effect-powder", "blotting-powder"],
  "blush": ["blush-powder"],
  
  // FACE & LIPS - Lip Products
  "lipstick": ["mavala-lipstick", "mavalip-lipstick", "lip-shine"],
  "lip gloss": ["lip-gloss"],
  "lip balm": ["lip-balm", "lip-base-balm"],
  "lip liner": ["lip-liner-pencil"],
  "dry lips": ["lip-balm", "lip-base-balm"],
  
  // GIFT SETS
  "gift set": ["cube", "delightful", "nail-essentials-box", "a-rose-by-any-other-name"],
  "gift": ["cube", "delightful", "nail-essentials-box"],
  "starter kit": ["nail-essentials-box", "cuticle-care"],
};

// =========================================
// Keyword Synonyms (maps user terms to standard keywords)
// =========================================

export const KEYWORD_SYNONYMS: Record<string, string> = {
  // Nail issues
  "peeling": "brittle nails",
  "breaking": "weak nails",
  "splitting": "brittle nails",
  "thin nails": "weak nails",
  "damaged nails": "weak nails",
  "nail damage": "weak nails",
  "strengthen": "nail strengthening",
  "stronger nails": "nail strengthening",
  "grow nails": "nail growth",
  "grow faster": "nail growth",
  "stop biting nails": "nail biting",
  
  // Skincare
  "moisturize": "moisturizer",
  "hydrate": "hydration",
  "aging": "anti aging",
  "fine lines": "wrinkles",
  "oily skin": "cleanser",
  
  // Hand/Foot
  "rough hands": "dry hands",
  "cracked hands": "dry hands",
  "tired feet": "foot care",
  "rough feet": "dry feet",
  
  // Makeup
  "eye makeup": "eyeshadow",
  "lip color": "lipstick",
  "lip colour": "lipstick",
  
  // Polish
  "nail color": "nail polish",
  "nail colour": "nail polish",
  "polish": "nail polish",
  "varnish": "nail polish",
  "lacquer": "nail polish",
};

// =========================================
// Helper Functions
// =========================================

/**
 * Find relevant products based on user question/text
 */
export function findRelevantProducts(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const foundProducts: string[] = [];
  
  // First, check for synonym mappings
  let searchText = normalizedText;
  for (const [synonym, keyword] of Object.entries(KEYWORD_SYNONYMS)) {
    if (normalizedText.includes(synonym)) {
      searchText = searchText.replace(synonym, keyword);
    }
  }
  
  // Then, check category mappings
  for (const [keyword, products] of Object.entries(CATEGORY_PRODUCTS)) {
    if (searchText.includes(keyword) || normalizedText.includes(keyword)) {
      foundProducts.push(...products);
    }
  }
  
  // Deduplicate and limit
  return [...new Set(foundProducts)].slice(0, 5);
}

/**
 * Get products for a specific category
 */
export function getProductsForCategory(category: string): string[] {
  const normalizedCategory = category.toLowerCase();
  
  // Direct match
  if (CATEGORY_PRODUCTS[normalizedCategory]) {
    return CATEGORY_PRODUCTS[normalizedCategory];
  }
  
  // Partial match
  for (const [key, products] of Object.entries(CATEGORY_PRODUCTS)) {
    if (key.includes(normalizedCategory) || normalizedCategory.includes(key)) {
      return products;
    }
  }
  
  return [];
}
