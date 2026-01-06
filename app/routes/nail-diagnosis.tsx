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

// All nail concerns - exactly 19 unique conditions with correct slugs
const NAIL_CONDITIONS = [
  // Top row (12 items)
  {
    name: "HEALTHY NAIL?",
    image: "/diagnosis/healthy-nail.png",
    slug: "healthy-nail",
  },
  { name: "DRY NAIL?", image: "/diagnosis/dry-nail.png", slug: "dry-nail" },
  {
    name: "DELICATE, FRAGILE NAIL?",
    image: "/diagnosis/delicate-fragile-nail.png",
    slug: "delicate-fragile-nail",
  },
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
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Breadcrumb */}
      <div className="py-6 px-4 md:px-8 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto">
          <p className="font-['Archivo'] text-[11px] md:text-[12px] uppercase text-[#ae1932] tracking-wider">
            <a href="/" className="hover:underline">
              MAVACADEMY
            </a>
            {" > "}
            <a href="/tips-advice" className="hover:underline">
              BEAUTY ADVICE
            </a>
            {" > "}
            <span className="text-gray-600">NAIL CONCERNS</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 md:py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <h1 className="font-['Archivo'] text-[28px] md:text-[36px] font-bold text-[#ae1932] uppercase text-center tracking-[1px] mb-8 md:mb-12">
            NAIL CONCERNS
          </h1>

          {/* Nail Conditions Grid - Optimized for mobile centering */}
          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-x-6 gap-y-6 md:gap-x-5 md:gap-y-8 xl:gap-6 max-w-fit justify-items-center">
              {NAIL_CONDITIONS.map((condition, idx) => (
                <a
                  key={idx}
                  href={`/nail-concern/${condition.slug}`}
                  className="flex flex-col items-center justify-start text-center cursor-pointer hover:opacity-80 transition-opacity duration-200 group w-[85px] sm:w-[90px] md:w-[90px] xl:w-[100px]"
                >
                  <div className="w-full aspect-[2/3] flex items-center justify-center mb-2">
                    <img
                      src={condition.image}
                      alt={condition.name}
                      className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <p className="font-['Archivo'] text-[9px] sm:text-[10px] md:text-[10px] uppercase text-gray-800 leading-tight font-semibold">
                    {condition.name}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
