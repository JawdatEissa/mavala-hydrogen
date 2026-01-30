// Product mapping for blog images to product URLs
// Maps image alt text, filenames, and keywords to product handles

export interface ProductMapping {
  keywords: string[];
  handle: string;
  title: string;
}

// Comprehensive product mapping
export const PRODUCT_MAPPINGS: ProductMapping[] = [
  // Nail Polish Colors - White/Cream Shades
  { keywords: ['white orchid', '257', 'orchid'], handle: 'white-shades', title: 'White Shades' },
  { keywords: ['geneve', '22 geneve', '022'], handle: 'white-shades', title: 'White Shades' },
  { keywords: ['izmir', '47 izmir', '047'], handle: 'white-shades', title: 'White Shades' },
  { keywords: ['lotus', '399', '399 lotus'], handle: 'white-shades', title: 'White Shades' },
  { keywords: ['windsor', '993'], handle: 'red-shades', title: 'Red Shades' },
  
  // Nail Care Products
  { keywords: ['mava-strong', 'mava strong', 'mavastrong'], handle: 'mava-strong', title: 'Mava-Strong' },
  { keywords: ['nailactan'], handle: 'nailactan', title: 'Nailactan' },
  { keywords: ['scientifique', 'nail hardener'], handle: 'mavala-scientifique', title: 'Mavala Scientifique' },
  { keywords: ['cuticle remover'], handle: 'cuticle-remover', title: 'Cuticle Remover' },
  { keywords: ['cuticle oil'], handle: 'cuticle-oil', title: 'Cuticle Oil' },
  { keywords: ['correcteur', 'correcteur pen'], handle: 'correcteur-pen', title: 'Correcteur Pen' },
  { keywords: ['nail polish remover pink', 'pink remover', 'pink nail polish remover'], handle: 'pink-nail-polish-remover', title: 'Pink Nail Polish Remover' },
  { keywords: ['nail polish remover blue', 'blue remover'], handle: 'blue-nail-polish-remover', title: 'Blue Nail Polish Remover' },
  { keywords: ['crystal nail polish remover', 'crystal remover'], handle: 'crystal-nail-polish-remover', title: 'Crystal Nail Polish Remover' },
  
  // Hand & Foot Care
  { keywords: ['prebiotic hand cream', 'hand cream prebiotic'], handle: 'prebiotic-hand-cream', title: 'Prebiotic Hand Cream' },
  { keywords: ['mava+ hand cream', 'mava hand cream', 'mava+ extreme', 'mava extreme'], handle: 'mava-hand-cream', title: 'Mava+ Hand Cream' },
  { keywords: ['smoothing scrub cream for feet', 'scrub feet', 'foot scrub'], handle: 'smoothing-scrub-cream-for-feet', title: 'Smoothing Scrub Cream for Feet' },
  
  // Face Care Products
  { keywords: ['serum foundation'], handle: 'serum-foundation', title: 'Serum Foundation' },
  { keywords: ['perfect concealer', 'concealer'], handle: 'perfect-concealer', title: 'Perfect Concealer' },
  { keywords: ['pore detox', 'purifying mask', 'pore detox purifying'], handle: 'pore-detox-purifying-mask', title: 'Pore Detox Purifying Mask' },
  { keywords: ['hydra-mat', 'hydra mat fluid', 'pore detox hydra'], handle: 'perfecting-hydra-matt-fluid', title: 'Perfecting Hydra-Matt Fluid' },
  { keywords: ['magic powder', 'kabuki'], handle: 'magic-powder', title: 'Magic Powder' },
  { keywords: ['aqua plus', 'multi-moisturizing sleeping', 'sleeping mask', 'aq2b'], handle: 'aqua-plus-multi-moisturizing-sleeping-mask', title: 'Aqua Plus Multi-Moisturizing Sleeping Mask' },
  
  // Eye Care
  { keywords: ['eye contour gel', 'eye gel'], handle: 'eye-contour-gel', title: 'Eye Contour Gel' },
  { keywords: ['eye contour cream', 'eye cream', 'double cream'], handle: 'eye-contour-double-cream', title: 'Eye Contour Double Cream' },
  { keywords: ['double-brow', 'double brow'], handle: 'double-brow', title: 'Double-Brow' },
  { keywords: ['double-lash', 'double lash'], handle: 'double-lash', title: 'Double-Lash' },
  
  // Eyelid/Eye Makeup
  { keywords: ['satin eyelid powder', 'pearl undertones'], handle: 'satin-eyelid-powder', title: 'Satin Eyelid Powder' },
  { keywords: ['khol kajal', 'kohl kajal', 'eye contour pencil'], handle: 'khol-kajal-eye-contour-pencil', title: 'Khol-Kajal Eye Contour Pencil' },
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
