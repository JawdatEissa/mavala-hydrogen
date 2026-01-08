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

      return {
        slug: product.slug,
        title: product.name,
        price: product.price,
        tagline: product.description,
        images: scrapedProduct?.images || [],
        url: `/products/${product.slug}`,
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
  { id: 'wrinkles', label: 'WRINKLES?', image: '/skin-concerns/wrinkles.png' },
  { id: 'lack-of-radiance', label: 'LACK OF RADIANCE?', image: '/skin-concerns/lack-of-radiance.png' },
  { id: 'uneven-complexion', label: 'UNEVEN COMPLEXION?', image: '/skin-concerns/uneven-complexion.png' },
  { id: 'dehydrated-skin', label: 'DEHYDRATED SKIN?', image: '/skin-concerns/dehydrated-skin.png' },
  { id: 'dry-skin', label: 'DRY SKIN?', image: '/skin-concerns/dry-skin.png' },
  { id: 'tired-dull-skin', label: 'TIRED, DULL SKIN?', image: '/skin-concerns/tired-dull-skin.png' },
  { id: 'clogged-skin', label: 'CLOGGED SKIN?', image: '/skin-concerns/clogged-skin.png' },
  { id: 'dilated-pores', label: 'DILATED PORES?', image: '/skin-concerns/dilated-pores.png' },
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
        label: "Lips",
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
        label: "Anti Age Nutrition",
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
        label: "Skin Vitality",
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
        label: "Clean & Comfort",
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

      {/* Skin Concern Survey Section */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <h2 className="font-['Archivo'] text-[18px] md:text-[24px] font-bold text-[#ae1932] uppercase tracking-[1px] text-center mb-6 md:mb-8">
            WHAT IS YOUR SKIN CONCERN?
          </h2>

          {/* Grid of Skin Concern Images */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-6 md:gap-x-8 md:gap-y-8 justify-items-center max-w-fit">
              {SKIN_CONCERNS.map((concern) => (
                <a
                  key={concern.id}
                  href="/face-concerns"
                  className="flex flex-col items-center group cursor-pointer w-[90px] sm:w-[110px] md:w-[140px]"
                >
                  <div className="w-full aspect-square mb-2">
                    <img
                      src={concern.image}
                      alt={concern.label}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <p className="font-['Archivo'] text-[12px] md:text-[14px] text-gray-600 text-center mb-5 md:mb-6 px-4">
            Let us help you choose a skincare routine adapted to your skin.
          </p>

          {/* Choose Products Button */}
          <div className="flex justify-center">
            <a
              href="/face-concerns"
              className="font-['Archivo'] text-[12px] md:text-[14px] font-semibold text-[#ae1932] uppercase tracking-[0.5px] px-6 md:px-8 py-2.5 md:py-3 border border-[#ae1932] hover:bg-[#ae1932] hover:text-white transition-colors duration-300"
            >
              Choose your routine →
            </a>
          </div>
        </div>
      </section>

      {/* Filtering Bar (match Color page styling/values) */}
      <section className="pt-0 pb-8 md:pb-10 px-4 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto flex justify-center">
          {/* Mobile: 2-row pill-style layout */}
          <div className="md:hidden flex flex-col gap-2 w-full max-w-md">
            <div className="flex items-center justify-center gap-2">
              {topRowTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={`
                    flex-1 px-4 py-3 rounded-full font-['Archivo'] text-[12px] font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap text-center
                    ${
                      activeTabId === tab.id
                        ? "bg-[#ae1932] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                    }
                  `}
                >
                  {tab.label}
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
                    flex-1 px-3 py-3 rounded-full font-['Archivo'] text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap text-center
                    ${
                      activeTabId === tab.id
                        ? "bg-[#ae1932] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Single row (same values as Color page) */}
          <div className="hidden md:flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl p-2.5 shadow-sm max-w-5xl">
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

