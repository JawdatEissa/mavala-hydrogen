import { useState, useMemo } from "react";
import { Link, useLoaderData } from "@remix-run/react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { loadScrapedProducts, type ScrapedProduct } from "../lib/scraped-products";

export const meta: MetaFunction = () => {
  return [
    { title: "Search - Mavala Switzerland" },
    { name: "description", content: "Search for Mavala products" },
  ];
};

// Load all products server-side
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const products = loadScrapedProducts();
  return json({ products });
};

export default function Search() {
  const { products } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState("");

  // Extract readable title from slug
  const extractTitleFromSlug = (slug: string): string => {
    let cleanSlug = slug.replace(/^all-products_/, '');
    const words = cleanSlug.split('-');
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Comprehensive search function that searches across multiple fields
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const searchTerms = query.split(/\s+/); // Split by whitespace for multi-word search

    return products.filter((product: ScrapedProduct) => {
      // Extract title from slug if title is empty or too long (like scraped HTML)
      const displayTitle = (product.title && product.title.length < 200) 
        ? product.title 
        : extractTitleFromSlug(product.slug);

      // Create a searchable text blob from all relevant fields
      const searchableFields = [
        displayTitle || "",
        product.slug || "",
        product.main_description || "",
        product.tagline || "",
        product.key_ingredients || "",
        product.how_to_use || "",
        product.note || "",
        product.notes || "",
        product.safety_directions || "",
        ...(product.categories || []),
        ...(product.description_bullets || []),
        // Add product type indicators from slug patterns
        product.slug.includes('nail') ? 'nail care nail polish manicure' : '',
        product.slug.includes('hand') ? 'hand care hand cream' : '',
        product.slug.includes('foot') ? 'foot care pedicure' : '',
        product.slug.includes('eye') ? 'eye care eye makeup' : '',
        product.slug.includes('lip') ? 'lips lipstick lip color' : '',
        product.slug.includes('skin') ? 'skincare skin care' : '',
        product.slug.includes('color') || product.slug.includes('shades') ? 'nail polish color' : '',
      ].join(" ").toLowerCase();

      // Check if all search terms are found in the searchable fields
      return searchTerms.every(term => searchableFields.includes(term));
    });
  }, [searchQuery, products]);

  // Get display price
  const getDisplayPrice = (product: ScrapedProduct) => {
    return product.price_from || product.price || "";
  };

  // Get first image
  const getProductImage = (product: ScrapedProduct) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return "/placeholder-product.jpg";
  };

  // Get display title
  const getDisplayTitle = (product: ScrapedProduct) => {
    // Use title if it exists and is not too long (not scraped HTML)
    if (product.title && product.title.length < 200) {
      return product.title;
    }
    // Otherwise extract from slug
    return extractTitleFromSlug(product.slug);
  };

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-8 py-16">
        {/* Search Section */}
        <div className="max-w-[1200px] mx-auto">
          {/* Search Title and Input Container */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 mb-16">
            {/* SEARCH Title */}
            <div className="flex-shrink-0">
              <h1 className="font-['Archivo'] text-[32px] lg:text-[40px] font-semibold uppercase tracking-[1px] text-[#A71830]">
                SEARCH
              </h1>
            </div>

            {/* Search Input */}
            <div className="flex-grow w-full lg:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 pr-12 font-['Archivo'] text-[16px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#A71830] focus:ring-1 focus:ring-[#A71830] transition-all"
                />
                {/* Search Icon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results Section */}
          {searchQuery.trim() && (
            <>
              {/* Results Count */}
              <div className="mb-8">
                <p className="font-['Archivo'] text-[16px] text-gray-600">
                  {searchResults.length > 0 ? (
                    <>
                      Found <span className="font-semibold">{searchResults.length}</span> {searchResults.length === 1 ? 'product' : 'products'}
                    </>
                  ) : (
                    <>No products found</>
                  )}
                </p>
              </div>

              {/* Products Grid */}
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
                  {searchResults.map((product) => (
                    <Link
                      key={product.slug}
                      to={`/products/${product.slug}`}
                      className="group"
                    >
                      <div className="bg-white border border-gray-200 hover:border-[#A71830] transition-all duration-300 overflow-hidden">
                        {/* Product Image */}
                        <div className="aspect-square bg-gray-100 overflow-hidden">
                          <img
                            src={getProductImage(product)}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-product.jpg";
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <h3 className="font-['Archivo'] text-[14px] font-semibold uppercase tracking-[0.5px] text-gray-900 mb-2 line-clamp-2 group-hover:text-[#A71830] transition-colors">
                            {getDisplayTitle(product)}
                          </h3>
                          
                          {product.tagline && (
                            <p className="font-['Archivo'] text-[12px] text-gray-600 mb-3 line-clamp-2">
                              {product.tagline}
                            </p>
                          )}

                          {getDisplayPrice(product) && (
                            <p className="font-['Archivo'] text-[14px] font-semibold text-[#A71830]">
                              {getDisplayPrice(product)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 mb-16">
                  <p className="font-['Archivo'] text-[16px] text-gray-600 mb-4">
                    We couldn't find any products matching "{searchQuery}"
                  </p>
                  <p className="font-['Archivo'] text-[14px] text-gray-500">
                    Try adjusting your search terms or browse our categories
                  </p>
                </div>
              )}
            </>
          )}

          {/* Horizontal Divider */}
          <div className="border-t border-gray-200 mb-16"></div>

          {/* Info Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Independent Swiss Laboratory Section */}
            <div className="text-center lg:text-left">
              <h2 className="font-['Archivo'] text-[16px] lg:text-[18px] font-semibold uppercase tracking-[1.2px] text-gray-700 mb-4">
                INDEPENDENT SWISS LABORATORY
              </h2>
              <p className="font-['Archivo'] text-[15px] text-gray-600 mb-6">
                Family business since 1959
              </p>
              <Link
                to="/the-brand"
                className="inline-block font-['Archivo'] text-[14px] font-normal text-[#A71830] hover:text-[#8B1426] uppercase tracking-[0.8px] border-b border-[#A71830] hover:border-[#8B1426] transition-colors pb-1"
              >
                Find out more
              </Link>
            </div>

            {/* Available Nationally Section */}
            <div className="text-center lg:text-left">
              <h2 className="font-['Archivo'] text-[16px] lg:text-[18px] font-semibold uppercase tracking-[1.2px] text-gray-700 mb-4">
                AVAILABLE NATIONALLY
              </h2>
              <p className="font-['Archivo'] text-[15px] text-gray-600 mb-6">
                Find MAVALA products online, in pharmacies and beauty salons
              </p>
              <a
                href="#"
                className="inline-block font-['Archivo'] text-[14px] font-normal text-[#A71830] hover:text-[#8B1426] uppercase tracking-[0.8px] border-b border-[#A71830] hover:border-[#8B1426] transition-colors pb-1"
              >
                Where to buy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

