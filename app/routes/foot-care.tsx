import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useMemo, useState } from "react";
import {
  CategoryHero,
  CategoryProductSection,
} from "../components/CategoryPageTemplate";
import { loadScrapedProducts } from "../lib/scraped-products.server";
import footCareData from "../data/foot-care-page.json";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const allProducts = loadScrapedProducts();

  // Map the foot care data with actual product data from scraped products
  const sections = footCareData.sections.map((section) => ({
    title: section.title,
    subtitle: section.subtitle,
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
    pageData: footCareData,
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Foot Care | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Comfort for feet as smooth as waterlily petals. Swiss foot care products for smooth, soft, and fresh feet.",
    },
  ];
};

export default function FootCarePage() {
  const { sections } = useLoaderData<typeof loader>();

  const normalizedSections = useMemo(() => {
    return sections.map((s) => {
      const id = (s.title || "section")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const label = (s.title || "Section")
        .toLowerCase()
        .split(/[\s-]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return { id, label, title: s.title, subtitle: s.subtitle, products: s.products };
    });
  }, [sections]);

  const [activeTabId, setActiveTabId] = useState<string>(
    normalizedSections[0]?.id ?? "comfort"
  );

  const activeSection = normalizedSections.find((s) => s.id === activeTabId);

  // Mobile: all 3 fit nicely in one row set; keep 2-row logic for parity
  const topRowTabs = normalizedSections.slice(0, 3);
  const bottomRowTabs = normalizedSections.slice(3);

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Hero Section */}
      <CategoryHero
        imageSrc="/foot-care-hero-new.png"
        alt="Foot Care - Comfort for feet"
        heightClassName="h-[22vh] md:h-[36vh]"
        objectPosition="50% 50%"
      />

      {/* Filtering Bar (match /color styling/values) */}
      <section className="pt-4 pb-2 md:pt-6 md:pb-3 px-4 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto flex justify-center">
          {/* Mobile: pill layout */}
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
            {bottomRowTabs.length > 0 && (
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
            )}
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
          subtitle={activeSection.subtitle}
          products={activeSection.products}
        />
      )}

      {/* Bottom Spacing */}
      <div className="pb-16"></div>
    </div>
  );
}

