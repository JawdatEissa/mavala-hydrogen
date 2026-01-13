import { useState, useMemo } from "react";
import { Link, useLoaderData } from "@remix-run/react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { loadScrapedProducts, type ScrapedProduct } from "../lib/scraped-products.server";
import { ProductCard } from "../components/ProductCard";

// Import color mappings so shade numbers/names are searchable (e.g. "12" -> "12 BERLIN" -> Cream Colors)
import colorMappingTheBasics from "../data/color_mapping_the-basics.json";
import colorMappingCreamColors from "../data/color_mapping_cream-colors.json";
import colorMappingPearlColors from "../data/color_mapping_pearl-colors.json";
import colorMappingPopWave from "../data/color_mapping_pop-wave.json";
import colorMappingNeoNudes from "../data/color_mapping_neo-nudes.json";
import colorMappingTerraTopia from "../data/color_mapping_terra-topia.json";
import colorMappingYummy from "../data/color_mapping_yummy.json";
import colorMappingWhisper from "../data/color_mapping_whisper.json";
import colorMappingTimeless from "../data/color_mapping_timeless.json";
import colorMappingColorBlock from "../data/color_mapping_color-block.json";
import colorMappingDigitalArt from "../data/color_mapping_digital-art.json";
import colorMappingBioColors from "../data/color_mapping_bio-colors.json";
import colorMappingTandem from "../data/color_mapping_tandem.json";
import colorMappingDelight from "../data/color_mapping_delight.json";
import colorMappingSofuture from "../data/color_mapping_sofuture.json";
import colorMappingPrismatic from "../data/color_mapping_prismatic.json";
import colorMappingColorVibe from "../data/color_mapping_color-vibe.json";
import colorMappingIconic from "../data/color_mapping_iconic.json";
import colorMappingBubbleGum from "../data/color_mapping_bubble-gum.json";
import colorMappingCyberChic from "../data/color_mapping_cyber-chic.json";
import colorMappingBlushColors from "../data/color_mapping_blush-colors.json";
import colorMappingNewLook from "../data/color_mapping_new-look.json";
import colorMappingCosmic from "../data/color_mapping_cosmic.json";
import colorMappingChillRelax from "../data/color_mapping_chill-relax.json";
import colorMappingHeritage from "../data/color_mapping_heritage.json";
import colorMappingPastelFiesta from "../data/color_mapping_pastel-fiesta.json";
import colorMappingSolaris from "../data/color_mapping_solaris.json";
import colorMappingWhiteShades from "../data/color_mapping_white-shades.json";
import colorMappingNudeShades from "../data/color_mapping_nude-shades.json";
import colorMappingPinkShades from "../data/color_mapping_pink-shades.json";
import colorMappingRedShades from "../data/color_mapping_red-shades.json";
import colorMappingCoralShades from "../data/color_mapping_coral-shades.json";
import colorMappingOrangeShades from "../data/color_mapping_orange-shades.json";
import colorMappingPurpleShades from "../data/color_mapping_purple-shades.json";
import colorMappingBurgundyShades from "../data/color_mapping_burgundy-shades.json";
import colorMappingBlueShades from "../data/color_mapping_blue-shades.json";
import colorMappingGreenShades from "../data/color_mapping_green-shades.json";
import colorMappingYellowShades from "../data/color_mapping_yellow-shades.json";
import colorMappingGoldShades from "../data/color_mapping_gold-shades.json";
import colorMappingBrownShades from "../data/color_mapping_brown-shades.json";
import colorMappingGreyShades from "../data/color_mapping_grey-shades.json";
import colorMappingBlackShades from "../data/color_mapping_black-shades.json";

type ColorMapping = {
  shade_details?: Array<{ name: string }>;
};

const COLOR_MAPPINGS: Record<string, ColorMapping> = {
  "the-basics": colorMappingTheBasics,
  "cream-colors": colorMappingCreamColors,
  "pearl-colors": colorMappingPearlColors,
  "pop-wave": colorMappingPopWave,
  "neo-nudes": colorMappingNeoNudes,
  "terra-topia": colorMappingTerraTopia,
  yummy: colorMappingYummy,
  whisper: colorMappingWhisper,
  timeless: colorMappingTimeless,
  "color-block": colorMappingColorBlock,
  "digital-art": colorMappingDigitalArt,
  "bio-colors": colorMappingBioColors,
  tandem: colorMappingTandem,
  delight: colorMappingDelight,
  sofuture: colorMappingSofuture,
  prismatic: colorMappingPrismatic,
  "color-vibe": colorMappingColorVibe,
  iconic: colorMappingIconic,
  "bubble-gum": colorMappingBubbleGum,
  "cyber-chic": colorMappingCyberChic,
  "blush-colors": colorMappingBlushColors,
  "new-look": colorMappingNewLook,
  cosmic: colorMappingCosmic,
  "chill-relax": colorMappingChillRelax,
  heritage: colorMappingHeritage,
  "pastel-fiesta": colorMappingPastelFiesta,
  solaris: colorMappingSolaris,
  "white-shades": colorMappingWhiteShades,
  "nude-shades": colorMappingNudeShades,
  "pink-shades": colorMappingPinkShades,
  "red-shades": colorMappingRedShades,
  "coral-shades": colorMappingCoralShades,
  "orange-shades": colorMappingOrangeShades,
  "purple-shades": colorMappingPurpleShades,
  "burgundy-shades": colorMappingBurgundyShades,
  "blue-shades": colorMappingBlueShades,
  "green-shades": colorMappingGreenShades,
  "yellow-shades": colorMappingYellowShades,
  "gold-shades": colorMappingGoldShades,
  "brown-shades": colorMappingBrownShades,
  "grey-shades": colorMappingGreyShades,
  "black-shades": colorMappingBlackShades,
};

const SHADE_NAMES_BY_SLUG: Record<string, string[]> = Object.fromEntries(
  Object.entries(COLOR_MAPPINGS).map(([slug, mapping]) => {
    const names = Array.isArray(mapping?.shade_details)
      ? mapping.shade_details.map((s) => String(s.name || "")).filter(Boolean)
      : [];
    return [slug, names];
  })
);

export const meta: MetaFunction = () => {
  return [
    { title: "Search - Mavala Switzerland" },
    { name: "description", content: "Search for Mavala products" },
  ];
};

// Load all products server-side
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const initialQuery = url.searchParams.get("q") || "";
  const products = loadScrapedProducts();
  return json({ products, initialQuery });
};

export default function Search() {
  const { products, initialQuery } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");

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
        // Make shade numbers/names searchable for color collections (e.g. "12" -> "12 BERLIN" -> Cream Colors)
        ...(SHADE_NAMES_BY_SLUG[product.slug] || []),
        // Add product type indicators from slug patterns
        product.slug.includes('nail') ? 'nail care nail polish manicure' : '',
        product.slug.includes('hand') ? 'hand care hand cream' : '',
        product.slug.includes('foot') ? 'foot care pedicure' : '',
        product.slug.includes('eye') ? 'eye care eye makeup' : '',
        product.slug.includes('lip') ? 'lips lipstick lip color' : '',
        product.slug.includes('skin') ? 'skincare skin care' : '',
        product.slug.includes('color') || product.slug.includes('shades') ? 'nail polish color' : '',
      ]
        .join(" ")
        .toLowerCase()
        .replace(/\s+/g, " ");

      // Check if all search terms are found in the searchable fields
      // - numeric terms should match as a token (so "12" doesn't match "312")
      const haystack = ` ${searchableFields} `;
      return searchTerms.every((term) => {
        if (/^\d+$/.test(term)) {
          return haystack.includes(` ${term} `);
        }
        return haystack.includes(term);
      });
    });
  }, [searchQuery, products]);

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
                    <ProductCard key={product.slug} product={product} />
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

