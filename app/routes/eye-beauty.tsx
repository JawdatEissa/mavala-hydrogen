import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useMemo, useState } from "react";
import {
  CategoryHero,
  CategoryProductSection,
} from "../components/CategoryPageTemplate";
import { loadScrapedProducts } from "../lib/scraped-products.server";
import eyeBeautyData from "../data/eye-beauty-page.json";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const allProducts = loadScrapedProducts();

  // Map the eye beauty data with actual product data from scraped products
  const sections = eyeBeautyData.sections.map((section) => ({
    title: section.title,
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
    pageData: eyeBeautyData,
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Eye Beauty | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Ophthalmologically tested eye care and makeup for sensitive eyes. Eye contour, lashes, brows, eyelids, and eye care serums.",
    },
  ];
};

export default function EyeBeautyPage() {
  const { sections } = useLoaderData<typeof loader>();

  const normalizedSections = useMemo(() => {
    return sections.map((s) => {
      const id = (s.title || "section")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const label = s.title
        .toLowerCase()
        .split(/[\s-]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return {
        id,
        label,
        title: s.title,
        products: s.products,
      };
    });
  }, [sections]);

  const [activeTabId, setActiveTabId] = useState<string>(
    normalizedSections[0]?.id ?? "eye-care"
  );

  const activeSection = normalizedSections.find((s) => s.id === activeTabId);

  // Mobile: split into 2 rows (like Color page), 3 + 3 for Eye Beauty
  const topRowTabs = normalizedSections.slice(0, 3);
  const bottomRowTabs = normalizedSections.slice(3);

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Hero Section */}
      <CategoryHero
        imageSrc="/eye-beauty-hero.jpg"
        alt="Ophthalmologically tested eye care and makeup for sensitive eyes"
        heightClassName="h-[22vh] md:h-[36vh]"
        objectPosition="50% 50%"
      />

      {/* Filtering Bar (match /color styling/values) */}
      <section className="pt-4 pb-2 md:pt-6 md:pb-3 px-4 md:px-8 bg-white">
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
                    flex-1 min-w-0 px-4 py-3 rounded-full font-['Archivo'] text-[12px] font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap text-center
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

          {/* Desktop: Single row */}
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
          products={activeSection.products}
        />
      )}

      {/* Bottom Spacing */}
      <div className="pb-16"></div>
    </div>
  );
}
