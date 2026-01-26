import type { MetaFunction } from "@remix-run/node";

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

// All nail concerns - 18 unique conditions with correct slugs
const NAIL_CONDITIONS = [
  // Top row (11 items)
  {
    name: "HEALTHY NAIL?",
    image: "/diagnosis/healthy-nail.png",
    slug: "healthy-nail",
  },
  { name: "DRY NAIL?", image: "/diagnosis/dry-nail.png", slug: "dry-nail" },
  { name: "SOFT NAIL?", image: "/diagnosis/soft-nail.png", slug: "soft-nail" },
  { name: "THIN NAIL?", image: "/diagnosis/thin-nail.png", slug: "thin-nail" },
  {
    name: "DAMAGED, BRITTLE NAIL?",
    image: "/diagnosis/damaged-brittle-nail.png",
    slug: "damaged-brittle-nail",
  },
  {
    name: "LIGHTLY RIDGED NAIL?",
    image: "/diagnosis/lightly-ridged-nail.png",
    slug: "lightly-ridged-nail",
  },
  {
    name: "SPLITTING, BREAKING NAIL?",
    image: "/diagnosis/splitting-breaking-nail.png",
    slug: "splitting-breaking-nail",
  },
  {
    name: "BITTEN NAIL?",
    image: "/diagnosis/bitten-nail.png",
    slug: "bitten-nail",
  },
  {
    name: "SLOW GROWING NAIL?",
    image: "/diagnosis/slow-growing-nail.png",
    slug: "slow-growing-nail",
  },
  {
    name: "LIGHTLY STAINED OR YELLOW NAIL?",
    image: "/diagnosis/lightly-stained-or-yellow-nail.png",
    slug: "lightly-stained-or-yellow-nail",
  },
  {
    name: "YELLOW, STAINED, DULL NAIL?",
    image: "/diagnosis/yellow-stained-dull-nail.png",
    slug: "yellow-stained-dull-nail",
  },

  // Bottom row (7 items)
  {
    name: "OVERGROWN CUTICLES?",
    image: "/diagnosis/overgrown-cuticles.png",
    slug: "overgrown-cuticles",
  },
  {
    name: "THICK, INFLEXIBLE NAIL?",
    image: "/diagnosis/thick-inflexible-nail.png",
    slug: "thick-inflexible-nail",
  },
  {
    name: "NAIL WITH LONGITUDINAL GROOVES?",
    image: "/diagnosis/nail-with-longitudinal-grooves.png",
    slug: "nail-with-longitudinal-grooves",
  },
  {
    name: "NAIL WITH TRANSVERSAL GROOVES?",
    image: "/diagnosis/nail-with-transversal-grooves.png",
    slug: "nail-with-transversal-grooves",
  },
  {
    name: "NAIL WITH SPOTTED EROSION?",
    image: "/diagnosis/nail-with-spotted-erosion.png",
    slug: "nail-with-spotted-erosion",
  },
  {
    name: "WHITE OR WHITE SPOTTED NAIL?",
    image: "/diagnosis/white-or-white-spotted-nail.png",
    slug: "white-or-white-spotted-nail",
  },
  {
    name: "BLACK OR BROWN NAIL?",
    image: "/diagnosis/black-or-brown-nail.png",
    slug: "black-or-brown-nail",
  },
  {
    name: "NAIL FUNGUS?",
    image: "/diagnosis/nail-fungus.png",
    slug: "nail-fungus",
  },
];

export default function NailDiagnosisPage() {
  return (
    <div className="min-h-screen bg-white pt-[90px] font-sans font-extralight">
      {/* Main Content */}
      <section className="py-8 md:py-16 px-2 sm:px-4 md:px-6 lg:px-6 xl:px-4">
        <div className="max-w-[1600px] mx-auto">
          {/* Title */}
          <h1 className="font-['Archivo'] text-[46px] md:text-[42px] font-medium text-[#ae1932] uppercase text-center tracking-[1px] mb-8 md:mb-12">
            NAIL CONCERNS
          </h1>

          {/* Nail Conditions Grid - Full width, large images */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-x-1 gap-y-6 sm:gap-x-2 md:gap-x-3 md:gap-y-8">
            {NAIL_CONDITIONS.map((condition, idx) => (
              <a
                key={idx}
                href={`/nail-concern/${condition.slug}`}
                className="flex flex-col items-center justify-start text-center cursor-pointer hover:opacity-80 transition-opacity duration-200 group w-full"
              >
                <div className="w-full aspect-[2/3] flex items-center justify-center overflow-hidden">
                  <img
                    src={condition.image}
                    alt={condition.name}
                    className="w-full h-full object-contain object-center scale-[1.3] sm:scale-[1.4] md:scale-[1.5] lg:scale-[1.6] transition-transform duration-200 group-hover:scale-[1.35] sm:group-hover:scale-[1.45] md:group-hover:scale-[1.55] lg:group-hover:scale-[1.65]"
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
