import type { MetaFunction } from "@remix-run/node";
import { useState, useMemo } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Nail Concerns - Mavacademy | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Identify your nail concern and discover the best Mavala products for your needs.",
    },
  ];
};

// Categorized nail concerns with 6 balanced categories
// Each category represents a specific aspect of nail health
// Custom scale: 0.75 = reduce by 25%, 1 = normal (will be globally scaled up by 25%)
const NAIL_CONDITIONS = [
  {
    name: "HEALTHY NAIL?",
    image: "/diagnosis/healthy-nail.png",
    slug: "healthy-nail",
    categories: ["ALL"],
    scale: 1,
  },
  {
    name: "DRY NAIL?",
    image: "/diagnosis/dry-nail.png",
    slug: "dry-nail",
    categories: ["ALL", "Flexibility"],
    scale: 1,
  },
  {
    name: "SOFT NAIL?",
    image: "/diagnosis/soft-nail.png",
    slug: "soft-nail",
    categories: ["ALL", "Flexibility"],
    scale: 1,
  },
  {
    name: "THIN NAIL?",
    image: "/diagnosis/thin-nail.png",
    slug: "thin-nail",
    categories: ["ALL", "Strength", "Growth"],
    scale: 1.02, // Increased by 15%
  },
  {
    name: "DAMAGED, BRITTLE NAIL?",
    image: "/diagnosis/damaged-brittle-nail.png",
    slug: "damaged-brittle-nail",
    categories: ["ALL", "Strength", "Growth"],
    scale: 1,
  },
  {
    name: "LIGHTLY RIDGED NAIL?",
    image: "/diagnosis/lightly-ridged-nail.png",
    slug: "lightly-ridged-nail",
    categories: ["ALL", "Texture"],
    scale: 1,
  },
  {
    name: "SPLITTING, BREAKING NAIL?",
    image: "/diagnosis/splitting-breaking-nail.png",
    slug: "splitting-breaking-nail",
    categories: ["ALL", "Strength", "Cuticles"],
    scale: 1,
  },
  {
    name: "BITTEN NAIL?",
    image: "/diagnosis/bitten-nail.png",
    slug: "bitten-nail",
    categories: ["ALL", "Strength", "Cuticles"],
    scale: 1,
  },
  {
    name: "SLOW GROWING NAIL?",
    image: "/diagnosis/slow-growing-nail.png",
    slug: "slow-growing-nail",
    categories: ["ALL", "Growth"],
    scale: 1,
  },
  {
    name: "LIGHTLY STAINED OR YELLOW NAIL?",
    image: "/diagnosis/lightly-stained-or-yellow-nail.png",
    slug: "lightly-stained-or-yellow-nail",
    categories: ["ALL", "Colour"],
    scale: 1,
  },
  {
    name: "YELLOW, STAINED, DULL NAIL?",
    image: "/diagnosis/yellow-stained-dull-nail.png",
    slug: "yellow-stained-dull-nail",
    categories: ["ALL", "Colour"],
    scale: 0.75, // Reduced by 25%
  },
  {
    name: "OVERGROWN CUTICLES?",
    image: "/diagnosis/overgrown-cuticles.png",
    slug: "overgrown-cuticles",
    categories: ["ALL", "Cuticles"],
    scale: 1,
  },
  {
    name: "THICK, INFLEXIBLE NAIL?",
    image: "/diagnosis/thick-inflexible-nail.png",
    slug: "thick-inflexible-nail",
    categories: ["ALL", "Flexibility"],
    scale: 0.75, // Reduced by 25%
  },
  {
    name: "NAIL WITH LONGITUDINAL GROOVES?",
    image: "/diagnosis/nail-with-longitudinal-grooves.png",
    slug: "nail-with-longitudinal-grooves",
    categories: ["ALL", "Texture"],
    scale: 1,
  },
  {
    name: "NAIL WITH TRANSVERSAL GROOVES?",
    image: "/diagnosis/nail-with-transversal-grooves.png",
    slug: "nail-with-transversal-grooves",
    categories: ["ALL", "Texture"],
    scale: 1,
  },
  {
    name: "NAIL WITH SPOTTED EROSION?",
    image: "/diagnosis/nail-with-spotted-erosion.png",
    slug: "nail-with-spotted-erosion",
    categories: ["ALL", "Texture"],
    scale: 1,
  },
  {
    name: "WHITE OR WHITE SPOTTED NAIL?",
    image: "/diagnosis/white-or-white-spotted-nail.png",
    slug: "white-or-white-spotted-nail",
    categories: ["ALL", "Colour"],
    scale: 0.75, // Reduced by 25%
  },
  {
    name: "BLACK OR BROWN NAIL?",
    image: "/diagnosis/black-or-brown-nail.png",
    slug: "black-or-brown-nail",
    categories: ["ALL", "Colour"],
    scale: 0.75, // Reduced by 25%
  },
  {
    name: "NAIL FUNGUS?",
    image: "/diagnosis/nail-fungus.png",
    slug: "nail-fungus",
    categories: ["ALL", "Colour", "Texture"],
    scale: 1,
  },
];

export default function NailDiagnosisPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  // Filter conditions based on active category
  const filteredConditions = useMemo(() => {
    return NAIL_CONDITIONS.filter((condition) =>
      condition.categories.includes(activeCategory)
    );
  }, [activeCategory]);

  // Navigation categories - 6 balanced categories based on nail health aspects
  // Colour (4), Strength (4), Texture (4), Flexibility (3), Growth (3), Cuticles (3)
  const categories = [
    { id: "ALL", label: "All" },
    { id: "Colour", label: "Colour" },
    { id: "Strength", label: "Strength" },
    { id: "Texture", label: "Texture" },
    { id: "Flexibility", label: "Flexibility" },
    { id: "Growth", label: "Growth" },
    { id: "Cuticles", label: "Cuticles" },
  ];

  // Split categories for mobile 2-row layout (4 + 3)
  const topRowTabs = categories.slice(0, 4); // ALL, Colour, Strength, Texture
  const bottomRowTabs = categories.slice(4); // Flexibility, Growth, Cuticles

  return (
    <div className="min-h-screen bg-white pt-[90px] font-sans font-extralight">
      {/* Navigation Bar Section */}
      <section className="pt-4 pb-4 md:pt-6 md:pb-6 px-4 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto flex justify-center">
          {/* Mobile: 2-row pill-style layout */}
          <div className="md:hidden flex flex-col gap-2 w-full max-w-lg">
            {/* First row: ALL, Colour, Strength, Texture */}
            <div className="flex items-center justify-center gap-1.5">
              {topRowTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`
                    flex-1 min-w-0 px-2 py-2.5 rounded-full font-['Archivo'] text-[10px] font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap text-center
                    ${
                      activeCategory === tab.id
                        ? "bg-[#ae1932] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                    }
                  `}
                >
                  <span className="block truncate">{tab.label}</span>
                </button>
              ))}
            </div>
            {/* Second row: Flexibility, Growth, Cuticles */}
            <div className="flex items-center justify-center gap-1.5">
              {bottomRowTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`
                    flex-1 min-w-0 px-2 py-2.5 rounded-full font-['Archivo'] text-[10px] font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap text-center
                    ${
                      activeCategory === tab.id
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

          {/* Desktop: Single row (matching color.tsx pattern) */}
          <div className="hidden md:flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl p-[10.5px] shadow-sm w-fit max-w-full">
            {categories.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`
                  px-6 py-[14.7px] rounded-xl font-['Archivo'] text-[14px] font-medium uppercase tracking-wide transition-colors duration-150 whitespace-nowrap
                  ${
                    activeCategory === tab.id
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

      {/* Main Content */}
      <section className="py-4 md:py-8 px-2 sm:px-4 md:px-6 lg:px-6 xl:px-4">
        <div className="max-w-[1600px] mx-auto">
          {/* Title */}
          <h1 className="font-['Archivo'] text-[46px] md:text-[42px] font-medium text-[#ae1932] uppercase text-center tracking-[1px] mb-8 md:mb-12">
            NAIL CONCERNS
          </h1>

          {/* Nail Conditions Grid - Full width, large images */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-x-1 gap-y-6 sm:gap-x-2 md:gap-x-3 md:gap-y-8">
            {filteredConditions.map((condition, idx) => (
              <a
                key={idx}
                href={`/nail-concern/${condition.slug}`}
                className="flex flex-col items-center justify-start text-center cursor-pointer hover:opacity-80 transition-opacity duration-200 group w-full"
              >
                {/* Fixed height container (+25% global increase) with individual scaling */}
                <div
                  className="w-full h-[125px] sm:h-[150px] md:h-[175px] lg:h-[188px] flex items-end justify-center bg-white"
                  style={
                    { "--img-scale": condition.scale } as React.CSSProperties
                  }
                >
                  <img
                    src={condition.image}
                    alt={condition.name}
                    className="max-w-full max-h-full object-contain object-bottom transition-transform duration-200"
                    style={{
                      transform: `scale(var(--img-scale, 1))`,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = `scale(${
                        condition.scale * 1.05
                      })`)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = `scale(${condition.scale})`)
                    }
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="font-['Archivo'] text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] uppercase text-gray-800 leading-tight font-medium mt-3">
                  {condition.name}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
