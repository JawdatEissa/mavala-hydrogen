import type { ScrapedProduct } from "./scraped-products.server";
import type { StorefrontMoney, StorefrontProductNode } from "./shopify-storefront.server";

function formatMoney(m: StorefrontMoney): string {
  const n = Number(m.amount);
  if (!Number.isFinite(n)) {
    return "";
  }
  const fixed = n.toFixed(2);
  switch (m.currencyCode) {
    case "CAD":
      return `CA$${fixed}`;
    case "USD":
      return `$${fixed}`;
    case "EUR":
      return `€${fixed}`;
    default:
      return `${fixed} ${m.currencyCode}`;
  }
}

function moneyAmountsEqual(a: StorefrontMoney, b: StorefrontMoney): boolean {
  return a.amount === b.amount && a.currencyCode === b.currencyCode;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstLinePlain(text: string, maxLen = 200): string {
  const line = text.split(/\n/)[0]?.trim() || "";
  if (line.length <= maxLen) return line;
  return `${line.slice(0, maxLen)}…`;
}

/** First available variant, else first variant — same rule as add-to-cart. */
export function getDefaultVariantGidFromStorefrontNode(
  node: StorefrontProductNode,
): string | null {
  const firstAvailable = node.variants.edges.find(
    (e) => e.node.availableForSale,
  )?.node;
  const v = firstAvailable ?? node.variants.edges[0]?.node ?? null;
  return v?.id ?? null;
}

/**
 * Map a Storefront API Product node into ScrapedProduct for existing UI.
 */
export function mapStorefrontProductToScrapedProduct(
  node: StorefrontProductNode,
): ScrapedProduct {
  const min = node.priceRange.minVariantPrice;
  const max = node.priceRange.maxVariantPrice;
  const minStr = formatMoney(min);
  const maxStr = formatMoney(max);
  const samePrice = moneyAmountsEqual(min, max);
  const priceFrom = samePrice ? minStr : `from ${minStr}`;
  const priceDisplay = samePrice ? minStr : `${minStr} – ${maxStr}`;

  const urls: string[] = [];
  if (node.featuredImage?.url) {
    urls.push(node.featuredImage.url);
  }
  for (const { node: img } of node.images.edges) {
    if (img.url && !urls.includes(img.url)) {
      urls.push(img.url);
    }
  }

  const categories = node.collections.edges.map((e) => e.node.title);

  const anyVariantAvailable = node.variants.edges.some(
    (e) => e.node.availableForSale,
  );
  const outOfStock = !node.availableForSale || !anyVariantAvailable;

  const descPlain = node.description?.trim() || stripHtml(node.descriptionHtml);
  const tagline = firstLinePlain(descPlain, 160);
  const mainDescription =
    descPlain.length > tagline.length ? descPlain : stripHtml(node.descriptionHtml);

  const defaultVariantId = getDefaultVariantGidFromStorefrontNode(node);

  const mapped: ScrapedProduct = {
    url: `/products/${node.handle}`,
    slug: node.handle,
    title: node.title,
    price: priceDisplay,
    price_from: priceFrom,
    images: urls,
    categories: categories.length ? categories : undefined,
    out_of_stock: outOfStock,
    tagline: tagline || undefined,
    main_description: mainDescription || undefined,
  };

  (mapped as ScrapedProduct & { shopify?: Record<string, unknown> }).shopify = {
    productGid: node.id,
    defaultVariantGid: defaultVariantId,
    variantCount: node.variants.edges.length,
  };

  return mapped;
}

const JSON_STRING_FIELDS: (keyof ScrapedProduct)[] = [
  "key_ingredients",
  "how_to_use",
  "note",
  "safety_directions",
  "first_aid",
  "youtube_video",
];

/**
 * Overlay bundled JSON catalog data onto a Shopify-sourced product (local assets + long-form copy).
 */
export function enrichShopifyProductFromJson(
  shopifyProduct: ScrapedProduct,
  jsonProduct: ScrapedProduct,
): void {
  const local = jsonProduct.local_images;
  if (Array.isArray(local) && local.length > 0) {
    shopifyProduct.local_images = [...local];
    shopifyProduct.images = Array.isArray(jsonProduct.images)
      ? [...jsonProduct.images]
      : [...local];
  }

  if (
    (!shopifyProduct.shades || shopifyProduct.shades.length === 0) &&
    Array.isArray(jsonProduct.shades) &&
    jsonProduct.shades.length > 0
  ) {
    shopifyProduct.shades = jsonProduct.shades;
  }

  if (
    Array.isArray(jsonProduct.gallery_images) &&
    jsonProduct.gallery_images.length > 0
  ) {
    if (
      !shopifyProduct.gallery_images ||
      shopifyProduct.gallery_images.length < jsonProduct.gallery_images.length
    ) {
      shopifyProduct.gallery_images = [...jsonProduct.gallery_images];
    }
  }

  for (const key of JSON_STRING_FIELDS) {
    const v = jsonProduct[key];
    if (typeof v === "string" && v.trim() && !shopifyProduct[key]) {
      (shopifyProduct as Record<string, unknown>)[key as string] = v;
    }
  }

  if (
    (!shopifyProduct.main_description ||
      shopifyProduct.main_description.length < 80) &&
    jsonProduct.main_description
  ) {
    shopifyProduct.main_description = jsonProduct.main_description;
  }
  if (!shopifyProduct.tagline && jsonProduct.tagline) {
    shopifyProduct.tagline = jsonProduct.tagline;
  }

  if (jsonProduct.rating != null && shopifyProduct.rating == null) {
    shopifyProduct.rating = jsonProduct.rating;
  }
  if (jsonProduct.review_count != null && shopifyProduct.review_count == null) {
    shopifyProduct.review_count = jsonProduct.review_count;
  }

  if (
    Array.isArray(jsonProduct.sizes) &&
    jsonProduct.sizes.length > 0 &&
    (!shopifyProduct.sizes || shopifyProduct.sizes.length === 0)
  ) {
    shopifyProduct.sizes = [...jsonProduct.sizes];
  }
}
