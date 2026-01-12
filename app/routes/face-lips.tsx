import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useMemo, useState } from "react";
import {
  CategoryHero,
  CategoryProductSection,
} from "../components/CategoryPageTemplate";
import { loadScrapedProducts } from "../lib/scraped-products.server";
import faceLipsData from "../data/face-lips-page.json";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const allProducts = loadScrapedProducts();

  // Map the face & lips data with actual product data from scraped products
  const sections = faceLipsData.sections.map((section) => ({
    title: section.title,
    subtitle: (section as any).subtitle,
    products: section.products.map((product) => {
      // Find matching product in scraped data
      const scrapedProduct = allProducts.find((p) => p.slug === product.slug);

      if (scrapedProduct) {
        // Use the full scraped product so cards can show category + price consistently.
        // Allow page JSON to override marketing name/description if provided.
        return {
          ...scrapedProduct,
          title: product.name || scrapedProduct.title,
          tagline: product.description || scrapedProduct.tagline,
        };
      }

      // Fallback: minimal shape (won't have categories, but avoids crashing)
      return {
        url: `/products/${product.slug}`,
        slug: product.slug,
        title: product.name,
        price: product.price || "",
        price_from: "",
        tagline: product.description,
        images: [],
        categories: [],
      };
    }),
  }));

  return json({
    sections,
    pageData: faceLipsData,
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Face & Lips | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Swiss skincare and lip beauty products. Moisturizing lip balms, lipsticks, anti-aging serums, foundations, and complete skincare routines.",
    },
  ];
};

// Skin concerns for the survey section
const SKIN_CONCERNS = [
  { id: "wrinkles", label: "WRINKLES?", image: "/skin-concerns/wrinkles.png" },
  {
    id: "lack-of-radiance",
    label: "LACK OF RADIANCE?",
    image: "/skin-concerns/lack-of-radiance.png",
  },
  {
    id: "uneven-complexion",
    label: "UNEVEN COMPLEXION?",
    image: "/skin-concerns/uneven-complexion.png",
  },
  {
    id: "dehydrated-skin",
    label: "DEHYDRATED SKIN?",
    image: "/skin-concerns/dehydrated-skin.png",
  },
  { id: "dry-skin", label: "DRY SKIN?", image: "/skin-concerns/dry-skin.png" },
  {
    id: "tired-dull-skin",
    label: "TIRED, DULL SKIN?",
    image: "/skin-concerns/tired-dull-skin.png",
  },
  {
    id: "clogged-skin",
    label: "CLOGGED SKIN?",
    image: "/skin-concerns/clogged-skin.png",
  },
  {
    id: "dilated-pores",
    label: "DILATED PORES?",
    image: "/skin-concerns/dilated-pores.png",
  },
];

// Preview (mobile-friendly) - 4 representative concerns, consistent with Nail Care page teaser
const SKIN_CONCERN_PREVIEWS = [
  SKIN_CONCERNS[0], // wrinkles
  SKIN_CONCERNS[2], // uneven complexion
  SKIN_CONCERNS[3], // dehydrated skin
  SKIN_CONCERNS[7], // dilated pores
];

export default function FaceLipsPage() {
  const { sections } = useLoaderData<typeof loader>();

  // Normalize sections into the desired categories (including combining Lip Care + Lip Beauty)
  const normalizedSections = useMemo(() => {
    const byTitle = new Map(sections.map((s) => [s.title, s]));

    const lipsBeauty = byTitle.get("LIP BEAUTY");
    const lipsCare = byTitle.get("LIP CARE");

    const lipsProducts = [
      ...(lipsBeauty?.products ?? []),
      ...(lipsCare?.products ?? []),
    ];

    const ordered = [
      {
        id: "lips",
        label: "LIPS",
        title: "LIPS",
        subtitle: undefined as string | undefined,
        products: lipsProducts,
      },
      {
        id: "complexion",
        label: "Complexion",
        title: "COMPLEXION",
        subtitle: byTitle.get("COMPLEXION")?.subtitle,
        products: byTitle.get("COMPLEXION")?.products ?? [],
      },
      {
        id: "wrinkles",
        label: "Wrinkles",
        title: "WRINKLES",
        subtitle: byTitle.get("ANTI-AGE PRO")?.subtitle,
        products: byTitle.get("ANTI-AGE PRO")?.products ?? [],
      },
      {
        id: "anti-age-nutrition",
        label: "Anti Age",
        title: "ANTI AGE NUTRITION",
        subtitle: byTitle.get("NUTRI-ELIXIR")?.subtitle,
        products: byTitle.get("NUTRI-ELIXIR")?.products ?? [],
      },
      {
        id: "hydration",
        label: "Hydration",
        title: "HYDRATION",
        subtitle: byTitle.get("AQUA-PLUS")?.subtitle,
        products: byTitle.get("AQUA-PLUS")?.products ?? [],
      },
      {
        id: "skin-vitality",
        label: "Vitality",
        title: "SKIN VITALITY",
        subtitle: byTitle.get("SKIN VITALITY")?.subtitle,
        products: byTitle.get("SKIN VITALITY")?.products ?? [],
      },
      {
        id: "pores",
        label: "Pores",
        title: "PORES",
        subtitle: byTitle.get("PORE DETOX")?.subtitle,
        products: byTitle.get("PORE DETOX")?.products ?? [],
      },
      {
        id: "clean-comfort",
        label: "Clean",
        title: "CLEAN & COMFORT",
        subtitle: byTitle.get("CLEAN & COMFORT")?.subtitle,
        products: byTitle.get("CLEAN & COMFORT")?.products ?? [],
      },
    ];

    // Remove empty sections (in case any source title is missing)
    return ordered.filter((s) => (s.products?.length ?? 0) > 0);
  }, [sections]);

  const [activeTabId, setActiveTabId] = useState<string>(
    normalizedSections[0]?.id ?? "lips"
  );

  const activeSection = normalizedSections.find((s) => s.id === activeTabId);

  // Mobile: split into 2 rows (like Color page), 4 + 4 by default
  const topRowTabs = normalizedSections.slice(0, 4);
  const bottomRowTabs = normalizedSections.slice(4);

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Hero Section - Uses skincare hero for Face & Lips category */}
      <CategoryHero
        imageSrc="/skincare-hero.jpg"
        alt="Swiss skincare and lip beauty for radiant, healthy skin"
        heightClassName="h-[22vh] md:h-[36vh]"
        objectPosition="50% 50%"
      />

      {/* Skin Concern Survey Section (mobile-first card) */}
      <section className="pt-5 pb-6 md:pt-10 md:pb-10 px-4 md:px-8 bg-gradient-to-b from-white to-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-6 md:px-8 md:py-9">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="font-['Archivo'] text-[20px] md:text-[26px] font-bold text-[#ae1932] uppercase tracking-[1px] mb-3">
                WHAT IS YOUR SKIN CONCERN?
              </h2>
              <p className="font-['Archivo'] text-[15px] md:text-[15px] text-gray-600 mb-5 md:mb-7 leading-relaxed">
                Let us help you choose a skincare routine adapted to your skin.
              </p>

              <a
                href="/face-concerns"
                className="group block mb-6"
                aria-label="Choose your routine"
              >
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4 sm:gap-5 justify-items-center max-w-[320px] sm:max-w-none mx-auto">
                  {SKIN_CONCERN_PREVIEWS.map((concern) => (
                    <div
                      key={concern.id}
                      className="flex items-center justify-center"
                    >
                      <div className="w-[120px] h-[140px] sm:w-[110px] sm:h-[130px] md:w-[140px] md:h-[160px] flex items-center justify-center">
                        <img
                          src={concern.image}
                          alt={concern.label}
                          className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </a>

              <div className="flex justify-center">
                <a
                  href="/face-concerns"
                  className="inline-block px-8 md:px-10 py-3 border border-[#ae1932] bg-transparent text-[#ae1932] font-['Archivo'] text-[12px] md:text-[13px] font-semibold uppercase tracking-wider hover:bg-[#ae1932] hover:text-white transition-colors duration-200"
                >
                  CHOOSE YOUR ROUTINE →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtering Bar (match Color page styling/values) */}
      <section className="pt-4 pb-2 md:pt-6 md:pb-3 px-4 md:px-8 bg-white">
        <div className="max-w-5xl md:max-w-[74.22rem] mx-auto flex justify-center">
          {/* Mobile: 2-row pill-style layout */}
          <div className="md:hidden flex flex-col gap-2 w-full max-w-md">
            <div className="flex items-center justify-center gap-2">
              {topRowTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={`
                    flex-1 min-w-0 px-3 py-3 rounded-full font-['Archivo'] text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap text-center
                    ${
                      activeTabId === tab.id
                        ? "bg-[#ae1932] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                    }
                  `}
                >
                  <span className="block truncate">{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2">
              {bottomRowTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={`
                    flex-1 min-w-0 px-3 py-3 rounded-full font-['Archivo'] text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap text-center
                    ${
                      activeTabId === tab.id
                        ? "bg-[#ae1932] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                    }
                  `}
                >
                  <span className="block truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Single row (same values as Color page) */}
          <div className="hidden md:flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl p-2.5 shadow-sm w-full">
            {normalizedSections.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`
                  px-6 py-3.5 rounded-xl font-['Archivo'] text-[14px] font-medium uppercase tracking-wide transition-colors duration-150 whitespace-nowrap
                  ${
                    activeTabId === tab.id
                      ? "bg-[#ae1932] text-white"
                      : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-[#ae1932]"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filtered Products (only the active category is shown) */}
      {activeSection && (
        <CategoryProductSection
          title={activeSection.title}
          subtitle={activeSection.subtitle}
          products={activeSection.products}
        />
      )}

      {/* Bottom Spacing */}
      <div className="pb-16"></div>
    </div>
  );
}
