import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import {
  loadScrapedProducts,
  type ScrapedProduct,
} from "../lib/scraped-products.server";
import shadeColorsData from "../data/shade_colors.json";

// Import color mappings to get shade counts for each product
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

// Map of slug to color mapping data
const COLOR_MAPPINGS: Record<
  string,
  { shade_details?: Array<{ name: string; image: string }> }
> = {
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

// Define the product categories for each section
// NOTE: Removed "10ml-bottles" (B2B only) and "french-manicure-kit" (single SKU, not needed)
const CLASSICS_SLUGS = ["the-basics", "cream-colors", "pearl-colors"];

// Mini Colours Collections - themed collections with multiple shades
const COLLECTIONS_SLUGS = [
  "pop-wave",
  "neo-nudes",
  "terra-topia",
  "yummy",
  "whisper",
  "timeless",
  "color-block",
  "digital-art",
  "bio-colors",
  "tandem",
  "delight",
  "sofuture",
  "prismatic",
  "color-vibe",
  "iconic",
  "bubble-gum",
  "cyber-chic",
  "blush-colors",
  "new-look",
  "cosmic",
  "chill-relax",
  "heritage",
  "pastel-fiesta",
  "solaris",
];

const SHADES_SLUGS = [
  "white-shades",
  "nude-shades",
  "pink-shades",
  "red-shades",
  "coral-shades",
  "orange-shades",
  "purple-shades",
  "burgundy-shades",
  "blue-shades",
  "green-shades",
  "yellow-shades",
  "gold-shades",
  "brown-shades",
  "grey-shades",
  "black-shades",
];

// Product taglines/descriptions for the color page
const PRODUCT_TAGLINES: Record<string, string> = {
  "the-basics": "Your every day base, top and clear coats.",
  "cream-colors": "60 creamy shades.",
  "pearl-colors": "30 pearl shades.",
  "pop-wave": "A wave of freshness and colourful energy",
  "neo-nudes": "Affirm your natural beauty",
  "terra-topia": "The utopia of a sublime and reassuring earth",
  yummy: "For a sweet and elegant look",
  whisper: "The whisper of a new season with utmost delicacy",
  timeless: "The eternal power of elegance",
  "color-block": "Color is the new block",
  "digital-art": "The coloured algorithm for your nails",
  "bio-colors": "Bio sourced nail polishes with 85% natural ingredients",
  tandem: "Romantic colours to cycle through the change of seasons",
  delight: "Daring and assuming colours",
  sofuture: "Dance, shine and express your party queen look!",
  prismatic: "Holographic colours through the prism of light",
  "color-vibe": "Dare the clash of colours",
  iconic: "Iconic and timeless elegance, with a contemporary touch",
  "bubble-gum": "Invent your own playful pop style fun.",
  "cyber-chic": "Sophisticated and high tech silver metallic nail polishes.",
  "blush-colors": "An imaginary voyage between dream and reality.",
  "new-look": "Give yourself a vibrant distinction of trendy modernity!",
  cosmic: "For a powdered, precious dust look.",
  "chill-relax": "Breathe in, breathe out… it's time to take your time 💕",
  heritage: "A masterful ode to autumnal nature.",
  "pastel-fiesta": "A sweet celebration of beauty and lightness!",
  solaris: "Celebrate life and energy with a palette of sunshine shades.",
  "white-shades": "All shades of white, off white and pearly white.",
  "nude-shades": "All skin tone shades.",
  "pink-shades": "All shades of rose, pink and fuchsia.",
  "red-shades": "All shades of red, crimson and vermilion.",
  "coral-shades": "All coral shades.",
  "orange-shades": "All shades of orange.",
  "purple-shades": "All shades of mauve, purple and violet.",
  "burgundy-shades": "All shades of carmine, plum and burgundy.",
  "blue-shades": "All shades of blue, azure and sapphire.",
  "green-shades": "All shades of khaki, green and emerald.",
  "yellow-shades": "All shades of yellow, canary and lemon.",
  "gold-shades": "All shades of gold, amber and copper.",
  "brown-shades": "All shades of brown, chocolate and caramel.",
  "grey-shades": "All shades of grey, silver and charcoal.",
  "black-shades": "All shades of black.",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Load products ONCE - this is the only expensive operation
  const allProducts = loadScrapedProducts();

  // Create a product map for O(1) lookups
  const productMap = new Map(allProducts.map((p) => [p.slug, p]));

  // Add cache headers for better performance
  const headers = {
    "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
  };

  // Helper function to add shades data from color mappings to a product
  const addShadesToProduct = (product: ScrapedProduct): ScrapedProduct => {
    const mapping = COLOR_MAPPINGS[product.slug];
    if (mapping?.shade_details) {
      return {
        ...product,
        shades: mapping.shade_details.map((s) => ({
          name: s.name,
          image: s.image,
        })),
      };
    }
    return product;
  };

  // OPTIMIZED: Get products by slugs without calling getProductBySlug (which reloads JSON each time!)
  const getProductsBySlug = (slugs: string[]) => {
    return slugs
      .map((slug) => productMap.get(slug))
      .filter(Boolean)
      .map(addShadesToProduct) as ScrapedProduct[];
  };

  // Load products directly from the map - NO additional file reads!
  const classics = getProductsBySlug(CLASSICS_SLUGS);
  const collections = getProductsBySlug(COLLECTIONS_SLUGS);
  const shades = getProductsBySlug(SHADES_SLUGS);

  // Get other products (base coats, top coats, etc.)
  const predefinedSlugs = new Set([
    ...CLASSICS_SLUGS,
    ...COLLECTIONS_SLUGS,
    ...SHADES_SLUGS,
  ]);
  const otherProducts = allProducts.filter((p) => {
    if (predefinedSlugs.has(p.slug)) return false;

    const titleLower = p.title?.toLowerCase() || "";

    // Only include specific categories
    const isBaseCoat =
      titleLower.includes("base") && titleLower.includes("coat");
    const isTopCoat = titleLower.includes("top") && titleLower.includes("coat");
    const isPolishDryer =
      titleLower.includes("dryer") || titleLower.includes("mavadry");
    const isRemover = titleLower.includes("remover");
    const isBioColor =
      titleLower.includes("bio") &&
      (titleLower.includes("color") || titleLower.includes("nail"));
    const is002Base = titleLower.includes("002") && titleLower.includes("base");

    return (
      isBaseCoat ||
      isTopCoat ||
      isPolishDryer ||
      isRemover ||
      isBioColor ||
      is002Base
    );
  });

  // Pass shade colors data
  const shadeColors = shadeColorsData as Record<
    string,
    { hex: string; rgb: number[] }
  >;

  return json(
    {
      classics,
      collections,
      shades,
      otherProducts,
      shadeColors,
    },
    { headers }
  );
};

export const meta: MetaFunction = () => {
  return [
    { title: "Mini Color's Nail Polishes | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Browse Mavala's breathable, 13-free and vegan Mini Color's nail polishes. Over 300 shades available in convenient 5ml format.",
    },
  ];
};

// Helper to get shade color from shade name
function getShadeColor(
  shadeName: string,
  shadeColors: Record<string, { hex: string; rgb: number[] }>
): string {
  // Try exact match first
  if (shadeColors[shadeName]) {
    return shadeColors[shadeName].hex;
  }

  // Try normalized match (handle "49 WHITE" vs "49. WHITE" etc)
  const normalizedName = shadeName.replace(/\./g, "").toUpperCase().trim();
  for (const [key, value] of Object.entries(shadeColors)) {
    const normalizedKey = key.replace(/\./g, "").toUpperCase().trim();
    if (normalizedKey === normalizedName) {
      return value.hex;
    }
  }

  // Fallback color
  return "#ae1932";
}

// Shade Count Indicator Component - Overlapping circles with count
function ShadeCountIndicator({
  count,
  colors = ["#ae1932", "#f5cdb6", "#5c666f"],
}: {
  count: number;
  colors?: string[];
}) {
  if (count <= 0) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Overlapping circles */}
      <div className="flex -space-x-2">
        {colors.slice(0, 3).map((color, idx) => (
          <div
            key={idx}
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: color, zIndex: 3 - idx }}
          />
        ))}
      </div>
      {/* Shade count text */}
      <span className="font-['Archivo'] text-[12px] font-medium text-gray-600 uppercase tracking-wide">
        {count} {count === 1 ? "SHADE" : "SHADES"}
      </span>
    </div>
  );
}

// Product Card Component for Color Page - With grey background for product images
function ColorProductCard({
  product,
  shadeColors,
}: {
  product: ScrapedProduct;
  shadeColors: Record<string, { hex: string; rgb: number[] }>;
}) {
  const tagline = PRODUCT_TAGLINES[product.slug] || product.tagline || "";
  const displayPrice = product.price_from || product.price || "A$11.95";
  const image = product.images?.[0] || "";

  // Get shade count from product data
  const shadeCount = product.shades?.length || 0;

  // Get actual colors from first 3 shades
  const sampleColors = product.shades
    ?.slice(0, 3)
    .map((shade) => getShadeColor(shade.name, shadeColors)) || [
    "#ae1932",
    "#f5cdb6",
    "#5c666f",
  ];

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col text-left"
    >
      {/* Image Container - Standardized grey background with 4:5 aspect ratio */}
      <div className="relative overflow-hidden mb-4 w-full bg-[#f5f5f5] aspect-[4/5] flex items-center justify-center p-6 border-none outline-none shadow-none">
        {image && (
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 border-none outline-none"
            loading="lazy"
          />
        )}
        {/* Shade count indicator - bottom left */}
        {shadeCount > 0 && (
          <div className="absolute bottom-3 left-3">
            <ShadeCountIndicator count={shadeCount} colors={sampleColors} />
          </div>
        )}
      </div>
      {/* Text aligned with left edge of image container */}
      <h3 className="font-['Archivo'] text-[15px] font-medium text-[#272724] mb-1">
        {product.title}
      </h3>
      <p className="font-['Archivo'] text-[13px] text-gray-500 mb-1">Make-Up</p>
      <p className="font-['Archivo'] text-[13px] text-gray-400">
        {displayPrice.startsWith("from") ? displayPrice : `A${displayPrice}`}
      </p>
    </Link>
  );
}

// Collection Card Component - No grey background, promotional images displayed larger
function CollectionCard({
  product,
  shadeColors,
}: {
  product: ScrapedProduct;
  shadeColors: Record<string, { hex: string; rgb: number[] }>;
}) {
  const tagline = PRODUCT_TAGLINES[product.slug] || product.tagline || "";
  const displayPrice = product.price_from || product.price || "A$11.95";
  const image = product.images?.[0] || "";

  // Get shade count from product data
  const shadeCount = product.shades?.length || 0;

  // Get actual colors from first 3 shades
  const sampleColors = product.shades
    ?.slice(0, 3)
    .map((shade) => getShadeColor(shade.name, shadeColors)) || [
    "#ae1932",
    "#f5cdb6",
    "#5c666f",
  ];

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col text-left"
    >
      {/* Image Container - No background, promotional images */}
      <div className="relative overflow-hidden mb-4 w-full aspect-[4/5] flex items-center justify-center">
        {image && (
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}
        {/* Shade count indicator - bottom left with white background for visibility */}
        {shadeCount > 0 && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
            <ShadeCountIndicator count={shadeCount} colors={sampleColors} />
          </div>
        )}
      </div>
      {/* Text aligned with left edge of image container */}
      <h3 className="font-['Archivo'] text-[14px] font-semibold uppercase tracking-wide text-gray-900 mb-1">
        {product.title}
      </h3>
      <p className="font-['Archivo'] text-[14px] text-gray-600 mb-2">
        {displayPrice.startsWith("from") ? displayPrice : `A${displayPrice}`}
      </p>
      {tagline && (
        <p className="font-['Archivo'] text-[13px] text-gray-500 leading-relaxed">
          {tagline}
        </p>
      )}
    </Link>
  );
}

// Section Header Component
function SectionHeader({ title, id }: { title: string; id: string }) {
  return (
    <h2
      id={id}
      className="font-['Archivo'] text-[28px] md:text-[32px] font-semibold text-[#ae1932] text-center uppercase tracking-wide mb-10 md:mb-14 scroll-mt-[120px]"
    >
      {title}
    </h2>
  );
}

export default function ColorPage() {
  const { classics, collections, shades, otherProducts, shadeColors } =
    useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<string>("Mini Colours");

  // Combine all products and DEDUPLICATE by slug to prevent duplicates
  const allProducts = (() => {
    const seen = new Set<string>();
    const combined = [...classics, ...collections, ...shades, ...otherProducts];
    return combined.filter((product) => {
      if (!product?.slug || seen.has(product.slug)) {
        return false;
      }
      seen.add(product.slug);
      return true;
    });
  })();

  // Smart categorization function - matches products to categories by title/slug
  const categorizeProduct = (product: ScrapedProduct): string[] => {
    const titleLower = product.title?.toLowerCase() || "";
    const slugLower = product.slug?.toLowerCase() || "";
    const categories: string[] = [];

    // Base Coat - must have both "base" AND "coat" (or be 002)
    const isBaseCoat =
      (titleLower.includes("base") && titleLower.includes("coat")) ||
      (titleLower.includes("002") && titleLower.includes("base"));
    if (isBaseCoat) {
      categories.push("Base Coat");
      return categories; // Base coat products are ONLY base coats
    }

    // Top Coat - must have both "top" AND "coat"
    const isTopCoat = titleLower.includes("top") && titleLower.includes("coat");
    if (isTopCoat) {
      categories.push("Top Coat");
      return categories; // Top coat products are ONLY top coats
    }

    // Polish Dryer - specific products
    const isPolishDryer =
      titleLower.includes("dryer") || titleLower.includes("mavadry");
    if (isPolishDryer) {
      categories.push("Polish Dryer");
      return categories;
    }

    // Remover - must have "remover"
    const isRemover = titleLower.includes("remover");
    if (isRemover) {
      categories.push("Remover");
      return categories;
    }

    // Mini Bio - must have "bio" and be nail-related
    const isBio =
      (titleLower.includes("bio") && titleLower.includes("color")) ||
      slugLower.includes("bio-color");
    if (isBio) {
      categories.push("Mini Bio");
      // Bio products can also be in Collections
    }

    // Mini Colours Collection - themed collections (pop-wave, neo-nudes, etc.)
    const isCollection = COLLECTIONS_SLUGS.includes(product.slug);
    if (isCollection) {
      categories.push("Mini Colours Collection");
      return categories; // Collections ONLY in Collections tab, not in Mini Colours
    }

    // Mini Colours - for products in classics, shades arrays OR nail polishes (NOT collections)
    const isInClassicsOrShades =
      CLASSICS_SLUGS.includes(product.slug) ||
      SHADES_SLUGS.includes(product.slug);
    const isNailPolish =
      titleLower.includes("mini") ||
      (titleLower.includes("color") && !isBaseCoat && !isTopCoat) ||
      titleLower.includes("polish") ||
      titleLower.includes("shade");

    if (isInClassicsOrShades || isNailPolish) {
      categories.push("Mini Colours");
    }

    return categories;
  };

  // Filter products based on active tab
  const filteredProducts =
    activeTab === "see-all"
      ? allProducts
      : allProducts.filter((p) => {
          const categories = categorizeProduct(p);
          return categories.includes(activeTab);
        });

  // Tab categories
  const tabs = [
    { id: "see-all", label: "See All" },
    { id: "Mini Colours", label: "Mini Colours" },
    { id: "Mini Colours Collection", label: "Collections" },
    { id: "Base Coat", label: "Base Coat" },
    { id: "Top Coat", label: "Top Coat" },
    { id: "Polish Dryer", label: "Polish Dryer" },
    { id: "Remover", label: "Remover" },
    { id: "Mini Bio", label: "Mini Bio" },
  ];

  // Dynamic title and description based on active tab
  const getTitleAndDescription = () => {
    switch (activeTab) {
      case "see-all":
        return {
          title: "Nail Make-Up",
          description:
            "Since 1962, MAVALA MINI COLOR nail polishes, in a handy and economical small format, have been your companion at all times. Their respectful formula offers easy application, perfect adhesion, shine and long-lasting hold! Nail polishes which also let the nails breathe and pass water vapour!",
        };
      case "Mini Colours":
        return {
          title: "MINI COLOR'S NAIL POLISHES",
          description:
            "All Mavala nail polishes, base coats and top coats allow nails to breathe. They contain a resin extracted from wood which adheres to the nail surface in the form of a flexible and resistant film which remains porous, allowing oxygen and water vapour to pass through the nail polish, to the nail plate. They are developed with rigorously selected ingredients and are free from ingredients of animal origin, thus suitable for vegans. Their convenient and economical 5ml MINI format helps reduce waste, and allows you to choose a few shades from the 300+ available!",
        };
      case "Mini Colours Collection":
        return {
          title: "MINI COLOR'S COLLECTIONS",
          description:
            "Discover our curated themed collections, each featuring a harmonious selection of shades designed to complement each other. From the fresh energy of Pop Wave to the natural elegance of Neo Nudes, find your perfect palette.",
        };
      case "Base Coat":
        return {
          title: "Base Coat",
          description:
            "MAVALA, nail care expert, offers nail polish base coats suitable for each type of nail to prevent yellowing and ensure perfect adhesion and long-lasting of the manicure. It's up to you to choose a long-lasting, moisturzing or fortifying base coat.",
        };
      case "Top Coat":
        return {
          title: "Top Coat",
          description:
            "MAVALA, nail care expert, offers top coats, depending on the desired result (shiny, matt, fast-drying, volumizing or even with a glitter effect) this essential coat prevents nail polish from flaking and allows it to resist shocks.",
        };
      case "Mini Bio":
        return {
          title: "Mini Bio Color's",
          description: "Make up your nails with ingredients of natural origin.",
        };
      case "Polish Dryer":
        return {
          title: "Nail Polish Dryer",
          description:
            "The active and busy woman does not have time to wait ... However, a nail polish dries completely in 24 hours! MAVALA offers drying accelerators which make nail polish touch-dry in a few seconds.",
        };
      case "Remover":
        return {
          title: "Nail Polish Remover",
          description:
            "MAVALA offers gentle yet effective nail polish removers that respect your nails and surrounding skin.",
        };
      default:
        return {
          title: "Nail Make-Up",
          description:
            "Since 1962, MAVALA MINI COLOR nail polishes, in a handy and economical small format, have been your companion at all times.",
        };
    }
  };

  const { title, description } = getTitleAndDescription();

  return (
    <div className="min-h-screen bg-white pt-[90px] scroll-smooth">
      {/* Hero Section - Reduced height for better mobile/desktop balance */}
      <section className="relative w-full h-[40vh] md:h-[45vh] overflow-hidden">
        <img
          src="/Gemini_Generated_Image_6ifo0k6ifo0k6ifo.png"
          alt="Mavala Mini Color Nail Polishes"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "50% 40%" }}
        />
      </section>

      {/* Intro Section with Description */}
      <section className="pt-4 md:pt-6 lg:pt-8 pb-12 md:pb-20 lg:pb-24 px-4 md:px-8 bg-gradient-to-b from-white to-[#fafafa]">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Title - Dynamic based on active tab */}
          <h1 className="font-['Archivo'] text-[26px] sm:text-[32px] md:text-[40px] lg:text-[48px] font-semibold text-[#ae1932] uppercase tracking-wide mb-6 md:mb-8 px-2">
            {title}
          </h1>

          {/* Description - Dynamic based on active tab */}
          <p className="font-['Archivo'] text-[14px] sm:text-[15px] md:text-[17px] lg:text-[18px] text-gray-600 leading-relaxed mb-10 md:mb-14 max-w-4xl mx-auto px-2">
            {description}
          </p>

          {/* Horizontal Tab Navigation Bar - Wraps on mobile, single row on desktop */}
          <div className="w-full flex justify-center px-4">
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2 md:gap-3 bg-white border border-gray-200 rounded-xl p-3 md:p-3 shadow-sm max-w-5xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-3 md:px-5 py-2 md:py-3 rounded-lg font-['Archivo'] text-[11px] md:text-[13px] font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? "bg-[#ae1932] text-white shadow-md"
                        : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-[#ae1932]"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid - Single unified grid */}
      <section className="py-0 md:py-4 px-6 md:px-10 lg:px-16 bg-white">
        <div className="w-full">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
              {filteredProducts.map((product) => {
                // Safety check - ensure product has required fields
                if (!product?.slug || !product?.title) return null;

                try {
                  return COLLECTIONS_SLUGS.includes(product.slug) ? (
                    <CollectionCard
                      key={product.slug}
                      product={product}
                      shadeColors={shadeColors}
                    />
                  ) : (
                    <ColorProductCard
                      key={product.slug}
                      product={product}
                      shadeColors={shadeColors}
                    />
                  );
                } catch (error) {
                  console.error(
                    `Error rendering product ${product.slug}:`,
                    error
                  );
                  return null;
                }
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-['Archivo'] text-gray-500 text-lg">
                No products found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Note Section */}
      <section className="py-8 px-4 md:px-8 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-['Archivo'] text-[13px] text-gray-600 italic">
            * Suitable for Muslim women but not independently halal certified.
          </p>
        </div>
      </section>
    </div>
  );
}
