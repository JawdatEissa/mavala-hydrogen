import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useMemo, useState } from "react";
import {
  loadScrapedProducts,
  type ScrapedProduct,
} from "../lib/scraped-products.server";
import {
  CategoryHero,
  CategoryProductSection,
} from "../components/CategoryPageTemplate";

// Preview nail concerns - just 4 representative images for the teaser
const NAIL_CONCERN_PREVIEWS = [
  { name: "DRY NAIL?", image: "/nail-concerns/dry-nail.png" },
  { name: "DAMAGED, BRITTLE NAIL?", image: "/nail-concerns/damaged-nail.png" },
  { name: "LIGHTLY RIDGED NAIL?", image: "/nail-concerns/ridged-nail.png" },
  { name: "BITTEN NAIL?", image: "/nail-concerns/bitten-nail.png" },
];

// Product slugs for each category
const PENETRATING_CARE_SLUGS = [
  "mavala-scientifique-k",
  "mavala-scientifique",
  "nailactan",
  "mava-flex",
  "mavaderma",
];

const CUTICLE_CARE_SLUGS = [
  "mavapen",
  "lightening-scrub-mask",
  "cuticle-remover",
  "cuticle-cream",
  "cuticle-oil",
  "cuticle-care-kit",
];

const NAIL_CAMOUFLAGE_SLUGS = [
  "nail-shield",
  "ridge-filler",
  "mava-white",
  "mavala-stop",
  "mavala-stop-pen",
  "post-artificial-nails-kit",
];

const NAIL_BEAUTY_SLUGS = [
  "mava-strong",
  "mavala-002-protective-base-coat",
  "barrier-base-coat",
  "colorfix",
  "gel-finish-top-coat",
  "star-top-coat",
  "oil-seal-dryer",
  "mavadry",
  "mavadry-spray",
  "perfect-manicure-kit",
];

// Manicure Tools slugs (merged from accessories)
const MANICURE_INSTRUMENTS_SLUGS = [
  "mini-emery-boards",
  "emery-boards",
  "manicure-sticks",
  "nail-white-crayon",
  "hoofstick",
  "nail-buffer-kit",
  "manicure-bowl",
  "manicure-pill",
  "nail-brush",
  "french-manicure-stickers",
  "pedi-pads",
  "scissors",
  "straight-cuticle-scissors",
  "baby-nail-scissors",
  "cuticle-nippers",
  "nail-nippers",
  "toenail-nippers",
  "clippers",
  "professional-manicure-tray",
];

const NAIL_POLISH_REMOVERS_SLUGS = [
  "blue-nail-polish-remover",
  "pink-nail-polish-remover",
  "crystal-nail-polish-remover",
  "correcteur-pen",
  "nail-polish-remover-pads",
  "make-up-remover-cotton-pads",
  "thinner-for-nail-polish",
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const allProducts = loadScrapedProducts();

  // Helper to get products by slugs
  const getProductsBySlug = (slugs: string[]) => {
    return slugs
      .map((slug) => allProducts.find((p) => p.slug.includes(slug)))
      .filter(Boolean) as ScrapedProduct[];
  };

  const penetratingCare = getProductsBySlug(PENETRATING_CARE_SLUGS);
  const cuticleCare = getProductsBySlug(CUTICLE_CARE_SLUGS);
  const nailCamouflage = getProductsBySlug(NAIL_CAMOUFLAGE_SLUGS);
  const nailBeauty = getProductsBySlug(NAIL_BEAUTY_SLUGS);
  const manicureInstruments = getProductsBySlug(MANICURE_INSTRUMENTS_SLUGS);
  const nailPolishRemovers = getProductsBySlug(NAIL_POLISH_REMOVERS_SLUGS);

  return json({
    penetratingCare,
    cuticleCare,
    nailCamouflage,
    nailBeauty,
    manicureInstruments,
    nailPolishRemovers,
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Swiss Quality Nail Care | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Discover Mavala's premium nail care products for damaged nails. Penetrating treatments, cuticle care, nail camouflage, and beauty products.",
    },
  ];
};

export default function NailCarePage() {
  const {
    penetratingCare,
    cuticleCare,
    nailCamouflage,
    nailBeauty,
    manicureInstruments,
    nailPolishRemovers,
  } = useLoaderData<typeof loader>();

  const categories = useMemo(() => {
    const items = [
      {
        id: "penetrating-care",
        label: "Penetrating Nail Care",
        mobileLabel: "CARE",
        title: "PENETRATING NAIL CARE",
        products: penetratingCare,
      },
      {
        id: "cuticle-care",
        label: "Cuticle Care",
        mobileLabel: "CUTICLE",
        title: "CUTICLE CARE",
        products: cuticleCare,
      },
      {
        id: "nail-camouflage",
        label: "Nail Camouflage",
        mobileLabel: "CAMOFLAUGE",
        title: "NAIL CAMOUFLAGE",
        products: nailCamouflage,
      },
      {
        id: "nail-beauty",
        label: "Nail Beauty",
        mobileLabel: "BEAUTY",
        title: "NAIL BEAUTY",
        products: nailBeauty,
      },
      {
        id: "manicure-instruments",
        label: "Manicure Instruments",
        mobileLabel: "MANICURE",
        title: "MANICURE INSTRUMENTS",
        products: manicureInstruments,
      },
      {
        id: "nail-polish-removers",
        label: "Nail Polish Removers",
        mobileLabel: "REMOVER",
        title: "NAIL POLISH REMOVERS",
        products: nailPolishRemovers,
      },
    ];

    return items;
  }, [
    penetratingCare,
    cuticleCare,
    nailCamouflage,
    nailBeauty,
    manicureInstruments,
    nailPolishRemovers,
  ]);

  const topRowTabs = categories.slice(0, 3);
  const bottomRowTabs = categories.slice(3);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.id ?? "penetrating-care"
  );

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Hero Section */}
      <CategoryHero
        imageSrc="/nail-care-hero.jpg"
        alt="Swiss Quality Nail Care for damaged nails"
        heightClassName="h-[22vh] md:h-[36vh]"
        objectPosition="50% 49%"
      />

      {/* Nail Quiz + Filtering Bar (quiz first, filter bar below) */}
      <section className="pt-5 pb-6 md:pt-7 md:pb-7 px-4 md:px-8 bg-gradient-to-b from-white to-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          {/* Nail Concern Survey Section */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-6 md:px-8 md:py-9">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="font-['Archivo'] text-[20px] md:text-[26px] font-bold text-[#ae1932] uppercase tracking-[1px] mb-3">
                WHAT IS YOUR NAIL CONCERN?
              </h2>
              <p className="font-['Archivo'] text-[15px] md:text-[15px] text-gray-600 mb-5 md:mb-7 leading-relaxed">
                Let us help you choose the products adapted to your nails.
              </p>

              <Link
                to="/nail-diagnosis"
                className="group block mb-6"
                aria-label="Take the nail quiz"
              >
                {/* Mobile: show only first row (2 items) */}
                <div className="sm:hidden grid grid-cols-2 gap-x-8 gap-y-6 justify-items-center max-w-[280px] mx-auto">
                  {NAIL_CONCERN_PREVIEWS.slice(0, 2).map((concern, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-[86px] h-[74px] overflow-hidden flex items-start justify-center">
                        <img
                          src={concern.image}
                          alt={concern.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                      <p className="mt-2 font-['Archivo'] text-[10px] font-semibold uppercase tracking-widest text-gray-900 leading-[1.15] text-center max-w-[7.5rem] line-clamp-2 min-h-[24px]">
                        {concern.name}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tablet/Desktop: keep all 4 items exactly as before */}
                <div className="hidden sm:grid grid-cols-4 gap-5 justify-items-center mx-auto">
                  {NAIL_CONCERN_PREVIEWS.map((concern, idx) => (
                    <div key={idx} className="flex items-center justify-center">
                      <div className="w-[92px] h-[130px] md:w-[110px] md:h-[160px] flex items-center justify-center">
                        <img
                          src={concern.image}
                          alt={concern.name}
                          className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Link>

              <Link
                to="/nail-diagnosis"
                className="inline-block px-8 md:px-10 py-3 border border-[#ae1932] bg-transparent text-[#ae1932] font-['Archivo'] text-[12px] md:text-[13px] font-semibold uppercase tracking-wider hover:bg-[#ae1932] hover:text-white transition-colors duration-200"
              >
                TAKE THE NAIL QUIZ →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filtering Bar (same sizing/values as /color) */}
      <section className="pt-4 pb-2 md:pt-6 md:pb-3 px-4 md:px-8 bg-white">
        <div className="max-w-5xl md:max-w-[80rem] mx-auto flex justify-center">
          {/* Mobile: 2-row pill-style layout (same as /color) */}
          <div className="md:hidden flex flex-col gap-2 w-full max-w-md">
            <div className="flex items-center justify-center gap-2">
              {topRowTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategoryId(tab.id)}
                  className={`
                    flex-1 min-w-0 px-3 py-3 rounded-full font-['Archivo'] text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap text-center
                    ${
                      activeCategoryId === tab.id
                        ? "bg-[#ae1932] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                    }
                  `}
                >
                  <span className="block truncate">{tab.mobileLabel ?? tab.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2">
              {bottomRowTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategoryId(tab.id)}
                  className={`
                    flex-1 min-w-0 px-3 py-3 rounded-full font-['Archivo'] text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap text-center
                    ${
                      activeCategoryId === tab.id
                        ? "bg-[#ae1932] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                    }
                  `}
                >
                  <span className="block truncate">{tab.mobileLabel ?? tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Single row (same as /color) */}
          <div className="hidden md:flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl p-[10.5px] shadow-sm w-fit max-w-full">
            {categories.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryId(tab.id)}
                className={`
                  px-6 py-[14.7px] rounded-xl font-['Archivo'] text-[14px] font-medium uppercase tracking-wide transition-colors duration-150 whitespace-nowrap
                  ${
                    activeCategoryId === tab.id
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
      {activeCategory && (
        <CategoryProductSection
          title={activeCategory.title}
          products={activeCategory.products}
        />
      )}
    </div>
  );
}
