// Product mapping for blog images to product URLs
// Maps image alt text, filenames, and keywords to product handles

export interface ProductMapping {
  keywords: string[];
  handle: string;
  title: string;
}

// Comprehensive product mapping - keywords match alt text OR filename (concatenated, no spaces)
// Uses correct product slugs from the store
export const PRODUCT_MAPPINGS: ProductMapping[] = [
  // Nail Polish Colors - link to color page
  { keywords: ['white orchid', '257', 'orchid', 'whiteorchid'], handle: 'color', title: 'Nail Colors' },
  { keywords: ['geneve', '22 geneve', '022', '22geneve'], handle: 'color', title: 'Nail Colors' },
  { keywords: ['izmir', '47 izmir', '047', '47izmir'], handle: 'color', title: 'Nail Colors' },
  { keywords: ['lotus', '399', '399 lotus', '399lotus'], handle: 'color', title: 'Nail Colors' },
  { keywords: ['windsor', '993', '993windsor'], handle: 'color', title: 'Nail Colors' },
  
  // Nail Care Products
  { keywords: ['mava-strong', 'mava strong', 'mavastrong', 'mava-strong-1'], handle: 'mava-strong', title: 'Mava-Strong' },
  { keywords: ['nailactan'], handle: 'nailactan-1', title: 'Nailactan' },
  { keywords: ['scientifique', 'nail hardener', 'mavalascientifique'], handle: 'mavala-scientifique-1', title: 'Mavala Scientifique' },
  { keywords: ['cuticleremover', 'cuticle remover', 'mavalacuticleremover'], handle: 'cuticle-remover', title: 'Cuticle Remover' },
  { keywords: ['cuticle oil', 'cuticleoil'], handle: 'cuticle-oil', title: 'Cuticle Oil' },
  { keywords: ['correcteur', 'correcteurpen'], handle: 'correcteur-pen', title: 'Correcteur Pen' },
  { keywords: ['nailpolishremoverpink', 'pink remover', 'pinkremover', 'removerpink'], handle: 'pink-nail-polish-remover', title: 'Pink Nail Polish Remover' },
  { keywords: ['nailpolishremoverblue', 'blue remover', 'blueremover'], handle: 'blue-nail-polish-remover', title: 'Blue Nail Polish Remover' },
  { keywords: ['crystalnailpolishremover', 'crystal remover'], handle: 'crystal-nail-polish-remover', title: 'Crystal Nail Polish Remover' },
  
  // Hand & Foot Care
  { keywords: ['prebiotichandcream', 'prebiotic hand cream', 'prebiotichand'], handle: 'prebiotic-hand-cream', title: 'Prebiotic Hand Cream' },
  { keywords: ['mava+extreme', 'mavaextreme', 'mava+ hand', 'mava+handcream', 'extremecareforhands'], handle: 'mava-hand-cream-1', title: 'Mava+ Hand Cream' },
  { keywords: ['smoothingscrubcream', 'smoothing scrub', 'scrubcreamforfeet', 'footscrub'], handle: 'smoothing-foot-scrub', title: 'Smoothing Scrub Cream' },
  
  // Face Care Products
  { keywords: ['serumfoundation', 'serum foundation', 'serumfoundationaward'], handle: 'serum-foundation', title: 'Serum Foundation' },
  { keywords: ['perfectconcealer', 'perfect concealer', 'concealer2'], handle: 'mavalia-concealer', title: 'Perfect Concealer' },
  { keywords: ['poredetox', 'pore detox', 'purifyingmask', 'poredetoxpurifying'], handle: 'purifying-mask', title: 'Purifying Mask' },
  { keywords: ['hydra-mat', 'hydramat', 'hydramatt', 'hydra-matt', 'usingporedetoxhydra'], handle: 'hydra-matt-fluid', title: 'Hydra-Matt Fluid' },
  { keywords: ['magicpowder', 'magic powder', 'kabuki', 'kabukibrush'], handle: 'magic-powder', title: 'Magic Powder' },
  { keywords: ['aquaplus', 'aqua plus', 'sleepingmask', 'aq2bsleepingmask', 'moisturizingsleeping'], handle: 'sleeping-mask', title: 'Sleeping Mask' },
  
  // Eye Care
  { keywords: ['eyecontourgel', 'eye contour gel', 'eye gel'], handle: 'eye-contour-gel', title: 'Eye Contour Gel' },
  { keywords: ['eyecontourcream', 'eye contour cream', 'doublecream'], handle: 'eye-contour-double-cream', title: 'Eye Contour Cream' },
  { keywords: ['double-brow', 'doublebrow', 'double brow'], handle: 'double-brow', title: 'Double-Brow' },
  { keywords: ['double-lash', 'doublelash', 'double lash'], handle: 'double-lash', title: 'Double-Lash' },
  
  // Eyelid/Eye Makeup
  { keywords: ['satineyelid', 'satin eyelid', 'eyelidpowder'], handle: 'satin-eyelid-powder', title: 'Satin Eyelid Powder' },
  { keywords: ['kholkajal', 'khol kajal', 'kohl kajal', 'kajal'], handle: 'khol-kajal-eye-contour-pencil', title: 'Khol-Kajal Pencil' },
  
  // Mini Colors / Nail Polish Collections
  { keywords: ['minicolor', 'mini color', 'popwave', 'newcollection'], handle: 'i-love-mini-colors', title: 'Mini Colors' },
];

/**
 * Find product link from image alt text or filename
 * @param altText - Image alt text
 * @param filename - Image filename
 * @returns Product URL path or null
 */
export function getProductLink(altText?: string, filename?: string): string | null {
  const searchText = `${altText || ''} ${filename || ''}`.toLowerCase();
  
  for (const mapping of PRODUCT_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return `/products/${mapping.handle}`;
      }
    }
  }
  
  return null;
}

/**
 * Get product title from image
 */
export function getProductTitle(altText?: string, filename?: string): string | null {
  const searchText = `${altText || ''} ${filename || ''}`.toLowerCase();
  
  for (const mapping of PRODUCT_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return mapping.title;
      }
    }
  }
  
  return null;
}

/**
 * Check if image is a product image
 */
export function isProductImage(altText?: string, filename?: string, width?: number, height?: number): boolean {
  // Check by size - product images tend to be smaller and portrait
  const isSmallSize = width && height && width < 500 && height < 700;
  
  // Check by keywords
  const hasProductKeyword = getProductLink(altText, filename) !== null;
  
  // Check by filename patterns
  const filenamePatterns = ['.png', '.jpg', 'mava', 'nail', 'cream', 'serum', 'gel', 'remover', 'powder'];
  const hasProductFilename = filename && filenamePatterns.some(p => filename.toLowerCase().includes(p));
  
  return hasProductKeyword || (isSmallSize && hasProductFilename);
}
