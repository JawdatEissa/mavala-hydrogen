import { Link } from "@remix-run/react";

// Specific categories from the homepage - using local images
const featuredCategories = [
  {
    name: "Nail and Cuticle Care",
    slug: "nail-care",
    image: "/category-nail-care.png",
  },
  {
    name: "Skin, Eye & Lip Care",
    slug: "skincare",
    image: "/category-skincare.png",
  },
  {
    name: "Nail Make-Up",
    slug: "nail-polish",
    image: "/category-nail-polish.png",
  },
];

export function CategoryGrid() {
  return (
    <section className="py-10 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* 3 Column Featured Grid - Stack on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {featuredCategories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>

        {/* Carousel Control - Hidden on mobile */}
        <div className="hidden md:flex justify-end mt-8">
          <button className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
}: {
  category: { name: string; slug: string; image: string };
}) {
  return (
    <Link to={`/collections/${category.slug}`} className="group block">
      <div className="aspect-[4/3] overflow-hidden mb-3 md:mb-6">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <h3 className="text-base md:text-lg font-normal text-gray-800 group-hover:text-[#E31837] transition-colors text-center md:text-left">
        {category.name}
      </h3>
    </Link>
  );
}
