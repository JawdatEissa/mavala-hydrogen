import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import {
  loadScrapedProducts,
  getProductBySlug,
  type ScrapedProduct,
} from "../lib/scraped-products.server";
import { formatPriceToCad } from "../lib/currency";
import { ShadeDrawer } from "../components/ShadeDrawer";
import { ProductCard } from "../components/ProductCard";
import { isBestsellerSlug } from "../lib/bestsellers";
// Import pre-generated image manifest (avoids fs scanning at runtime)
import imageManifest from "~/data/image-manifest.json";
// Import shade colors data directly
import shadeColorsData from "~/data/shade_colors.json";

// Import color mappings for shade data
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

// Map of slug to color mapping data
const COLOR_MAPPINGS: Record<
  string,
  {
    shade_details?: Array<{ name: string; image: string; color?: string }>;
    color_groups?: Record<string, string[]>;
  }
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

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { handle } = params;

  if (!handle) {
    throw new Response("Not Found", { status: 404 });
  }

  // Use getProductBySlug which loads detailed data with shades
  const product = getProductBySlug(handle);

  if (!product) {
    console.error(`Product not found: ${handle}`);
    throw new Response("Not Found", { status: 404 });
  }

  // Get related products: hybrid approach (same category + best sellers)
  const allProducts = loadScrapedProducts();
  
  // Get the current product's categories
  const productCategories = product.categories || [];
  
  // Find products from the same category (excluding current product)
  const sameCategoryProducts = allProducts.filter((p) => {
    if (p.slug === product.slug) return false;
    if (!p.categories || !Array.isArray(p.categories)) return false;
    return p.categories.some((cat) => 
      productCategories.some((pCat) => 
        cat.toLowerCase() === pCat.toLowerCase()
      )
    );
  });
  
  // Get best sellers (excluding current product)
  const bestSellers = allProducts.filter((p) => 
    p.slug !== product.slug && isBestsellerSlug(p.slug)
  );
  
  // Build hybrid recommendations: 2-3 from same category + 2-3 best sellers
  const recommendedProducts: ScrapedProduct[] = [];
  const addedSlugs = new Set<string>();
  
  // Add up to 3 from same category first
  for (const p of sameCategoryProducts.slice(0, 3)) {
    if (!addedSlugs.has(p.slug)) {
      recommendedProducts.push(p);
      addedSlugs.add(p.slug);
    }
  }
  
  // Fill remaining with best sellers (up to 5 total)
  for (const p of bestSellers) {
    if (recommendedProducts.length >= 5) break;
    if (!addedSlugs.has(p.slug)) {
      recommendedProducts.push(p);
      addedSlugs.add(p.slug);
    }
  }
  
  // If still not enough, add random products to reach 5
  if (recommendedProducts.length < 5) {
    for (const p of allProducts) {
      if (recommendedProducts.length >= 5) break;
      if (p.slug !== product.slug && !addedSlugs.has(p.slug)) {
        recommendedProducts.push(p);
        addedSlugs.add(p.slug);
      }
    }
  }
  
  const relatedProducts = recommendedProducts;

  // Load color mapping for this product (contains shades and color groups)
  const colorMapping = COLOR_MAPPINGS[handle] || null;

  // Add shades from color mapping if product doesn't have them
  if (
    colorMapping?.shade_details &&
    (!product.shades || product.shades.length === 0)
  ) {
    product.shades = colorMapping.shade_details.map((s) => ({
      name: s.name,
      image: s.image,
    }));
  }

  // Use bundled shade colors data
  const shadeColors = shadeColorsData as Record<
    string,
    { hex: string; rgb: number[] }
  >;

  // Helper to normalize strings for matching (handles accents)
  const normalizeForMatching = (str: string): string => {
    return str
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics/accents
      .replace(/[*\.]/g, "") // Remove asterisks and periods
      .replace(/-/g, " ") // Convert hyphens to spaces
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  };

  // Load all shade images from pre-generated manifest (avoids fs scanning at runtime)
  const shadeImagesMap: Record<string, string[]> = {};
  const manifest = imageManifest as {
    products: Record<string, string[]>;
    shades: Record<string, string[]>;
  };
  const shadeFolderNames = Object.keys(manifest.shades);

  if (Array.isArray(product.shades) && shadeFolderNames.length > 0) {
    product.shades.forEach((shade: { name: string }) => {
      const shadeName = normalizeForMatching(shade.name);
      const matchingFolder = shadeFolderNames.find((folder) => {
        const folderName = normalizeForMatching(folder);
        if (folderName === shadeName) return true;
        if (folderName.includes(shadeName) || shadeName.includes(folderName))
          return true;
        const shadeWords = shadeName.split(/\s+/);
        return shadeWords.every((word) => word && folderName.includes(word));
      });

      if (matchingFolder) {
        const folderImages = manifest.shades[matchingFolder];
        if (folderImages && folderImages.length > 0) {
          // Limit to first 3 images
          shadeImagesMap[shade.name] = folderImages.slice(0, 3);
        }
      }
    });
  }

  return json({
    product,
    relatedProducts,
    colorMapping,
    shadeImagesMap,
    shadeColors,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.product.title} | Mavala Switzerland` },
    {
      name: "description",
      content:
        data?.product.main_description?.slice(0, 160) || data?.product.tagline,
    },
  ];
};

// Mobile Shade Gallery - Mavala-style swipeable images with progress bar
function MobileShadeGallery({
  images,
  alt,
  onImageClick,
  productSlug = "",
}: {
  images: string[];
  alt: string;
  onImageClick: (index: number) => void;
  productSlug?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    const diff = currentTouch - touchStart;
    if (
      (currentIndex === 0 && diff > 0) ||
      (currentIndex === images.length - 1 && diff < 0)
    ) {
      setDragOffset(diff * 0.3);
    } else {
      setDragOffset(diff);
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    setDragOffset(0);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (distance < -minSwipeDistance && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Calculate progress bar width
  const progressWidth =
    images.length > 1 ? ((currentIndex + 1) / images.length) * 100 : 100;

  return (
    <div className="w-full">
      {/* Swipeable Image Container */}
      <div
        className="relative bg-[#f5f5f5] overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(calc(-${
              currentIndex * 100
            }% + ${dragOffset}px))`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-full aspect-square flex items-center justify-center"
              onClick={() => onImageClick(idx)}
              style={
                productSlug === "double-lash" && idx === 1
                  ? { paddingTop: "20%" }
                  : undefined
              }
            >
              <img
                src={img}
                alt={`${alt} - ${idx + 1}`}
                className="max-w-full max-h-full object-contain"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar - Like Mavala */}
      {images.length > 1 && (
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Universal Image Gallery with Lightbox - Works on mobile and desktop
function ImageGallery({
  mainImage,
  additionalImages,
  alt,
  isCollectionProduct = false,
  isBioColors = false,
  productSlug = "",
}: {
  mainImage: string;
  additionalImages: string[];
  alt: string;
  isCollectionProduct?: boolean;
  isBioColors?: boolean;
  productSlug?: string;
}) {
  // Product-specific flags
  const isScientifique1 = productSlug === "mavala-scientifique-1";
  const isScientifiqueK = productSlug === "mavala-scientifique-k";
  const isMavadrySpray = productSlug === "mavadry-spray";
  const isMavalaStop = productSlug === "mavala-stop";
  const isNailactan = productSlug === "nailactan-1";
  const isNailWhiteCrayon = productSlug === "nail-white-crayon";
  
  // Background color: white for collection products and nail-white-crayon, grey for others
  const bgColor = (isCollectionProduct || isNailWhiteCrayon) ? "bg-white" : "bg-[#f5f5f5]";
  
  // Products that use the special 3-image grid layout (like mavala-stop)
  const useSpecialGridLayout = isMavalaStop || isScientifique1 || isScientifiqueK || isNailactan;

  // Products with lifestyle images that should use object-cover for secondary images
  // Note: shade products (like nude-shades) use object-contain to show full images
  const lifestyleImageProducts = [
    "cream-colors",
    "pearl-colors",
  ];

  const useObjectCover =
    lifestyleImageProducts.includes(productSlug) || isScientifique1;
  const bioGridRowsClass = (isBioColors || isNailWhiteCrayon) ? "md:grid-rows-2 md:items-stretch" : "";
  const bioFillHeightClass = (isBioColors || isNailWhiteCrayon) ? "h-full" : "";
  const mainImageClass = (isBioColors || isNailWhiteCrayon)
    ? "block w-full h-full object-cover border-none outline-none"
    : "block w-full h-full object-contain border-none outline-none";

  /**
   * Some products need per-image background/fit tweaks.
   * - `mavala-scientifique-1`: image 01 on grey, images 02/03 on white.
   * - `mavadry-spray`: image 02 on grey (product shot), image 03 as cover (no grey showing).
   * - `mavala-stop`: image 01 on grey, images 02/03 on white with object-cover.
   */
  const getContainerBgColor = (imageIndex: number): string => {
    if (imageIndex === 0) return bgColor;
    if (isScientifique1) return "bg-white";
    if (isMavadrySpray && imageIndex === 2) return "bg-white";
    if (isMavalaStop) return "bg-white";
    if (isNailactan) return "bg-white";
    if (isNailWhiteCrayon) return "bg-white";
    return bgColor;
  };

  const getAdditionalImageClass = (imageIndex: number): string => {
    if (isBioColors) return "block w-full h-full object-cover border-none outline-none";
    if (isScientifique1)
      return "block w-full h-full object-cover border-none outline-none";
    if (isMavalaStop)
      return "block w-full h-full object-cover border-none outline-none";
    if (isNailactan)
      return "block w-full h-full object-cover border-none outline-none";
    if (isNailWhiteCrayon)
      return "block w-full h-full object-cover border-none outline-none";
    if (productSlug === "double-lash")
      return "block w-full h-full object-cover border-none outline-none";
    if (isMavadrySpray) {
      return imageIndex === 2
        ? "block w-full h-full object-cover border-none outline-none"
        : "block w-full h-full object-contain border-none outline-none";
    }
    return `block w-full aspect-square border-none outline-none ${
      useObjectCover ? "object-cover" : "object-contain"
    }`;
  };

  const getThumbnailImageClass = (imageIndex: number): string => {
    if (isMavadrySpray) {
      return imageIndex === 2
        ? "block w-full h-full object-cover"
        : "block w-full h-full object-contain";
    }
    return "block w-full h-full object-cover";
  };

  // Get image positioning for specific products
  const getImageStyle = (imageIndex: number): React.CSSProperties => {
    const isDoubleLash = productSlug === "double-lash";
    
    // For double-lash, move the second image (index 1) down by 20%
    if (isDoubleLash && imageIndex === 1) {
      return {
        // `objectPosition` can be visually subtle depending on the source image;
        // use translateY to physically move the image within the fixed grey box.

        objectPosition: "center 75%",
        transform: "scale(1.331) translateY(10%)",
        transformOrigin: "center",
        imageRendering: "-webkit-optimize-contrast" as any,
      };
    }
    
    return {
      imageRendering: "-webkit-optimize-contrast" as any,
    };
  };

  // Get container styling for specific products
  const getContainerStyle = (imageIndex: number): React.CSSProperties => {
    const isDoubleLash = productSlug === "double-lash";
    
    // For double-lash, add padding to the top of the first additional image container
    if (isDoubleLash && imageIndex === 1) {
      return {
        paddingTop: "20%",
      };
    }
    
    return {};
  };

  // Get main image styling for specific products
  const getMainImageStyle = (): React.CSSProperties => {
    const isDoubleLash = productSlug === "double-lash";
    
    // For double-lash, scale up by 10% and move up by 15%
    if (isDoubleLash) {
      return {
        transform: "scale(1.1) translateY(-15%)",
        imageRendering: "-webkit-optimize-contrast" as any,
      };
    }
    
    return {
      imageRendering: "-webkit-optimize-contrast" as any,
    };
  };
  const bioGridStyle = isBioColors 
    ? { aspectRatio: "4/3" } 
    : isNailWhiteCrayon 
      ? { maxHeight: '700px' } 
      : undefined;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // Touch handling state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // All images including main
  const allImages = [mainImage, ...additionalImages];

  // Minimum swipe distance to trigger navigation (50px)
  const minSwipeDistance = 50;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    setIsClosing(false);
    setDragOffset(0);
    document.body.style.overflow = "hidden";
    // Push history state so back button closes lightbox instead of navigating
    window.history.pushState({ lightbox: true }, "");
    // Hide the main header
    window.dispatchEvent(new CustomEvent("shadeDrawerOpen"));
  };

  const closeLightbox = (fromBackButton = false) => {
    setIsClosing(true);
    // If not closed via back button, go back in history to remove our pushed state
    if (!fromBackButton) {
      window.history.back();
    }
    // Show the main header again
    window.dispatchEvent(new CustomEvent("shadeDrawerClose"));
    setTimeout(() => {
      setLightboxOpen(false);
      setIsClosing(false);
      document.body.style.overflow = "";
    }, 300);
  };

  // Handle back button and Escape key - close lightbox
  useEffect(() => {
    const handlePopState = () => {
      if (lightboxOpen && !isClosing) {
        closeLightbox(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, isClosing, currentIndex]);

  // Navigate to next/previous image
  const goToImage = (index: number) => {
    if (index >= 0 && index < allImages.length) {
      setCurrentIndex(index);
    }
  };

  const goNext = () => goToImage(currentIndex + 1);
  const goPrev = () => goToImage(currentIndex - 1);

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);

    // Calculate drag offset for visual feedback
    const diff = currentTouch - touchStart;
    // Limit drag offset at edges
    if (
      (currentIndex === 0 && diff > 0) ||
      (currentIndex === allImages.length - 1 && diff < 0)
    ) {
      setDragOffset(diff * 0.3); // Resistance at edges
    } else {
      setDragOffset(diff);
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    setDragOffset(0);

    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < allImages.length - 1) {
      goNext();
    } else if (isRightSwipe && currentIndex > 0) {
      goPrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Hide thumbnail strip if only 1 image
  const showThumbnails = allImages.length > 1;

  return (
    <div>
      {/* MOBILE LAYOUT */}
      <div className="md:hidden">
        {/* Main Large Image - Tappable */}
        <div
          className={`${bgColor} border-none outline-none shadow-none cursor-pointer active:opacity-90 transition-opacity`}
          onClick={() => openLightbox(0)}
        >
          <img
            src={mainImage}
            alt={alt}
            className="block w-full aspect-square object-contain border-none outline-none"
            style={{ imageRendering: "-webkit-optimize-contrast" }}
          />
        </div>

        {/* Thumbnail Strip - Only show if multiple images */}
        {showThumbnails && (
          <div
            className="flex gap-1 mt-2 overflow-x-auto scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {allImages.map((img, idx) => (
              <div
                key={idx}
                className={`flex-1 min-w-0 aspect-square ${
                  getContainerBgColor(idx)
                } cursor-pointer active:opacity-80 transition-opacity`}
                onClick={() => openLightbox(idx)}
              >
                <img
                  src={img}
                  alt={`${alt} - ${idx + 1}`}
                  className={getThumbnailImageClass(idx)}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP LAYOUT - Grid with main image left, additional images right (if multiple) */}
      {showThumbnails && additionalImages.length >= 2 ? (
        /* 2+ additional images: Standard grid layout */
        useSpecialGridLayout ? (
          /* Special 3-image grid layout - main image with two smaller images on right */
          <div className="hidden md:grid md:grid-cols-[60%_40%] gap-2">
            {/* Main Large Image - Left - Clickable - Reduced by 20% for scientifique-k */}
            <div
              className={`${bgColor} border-none outline-none shadow-none cursor-pointer hover:opacity-95 transition-opacity overflow-hidden`}
              onClick={() => openLightbox(0)}
            >
              <img
                src={mainImage}
                alt={alt}
                className="block w-full object-contain border-none outline-none"
                style={{ 
                  imageRendering: "-webkit-optimize-contrast", 
                  maxHeight: '775px',
                  transform: isScientifiqueK ? 'scale(0.8)' : undefined
                }}
              />
            </div>

            {/* Additional Images Column - Right - Clickable */}
            <div className="flex flex-col gap-2">
              {additionalImages.slice(0, 2).map((img, idx) => (
                <div
                  key={idx}
                  className="bg-white border-none outline-none shadow-none cursor-pointer hover:opacity-95 transition-opacity overflow-hidden"
                  onClick={() => openLightbox(idx + 1)}
                >
                  <img
                    src={img}
                    alt={`${alt} - ${idx + 2}`}
                    className="block w-full object-contain border-none outline-none"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Standard grid layout for other products */
          <div
            className={`hidden md:grid md:grid-cols-[60%_40%] gap-2 ${bioGridRowsClass}`}
            style={bioGridStyle}
          >
            {/* Main Large Image - Left - Clickable */}
            <div
              className={`${bgColor} border-none outline-none shadow-none row-span-2 cursor-pointer hover:opacity-95 transition-opacity ${bioFillHeightClass}`}
              onClick={() => openLightbox(0)}
            >
              <img
                src={mainImage}
                alt={alt}
                className={mainImageClass}
                style={getMainImageStyle()}
              />
            </div>

            {/* Additional Images Stacked - Right - Clickable */}
            {additionalImages.slice(0, 2).map((img, idx) => (
              <div
                key={idx}
                className={`${getContainerBgColor(
                  idx + 1
                )} border-none outline-none shadow-none cursor-pointer hover:opacity-95 transition-opacity overflow-hidden ${bioFillHeightClass}`}
                style={getContainerStyle(idx + 1)}
                onClick={() => openLightbox(idx + 1)}
              >
                <img
                  src={img}
                  alt={`${alt} - ${idx + 2}`}
                  className={getAdditionalImageClass(idx + 1)}

                  style={getImageStyle(idx + 1)}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )
      ) : showThumbnails && additionalImages.length === 1 ? (
        /* 1 additional image: Main image large on left, smaller image on right */
        <div className="hidden md:grid md:grid-cols-[55%_45%] gap-2 items-start">
          {/* Main Large Image - Left - Clickable - Taller */}
          <div
            className={`${bgColor} border-none outline-none shadow-none cursor-pointer hover:opacity-95 transition-opacity`}
            onClick={() => openLightbox(0)}
          >
            <img
              src={mainImage}
              alt={alt}
              className={
                isBioColors
                  ? "w-full h-full object-cover border-none outline-none"
                  : "w-full object-contain border-none outline-none"
              }
              style={{
                imageRendering: "-webkit-optimize-contrast",
                aspectRatio: "4/5",
              }}
            />
          </div>

          {/* Single Additional Image - Right - Clickable - Square */}
          <div
            className={`${getContainerBgColor(
              1
            )} border-none outline-none shadow-none cursor-pointer hover:opacity-95 transition-opacity`}
            onClick={() => openLightbox(1)}
          >
            <img
              src={additionalImages[0]}
              alt={`${alt} - 2`}
              className={getAdditionalImageClass(1)}
              style={isBioColors ? undefined : { aspectRatio: "4/5" }}
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        /* Single image - full width, still clickable */
        <div
          className={`hidden md:block ${bgColor} border-none outline-none shadow-none cursor-pointer hover:opacity-95 transition-opacity`}
          onClick={() => openLightbox(0)}
        >
          <img
            src={mainImage}
            alt={alt}
            className={
              isBioColors
                ? "block w-full aspect-square object-cover border-none outline-none"
                : "block w-full aspect-square object-contain border-none outline-none"
            }
            style={{ imageRendering: "-webkit-optimize-contrast" }}
          />
        </div>
      )}

      {/* Fullscreen Lightbox - Shared for mobile and desktop */}
      {lightboxOpen && (
        <div
          className={`fixed inset-0 z-50 bg-[#f5f5f5] transition-opacity duration-300 cursor-pointer ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={() => closeLightbox()}
        >
          {/* Close button - prominent X in top right */}
          <button
            className="absolute top-4 right-4 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg text-black"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Image counter */}
          <div
            className="absolute top-4 left-4 z-20 text-black text-sm font-medium bg-white/50 px-2 py-1 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            {currentIndex + 1} / {allImages.length}
          </div>

          {/* Swipeable Image Container - Touch controlled */}
          <div
            className="h-full w-full overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="h-full flex"
              style={{
                transform: `translateX(calc(-${
                  currentIndex * 100
                }% + ${dragOffset}px))`,
                transition: isDragging ? "none" : "transform 0.3s ease-out",
              }}
            >
              {allImages.map((img, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-full h-full flex items-center justify-center px-4"
                >
                  <img
                    src={img}
                    alt={`${alt} - ${idx + 1}`}
                    className="max-w-full max-h-[80vh] object-contain cursor-default"
                    onClick={(e) => e.stopPropagation()}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows for desktop/accessibility */}
          {currentIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/10 text-black hover:bg-black/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
          )}
          {currentIndex < allImages.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/10 text-black hover:bg-black/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          )}

          {/* Dot indicators */}
          <div
            className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {allImages.map((_, idx) => (
              <button
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  idx === currentIndex ? "bg-black scale-125" : "bg-black/30"
                }`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductPage() {
  const {
    product,
    relatedProducts,
    colorMapping,
    shadeImagesMap,
    shadeColors,
  } = useLoaderData<typeof loader>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedMainColor, setSelectedMainColor] = useState<string | null>(
    null
  );
  const [selectedShade, setSelectedShade] = useState<string | null>(null);
  const [isShadeDrawerOpen, setIsShadeDrawerOpen] = useState(false);
  // Tab state for product details section (horizontal tabs like reference site)
  const [activeProductTab, setActiveProductTab] = useState<"details" | "ingredients">("details");
  // Track header visibility for sticky positioning
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);

  // Listen for scroll direction to match header hide/show behavior
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollingDown = currentScrollY > lastScrollY;
          
          // Match header's hide logic: hide after 100px when scrolling down
          // Show when scrolling up or near top
          if (currentScrollY <= 40) {
            setIsHeaderHidden(false);
          } else if (scrollingDown && currentScrollY > 100) {
            setIsHeaderHidden(true);
          } else if (!scrollingDown) {
            setIsHeaderHidden(false);
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get display price - prefer exact price, fallback to price_from but strip "from " prefix
  const displayPrice = product.price || (product.price_from ? product.price_from.replace(/^from\s+/i, '') : "");

  // Get images array safely - prefer gallery_images for detailed products
  // Filter out certification/badge images (they contain words like "cares", "tested", "vegan", "animal")
  const filterCertificationImages = (imgs: string[]) => {
    const certificationKeywords = [
      "cares",
      "tested",
      "animal",
      "vegan",
      "cruelty",
      "certification",
      "badge",
      "logo_",
      "icon_",
      "seal_",
    ];
    return imgs.filter((img) => {
      const lowerImg = img.toLowerCase();
      return !certificationKeywords.some((keyword) =>
        lowerImg.includes(keyword)
      );
    });
  };

  const rawImages =
    Array.isArray(product.gallery_images) && product.gallery_images.length > 0
      ? product.gallery_images
      : Array.isArray(product.images)
      ? product.images
      : [];

  // Filter out certification images from main gallery
  const images = filterCertificationImages(rawImages);

  // Get sizes array safely
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];

  // Get shades array safely
  const shades = Array.isArray(product.shades) ? product.shades : [];

  // Clean up occasional bad scrape artifacts (e.g. popup JS injected into description)
  const rawMainDescription =
    typeof product.main_description === "string" ? product.main_description : "";
  const isPopupScriptDescription =
    /\bfunction\s+MakePopup\b|window\.createPopup|var\s+popupWindow\s*=/i.test(
      rawMainDescription
    );
  const mainDescription = isPopupScriptDescription
    ? product.slug === "mavadry-spray"
      ? "MAVADRY SPRAY dries nail polish quickly to help prevent smudging and flaking, while enhancing colour and adding shine. A manicure time-saver for a fast, glossy finish."
      : typeof product.tagline === "string"
      ? product.tagline
      : ""
    : rawMainDescription;

  // Prefer explicit volume, else first size; fall back to 5ml for shade products only
  const volumeLabel =
    (typeof product.volume === "string" && product.volume.trim()) ||
    (sizes.length > 0 ? sizes[0] : "") ||
    (shades.length > 0 ? "5ml" : "");

  // Get new_shades (for collections like Oh La La!)
  const newShades = product.new_shades as
    | {
        collection_name?: string;
        collection_image?: string;
        shades?: Array<{ name: string; image: string }>;
      }
    | undefined;

  // Get description bullets
  const descriptionBullets = Array.isArray(product.description_bullets)
    ? product.description_bullets
    : [];

  // Group shades by main color using official Mavala categorization
  let shadesByColor: Record<string, typeof shades> = {};
  let availableMainColors: Array<{ name: string }> = [];

  const colorGroups = colorMapping?.color_groups;
  if (colorGroups) {
    // Use official color groups from mapping
    Object.keys(colorGroups).forEach((colorName) => {
      const shadeNames = colorGroups[colorName];
      shadesByColor[colorName] = shades.filter((shade) =>
        shadeNames.includes(shade.name)
      );
    });

    // Get available colors (only those with shades)
    availableMainColors = Object.keys(shadesByColor)
      .filter((color) => shadesByColor[color].length > 0)
      .map((name) => ({ name }));
  }

  // Filter shades based on selected main color
  const filteredShades =
    selectedMainColor && shadesByColor[selectedMainColor]
      ? shadesByColor[selectedMainColor]
      : shades;

  // Get current display image (either from gallery or selected shade)
  const getCurrentImage = () => {
    // If a shade is selected, try to show its image from local shades folder first
    if (selectedShade) {
      // First try shadeImagesMap (local transparent images)
      if (
        shadeImagesMap &&
        shadeImagesMap[selectedShade] &&
        shadeImagesMap[selectedShade].length > 0
      ) {
        return shadeImagesMap[selectedShade][0];
      }
      // Fall back to shade.image only if local not found
      const shade = shades.find((s) => s.name === selectedShade);
      if (shade && shade.image && shade.image.startsWith("/images/shades/")) {
        return shade.image;
      }
    }
    // Otherwise show the selected gallery image
    return images[selectedImage] || images[0];
  };

  // Get additional images for multi-image display
  const getAdditionalImages = () => {
    if (selectedShade && shadeImagesMap && shadeImagesMap[selectedShade]) {
      const allShadeImages = shadeImagesMap[selectedShade];
      // Return images 2 and 3 (skip the first one as it's the main image)
      return allShadeImages.slice(1, 3);
    }
    return [];
  };

  const additionalImages = getAdditionalImages();

  // Get image for a shade, prioritizing local images from shadeImagesMap
  const getShadeImage = (shade: { name: string; image: string }): string => {
    // First try shadeImagesMap (local transparent images)
    if (
      shadeImagesMap &&
      shadeImagesMap[shade.name] &&
      shadeImagesMap[shade.name].length > 0
    ) {
      return shadeImagesMap[shade.name][0];
    }
    // Only fall back to shade.image if it's a local path (not CDN)
    if (shade.image && shade.image.startsWith("/images/shades/")) {
      return shade.image;
    }
    // Return empty string if no local image found (shouldn't display these)
    return "";
  };

  // Helper to normalize strings for matching (handles accents)
  const normalizeForColorMatching = (str: string): string => {
    return str
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics/accents
      .replace(/[*\.]/g, "") // Remove asterisks and periods
      .replace(/-/g, " ") // Convert hyphens to spaces
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  };

  // Get shade color from extracted colors
  const getShadeColor = (shadeName: string): string | null => {
    if (!shadeColors) return null;

    const normalizedName = normalizeForColorMatching(shadeName);

    // Try to find matching key
    const shadeKey = Object.keys(shadeColors).find((key) => {
      const normalizedKey = normalizeForColorMatching(key);
      return (
        normalizedKey === normalizedName ||
        normalizedKey.includes(normalizedName) ||
        normalizedName.includes(normalizedKey)
      );
    });

    if (shadeKey && shadeColors[shadeKey]) {
      return shadeColors[shadeKey].hex;
    }
    return null;
  };

  // Get all shade images for mobile swiper
  const getAllShadeImages = () => {
    if (selectedShade && shadeImagesMap && shadeImagesMap[selectedShade]) {
      return shadeImagesMap[selectedShade];
    }
    return [getCurrentImage()];
  };

  const mobileShadeImages = getAllShadeImages();

  // State for mobile lightbox
  const [mobileLightboxOpen, setMobileLightboxOpen] = useState(false);
  const [mobileLightboxIndex, setMobileLightboxIndex] = useState(0);

  const openMobileLightbox = (index: number) => {
    setMobileLightboxIndex(index);
    setMobileLightboxOpen(true);
    document.body.style.overflow = "hidden";
    window.history.pushState({ lightbox: true }, "");
    window.dispatchEvent(new CustomEvent("shadeDrawerOpen"));
  };

  const closeMobileLightbox = (fromBackButton = false) => {
    if (!fromBackButton) window.history.back();
    window.dispatchEvent(new CustomEvent("shadeDrawerClose"));
    setMobileLightboxOpen(false);
    document.body.style.overflow = "";
  };

  // Handle back button for mobile lightbox
  useEffect(() => {
    const handlePopState = () => {
      if (mobileLightboxOpen) {
        closeMobileLightbox(true);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [mobileLightboxOpen]);

  return (
    <div className="pt-[104px] md:pt-[112px] font-['Archivo']">
      {/* ============ MOBILE LAYOUT FOR SHADE PRODUCTS ============ */}
      {shades.length > 0 && (
        <div className="md:hidden">
          {/* Mobile Product Title & Reviews - Above Image */}
          <div className="px-4 py-3 bg-white">
            <h1 className="product-page-title mb-1">
              {formatTitle(product.title)}
            </h1>
            <div className="flex items-center justify-between">
              <span className="product-page-volume">
                {volumeLabel}
              </span>
              {product.store_reviews &&
                typeof product.store_reviews === "object" &&
                product.store_reviews.count && (
                  <span className="product-page-volume">
                    ★★★★★ {product.store_reviews.rating || "4.9"} -{" "}
                    {product.store_reviews.count} Reviews
                  </span>
                )}
            </div>
          </div>

          {/* Mobile Swipeable Image Gallery */}
          <MobileShadeGallery
            images={mobileShadeImages}
            alt={selectedShade || product.title}
            onImageClick={openMobileLightbox}
            productSlug={product.slug}
          />

          {/* Mobile Shade Selection - Mavala Style */}
          <div className="px-4 py-5 bg-white">
            {/* FAVORITE SHADES - Compact */}
            <div className="mb-5">
              <h3 className="font-['Archivo'] text-sm font-bold text-[#272724] uppercase tracking-wider mb-3">
                Favorite Shades
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {filteredShades.slice(0, 6).map((shade, idx) => {
                  const shadeColor = getShadeColor(shade.name);
                  const shadeNumber = shade.name.match(/^\d+/)?.[0] || "";
                  const isSelected = selectedShade === shade.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedShade(shade.name)}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-2 border-black"
                            : "border-2 border-transparent"
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: shadeColor || "#f5f5f5" }}
                        />
                      </div>
                      <span className="text-[10px] font-['Archivo'] text-[#5c666f] mt-0.5">
                        {shadeNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* See All Shades Button */}
            <button
              onClick={() => setIsShadeDrawerOpen(true)}
              className="flex items-center gap-2 text-sm font-['Archivo'] text-[#8b7355] mb-6"
            >
              <span
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{
                  background:
                    "conic-gradient(from 0deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b)",
                }}
              />
              <span>See all shades ({shades.length})</span>
            </button>

            {/* Divider */}
            <hr className="border-t border-gray-200 mb-4" />

            {/* Selected Shade Indicator */}
            {selectedShade && (
              <div className="flex items-center justify-between py-2">
                <span className="font-['Archivo'] text-sm font-bold text-[#272724] uppercase tracking-wider">
                  Selected Shade
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-['Archivo'] text-sm text-[#5c666f]">
                    {selectedShade}
                  </span>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor:
                        getShadeColor(selectedShade) || "#f5f5f5",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Mobile Add to Cart Section - French Mavala Premium Style */}
            <div className="mt-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="font-['Archivo'] text-[0.79rem] text-[#5c666f]">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-lg hover:bg-gray-100 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-lg hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Premium Add to Cart Button - French Mavala Style */}
              <button className="w-full py-4 bg-[#272724] hover:bg-[#1f1f1c] rounded-md font-['Archivo'] transition-all duration-200 flex items-center justify-center gap-3">
                <span className="text-white/90 font-extralight">•</span>
                <span className="text-white font-extralight text-[16px] uppercase tracking-[0.2em]">ADD</span>
                <span className="text-white/90 font-extralight">•</span>
                <span className="text-white font-extralight text-[14px]">{displayPrice ? formatPriceToCad(displayPrice) : ''}</span>
              </button>
            </div>

            {/* Mobile Product Description */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {mainDescription && (
                <p className="product-page-description mb-6">
                  {mainDescription}
                </p>
              )}

              {/* Key Features with vertical bar bullets - Mavala.fr style */}
              {product.slug === "mavala-stop" ? (
                <div className="mb-6 space-y-4">
                  <div className="flex items-start">
                    <span className="w-[5px] h-[18px] flex-shrink-0 mt-1 mr-2 bg-black rounded-full" />
                    <span className="product-page-feature">
                      Bitter nail polish for beautiful nails
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-[5px] h-[18px] flex-shrink-0 mt-1 mr-2 bg-black rounded-full" />
                    <span className="product-page-feature">
                      Dermatologically tested
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-6 space-y-4">
                  <div className="flex items-start">
                    <span className="w-[5px] h-[18px] flex-shrink-0 mt-1 mr-2 bg-black rounded-full" />
                    <span className="product-page-feature">Vegan formula</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-[5px] h-[18px] flex-shrink-0 mt-1 mr-2 bg-black rounded-full" />
                    <span className="product-page-feature">
                      Long-lasting hold and shine
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-[5px] h-[18px] flex-shrink-0 mt-1 mr-2 bg-black rounded-full" />
                    <span className="product-page-feature">
                      Enriched with protective silicium
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Accordion Sections */}
              <div className="border-t border-gray-200">
                {/* How To Use */}
                <details className="group border-b border-gray-200">
                  <summary className="flex items-center justify-between py-4 cursor-pointer list-none">
                    <h3 className="product-page-heading">How to Use</h3>
                    <span className="text-gray-400 transition-transform group-open:rotate-180">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="pb-4 product-page-accordion-text">
                    {product.how_to_use ? (
                      <p className="whitespace-pre-line">
                        {product.how_to_use}
                      </p>
                    ) : (
                      <p>
                        Apply evenly to clean, dry nails. Allow to dry
                        completely between coats.
                      </p>
                    )}
                    
                    {/* YouTube Tutorial Video - Mobile */}
                    {product.youtube_video && (
                      <div className="mt-6">
                        <h4 className="font-['Archivo'] text-sm font-medium text-gray-800 mb-3">
                          Tutorial Video
                        </h4>
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <iframe
                            src={product.youtube_video}
                            title="Product Tutorial Video"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </details>

                {/* Key Ingredients */}
                <details className="group border-b border-gray-200">
                  <summary className="flex items-center justify-between py-4 cursor-pointer list-none">
                    <h3 className="product-page-heading">Key Ingredients</h3>
                    <span className="text-gray-400 transition-transform group-open:rotate-180">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="pb-4 product-page-accordion-text">
                    {product.key_ingredients ? (
                      <p className="whitespace-pre-line">
                        {product.key_ingredients}
                      </p>
                    ) : (
                      <p>No ingredient information available.</p>
                    )}
                  </div>
                </details>

                {/* Safety Directions */}
                <details className="group border-b border-gray-200">
                  <summary className="flex items-center justify-between py-4 cursor-pointer list-none">
                    <h3 className="product-page-heading">Safety Directions</h3>
                    <span className="text-gray-400 transition-transform group-open:rotate-180">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="pb-4 product-page-accordion-text">
                    {product.safety_directions ? (
                      <p className="whitespace-pre-line">
                        {product.safety_directions}
                      </p>
                    ) : (
                      <p>
                        Keep away from heat and open flame. Keep out of reach of
                        children.
                      </p>
                    )}
                  </div>
                </details>

                {/* Ingredients (Full List) */}
                <details className="group border-b border-gray-200">
                  <summary className="flex items-center justify-between py-4 cursor-pointer list-none">
                    <h3 className="product-page-heading">Ingredients</h3>
                    <span className="text-gray-400 transition-transform group-open:rotate-180">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="pb-4 product-page-accordion-text">
                    {product.ingredients ? (
                      <p className="whitespace-pre-line">
                        {product.ingredients}
                      </p>
                    ) : (
                      <p>See packaging for full ingredients list.</p>
                    )}
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Mobile Lightbox */}
          {mobileLightboxOpen && (
            <div
              className="fixed inset-0 z-50 bg-[#f5f5f5]"
              onClick={() => closeMobileLightbox()}
            >
              <button
                className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg text-black"
                onClick={() => closeMobileLightbox()}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="h-full flex items-center justify-center p-4">
                <img
                  src={
                    mobileShadeImages[mobileLightboxIndex] || getCurrentImage()
                  }
                  alt={selectedShade || product.title}
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ DESKTOP LAYOUT & NON-SHADE PRODUCTS ============ */}
      {/* Split-page sticky layout: Left column scrolls (gallery + accordions), Right column stays fixed */}
      <div className={shades.length > 0 ? "hidden md:block" : ""}>
        {/* Product Section */}
        <div className="max-w-[2000px] mx-auto px-4 md:px-8 py-2 md:py-4">
          <div className="grid lg:grid-cols-[60%_40%] gap-4 lg:gap-8 items-start">
            {/* ===== LEFT COLUMN: Gallery + Accordions (scrollable) ===== */}
            <div className="product-content-scrollable">
            {/* Product Gallery */}
            {additionalImages.length > 0 && selectedShade ? (
              /* Shade selected - Universal gallery with lightbox */
              <ImageGallery
                mainImage={getCurrentImage()}
                additionalImages={additionalImages}
                alt={selectedShade || product.title}
              />
            ) : images.length > 1 ? (
              /* Multiple product images - use gallery with lightbox */
              <ImageGallery
                mainImage={images[0]}
                additionalImages={images.slice(1)}
                alt={product.title}
                productSlug={product.slug}
                isCollectionProduct={
                  product.slug.includes("pop-wave") ||
                  product.slug.includes("neo-nudes") ||
                  product.slug.includes("terra-topia") ||
                  product.slug.includes("yummy") ||
                  product.slug.includes("whisper") ||
                  product.slug.includes("timeless") ||
                  product.slug.includes("color-block") ||
                  product.slug.includes("digital-art") ||
                  product.slug.includes("bio-colors") ||
                  product.slug.includes("tandem") ||
                  product.slug.includes("delight") ||
                  product.slug.includes("sofuture") ||
                  product.slug.includes("prismatic") ||
                  product.slug.includes("color-vibe") ||
                  product.slug.includes("iconic") ||
                  product.slug.includes("bubble-gum") ||
                  product.slug.includes("cyber-chic") ||
                  product.slug.includes("blush-colors") ||
                  product.slug.includes("new-look") ||
                  product.slug.includes("cosmic")
                }
                isBioColors={product.slug.includes("bio-colors")}
              />
            ) : (
              /* Single image product - still clickable with lightbox */
              <ImageGallery
                mainImage={getCurrentImage()}
                additionalImages={[]}
                alt={product.title}
                isCollectionProduct={
                  product.slug.includes("pop-wave") ||
                  product.slug.includes("neo-nudes") ||
                  product.slug.includes("terra-topia") ||
                  product.slug.includes("yummy") ||
                  product.slug.includes("whisper") ||
                  product.slug.includes("timeless") ||
                  product.slug.includes("color-block") ||
                  product.slug.includes("digital-art") ||
                  product.slug.includes("bio-colors") ||
                  product.slug.includes("tandem") ||
                  product.slug.includes("delight") ||
                  product.slug.includes("sofuture") ||
                  product.slug.includes("prismatic") ||
                  product.slug.includes("color-vibe") ||
                  product.slug.includes("iconic") ||
                  product.slug.includes("bubble-gum") ||
                  product.slug.includes("cyber-chic") ||
                  product.slug.includes("blush-colors") ||
                  product.slug.includes("new-look") ||
                  product.slug.includes("cosmic")
                }
              />
            )}

              {/* ===== HORIZONTAL TABS (like reference site) - DESKTOP ONLY ===== */}
              <div className="hidden lg:block mt-12">
                {/* Tab Navigation */}
                <div className="flex gap-8 border-b border-gray-200">
                  <button
                    onClick={() => {
                      window.dispatchEvent(new Event("productTabClick"));
                      setActiveProductTab("details");
                    }}
                    className={`pb-4 font-['Archivo'] text-lg transition-colors relative ${
                      activeProductTab === "details"
                        ? "text-[#1a7eb8] font-medium"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Product details
                    {activeProductTab === "details" && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1a7eb8]" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      window.dispatchEvent(new Event("productTabClick"));
                      setActiveProductTab("ingredients");
                    }}
                    className={`pb-4 font-['Archivo'] text-lg transition-colors relative ${
                      activeProductTab === "ingredients"
                        ? "text-[#1a7eb8] font-medium"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Ingredients
                    {activeProductTab === "ingredients" && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1a7eb8]" />
                    )}
                  </button>
                </div>

                {/* Tab Content */}
                <div className="pt-8 pb-12">
                  {/* Product Details Tab */}
                  {activeProductTab === "details" && (
                    <div className="space-y-8">
                      {/* Description */}
                      {product.description && (
                        <div>
                          <p className="product-page-accordion-text whitespace-pre-line leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      )}

                      {/* How to Use */}
                      {product.how_to_use && (
                        <div>
                          <h3 className="font-['Archivo'] text-xl font-medium text-gray-900 mb-4">
                            How to Use
                          </h3>
                          <p className="product-page-accordion-text whitespace-pre-line leading-relaxed">
                            {product.how_to_use}
                          </p>
                        </div>
                      )}

                      {/* YouTube Tutorial Video - Below How to Use */}
                      {product.youtube_video && (
                        <div className="mt-8">
                          <h3 className="font-['Archivo'] text-xl font-medium text-gray-900 mb-4">
                            Tutorial Video
                          </h3>
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                            <iframe
                              src={product.youtube_video}
                              title="Product Tutorial Video"
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}

                      {/* Safety Directions */}
                      {product.safety_directions && (
                        <div>
                          <h3 className="font-['Archivo'] text-xl font-medium text-gray-900 mb-4">
                            Safety Directions
                          </h3>
                          <p className="product-page-accordion-text whitespace-pre-line leading-relaxed">
                            {product.safety_directions}
                          </p>
                          {product.first_aid && (
                            <div className="mt-4">
                              <h4 className="font-['Archivo'] font-medium text-gray-800 mb-2">
                                First Aid
                              </h4>
                              <p className="product-page-accordion-text whitespace-pre-line">
                                {product.first_aid}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ingredients Tab */}
                  {activeProductTab === "ingredients" && (
                    <div className="space-y-8">
                      {/* Key Ingredients */}
                      {product.key_ingredients && (
                        <div>
                          <h3 className="font-['Archivo'] text-xl font-medium text-gray-900 mb-4">
                            Key Ingredients
                          </h3>
                          <p className="product-page-accordion-text whitespace-pre-line leading-relaxed">
                            {product.key_ingredients}
                          </p>
                        </div>
                      )}

                      {/* Full Ingredients List */}
                      {product.ingredients && (
                        <div>
                          <h3 className="font-['Archivo'] text-xl font-medium text-gray-900 mb-4">
                            Full Ingredients
                          </h3>
                          <p className="product-page-accordion-text whitespace-pre-line leading-relaxed">
                            {product.ingredients}
                          </p>
                        </div>
                      )}

                      {/* Fallback if no ingredient data */}
                      {!product.key_ingredients && !product.ingredients && (
                        <p className="product-page-accordion-text text-gray-500 italic">
                          See packaging for full ingredients list.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* ===== END LEFT COLUMN ===== */}

            {/* ===== RIGHT COLUMN: Product Info (sticky) ===== */}
            <div 
              className="lg:pl-6 pr-4 lg:pr-8"
              style={{
                position: 'sticky',
                top: isHeaderHidden ? '1rem' : '7.5rem',
                alignSelf: 'flex-start',
                transition: 'top 0.15s ease-out',
              }}
            >
              {/* Store Reviews Link - Top */}
              {product.store_reviews &&
                typeof product.store_reviews === "string" &&
                !isNaN(parseInt(product.store_reviews)) &&
                parseInt(product.store_reviews) > 0 && (
                  <a
                    href="#reviews"
                    className="font-['Archivo'] text-sm text-[#9e1b32] underline hover:no-underline mb-4 inline-block"
                  >
                    {parseInt(product.store_reviews).toLocaleString()} Store
                    Reviews
                  </a>
                )}

              {/* Title - Title case, black, not bold */}
              <h1 className={`product-page-title ${shades.length > 0 ? 'mb-1' : 'mb-2'}`}>
                {formatTitle(product.title)}
              </h1>

              {/* Size - Uses CSS variable */}
              {volumeLabel ? (
                <p className={`product-page-volume ${shades.length > 0 ? 'mb-3' : 'mb-6'}`}>{volumeLabel}</p>
              ) : null}

              {/* Description - Truncated for shade products, full for others */}
              {mainDescription && (
                shades.length > 0 ? (
                  <div className="product-page-description mb-3 max-w-[53ch]">
                    <p className="mb-0 line-clamp-3">
                      {mainDescription.replace(/\n/g, ' ')}
                    </p>
                  </div>
                ) : (
                  <div className="product-page-description mb-8 max-w-[53ch]">
                    {mainDescription
                      .split("\n")
                      .filter((p) => p.trim())
                      .map((paragraph, idx) => (
                        <p key={idx} className="mb-0">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                )
              )}

              {/* Key Features - Compact for shade products, full for others */}
              {shades.length > 0 ? (
                /* Compact inline style for shade products */
                product.slug === "mavala-stop" ? (
                  <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center text-sm text-[#333]">
                      <span className="w-[3px] h-[12px] mr-1.5 bg-black rounded-full" />
                      Bitter nail polish
                    </span>
                    <span className="flex items-center text-sm text-[#333]">
                      <span className="w-[3px] h-[12px] mr-1.5 bg-black rounded-full" />
                      Dermatologically tested
                    </span>
                  </div>
                ) : (
                  <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center text-sm text-[#333]">
                      <span className="w-[3px] h-[12px] mr-1.5 bg-black rounded-full" />
                      Vegan formula
                    </span>
                    <span className="flex items-center text-sm text-[#333]">
                      <span className="w-[3px] h-[12px] mr-1.5 bg-black rounded-full" />
                      Long-lasting shine
                    </span>
                  </div>
                )
              ) : (
                /* Full vertical style for non-shade products */
                product.slug === "mavala-stop" ? (
                  <div className="mb-8 space-y-4">
                    <div className="flex items-start">
                      <span className="w-[5px] h-[18px] flex-shrink-0 mt-1 mr-2 bg-black rounded-full" />
                      <span className="product-page-feature">
                        Bitter nail polish for beautiful nails
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-[5px] h-[18px] flex-shrink-0 mt-1 mr-2 bg-black rounded-full" />
                      <span className="product-page-feature">
                        Dermatologically tested
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 space-y-4">
                    <div className="flex items-start">
                      <span className="w-[5px] h-[18px] flex-shrink-0 mt-1 mr-2 bg-black rounded-full" />
                      <span className="product-page-feature">Vegan formula</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-[5px] h-[18px] flex-shrink-0 mt-1 mr-2 bg-black rounded-full" />
                      <span className="product-page-feature">
                        Long-lasting hold and shine
                      </span>
                    </div>
                  </div>
                )
              )}

              {/* Horizontal Divider */}
              <hr className={`border-t border-gray-200 ${shades.length > 0 ? 'mb-4' : 'mb-6'}`} />

              {/* Shade Selection - Only for shade products (compact layout) */}
              {shades.length > 0 && (
                <div className="mb-4">
                  {/* MAIN COLOR Selector */}
                  {availableMainColors.length >= 1 && (
                    <div className="mb-5">
                      <h3 className="font-['Archivo'] text-[13px] font-semibold text-[#333] uppercase tracking-wider mb-3">
                        Main Color
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {availableMainColors.map((color) => {
                          const colorMap: Record<string, string> = {
                            Nude: "bg-[#f5cdb6]",
                            Pink: "bg-pink-400",
                            Purple: "bg-purple-500",
                            Gray: "bg-gray-500",
                            Grey: "bg-gray-500",
                            Brown: "bg-amber-800",
                            Gold: "bg-yellow-400",
                            Golden: "bg-yellow-400",
                            Silver: "bg-gray-300",
                            White: "bg-white border border-gray-300",
                            Blue: "bg-blue-500",
                            Yellow: "bg-yellow-300",
                            Black: "bg-black",
                            Orange: "bg-orange-500",
                            Red: "bg-red-600",
                            Transparent:
                              "bg-transparent border border-gray-300",
                            Green: "bg-green-600",
                            Special:
                              "bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400",
                          };
                          return (
                            <button
                              key={color.name}
                              type="button"
                              onClick={() =>
                                setSelectedMainColor(
                                  selectedMainColor === color.name
                                    ? null
                                    : color.name
                                )
                              }
                              className={`px-3 py-1.5 text-xs font-['Archivo'] transition-all ${
                                selectedMainColor === color.name
                                  ? "border-2 border-black text-black bg-white"
                                  : "border border-gray-300 text-gray-700 hover:border-gray-500"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                    colorMap[color.name] || "bg-gray-400"
                                  }`}
                                ></span>
                                <span>{color.name}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Horizontal Divider */}
                  <hr className="border-t border-gray-200 mb-5" />

                  {/* FAVORITE SHADES - Compact colored circles with numbers */}
                  <div className="mb-3">
                    <h3 className="font-['Archivo'] text-[13px] font-semibold text-[#333] uppercase tracking-wider mb-3">
                      Favorite Shades
                    </h3>
                    <div className="flex flex-wrap gap-2.5 mb-3">
                      {filteredShades.slice(0, 5).map((shade, idx) => {
                        const shadeColor = getShadeColor(shade.name);
                        const shadeNumber = shade.name.match(/^\d+/)?.[0] || "";
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedShade(shade.name)}
                            className="flex flex-col items-center group"
                            title={shade.name}
                          >
                            <div
                              className={`w-10 h-10 rounded-full transition-all mb-1 ${
                                selectedShade === shade.name
                                  ? "ring-2 ring-black ring-offset-2 scale-105"
                                  : "group-hover:ring-1 group-hover:ring-gray-400 group-hover:ring-offset-1"
                              }`}
                              style={{
                                backgroundColor: shadeColor || "#f5f5f5",
                              }}
                            />
                            <span className="text-[10px] font-['Archivo'] text-[#5c666f]">
                              {shadeNumber}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* See all shades button - opens drawer */}
                    {filteredShades.length > 0 && (
                      <button
                        onClick={() => setIsShadeDrawerOpen(true)}
                        className="inline-flex items-center gap-2 text-sm font-['Archivo'] hover:underline cursor-pointer"
                        style={{
                          color: "#8b7355",
                        }}
                      >
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #f5cdb6 0%, #e8a87c 25%, #c38d6d 50%, #8b5a3c 75%, #5c3d2e 100%)",
                          }}
                        />
                        <span>See all shades ({filteredShades.length})</span>
                      </button>
                    )}
                  </div>

                  {/* SELECTED SHADE DISPLAY - Inline compact */}
                  {selectedShade && (
                    <div className="mt-3 flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="font-['Archivo'] text-[10px] text-[#5c666f] uppercase">Selected:</span>
                      <div
                        className="w-5 h-5 rounded-full border border-black"
                        style={{
                          backgroundColor: getShadeColor(selectedShade) || "#f5f5f5",
                        }}
                      />
                      <span className="font-['Archivo'] text-sm font-medium text-[#333]">
                        {selectedShade}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity + Add to Cart - French Mavala Premium Style */}
              {shades.length > 0 ? (
                /* Compact: Same line for shade products */
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <label className="font-['Archivo'] text-xs text-[#5c666f]">
                      Qty:
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      min="1"
                      className="font-['Archivo'] border border-gray-300 rounded px-2 py-1.5 w-16 text-center text-sm focus:outline-none focus:border-[#272724]"
                    />
                  </div>
                  {/* Premium Add to Cart Button - French Mavala Style */}
                  <button className="flex-1 py-3.5 bg-[#272724] hover:bg-[#1f1f1c] rounded-md font-['Archivo'] transition-all duration-200 flex items-center justify-center gap-3">
                    <span className="text-white/90 font-extralight">•</span>
                    <span className="text-white font-extralight text-[15px] uppercase tracking-[0.2em]">ADD</span>
                    <span className="text-white/90 font-extralight">•</span>
                    <span className="text-white font-extralight text-[13px]">{displayPrice ? formatPriceToCad(displayPrice) : ''}</span>
                  </button>
                </div>
              ) : (
                /* Full: Separate sections for non-shade products */
                <>
                  <div className="mb-5">
                    <label className="block font-['Archivo'] text-sm text-[#5c666f] mb-2">
                      Quantity:
                    </label>
                    <div className="flex items-center border border-gray-300 rounded w-fit">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-lg hover:bg-gray-100 transition-colors"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center font-['Archivo']">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 text-lg hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Premium Add to Cart Button - French Mavala Style */}
                  <button className="w-full py-4 bg-[#272724] hover:bg-[#1f1f1c] rounded-md font-['Archivo'] transition-all duration-200 flex items-center justify-center gap-3 mb-6">
                    <span className="text-white/90 font-extralight">•</span>
                    <span className="text-white font-extralight text-[16px] uppercase tracking-[0.2em]">ADD</span>
                    <span className="text-white/90 font-extralight">•</span>
                    <span className="text-white font-extralight text-[14px]">{displayPrice ? formatPriceToCad(displayPrice) : ''}</span>
                  </button>
                </>
              )}

              {/* Share */}
              <button className={`font-['Archivo'] text-[#5c666f] hover:text-[#9e1b32] flex items-center gap-2 uppercase tracking-wider ${shades.length > 0 ? 'text-xs gap-1.5' : 'text-sm'}`}>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </button>
              {/* Accordions moved to left column for split-page sticky layout */}
            </div>
            {/* ===== END RIGHT COLUMN (sticky) ===== */}
          </div>
        </div>

        {/* ===== MOBILE ONLY: Horizontal Tabs (shown after product info on mobile) ===== */}
        <div className="lg:hidden px-4 mt-8">
          {/* Tab Navigation */}
          <div className="flex gap-8 border-b border-gray-200">
            <button
              onClick={() => {
                window.dispatchEvent(new Event("productTabClick"));
                setActiveProductTab("details");
              }}
              className={`pb-4 font-['Archivo'] text-lg transition-colors relative ${
                activeProductTab === "details"
                  ? "text-[#1a7eb8] font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Product details
              {activeProductTab === "details" && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1a7eb8]" />
              )}
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(new Event("productTabClick"));
                setActiveProductTab("ingredients");
              }}
              className={`pb-4 font-['Archivo'] text-lg transition-colors relative ${
                activeProductTab === "ingredients"
                  ? "text-[#1a7eb8] font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Ingredients
              {activeProductTab === "ingredients" && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1a7eb8]" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-8 pb-12">
            {/* Product Details Tab */}
            {activeProductTab === "details" && (
              <div className="space-y-8">
                {product.description && (
                  <div>
                    <p className="product-page-accordion-text whitespace-pre-line leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}
                {product.how_to_use && (
                  <div>
                    <h3 className="font-['Archivo'] text-xl font-medium text-gray-900 mb-4">
                      How to Use
                    </h3>
                    <p className="product-page-accordion-text whitespace-pre-line leading-relaxed">
                      {product.how_to_use}
                    </p>
                  </div>
                )}

                {/* YouTube Tutorial Video - Mobile Tabs */}
                {product.youtube_video && (
                  <div>
                    <h3 className="font-['Archivo'] text-xl font-medium text-gray-900 mb-4">
                      Tutorial Video
                    </h3>
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <iframe
                        src={product.youtube_video}
                        title="Product Tutorial Video"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {product.safety_directions && (
                  <div>
                    <h3 className="font-['Archivo'] text-xl font-medium text-gray-900 mb-4">
                      Safety Directions
                    </h3>
                    <p className="product-page-accordion-text whitespace-pre-line leading-relaxed">
                      {product.safety_directions}
                    </p>
                    {product.first_aid && (
                      <div className="mt-4">
                        <h4 className="font-['Archivo'] font-medium text-gray-800 mb-2">
                          First Aid
                        </h4>
                        <p className="product-page-accordion-text whitespace-pre-line">
                          {product.first_aid}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Ingredients Tab */}
            {activeProductTab === "ingredients" && (
              <div className="space-y-8">
                {product.key_ingredients && (
                  <div>
                    <h3 className="font-['Archivo'] text-xl font-medium text-gray-900 mb-4">
                      Key Ingredients
                    </h3>
                    <p className="product-page-accordion-text whitespace-pre-line leading-relaxed">
                      {product.key_ingredients}
                    </p>
                  </div>
                )}
                {product.ingredients && (
                  <div>
                    <h3 className="font-['Archivo'] text-xl font-medium text-gray-900 mb-4">
                      Full Ingredients
                    </h3>
                    <p className="product-page-accordion-text whitespace-pre-line leading-relaxed">
                      {product.ingredients}
                    </p>
                  </div>
                )}
                {!product.key_ingredients && !product.ingredients && (
                  <p className="product-page-accordion-text text-gray-500 italic">
                    See packaging for full ingredients list.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* NEW SHADES Section - For products with new collections like Oh La La! */}
        {newShades && newShades.shades && newShades.shades.length > 0 && (
          <div className="w-full border-t border-gray-200 mt-16 pt-16 pb-8">
            <h2 className="font-['Archivo'] text-[#ae1932] text-2xl font-bold uppercase tracking-wider text-center mb-4">
              NEW SHADES
            </h2>
            {newShades.collection_name && (
              <p className="font-['Archivo'] text-[15px] uppercase tracking-wider text-center mb-12 text-[#5c666f]">
                {newShades.collection_name}
              </p>
            )}
            <div className="max-w-[1400px] mx-auto px-8 md:px-16">
              <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16">
                {/* Collection Image on the left */}
                {newShades.collection_image && (
                  <div className="w-full md:w-1/2">
                    <img
                      src={newShades.collection_image}
                      alt={newShades.collection_name || "New Shades Collection"}
                      className="w-full h-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                )}
                {/* Shade swatches on the right */}
                <div className="w-full md:w-1/2">
                  <div className="grid grid-cols-3 gap-x-6 gap-y-8">
                    {newShades.shades.map((shade, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedShade(shade.name);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-center group cursor-pointer"
                      >
                        <div
                          className={`bg-[#f5f5f5] p-6 mb-4 overflow-hidden flex items-center justify-center h-[120px] md:h-[140px] transition-all ${
                            selectedShade === shade.name
                              ? "ring-4 ring-[#9e1b32]"
                              : "group-hover:ring-2 group-hover:ring-[#9e1b32]"
                          }`}
                        >
                          {getShadeImage(shade) && (
                            <img
                              src={getShadeImage(shade)}
                              alt={shade.name}
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <p
                          className={`font-['Archivo'] text-[12px] uppercase tracking-wider ${
                            selectedShade === shade.name
                              ? "text-[#9e1b32] font-semibold"
                              : "text-[#5c666f]"
                          }`}
                        >
                          {shade.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ALL SHADES Section - Removed, will be handled by "See all shades" button */}


        {/* Related Products - Full Width Section (outside max-w-7xl for wider design) */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-14 pb-20 border-t border-gray-200 border-b bg-white px-4 md:px-6 lg:px-8">
            <h2 className="font-['Archivo'] text-[22px] md:text-[26px] font-bold text-[#ae1932] uppercase tracking-[1px] text-center mb-10 md:mb-14">
              You Might Also Like
            </h2>
            {/* Wide grid: 2 cols mobile, 3 tablet, 5 desktop - smaller gaps, larger cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.slug}
                  product={p as unknown as ScrapedProduct}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Shade Drawer - Slide out panel */}
      <ShadeDrawer
        isOpen={isShadeDrawerOpen}
        onClose={() => setIsShadeDrawerOpen(false)}
        shades={shades}
        selectedShade={selectedShade}
        onSelectShade={(shadeName) => {
          setSelectedShade(shadeName);
          // Drawer stays open - user can continue browsing shades
        }}
        shadeColors={shadeColors}
        getShadeImage={getShadeImage}
        availableMainColors={availableMainColors}
        productTitle={product.title}
        colorMapping={colorMapping}
      />
    </div>
  );
}
