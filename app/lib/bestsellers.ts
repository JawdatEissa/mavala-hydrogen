const BESTSELLER_SLUGS = new Set<string>([
  "mavala-stop",
  "mavala-scientifique-k",
  "nailactan-1",
  "double-lash",
  "nail-white-crayon",
  "double-brow",
]);

export const BESTSELLER_BADGE_TEXT = "BESTSELLERS";

function normalizeSlug(slug: string): string {
  // Handle any accidental prefixes like "all-products_..."
  return slug.replace(/^all-products_/, "").replace(/^[^_]+_/, "");
}

export function isBestsellerSlug(slug: string): boolean {
  if (!slug) return false;
  return BESTSELLER_SLUGS.has(slug) || BESTSELLER_SLUGS.has(normalizeSlug(slug));
}

