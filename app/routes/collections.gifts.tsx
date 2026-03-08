import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { CategoryProductSection } from "../components/CategoryPageTemplate";
import {
  loadScrapedProducts,
  getProductsByCategory,
} from "../lib/scraped-products.server";
import type { ScrapedProduct } from "../lib/scraped-products.server";

const GIFT_SUBCATEGORIES: {
  id: string;
  label: string;
  mobileLabel?: string;
  slugs: string[];
}[] = [
  {
    id: "all",
    label: "All Gift Sets",
    mobileLabel: "All",
    slugs: [],
  },
  {
    id: "valentines",
    label: "Valentine's",
    slugs: [
      "a-rose-by-any-other-name",
      "cube",
      "delightful",
      "mini-colors-collection-set",
      "mini-manicure-coffret",
    ],
  },
  {
    id: "for-him",
    label: "For Him",
    slugs: [
      "perfect-manicure",
      "cuticle-care",
      "french-manicure-kit",
      "gift-card",
    ],
  },
  {
    id: "mothers-day",
    label: "Mother's Day",
    mobileLabel: "Mother's",
    slugs: [
      "healthy-glow-kit",
      "multi-moisturizing-kit",
      "nutri-elixir-kit-e6dml",
      "lash-party",
      "a-rose-by-any-other-name",
      "extra-soft-foot-care",
    ],
  },
  {
    id: "all-year",
    label: "All Year",
    slugs: [
      "gift-card",
      "cube",
      "delightful",
      "french-manicure-kit",
      "mini-manicure-coffret",
      "mini-colors-collection-set",
      "perfect-manicure",
      "cuticle-care",
      "post-artificial-kit",
      "professional-manicure-tray",
      "extra-soft-foot-care",
    ],
  },
  {
    id: "christmas",
    label: "Christmas / End of Year",
    mobileLabel: "Christmas",
    slugs: [
      "magic-tree",
      "delightful",
      "mini-manicure-coffret",
      "mini-colors-collection-set",
      "cube",
      "healthy-glow-kit",
      "nutri-elixir-kit-e6dml",
    ],
  },
  {
    id: "pink-october",
    label: "Pink October",
    slugs: [
      "a-rose-by-any-other-name",
      "lash-party",
      "healthy-glow-kit",
      "multi-moisturizing-kit",
    ],
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const allProducts = loadScrapedProducts();
  const giftProducts = getProductsByCategory(allProducts, "Gift Sets");

  const subcategories = GIFT_SUBCATEGORIES.map((sub) => ({
    ...sub,
    products:
      sub.id === "all"
        ? giftProducts
        : (sub.slugs
            .map((slug) => giftProducts.find((p) => p.slug === slug))
            .filter(Boolean) as ScrapedProduct[]),
  }));

  return json({
    subcategories,
    totalCount: giftProducts.length,
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Gift Sets | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Discover Mavala Swiss beauty gift sets for every occasion. Valentine's, Mother's Day, Christmas, and all year round.",
    },
  ];
};

export default function GiftSetsPage() {
  const { subcategories, totalCount } = useLoaderData<typeof loader>();
  const [activeTabId, setActiveTabId] = useState("all");

  const activeSection = subcategories.find((s) => s.id === activeTabId);
  const topRowTabs = subcategories.slice(0, 4);
  const bottomRowTabs = subcategories.slice(4);

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Hero Section */}
      <div
        className="w-full h-[22vh] md:h-[36vh]"
        style={{
          backgroundImage: "url('/gift-sets-hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "50% 55%",
          backgroundRepeat: "no-repeat",
        }}
        role="img"
        aria-label="Mavala Swiss beauty gift sets for every occasion"
      />

      {/* Filter Bar */}
      <section className="pt-4 pb-0 md:pt-6 md:pb-0 px-4 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto flex justify-center">
          {/* Mobile: 2-row pill layout */}
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
                  <span className="block truncate">
                    {tab.mobileLabel ?? tab.label}
                  </span>
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
                  <span className="block truncate">
                    {tab.mobileLabel ?? tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Single row */}
          <div className="hidden md:flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl p-2.5 shadow-sm max-w-5xl">
            {subcategories.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`
                  px-5 py-3.5 rounded-xl font-['Archivo'] text-[13px] font-medium uppercase tracking-wide transition-colors duration-150 whitespace-nowrap
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

      {/* Filtered Products */}
      {activeSection && activeSection.products.length > 0 && (
        <CategoryProductSection
          title={activeSection.label}
          products={activeSection.products as ScrapedProduct[]}
          hideHeader
        />
      )}

      {activeSection && activeSection.products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 font-['Archivo']">
            No products found in this category yet.
          </p>
        </div>
      )}

      {/* Bottom Spacing */}
      <div className="pb-16"></div>
    </div>
  );
}
