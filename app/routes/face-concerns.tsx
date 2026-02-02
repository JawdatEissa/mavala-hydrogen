import type { MetaFunction } from "@remix-run/node";
import { useState, useMemo } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Face Concerns | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Identify your face concerns and find the perfect skincare solution. Expert advice for wrinkles, radiance, complexion, and more.",
    },
  ];
};

// All 12 face concerns - restructured to avoid sparse categories
const FACE_CONCERNS = [
  {
    id: "wrinkles",
    label: "WRINKLES?",
    image: "/face-concerns/wrinkles.jpg",
    categories: ["ALL", "Aging & Dullness"],
  },
  {
    id: "lack-of-radiance",
    label: "LACK OF RADIANCE?",
    image: "/face-concerns/lack-of-radiance.jpg",
    categories: ["ALL", "Aging & Dullness"],
  },
  {
    id: "uneven-complexion",
    label: "UNEVEN COMPLEXION?",
    image: "/face-concerns/uneven-complexion.jpg",
    categories: ["ALL", "Complexion"],
  },
  {
    id: "dehydrated-skin",
    label: "DEHYDRATED SKIN?",
    image: "/face-concerns/dehydrated-skin.jpg",
    categories: ["ALL", "Skin Type"],
  },
  {
    id: "dry-skin",
    label: "DRY SKIN?",
    image: "/face-concerns/dry-skin.jpg",
    categories: ["ALL", "Skin Type"],
  },
  {
    id: "tired-dull-skin",
    label: "TIRED, DULL SKIN?",
    image: "/face-concerns/tired-dull-skin.jpg",
    categories: ["ALL", "Aging & Dullness"],
  },
  {
    id: "clogged-skin",
    label: "CLOGGED SKIN?",
    image: "/face-concerns/clogged-skin.jpg",
    categories: ["ALL", "Skin Type"],
  },
  {
    id: "dilated-pores",
    label: "DILATED PORES?",
    image: "/face-concerns/dilated-pores.jpg",
    categories: ["ALL", "Skin Type"],
  },
  {
    id: "clear-complexion",
    label: "CLEAR COMPLEXION?",
    image: "/face-concerns/clear-complexion.jpg",
    categories: ["ALL", "Complexion"],
  },
  {
    id: "dull-complexion",
    label: "DULL COMPLEXION?",
    image: "/face-concerns/dull-complexion.jpg",
    categories: ["ALL", "Complexion", "Aging & Dullness"],
  },
  {
    id: "blotchy-complexion",
    label: "BLOTCHY COMPLEXION?",
    image: "/face-concerns/blotchy-complexion.jpg",
    categories: ["ALL", "Complexion"],
  },
  {
    id: "complexion-with-irregularities",
    label: "COMPLEXION WITH IRREGULARITIES?",
    image: "/face-concerns/complexion-with-irregularities.jpg",
    categories: ["ALL", "Complexion"],
  },
];

export default function FaceConcernsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  // Filter concerns based on active category
  const filteredConcerns = useMemo(() => {
    return FACE_CONCERNS.filter((concern) =>
      concern.categories.includes(activeCategory)
    );
  }, [activeCategory]);

  // Navigation categories - restructured to avoid sparse categories
  // New structure: ALL (12), Skin Type (4), Aging & Dullness (4), Complexion (5)
  const categories = [
    { id: "ALL", label: "All" },
    { id: "Skin Type", label: "Skin Type" },
    { id: "Aging & Dullness", label: "Aging & Dullness" },
    { id: "Complexion", label: "Complexion" },
  ];

  // Split categories for mobile 2-row layout
  const topRowTabs = categories.slice(0, 2); // ALL, Skin Type
  const bottomRowTabs = categories.slice(2); // Aging & Dullness, Complexion

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Navigation Bar Section */}
      <section className="pt-4 pb-4 md:pt-6 md:pb-6 px-4 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto flex justify-center">
          {/* Mobile: 2-row pill-style layout (matching nail-diagnosis pattern) */}
          <div className="md:hidden flex flex-col gap-2 w-full max-w-md">
            {/* First row: ALL, Anti-Aging, Hydration */}
            <div className="flex items-center justify-center gap-2">
              {topRowTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`
                    flex-1 min-w-0 px-3 py-3 rounded-full font-['Archivo'] text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap text-center
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
            {/* Second row: Radiance, Pores, Complexion */}
            <div className="flex items-center justify-center gap-2">
              {bottomRowTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`
                    flex-1 min-w-0 px-3 py-3 rounded-full font-['Archivo'] text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap text-center
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

          {/* Desktop: Single row (matching nail-diagnosis pattern) */}
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

      {/* Main Title */}
      <div className="py-4 md:py-6 px-2 sm:px-4 md:px-8">
        <div className="max-w-[1800px] mx-auto text-center">
          <h1 className="font-['Archivo'] text-[46px] md:text-[42px] font-bold text-[#ae1932] uppercase tracking-[1px]">
            FACE CONCERNS
          </h1>
        </div>
      </div>

      {/* Face Concerns Grid - Full width on mobile */}
      <div className="py-6 md:py-12 px-2 sm:px-4 md:px-8 pb-12 md:pb-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6 sm:gap-x-6 md:gap-x-8 md:gap-y-10 justify-items-center">
            {filteredConcerns.map((concern) => (
              <a
                key={concern.id}
                href={`/face-concern/${concern.id}`}
                className="flex flex-col items-center group w-full max-w-[160px] sm:max-w-[130px] md:max-w-[140px]"
              >
                {/* Circular Image */}
                <div className="w-full aspect-square mb-3 md:mb-4 overflow-hidden rounded-full">
                  <img
                    src={concern.image}
                    alt={concern.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Label */}
                <p className="font-['Archivo'] text-[16px] sm:text-[13px] md:text-[14px] font-semibold uppercase text-center text-[#1a1a2e] leading-tight group-hover:text-[#ae1932] transition-colors">
                  {concern.label}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

