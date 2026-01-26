import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { HeroVideo } from "../components/HeroVideo";
import { BestsellerCard } from "../components/BestsellerCard";
import { useState, useEffect, useRef } from "react";

export const meta: MetaFunction = () => {
  return [
    {
      title:
        "Mavala | Dedicated to care & beauty | Natural treatment cosmetics",
    },
    {
      name: "description",
      content:
        "Shop MAVALA Switzerland's high performing care and beauty products.",
    },
  ];
};

export default function Homepage() {
  // Best Sellers scroll tracking
  const [currentSlide, setCurrentSlide] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bestSellers = [
    {
      to: "/products/mavala-stop",
      imageSrc: "/bestseller-stop.png",
      imageAlt: "Mavala Stop",
      name: "Mavala Stop",
      category: "Nail care",
      priceCompare: "€23.00",
      priceCurrent: "€21.00",
      meta: "10ml",
      // Some packshots read visually smaller; boost ~15% inside the grey box
      imageClassName:
        "!max-w-full !max-h-full !scale-[1.15] group-hover:!scale-[1.265]",
    },
    {
      to: "/products/mavala-scientifique-k",
      imageSrc: "/bestseller-k-plus.png",
      imageAlt: "Scientifique K+",
      name: "Scientifique K+ Nail Hardener",
      category: "Nail care",
      priceCompare: "€23.00",
      priceCurrent: "€21.00",
      meta: "5ml",
    },
    {
      to: "/products/nailactan-1",
      imageSrc: "/bestseller-nailactan.png",
      imageAlt: "Nailactan",
      name: "Nailactan Nutritive Nail Cream",
      category: "Nail care",
      priceCompare: "€19.50",
      priceCurrent: "€17.90",
      meta: "15ml",
      // Some packshots read visually smaller; boost ~15% inside the grey box
      imageClassName:
        "!max-w-full !max-h-full !scale-[1.15] group-hover:!scale-[1.265]",
    },
    {
      to: "/products/double-lash",
      imageSrc: "/bestseller-double-lash.png",
      imageAlt: "Double Lash",
      name: "Double Lash Eyelash Serum",
      category: "Eye care",
      priceCompare: "€23.00",
      priceCurrent: "€21.00",
      meta: "10ml",
      imageClassName: "scale-[1.7] -translate-y-12 group-hover:scale-[1.87]",
    },
    {
      to: "/products/nail-white-crayon",
      imageSrc: "/bestseller-nail-white-crayon.png",
      imageAlt: "Nail White Crayon",
      name: "Nail White Crayon",
      category: "Makeup",
      priceCompare: "€14.20",
      priceCurrent: "€12.10",
      meta: "1.6g",
    },
    {
      to: "/products/double-brow",
      imageSrc: "/images/double-brow/01_Double-Brow.png",
      imageAlt: "Double Brow",
      name: "Double-Brow Serum",
      category: "Eye care",
      priceCompare: "€23.00",
      priceCurrent: "€21.00",
      meta: "4.5ml",
    },
  ];

  const totalProducts = bestSellers.length;

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const itemWidth = container.scrollWidth / totalProducts;
      const index = Math.round(scrollLeft / itemWidth);
      setCurrentSlide(index);

      // Gate arrow visibility based on actual scroll position.
      // Use a small epsilon to avoid flicker due to fractional pixels.
      const epsilon = 2;
      setCanScrollLeft(scrollLeft > epsilon);
      setCanScrollRight(
        scrollLeft + container.clientWidth < container.scrollWidth - epsilon
      );
    };

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    // Initialize state after layout.
    requestAnimationFrame(handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [totalProducts]);

  const blogPosts = [
    {
      title: "The Power Of Pink Campaign… let’s join forces",
      date: "OCT 21, 2025",
      image: "/blog-power-of-pink.jpg",
      to: "/blog/power-of-pink",
    },
    {
      title: "Breaking Up with Synthetic Nails!",
      date: "OCT 3, 2025",
      image: "/blog-breaking-up-with-synthetics.jpg",
      to: "/blog/breaking-up-with-synthetics",
    },
    {
      title: "The Art of Polka Dot Nails",
      date: "SEP 25, 2025",
      image: "/blog-polka-dots.jpg",
      to: "/blog/polka-dot-nails",
    },
    {
      title: "New season nail trends",
      date: "AUG 19, 2025",
      image: "/blog-nail-trends.jpg",
      to: "/blog/new-season-nail-trends",
    },
    {
      title: "Old-school beauty rules",
      date: "AUG 7, 2025",
      image: "/blog-beauty-myths.jpg",
      to: "/blog/old-school-beauty-rules",
    },
    {
      title: "More than a manicure, it’s a moment for me",
      date: "JUL 3, 2025",
      image: "/blog-manicure-for-me.jpg",
      to: "/blog/more-than-a-manicure",
    },
  ];

  return (
    <div className="pt-[90px]">
      {/* Hero Video Section */}
      <HeroVideo />

      {/* Mission Statement - Visible below hero on all screens */}
      <section className="mt-8 md:mt-0 py-10 md:py-20 text-center bg-white px-6">
        <div className="mx-auto max-w-4xl">
          {/* Main Tagline - Archivo font matching reference */}
          <h2 className="font-['Archivo'] text-[30px] md:text-[34px] font-semibold text-[rgb(174,25,50)] uppercase text-center tracking-[2px] leading-[36px] md:leading-[40px]">
            YOUR CARE. YOUR STYLE. SINCE 1959.
          </h2>

          {/* Mission Text - Archivo font matching reference */}
          <p className="font-['Archivo'] text-[#1C1C1C] text-[17px] md:text-[19px] font-normal tracking-[0.2px] leading-[24px] md:leading-[27px] text-center mt-[24px] mb-0 mx-[20px]">
            Our Mission: We continually contribute to the fulfilment of both
            beauty and wellbeing by crafting exceptional Swiss products.
          </p>

          {/* NEW PRODUCTS Text Label */}
          <p className="block font-['Archivo'] text-[17px] md:text-[19px] font-semibold uppercase tracking-[1px] leading-[21px] md:leading-[23px] text-[rgb(92,102,111)] text-center mt-[24px] mb-0">
            NEW PRODUCTS
          </p>
        </div>
      </section>

      {/* Promotional Banners - Mavadry & Double-Brow */}
      <section className="mt-4 md:-mt-12 pb-8 md:pb-12 bg-white">
        <div className="mx-auto px-4 md:px-8 lg:px-12 max-w-[1800px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* Mavadry Banner (replaces Pop Wave) */}
            <div className="flex flex-col items-center">
              <div
                className="w-full relative overflow-hidden bg-[#F7B5C6]"
                style={{ aspectRatio: "1080/720" }}
              >
                {/* Text boxes */}
                <div className="absolute left-[50%] md:left-[52%] lg:left-[52%] xl:left-[54%] 2xl:left-[54%] top-[51%] z-10">
                  <p className="font-['Archivo'] text-[#8B1E2B] font-semibold tracking-[0.2px] text-[20px] md:text-[17px] lg:text-[22px] xl:text-[30px] 2xl:text-[40px] leading-[24px] md:leading-[21px] lg:leading-[26px] xl:leading-[34px] 2xl:leading-[44px]">
                    <span className="block whitespace-nowrap">
                      <span className="font-extrabold">Dry</span>{" "}
                      <span className="font-normal">your polish in</span>
                    </span>
                    <span className="block font-extrabold whitespace-nowrap mt-[2px] lg:mt-[4px]">
                      seconds
                    </span>
                  </p>
                </div>

                <div className="absolute left-[50%] md:left-[52%] lg:left-[52%] xl:left-[54%] 2xl:left-[54%] top-[72%] md:top-[68%] lg:top-[71%] z-10">
                  <p className="font-['Archivo'] text-[#8B1E2B] tracking-[0.2px] text-[20px] md:text-[17px] lg:text-[22px] xl:text-[30px] 2xl:text-[40px] leading-[24px] md:leading-[21px] lg:leading-[26px] xl:leading-[34px] 2xl:leading-[44px]">
                    <span className="block font-extrabold whitespace-nowrap">Professional</span>
                    
                    <span className="block font-normal whitespace-nowrap mt-[2px] lg:mt-[4px]">
                      Results
                    </span>
                  </p>
                </div>

                {/* Spray image */}
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                  <img
                    src="/mavadry-promotional.png"
                    alt="MAVADRY Spray"
                    className="h-[100%] w-auto object-contain transform-gpu scale-[1.2] md:scale-[1.2] translate-y-[5%] -translate-x-[45%] md:-translate-x-[29%]"
                  />
                </div>
                {/* Badge overlay (simple to adjust: top/right for position; w-* for size) */}
                <img
                  src="/mavadry-badge.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute top-0 right-0 h-[39%] w-auto object-contain transform-gpu scale-[1.1] -translate-x-[130%] translate-y-[21%] pointer-events-none select-none"
                />
              </div>
              <Link
                to="/products/mavadry-spray"
                className="inline-block mt-6 px-[32px] py-[16px] border-2 border-[#ae1932] bg-transparent text-[#ae1932] font-['Archivo'] text-[14px] font-light uppercase tracking-[1.01px] hover:bg-[#ae1932] hover:text-white transition-colors duration-100 ease-linear"
              >
                VIEW MAVADRY SPRAY
              </Link>
            </div>

            {/* Double-Brow Banner */}
            <div className="flex flex-col items-center">
              <div
                className="w-full relative"
                style={{ aspectRatio: "1080/720" }}
              >
                <img
                  src="/Double-Brow_Card_Banner.png"
                  alt="Double-Brow Eyebrow Serum"
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
              <Link
                to="/products/double-brow"
                className="inline-block mt-6 px-[32px] py-[16px] border-2 border-[#ae1932] bg-transparent text-[#ae1932] font-['Archivo'] text-[14px] font-light uppercase tracking-[1.01px] hover:bg-[#ae1932] hover:text-white transition-colors duration-100 ease-linear"
              >
                VIEW DOUBLE-BROW
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="w-full">
          {/* Section Header */}
          <h2 className="font-['Archivo'] text-[15px] font-semibold uppercase tracking-[1px] leading-[18.2px] text-[rgb(92,102,111)] text-center mb-10 md:mb-14">
            BEST SELLERS
          </h2>

          {/* Products Scroll Container - Horizontal scroll on all screens */}
          <div className="relative group/nav rounded-2xl overflow-hidden">
            {/* Left edge fade - Mobile only */}
            <div className="md:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

            {/* Right edge fade - Mobile only */}
            <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            {/* Left Scroll Button - Desktop only - appears on section hover */}
            <button
              onClick={(e) => {
                e.preventDefault();
                const container = scrollContainerRef.current;
                if (container) {
                  container.scrollBy({ left: -300, behavior: "smooth" });
                }
              }}
              className={`hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-black shadow-xl text-white transition-all hover:scale-110 ${
                canScrollLeft
                  ? "opacity-0 -translate-x-2 group-hover/nav:opacity-100 group-hover/nav:translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none"
              }`}
              aria-hidden={!canScrollLeft}
              tabIndex={canScrollLeft ? 0 : -1}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Right Scroll Button - Desktop only - appears on section hover */}
            <button
              onClick={(e) => {
                e.preventDefault();
                const container = scrollContainerRef.current;
                if (container) {
                  container.scrollBy({ left: 300, behavior: "smooth" });
                }
              }}
              className={`hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-black shadow-xl text-white opacity-0 group-hover/nav:opacity-100 transition-all hover:scale-110 ${
                canScrollRight ? "" : "pointer-events-none"
              }`}
              aria-hidden={!canScrollRight}
              tabIndex={canScrollRight ? 0 : -1}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide scroll-container snap-x snap-mandatory scroll-smooth"
            >
              <div
                // Match desired gallery layout:
                // - Larger left inset before the first card
                // - Smaller gaps between cards
                className="flex gap-1.5 md:gap-2 pl-10 pr-4 md:pl-16 md:pr-6"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {bestSellers.map((p) => (
                  <BestsellerCard
                    key={p.to}
                    to={p.to}
                    imageSrc={p.imageSrc}
                    imageAlt={p.imageAlt}
                    name={p.name}
                    category={p.category}
                    priceCompare={p.priceCompare}
                    priceCurrent={p.priceCurrent}
                    meta={p.meta}
                    imageClassName={p.imageClassName}
                  />
                ))}
              </div>
            </div>

            {/* Dot Indicators - Mobile only */}
            <div className="flex md:hidden justify-center items-center gap-2 mt-6">
              {Array.from({ length: totalProducts }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const container = scrollContainerRef.current;
                    if (container) {
                      const itemWidth = container.scrollWidth / totalProducts;
                      container.scrollTo({
                        left: itemWidth * idx,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentSlide
                      ? "w-8 h-2 bg-[#ae1932]"
                      : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to product ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section - Consolidated to 6 categories */}
      <section className="py-12 md:py-16 bg-white">
        <div className="w-full">
          {/* Section Header */}
          <h2 className="font-['Archivo'] text-[25px] font-semibold text-[rgb(174,25,50)] uppercase text-center tracking-[2px] leading-[30px] mb-10 md:mb-14 px-4">
            SHOP BY CATEGORY
          </h2>

          {/* Categories Grid - 3 columns x 2 rows (6 categories) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[7px]">
            {/* Row 1 */}
            <a
              href="/nail-care"
              className="relative aspect-square overflow-hidden group"
            >
              <img
                src="/shop-nail-care.png"
                alt="Nail Care"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </a>

            <a
              href="/color"
              className="relative aspect-square overflow-hidden group"
            >
              <img
                src="/shop-nail-polish.png"
                alt="Nail Polish"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </a>

            <a
              href="/eye-beauty"
              className="relative aspect-square overflow-hidden group"
            >
              <img
                src="/shop-eye-beauty.png"
                alt="Eye Beauty"
                className="w-full h-full object-cover origin-center scale-[1.05] -translate-y-2 md:scale-[1.12] md:-translate-y-8 transition-transform duration-500 group-hover:scale-110 md:group-hover:scale-[1.18]"
              />
            </a>

            {/* Row 2 */}
            <a
              href="/face-lips"
              className="relative aspect-square overflow-hidden group"
            >
              <img
                src="/shop-face-lips.png"
                alt="Face & Lips"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </a>

            <a
              href="/hand-care"
              className="relative aspect-square overflow-hidden group"
            >
              <img
                src="/shop-hand-care.png"
                alt="Hand Care"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </a>

            <a
              href="/foot-care"
              className="relative aspect-square overflow-hidden group"
            >
              <img
                src="/shop-foot-care.png"
                alt="Foot Care"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Our Latest Blog Posts */}
      <section className="py-14 md:py-16 bg-white">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <h2 className="font-['Archivo'] text-[21px] md:text-[24px] font-semibold uppercase tracking-[1px] leading-tight text-[#ae1932] text-center mb-10 md:mb-14">
            OUR LATEST BLOG POSTS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {blogPosts.map((post) => (
              <Link
                key={post.to}
                to={post.to}
                className="group flex flex-col gap-4"
              >
                <div className="w-full overflow-hidden">
                  <div className="aspect-[4/3] w-full">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-['Archivo'] text-[15px] font-semibold text-[#1c1c1c] leading-snug">
                    {post.title}
                  </p>
                  <p className="font-['Archivo'] text-[13px] font-normal tracking-[0.5px] text-[#6b6b6b] uppercase">
                    {post.date}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-12 md:mt-16">
            <Link
              to="/blog"
              className="inline-block px-8 py-3 border-2 border-[#ae1932] bg-transparent text-[#ae1932] font-['Archivo'] text-xs font-normal uppercase tracking-widest hover:bg-[#ae1932] hover:text-white transition-colors duration-150"
            >
              VISIT THE BLOG
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
