import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  loadScrapedProducts,
  type ScrapedProduct,
} from "../lib/scraped-products";
import {
  CategoryHero,
  CategoryProductSection,
} from "../components/CategoryPageTemplate";

// Preview nail concerns - just 4 representative images for the teaser
const NAIL_CONCERN_PREVIEWS = [
  { name: "DRY NAIL?", image: "/nail-concerns/dry-nail.png" },
  { name: "DAMAGED NAIL?", image: "/nail-concerns/damaged-nail.png" },
  { name: "RIDGED NAIL?", image: "/nail-concerns/ridged-nail.png" },
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
  const { penetratingCare, cuticleCare, nailCamouflage, nailBeauty, manicureInstruments, nailPolishRemovers } =
    useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Hero Section */}
      <CategoryHero
        imageSrc="/nail-care-hero.jpg"
        alt="Swiss Quality Nail Care for damaged nails"
        height="90vh"
        objectPosition="50% 49%"
      />

      {/* Nail Concern Survey Section - Simplified Preview */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h2 className="font-['Archivo'] text-[22px] md:text-[28px] font-bold text-[#ae1932] uppercase tracking-[1px] mb-4">
            WHAT IS YOUR NAIL CONCERN?
          </h2>

          {/* Subtitle */}
          <p className="font-['Archivo'] text-[14px] md:text-[16px] text-gray-600 mb-10 md:mb-12">
            Let us help you choose the products adapted to your nails.
          </p>

          {/* Preview Grid - 4 images in a row, no labels */}
          <a 
            href="/nail-diagnosis"
            className="flex justify-center items-start gap-6 md:gap-10 mb-10 md:mb-12 group cursor-pointer"
          >
            {NAIL_CONCERN_PREVIEWS.map((concern, idx) => (
              <div
                key={idx}
                className="flex-shrink-0"
              >
                <div className="w-[70px] h-[105px] md:w-[100px] md:h-[150px] lg:w-[120px] lg:h-[180px] flex items-center justify-center">
                  <img
                    src={concern.image}
                    alt={concern.name}
                    className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </div>
            ))}
          </a>

          {/* CTA Button */}
          <a
            href="/nail-diagnosis"
            className="inline-block px-8 md:px-10 py-3 border border-[#ae1932] bg-transparent text-[#ae1932] font-['Archivo'] text-[12px] md:text-[13px] font-semibold uppercase tracking-wider hover:bg-[#ae1932] hover:text-white transition-colors duration-200"
          >
            TAKE THE NAIL QUIZ →
          </a>
        </div>
      </section>

      {/* PENETRATING NAIL CARE Section */}
      <CategoryProductSection
        title="PENETRATING NAIL CARE"
        products={penetratingCare}
        id="penetrating-care"
      />

      {/* CUTICLE CARE Section */}
      <CategoryProductSection
        title="CUTICLE CARE"
        products={cuticleCare}
        id="cuticle-care"
      />

      {/* NAIL CAMOUFLAGE Section */}
      <CategoryProductSection
        title="NAIL CAMOUFLAGE"
        products={nailCamouflage}
        id="nail-camouflage"
      />

      {/* NAIL BEAUTY Section */}
      <CategoryProductSection
        title="NAIL BEAUTY"
        products={nailBeauty}
        id="nail-beauty"
      />

      {/* MANICURE INSTRUMENTS Section (merged from Accessories) */}
      <CategoryProductSection
        title="MANICURE INSTRUMENTS"
        products={manicureInstruments}
        id="manicure-instruments"
      />

      {/* NAIL POLISH REMOVERS Section (merged from Accessories) */}
      <CategoryProductSection
        title="NAIL POLISH REMOVERS"
        products={nailPolishRemovers}
        id="nail-polish-removers"
      />
    </div>
  );
}
