import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Hero Section - Uses skincare hero for Face & Lips category */}
      <CategoryHero
        imageSrc="/skincare-hero.jpg"
        alt="Swiss skincare and lip beauty for radiant, healthy skin"
        height="90vh"
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

      {/* Product Sections */}
      {sections.map((section, idx) => (
        <CategoryProductSection
          key={idx}
          title={section.title}
          subtitle={section.subtitle}
          products={section.products}
        />
      ))}

      {/* Bottom Spacing */}
      <div className="pb-16"></div>
    </div>
  );
}

