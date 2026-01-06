import { Link, useSearchParams } from "@remix-run/react";
import { CATEGORIES } from "../lib/scraped-products";

export function CategoryNav() {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";

  return (
    <nav className="w-full bg-white py-8">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <ul className="category-nav-links flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            const href =
              category === "All"
                ? "/collections/all"
                : `/collections/all?category=${encodeURIComponent(category)}`;

            return (
              <li key={category}>
                <Link
                  to={href}
                  className={`font-['Archivo'] text-[13px] uppercase tracking-[0.5px] transition-colors ${
                    isActive
                      ? "text-[#a71830] font-medium"
                      : "text-[#a71830] hover:text-[#7a1020]"
                  }`}
                >
                  {category}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
