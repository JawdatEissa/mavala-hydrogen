/**
 * Mock Data System
 * Uses sample data for development
 * Will be replaced with Shopify Storefront API when account is ready
 */

export interface Product {
  url: string;
  slug: string;
  title: string;
  price: string;
  description: string;
  key_ingredients: string;
  how_to_use: string;
  safety_directions: string;
  first_aid: string;
  sizes: string[];
  images: string[];
}

export interface BlogPost {
  url: string;
  slug: string;
  title: string;
  categories: string[];
  date: string;
  content_blocks: ContentBlock[];
  full_html: string;
}

export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'bold_text' | 'image';
  content?: string;
  src?: string;
  alt?: string;
  level?: number;
}

// Sample products for development
export const products: Product[] = [
  {
    url: 'https://mavala.com.au/all-products/mavala-scientifique-k',
    slug: 'mavala-scientifique-k',
    title: 'MAVALA SCIENTIFIQUE K+',
    price: '$24.95',
    description: 'Penetrating nail hardener without formaldehyde. Winner of the 2021 Prevention Best of Beauty Award for Best Nail Strengthener.',
    key_ingredients: 'Mavala\'s exclusive complex, regenerating, anti-drying and strengthener of nails. Free from phthalates and paraben. Vegan product.',
    how_to_use: 'Remove your nail polish or any oily film and clean nails thoroughly. Brush on to the free edge of the nails. Leave on for one minute to set.',
    safety_directions: 'Do not swallow. Avoid contact with eyes.',
    first_aid: 'For advice, contact a Poisons Information Centre.',
    sizes: ['5ml', '10ml'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/55432595e4b05903a7a1130b/1622616833063-M4M8AEWSZ4R36B99A2WF/scientifique-k.jpg',
      'https://images.squarespace-cdn.com/content/v1/55432595e4b05903a7a1130b/1622616833063-XXXXXX/scientifique-k-2.jpg',
    ],
  },
  {
    url: 'https://mavala.com.au/all-products/double-lash',
    slug: 'double-lash',
    title: 'DOUBLE-LASH',
    price: '$32.95',
    description: 'A nutritive serum for longer, denser lashes and brows. Contains natural extract rich in vitamins and proteins.',
    key_ingredients: 'Natural extract rich in vitamins and proteins that strengthens, covers and protects the lashes.',
    how_to_use: 'Apply every night on clean lashes using the applicator brush. Can also be applied to eyebrows.',
    safety_directions: '',
    first_aid: '',
    sizes: ['10ml'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/55432595e4b05903a7a1130b/1622616833063-M4M8AEWSZ4R36B99A2WF/double-lash.jpg',
    ],
  },
  {
    url: 'https://mavala.com.au/all-products/hand-cream',
    slug: 'hand-cream',
    title: 'HAND CREAM',
    price: '$19.95',
    description: 'A daily care that moisturises and protects your hands. Specially formulated for dry, damaged hands and sensitive skin.',
    key_ingredients: 'Marine collagen, very moisturizing, and allantoin, well-known for its healing properties.',
    how_to_use: 'Apply to hands as needed throughout the day.',
    safety_directions: '',
    first_aid: '',
    sizes: ['50ml', '120ml'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/55432595e4b05903a7a1130b/1622616833063-M4M8AEWSZ4R36B99A2WF/hand-cream.jpg',
    ],
  },
  {
    url: 'https://mavala.com.au/all-products/mavala-lipstick',
    slug: 'mavala-lipstick',
    title: 'MAVALA LIPSTICK',
    price: '$29.95',
    description: 'Moisturising, comfortable satin lipstick. Winner of the 2021 Prevention Best of Beauty Award for Best Lipstick.',
    key_ingredients: 'Rich in moisturizing ingredients for comfortable wear.',
    how_to_use: 'Apply directly to lips. Can be used with or without lip liner.',
    safety_directions: '',
    first_aid: '',
    sizes: [],
    images: [
      'https://images.squarespace-cdn.com/content/v1/55432595e4b05903a7a1130b/1622616833063-M4M8AEWSZ4R36B99A2WF/lipstick.jpg',
    ],
  },
  {
    url: 'https://mavala.com.au/all-products/serum-foundation',
    slug: 'serum-foundation',
    title: 'SERUM FOUNDATION',
    price: '$49.95',
    description: 'Radiance serum in a second-skin foundation. Winner of the 2025 Prevention Beauty Awards.',
    key_ingredients: '83% skincare ingredients. Non-comedogenic fluid texture.',
    how_to_use: 'Apply with fingertips or brush, blending outward from center of face.',
    safety_directions: '',
    first_aid: '',
    sizes: ['30ml'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/55432595e4b05903a7a1130b/1622616833063-M4M8AEWSZ4R36B99A2WF/serum-foundation.jpg',
    ],
  },
  {
    url: 'https://mavala.com.au/all-products/pop-wave',
    slug: 'pop-wave',
    title: 'POP WAVE',
    price: '$11.95',
    description: 'A wave of freshness and colourful energy. Inspired by the 70\'s, this collection revisits the retro spirit.',
    key_ingredients: 'Toxic free, cruelty free nail polish formula.',
    how_to_use: 'Apply two coats over base coat, finish with top coat.',
    safety_directions: '',
    first_aid: '',
    sizes: ['5ml'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/55432595e4b05903a7a1130b/1717560497169-21EB467JG56BQC8ME5V5/pop-wave.jpg',
    ],
  },
  {
    url: 'https://mavala.com.au/all-products/cuticle-oil',
    slug: 'cuticle-oil',
    title: 'CUTICLE OIL',
    price: '$18.95',
    description: 'Nourishing oil for cuticles and nails. Softens and conditions dry cuticles.',
    key_ingredients: 'Blend of nourishing oils to hydrate and protect.',
    how_to_use: 'Apply daily to cuticles and massage gently.',
    safety_directions: '',
    first_aid: '',
    sizes: ['10ml'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/55432595e4b05903a7a1130b/1622616833063-M4M8AEWSZ4R36B99A2WF/cuticle-oil.jpg',
    ],
  },
  {
    url: 'https://mavala.com.au/all-products/mavala-stop',
    slug: 'mavala-stop',
    title: 'MAVALA STOP',
    price: '$19.95',
    description: 'Helps discourage nail biting and thumb sucking. Bitter-tasting formula.',
    key_ingredients: 'Bitter-tasting, harmless ingredients.',
    how_to_use: 'Apply to nails daily. Reapply after hand washing.',
    safety_directions: 'Not for children under 3 years.',
    first_aid: '',
    sizes: ['10ml'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/55432595e4b05903a7a1130b/1622616833063-M4M8AEWSZ4R36B99A2WF/mavala-stop.jpg',
    ],
  },
];

// Sample blog posts
export const blogPosts: BlogPost[] = [
  {
    url: 'https://mavala.com.au/blog/breaking-up-with-synthetic-nails',
    slug: 'breaking-up-with-synthetic-nails',
    title: 'Breaking Up with Synthetic Nails!',
    categories: ['Manicure', 'Nail care', 'Tips'],
    date: 'October 15, 2024',
    content_blocks: [
      { type: 'paragraph', content: 'Have synthetic nails been your go-to beauty staple? In light of the recent EU gel poison polish ban it\'s time to consider breaking up with synthetic nails and embracing a healthier option… your natural nails.' },
      { type: 'heading', content: 'Step 1: Remove safely', level: 2 },
      { type: 'paragraph', content: 'Resist the urge to peel or pick! Improper removal can cause significant damage. The safest option is to let a professional nail technician remove properly.' },
      { type: 'image', src: 'https://images.squarespace-cdn.com/content/v1/55432595e4b05903a7a1130b/blog-synthetic-nails.jpg', alt: 'Natural nail care' },
    ],
    full_html: '',
  },
  {
    url: 'https://mavala.com.au/blog/nail-trends',
    slug: 'nail-trends',
    title: 'New Season Nail Trends',
    categories: ['Nail polish', 'Tips'],
    date: 'September 20, 2024',
    content_blocks: [
      { type: 'paragraph', content: 'Nails are the ultimate accessory; adaptable, short-lived bursts of fun and quick to nail! Mavala\'s Global Trainer shares the latest trends to inspire you for the sunshine season ahead.' },
      { type: 'heading', content: 'Trending Colors', level: 2 },
      { type: 'paragraph', content: 'Bold reds, soft pinks, and earthy nudes are dominating this season.' },
    ],
    full_html: '',
  },
  {
    url: 'https://mavala.com.au/blog/power-of-pink',
    slug: 'power-of-pink',
    title: 'The Power Of Pink Campaign',
    categories: ['Tips', 'Community'],
    date: 'August 10, 2024',
    content_blocks: [
      { type: 'paragraph', content: 'In the time between waking up this morning and going to sleep tonight, 58 Canadians will be told they have breast cancer. Let\'s join forces!' },
      { type: 'image', src: 'https://images.squarespace-cdn.com/content/v1/55432595e4b05903a7a1130b/power-of-pink.jpg', alt: 'Power of Pink Campaign' },
    ],
    full_html: '',
  },
  {
    url: 'https://mavala.com.au/blog/summer-skincare',
    slug: 'summer-skincare',
    title: 'Summer Skincare Essentials',
    categories: ['Skincare', 'Tips'],
    date: 'July 5, 2024',
    content_blocks: [
      { type: 'paragraph', content: 'As temperatures rise, your skincare routine needs to adapt. Here are our top tips for keeping your skin healthy and glowing all summer long.' },
    ],
    full_html: '',
  },
];

// Helper functions
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug || p.url.includes(slug));
}

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((b) => b.slug === slug || b.url.includes(slug));
}

export function getProductsByCategory(category: string): Product[] {
  const categoryMap: Record<string, string[]> = {
    'nail-care': ['nail', 'cuticle', 'mava', 'scientifique', 'stop'],
    'nail-polish': ['shades', 'colors', 'polish', 'lacquer', 'pop-wave'],
    'hand-care': ['hand', 'cream'],
    'foot-care': ['foot', 'pedi'],
    'eye-care': ['eye', 'lash', 'mascara', 'double-lash'],
    'lip': ['lip', 'lipstick', 'gloss', 'balm'],
    'skincare': ['skin', 'serum', 'cream', 'mask', 'foundation'],
  };
  
  const keywords = categoryMap[category] || [category];
  return products.filter((p) => 
    keywords.some((k) => p.slug.toLowerCase().includes(k) || p.title.toLowerCase().includes(k))
  );
}

export function getFeaturedProducts(count: number = 6): Product[] {
  return products.slice(0, count);
}

export function getRecentBlogPosts(count: number = 4): BlogPost[] {
  return blogPosts.slice(0, count);
}

// Categories - Consolidated from 12 to 7 categories
// See docs/CATEGORY_RESTRUCTURE_PLAN.md for rollback instructions
export const categories = [
  { name: 'NAIL CARE', slug: 'nail-care', url: '/nail-care' },
  { name: 'NAIL POLISH', slug: 'nail-polish', url: '/color' },
  { name: 'EYE BEAUTY', slug: 'eye-beauty', url: '/eye-beauty' },
  { name: 'FACE & LIPS', slug: 'face-lips', url: '/face-lips' },
  { name: 'HAND CARE', slug: 'hand-care', url: '/hand-care' },
  { name: 'FOOT CARE', slug: 'foot-care', url: '/foot-care' },
  { name: 'GIFT SETS', slug: 'gifts', url: '/collections/gifts' },
];

// Old categories preserved for reference/rollback:
// { name: 'ALL PRODUCTS', slug: 'all-products', url: '/collections/all' },
// { name: 'MANICURE TOOLS', slug: 'accessories', url: '/accessories' }, -> merged into Nail Care
// { name: 'EYE CARE', slug: 'eye-care', url: '/eye-care' }, -> merged into Eye Beauty
// { name: 'LIPS', slug: 'lips', url: '/lips' }, -> merged into Face & Lips
// { name: 'SKIN CARE', slug: 'skincare', url: '/skincare' }, -> merged into Face & Lips
// { name: 'COMPLEXION', slug: 'complexion', url: '/complexion' }, -> merged into Face & Lips
// { name: 'HAIR & BODY', slug: 'hair-body', url: '/collections/hair-body' }, -> removed
