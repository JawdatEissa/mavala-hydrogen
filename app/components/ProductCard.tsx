import { Link } from "@remix-run/react";
import type { Product } from "../lib/mock-data";
import type { ScrapedProduct } from "../lib/scraped-products.server";

type ProductType = Product | ScrapedProduct;

interface ProductCardProps {
  product: ProductType;
  showQuickAdd?: boolean;
}

export function ProductCard({
  product,
  showQuickAdd = false,
}: ProductCardProps) {
  // Extract slug from product
  const slug = product.slug || product.url.split("/").pop() || "";

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
      return product.title;
    }
    // Extract from slug as fallback
    const cleanSlug = slug.replace(/^all-products_/, "").replace(/^[^_]+_/, "");
    return cleanSlug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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

  return (
    <div className="product-card group relative flex flex-col w-full">
      <Link to={`/products/${slug}`} className="block flex flex-col h-full">
        {/* Image Container - Standardized grey background with 4:5 aspect ratio */}
        <div className="relative overflow-hidden mb-4 bg-[#f5f5f5] aspect-[4/5] flex items-center justify-center p-6 border-none outline-none shadow-none">
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

        {/* Product Info - Left aligned like mavala.com */}
        <div className="space-y-1 text-left">
          <h3 className="font-['Archivo'] text-[15px] font-medium text-[#272724] leading-tight">
            {displayTitle}
          </h3>
          {displayPrice && (
            <p className="font-['Archivo'] text-[13px] text-gray-400 font-normal">
              {displayPrice}
            </p>
          )}
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
