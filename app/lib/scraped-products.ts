/**
 * Load and process scraped products from all_products.json
 * Server-side only - use in Remix loaders
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export interface ScrapedProduct {
  url: string;
  slug: string;
  title: string;
  price: string;
  price_from?: string;
  rating?: number;
  review_count?: number;
  tagline?: string;
  main_description?: string;
  key_ingredients?: string;
  how_to_use?: string;
  note?: string;
  safety_directions?: string;
  first_aid?: string;
  sizes?: string[];
  images: string[];
  youtube_video?: string;
  categories?: string[];
  local_images?: string[];
  scraped_at?: string;
  [key: string]: any;
}

/**
 * Extract product title from slug if title is empty
 */
function extractTitleFromSlug(slug: string): string {
  // Remove prefix like "all-products_"
  let cleanSlug = slug.replace(/^all-products_/, '');
  
  // Convert kebab-case to Title Case
  const words = cleanSlug.split('-');
  const title = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return title;
}

/**
 * Get ALL local image paths for a product
 * Checks public/images/{slug}/ folder
 * Returns array of paths relative to public folder
 */
function getLocalImages(slug: string): string[] {
  try {
    // Try multiple possible folder names
    const folderVariants = [
      slug,
      `all-products_${slug}`,
    ];
    
    for (const folder of folderVariants) {
      // Check in public/images folder (where images were copied)
      const imageDirPath = join(process.cwd(), 'public', 'images', folder);
      
      if (existsSync(imageDirPath)) {
        const files = readdirSync(imageDirPath);
        const imageFiles = files
          .filter((f: string) => /\.(jpg|jpeg|png|webp)$/i.test(f))
          .sort();
        
        // Group by base name and prefer PNG over JPG
        const baseNames = new Map<string, string>();
        for (const file of imageFiles) {
          const baseName = file.replace(/\.(jpg|jpeg|png|webp)$/i, '');
          const ext = file.split('.').pop()?.toLowerCase() || '';
          
          // If we don't have this base yet, or if current is PNG and existing isn't
          if (!baseNames.has(baseName) || (ext === 'png' && !baseNames.get(baseName)?.endsWith('.png'))) {
            baseNames.set(baseName, file);
          }
        }
        
        // Get unique images sorted by base name
        const uniqueImages = Array.from(baseNames.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([_, filename]) => filename);
        
        if (uniqueImages.length > 0) {
          // Return all image paths relative to public folder
          return uniqueImages.map(f => `/images/${folder}/${f}`);
        }
      }
    }
    
    return [];
  } catch {
    return [];
  }
}

/**
 * Load all products from scraped JSON
 * Server-side only function
 */
export function loadScrapedProducts(): ScrapedProduct[] {
  try {
    // Try multiple possible paths - prefer new scraped data
    let jsonPath: string;
    const possiblePaths = [
      join(process.cwd(), '..', 'scraped_data', 'all_products_new.json'), // New scraped data
      join(process.cwd(), 'scraped_data', 'all_products_new.json'), // From project root
      join(process.cwd(), '..', 'scraped_data', 'all_products.json'), // Fallback old data
      join(process.cwd(), 'scraped_data', 'all_products.json'), // Fallback from project root
    ];
    
    jsonPath = possiblePaths.find(path => existsSync(path)) || possiblePaths[0];
    
    if (!existsSync(jsonPath)) {
      console.error('❌ Scraped products JSON not found. Tried paths:');
      possiblePaths.forEach(p => console.error('  -', p));
      return [];
    }
    
    console.log('✅ Loading products from:', jsonPath);
    
    const fileContent = readFileSync(jsonPath, 'utf-8');
    const products: ScrapedProduct[] = JSON.parse(fileContent);
    
    console.log('✅ Parsed', products.length, 'products from JSON');
    
    // Process products: extract titles and use local images
    return products.map((product) => {
      // Extract title if empty
      if (!product.title || product.title.trim() === '') {
        product.title = extractTitleFromSlug(product.slug);
      }
      
      // Get local images for this product
      const localImages = getLocalImages(product.slug);
      
      // Use local images if available, otherwise keep original
      if (localImages.length > 0) {
        product.images = localImages;
        product.local_images = localImages;
      } else if (!product.images || !Array.isArray(product.images)) {
        product.images = [];
      }
      
      return product;
    });
  } catch (error) {
    console.error('Error loading scraped products:', error);
    return [];
  }
}

/**
 * Convert CDN URL to local image path if local image exists
 */
function convertToLocalImage(cdnUrl: string, slug: string, localImagesList: string[]): string {
  if (!cdnUrl || !cdnUrl.includes('squarespace-cdn.com')) {
    return cdnUrl; // Already local or not a CDN URL
  }
  
  // Extract filename from CDN URL
  // Example: .../1501470975844-SV3GXW4NHOQA7RP4I9WB/Cream.jpg?format=1500w
  try {
    const url = new URL(cdnUrl);
    const pathParts = url.pathname.split('/');
    let filename = pathParts[pathParts.length - 1];
    // Remove query params
    filename = filename.split('?')[0];
    // Decode URL encoding (e.g., %2B -> +)
    filename = decodeURIComponent(filename);
    
    // Find matching local image by filename (case-insensitive, partial match)
    const filenameClean = filename.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchingLocal = localImagesList.find(localPath => {
      const localFilename = localPath.split('/').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
      return localFilename.includes(filenameClean) || filenameClean.includes(localFilename.replace(/^\d+_/, ''));
    });
    
    if (matchingLocal) {
      return matchingLocal;
    }
  } catch {
    // Invalid URL, return original
  }
  
  return cdnUrl;
}

/**
 * Load detailed product data by slug
 * Checks products_detailed folder for enhanced data with shades, gallery images, etc.
 */
export function getProductBySlug(slug: string): ScrapedProduct | null {
  // First load all products to get base data
  const allProducts = loadScrapedProducts();
  const baseProduct = allProducts.find((p) => p.slug === slug);
  
  if (!baseProduct) {
    return null;
  }
  
  // Get local images for this product
  const localImages = getLocalImages(slug);
  
  // Try to load detailed product data
  const detailedPaths = [
    join(process.cwd(), '..', 'scraped_data', 'products_detailed', `${slug}.json`),
    join(process.cwd(), 'scraped_data', 'products_detailed', `${slug}.json`),
  ];
  
  const detailedPath = detailedPaths.find(path => existsSync(path));
  
  if (detailedPath) {
    try {
      console.log('✅ Loading detailed product data from:', detailedPath);
      const detailedContent = readFileSync(detailedPath, 'utf-8');
      const detailedProduct: ScrapedProduct = JSON.parse(detailedContent);
      
      // Merge detailed data with base product (detailed takes precedence)
      const mergedProduct = { ...baseProduct, ...detailedProduct };
      
      // Convert all image URLs to local paths
      if (localImages.length > 0) {
        // Replace main images
        mergedProduct.images = localImages;
        mergedProduct.local_images = localImages;
        
        // Replace gallery_images with local images
        if (mergedProduct.gallery_images) {
          mergedProduct.gallery_images = localImages;
        }
        
        // Replace thumbnail_images with local images  
        if (mergedProduct.thumbnail_images) {
          mergedProduct.thumbnail_images = localImages;
        }
        
        // Map shade images to scraped local shade images
        if (Array.isArray(mergedProduct.shades)) {
          mergedProduct.shades = mapShadeImagesToLocal(mergedProduct.shades);
        }
        
        // Map new_shades images if present
        if (mergedProduct.new_shades && Array.isArray((mergedProduct.new_shades as any).shades)) {
          const newShades = mergedProduct.new_shades as any;
          newShades.shades = mapShadeImagesToLocal(newShades.shades);
          if (newShades.collection_image) {
            newShades.collection_image = convertToLocalImage(newShades.collection_image, slug, localImages);
          }
        }
      }
      
      return mergedProduct;
    } catch (error) {
      console.error('Error loading detailed product:', error);
    }
  }
  
  // Use local images for base product
  if (localImages.length > 0) {
    baseProduct.images = localImages;
    baseProduct.local_images = localImages;
  }
  
  return baseProduct;
}

/**
 * Normalize string by removing accents and special characters for better matching
 */
function normalizeForMatching(str: string): string {
  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
    .replace(/[*\.]/g, '') // Remove asterisks and periods
    .replace(/-/g, ' ') // Convert hyphens to spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Map shade images to scraped local images from public/images/shades/
 * Matches shade names to folder names like "9 LISBOA"
 * ONLY returns shades that have local images (filters out "Special" category shades from mavala.au)
 */
function mapShadeImagesToLocal(shades: Array<{ name: string; image: string }>): Array<{ name: string; image: string }> {
  try {
    const shadesDir = join(process.cwd(), 'public', 'images', 'shades');
    
    if (!existsSync(shadesDir)) {
      return []; // No scraped shades folder, return empty (we only want local images)
    }
    
    // Get all shade folders
    const shadeFolders = readdirSync(shadesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Map each shade to its local images and filter out those without local images
    const mappedShades: Array<{ name: string; image: string }> = [];
    
    for (const shade of shades) {
      // Try to find matching folder
      // Shade name might be "9. LISBOA" or "LISBOA" or "22 GENEVE"
      // Folder name might be "9 LISBOA" or "22 GENÈVE" (with accents)
      const shadeName = normalizeForMatching(shade.name);
      
      const matchingFolder = shadeFolders.find(folder => {
        const folderName = normalizeForMatching(folder);
        // Try exact match first
        if (folderName === shadeName) return true;
        // Try partial match (e.g., "9 LISBOA" contains "LISBOA")
        if (folderName.includes(shadeName) || shadeName.includes(folderName)) return true;
        // Try matching just the shade number and city name
        const shadeWords = shadeName.split(/\s+/);
        return shadeWords.every(word => word && folderName.includes(word));
      });
      
      if (matchingFolder) {
        // Get first image from this folder, preferring PNG over JPG
        const folderPath = join(shadesDir, matchingFolder);
        const allFiles = readdirSync(folderPath)
          .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
        
        // Group files by base name and prefer PNG over JPG
        const baseNames = new Map<string, string>();
        for (const file of allFiles) {
          const baseName = file.replace(/\.(jpg|jpeg|png|webp)$/i, '');
          const ext = file.split('.').pop()?.toLowerCase() || '';
          
          // If we don't have this base yet, or if current is PNG and existing isn't
          if (!baseNames.has(baseName) || (ext === 'png' && !baseNames.get(baseName)?.endsWith('.png'))) {
            baseNames.set(baseName, file);
          }
        }
        
        // Get the first image (sorted by base name)
        const sortedImages = Array.from(baseNames.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([_, filename]) => filename);
        
        if (sortedImages.length > 0) {
          // Return path to first image - only include shades with local images
          mappedShades.push({
            ...shade,
            image: `/images/shades/${matchingFolder}/${sortedImages[0]}`
          });
        }
      }
      // If no matching folder found, shade is filtered out (not included in result)
    }
    
    return mappedShades;
  } catch (error) {
    console.error('Error mapping shade images:', error);
    return []; // Return empty on error - only want local images
  }
}

/**
 * Get products by category
 */
export function getProductsByCategory(
  products: ScrapedProduct[],
  category: string | null
): ScrapedProduct[] {
  if (!category || category === 'All' || category === '') {
    return products;
  }
  
  // First try to match using the categories array from scraped data
  const matchedByCategory = products.filter((product) => {
    if (product.categories && Array.isArray(product.categories)) {
      return product.categories.some(
        (cat) => cat.toLowerCase() === category.toLowerCase()
      );
    }
    return false;
  });
  
  // If we found products by category, return them
  if (matchedByCategory.length > 0) {
    return matchedByCategory;
  }
  
  // Fallback to keyword matching for products without categories
  const categoryKeywords: Record<string, string[]> = {
    'Complexion': ['complexion', 'foundation', 'concealer', 'powder', 'bb cream'],
    'Cuticle Care': ['cuticle', 'nail', 'mava'],
    'Eye Colour': ['eye shadow', 'eyelid', 'eye colour'],
    'Eyebrows & Lashes': ['lash', 'brow', 'eyebrow', 'mascara', 'double-lash', 'double-brow'],
    'Foot Care': ['foot', 'pedi'],
    'Gift Sets': ['kit', 'set', 'gift', 'coffret', 'collection'],
    'Hair & Body': ['hair', 'body', 'tanoa'],
    'Hand care': ['hand', 'hand cream'],
    'Lip balm': ['lip balm', 'lip-balm'],
    'Lip Colour': ['lipstick', 'lip', 'lip colour', 'lip-colour', 'mavalip'],
    'Makeup Removers': ['remover', 'makeup remover', 'make-up remover'],
    'Manicure Essentials': ['manicure', 'nail', 'emery', 'buffer', 'scissors', 'clippers', 'stick'],
    'Nail Colour': ['nail polish', 'nail-polish', 'shades', 'colors', 'colours', 'pop wave', 'neo nudes'],
    'Nail Polish Collections': ['collection', 'pop wave', 'neo nudes', 'terra topia', 'yummy', 'whisper'],
    'Nail Polish Removers': ['remover', 'nail polish remover', 'thinner'],
    'Nail Repair': ['scientifique', 'nailactan', 'mava-flex', 'mavaderma', 'nail shield', 'ridge filler'],
    'Skincare': ['skin', 'serum', 'cream', 'mask', 'chrono', 'anti-age', 'multi-moisturizing', 'vitalizing'],
  };
  
  const keywords = categoryKeywords[category] || [category.toLowerCase()];
  
  return products.filter((product) => {
    const searchText = `${product.title} ${product.slug} ${product.main_description || ''}`.toLowerCase();
    return keywords.some((keyword) => searchText.includes(keyword.toLowerCase()));
  });
}

/**
 * Category list matching the reference site
 */
export const CATEGORIES = [
  'All',
  'Complexion',
  'Cuticle Care',
  'Eye Colour',
  'Eyebrows & Lashes',
  'Foot Care',
  'Gift Sets',
  'Hair & Body',
  'Hand care',
  'Lip balm',
  'Lip Colour',
  'Makeup Removers',
  'Manicure Essentials',
  'Nail Colour',
  'Nail Polish Collections',
  'Nail Polish Removers',
  'Nail Repair',
  'Skincare',
];

