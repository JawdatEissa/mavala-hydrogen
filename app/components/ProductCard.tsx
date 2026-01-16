import { Link } from "@remix-run/react";
import type { Product } from "../lib/mock-data";
import type { ScrapedProduct } from "../lib/scraped-products.server";
import { formatPriceToCad } from "../lib/currency";
import { getListingMeta } from "../lib/product-meta";
import { isBestsellerSlug } from "../lib/bestsellers";
import { BestsellerBadge } from "./BestsellerBadge";

type ProductType = Product | ScrapedProduct;

interface ProductCardProps {
  product: ProductType;
  showQuickAdd?: boolean;
}

const formatTitle = (rawTitle?: string): string => {
  if (!rawTitle) return "";
  const trimmed = rawTitle.trim();
  if (trimmed === "THE BASICS") return "The Basics";
  const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
  if (isAllCaps) {
    const lower = trimmed.toLowerCase();
    return lower.replace(/\b([a-z])/g, (match) => match.toUpperCase());
  }
  return trimmed;
};

export function ProductCard({
  product,
  showQuickAdd = false,
}: ProductCardProps) {
  // Extract slug from product
  const slug = product.slug || product.url.split("/").pop() || "";
  const showBestsellerBadge = isBestsellerSlug(slug);

  // Helper to extract title from slug if title is empty or corrupted
  const getDisplayTitle = (): string => {
    // If title exists and looks valid (not empty, not too long, not HTML-like)
    if (
      product.title &&
      product.title.trim().length > 0 &&
      product.title.length < 100 &&
      !product.title.includes("<") &&
      !product.title.includes("function") &&
      !product.title.includes("window.")
    ) {
      return formatTitle(product.title);
    }
    // Extract from slug as fallback
    const cleanSlug = slug.replace(/^all-products_/, "").replace(/^[^_]+_/, "");
    return formatTitle(
      cleanSlug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
    );
  };

  // Get product image - images array now contains local paths from scraped-products.ts
  const getProductImage = (): string => {
    // First check local_images array (populated by scraped-products.ts)
    const scraped = product as ScrapedProduct;
    if (scraped.local_images && scraped.local_images.length > 0) {
      return scraped.local_images[0];
    }

    // Then check images array
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }

    // Fallback to placeholder
    return "/category-nail-care.png";
  };

  const productImage = getProductImage();

  // Get price - ONLY use price_from field (price field is corrupted with HTML)
  const getDisplayPrice = (): string => {
    const scraped = product as ScrapedProduct;

    // Use price_from if available (this is the clean price)
    if (scraped.price_from && scraped.price_from.trim()) {
      return scraped.price_from;
    }

    // Only use price field if it looks like a valid price (short, starts with currency)
    if (
      product.price &&
      product.price.length < 20 &&
      (product.price.startsWith("$") ||
        product.price.startsWith("€") ||
        /^\d/.test(product.price))
    ) {
      return product.price;
    }

    // Don't display corrupted price data
    return "";
  };

  const displayPrice = getDisplayPrice();
  const displayTitle = getDisplayTitle();
  const displaySubtitle =
    Array.isArray((product as ScrapedProduct).categories) &&
    (product as ScrapedProduct).categories.length > 0
      ? String((product as ScrapedProduct).categories[0])
      : "";

  const compareAtPrice =
    String((product as any).compare_at_price ?? (product as any).compareAtPrice ?? (product as any).original_price ?? "")
      .trim();
  const showCompareAt = Boolean(
    compareAtPrice &&
      compareAtPrice !== displayPrice &&
      compareAtPrice !== (product as any).price
  );

  const displayPriceCad = displayPrice ? formatPriceToCad(displayPrice) : "";
  const compareAtCad = showCompareAt ? formatPriceToCad(compareAtPrice) : "";
  const listingMeta =
    typeof (product as any).sizes !== "undefined"
      ? getListingMeta(product as ScrapedProduct)
      : "";

  return (
    <div className="product-card group relative flex flex-col w-full">
      <Link to={`/products/${slug}`} className="block flex flex-col h-full">
        {/* Image Container - EXACT MATCH to Bestseller: rounded-[3px], grey bg, 4:5 aspect */}
        <div className="relative overflow-hidden bg-[#f5f5f5] rounded-[3px] aspect-[4/5] flex items-center justify-center p-6 border-none outline-none shadow-none transition-shadow duration-300 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          {showBestsellerBadge ? <BestsellerBadge /> : null}
          <img
            src={productImage}
            alt={displayTitle}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 border-none outline-none"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/category-nail-care.png";
            }}
          />
        </div>

        {/* Product Info - EXACT MATCH to Bestseller spacing and typography */}
        <div className="mt-3 text-left" style={{ paddingLeft: 0 }}>
          <h3 className="product-card-title">{displayTitle}</h3>
          {displaySubtitle ? (
            <p className="product-card-subtitle">{displaySubtitle}</p>
          ) : null}

          {displayPriceCad ? (
            <div
              className="flex items-baseline"
              style={{ marginLeft: "var(--bs-price-compare-margin-left)" }}
            >
              {compareAtCad ? (
                <span className="product-card-price-compare">{compareAtCad}</span>
              ) : null}
              <span className="product-card-price-current">{displayPriceCad}</span>
              {listingMeta ? (
                <span className="product-card-meta">{listingMeta}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </Link>
    </div>
  );
}

// Grid wrapper for product listings - Standardized 4 columns like mavala.com
export function ProductGrid({
  products,
  columns = 4,
}: {
  products: ProductType[];
  columns?: 3 | 4 | 5 | 6;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard key={product.slug || product.url} product={product} />
      ))}
    </div>
  );
}
