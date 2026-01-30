/**
 * Blog Data Types for Mavala Website
 * Matches the scraped blog data structure
 */

export interface BlogMetadata {
  title: string;
  date: string;
  date_iso: string;
  author: string;
  categories: string[];
  tags: string[];
  featured_image: string;
  excerpt: string;
}

export interface BlogImageFile {
  original_url: string;
  local_path: string;
  filename: string;
  size_bytes?: number;
}

export interface BlogImageStyles {
  width?: string;
  height?: string;
  objectFit?: string;
  objectPosition?: string;
  borderRadius?: string;
}

export interface BlogTextStyles {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  lineHeight?: string;
  marginTop?: string;
  marginBottom?: string;
}

export interface BlogLink {
  text: string;
  href: string;
  target?: string;
}

export interface BlogListItem {
  text: string;
  html: string;
}

// Content Block Types
export interface BlogParagraphBlock {
  type: 'paragraph';
  content: string;
  html: string;
  has_bold: boolean;
  links: BlogLink[];
  styles: BlogTextStyles;
  order: number;
}

export interface BlogHeadingBlock {
  type: 'heading';
  level: number;
  content: string;
  styles: BlogTextStyles;
  order: number;
}

export interface BlogImageBlock {
  type: 'image';
  src: string;
  alt: string;
  caption: string;
  local_file: BlogImageFile | null;
  dimensions: { width: number; height: number };
  styles: BlogImageStyles;
  order: number;
}

export interface BlogListBlock {
  type: 'unordered_list' | 'ordered_list';
  items: BlogListItem[];
  styles: {
    listStyleType?: string;
    paddingLeft?: string;
    marginTop?: string;
    marginBottom?: string;
  };
  order: number;
}

export type BlogContentBlock = 
  | BlogParagraphBlock 
  | BlogHeadingBlock 
  | BlogImageBlock 
  | BlogListBlock;

export interface BlogPost {
  url: string;
  slug: string;
  scraped_at: string;
  metadata: BlogMetadata;
  featured_image_local: BlogImageFile | null;
  content_blocks: BlogContentBlock[];
  stats: {
    total_blocks: number;
    paragraphs: number;
    headings: number;
    images: number;
    lists: number;
  };
}

export interface BlogData {
  blogs: BlogPost[];
  total_blogs: number;
}

// Helper function to get local image path for use in the app
export function getLocalImagePath(localFile: BlogImageFile | null, slug: string): string {
  if (!localFile) return '';
  // Convert from scraped path to public path
  // "blogs_v2\\images\\slug\\filename.jpg" -> "/images/blog/slug/filename.jpg"
  return `/images/blog/${slug}/${localFile.filename}`;
}

// Get the best image from content blocks as featured image
// Prefers larger, more visually appealing images over small graphics
export function getFeaturedImage(blog: BlogPost): string {
  // First try local featured image
  if (blog.featured_image_local) {
    return getLocalImagePath(blog.featured_image_local, blog.slug);
  }
  
  // Get all images from content blocks
  const images = blog.content_blocks.filter(
    (block): block is BlogImageBlock => block.type === 'image'
  );
  
  // Try to find a good hero image - prefer larger landscape images
  // Skip small product images and graphics
  const heroImage = images.find(img => {
    const { width, height } = img.dimensions;
    // Prefer images that are reasonably large and not too tall/narrow
    const isLargeEnough = width > 600 || height > 600;
    const isNotTooTall = height / width < 2; // Skip very tall/portrait images for hero
    const hasNoProductAlt = !img.alt || (!img.alt.includes('ORCHID') && !img.alt.includes('GENEVE') && !img.alt.includes('IZMIR') && !img.alt.includes('LOTUS'));
    return isLargeEnough && isNotTooTall && hasNoProductAlt;
  });
  
  // Fallback to first image if no good hero found
  const selectedImage = heroImage || images[0];
  
  if (selectedImage?.local_file) {
    return getLocalImagePath(selectedImage.local_file, blog.slug);
  }
  
  // Fallback to original URL
  if (selectedImage?.src) {
    return selectedImage.src;
  }
  
  return blog.metadata.featured_image || '';
}

// Format date for display
export function formatBlogDate(dateString: string): string {
  // Input: "DECEMBER 29, 2025" or "2025-12-29"
  if (dateString.includes('-')) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  // Already formatted, just title case it
  return dateString.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

// Get reading time estimate
export function getReadingTime(blog: BlogPost): number {
  const wordsPerMinute = 200;
  const textBlocks = blog.content_blocks.filter(
    (block): block is BlogParagraphBlock | BlogHeadingBlock => 
      block.type === 'paragraph' || block.type === 'heading'
  );
  const totalWords = textBlocks.reduce((acc, block) => {
    return acc + (block.content?.split(/\s+/).length || 0);
  }, 0);
  return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
}
