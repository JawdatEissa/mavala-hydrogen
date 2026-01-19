import type { ScrapedProduct } from "../lib/scraped-products.server";
import { ProductCard } from "./ProductCard";

// Product Card Component for Category Pages - Standardized 4-column layout
export function CategoryProductCard({ product }: { product: ScrapedProduct }) {
  return <ProductCard product={product} />;
}

// Section Header Component
export function CategorySectionHeader({ 
  title, 
  subtitle 
}: { 
  title: string; 
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <h2 className="font-['Archivo'] text-[22px] md:text-[26px] font-bold text-[#ae1932] uppercase tracking-[1px] mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="font-['Archivo'] text-[14px] md:text-[15px] text-gray-600 uppercase tracking-wide">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Hero Section Component - Reusable for all category pages
export function CategoryHero({
  imageSrc,
  alt,
  height = "95vh",
  heightClassName,
  objectPosition = "50% 20%",
}: {
  imageSrc: string;
  alt: string;
  height?: string;
  heightClassName?: string;
  objectPosition?: string;
}) {
  return (
    <section
      className={`relative w-full overflow-hidden ${heightClassName ?? ""}`}
      style={heightClassName ? undefined : { height }}
    >
      <img
        src={imageSrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition }}
      />
    </section>
  );
}

// Product Section Component - Reusable grid for product categories (4-column full-width layout)
export function CategoryProductSection({
  title,
  subtitle,
  products,
  id,
  hideHeader = false,
}: {
  title: string;
  subtitle?: string;
  products: ScrapedProduct[];
  id?: string;
  hideHeader?: boolean;
}) {
  return (
    <section
      id={id}
      className="pt-6 pb-12 md:pt-8 md:pb-16 px-6 md:px-10 lg:px-16 bg-white scroll-mt-[120px]"
    >
      <div className="w-full">
        {!hideHeader ? (
          <CategorySectionHeader title={title} subtitle={subtitle} />
        ) : null}
        {/* 4-column grid on desktop, 2 on mobile - full width */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product) => (
            <CategoryProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Intro Section with Title and Description (optional)
export function CategoryIntro({
  title,
  description,
  buttons,
}: {
  title: string;
  description?: string;
  buttons?: Array<{ label: string; href: string }>;
}) {
  return (
    <section className="py-12 md:py-20 px-4 md:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="font-['Archivo'] text-[28px] md:text-[36px] font-semibold text-[#ae1932] uppercase tracking-wide mb-6">
          {title}
        </h1>

        {description && (
          <p className="font-['Archivo'] text-[15px] md:text-[16px] text-gray-700 leading-relaxed mb-10 max-w-3xl mx-auto">
            {description}
          </p>
        )}

        {buttons && buttons.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            {buttons.map((button, idx) => (
              <a
                key={idx}
                href={button.href}
                className="inline-block px-8 py-3 border-2 border-[#ae1932] bg-transparent text-[#ae1932] font-['Archivo'] text-[13px] font-medium uppercase tracking-wider hover:bg-[#ae1932] hover:text-white transition-colors duration-150"
              >
                {button.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
