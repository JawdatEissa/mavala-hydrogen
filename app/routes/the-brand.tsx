import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { useState, useRef, useEffect } from "react";
import brandData from "../data/brand-page.json";

export const meta: MetaFunction = () => {
  return [
    { title: "The Brand | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Discover MAVALA's heritage, mission, and commitment to excellence in Swiss beauty since 1959.",
    },
  ];
};

export const loader = async () => {
  return json({ brandData });
};

// Timeline Section Component with Carousel (Desktop) and Accordion (Mobile)
function TimelineSection({ timeline }: { timeline: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Calculate max slide to prevent scrolling past last item
  // Show ~2.5 cards at a time, so stop earlier
  const maxSlide = Math.max(0, timeline.length - 3);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="mb-12">
      {/* Desktop Carousel View - Edge to Edge */}
      <div className="hidden lg:block -mx-4 md:-mx-8 lg:-mx-12">
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] group">
          {/* Navigation Arrows - Visible on Hover */}
          <button
            onClick={prevSlide}
            className="absolute left-32 top-[280px] w-12 h-12 rounded-full bg-[#272724] text-white flex items-center justify-center hover:bg-black transition-all z-10 opacity-0 group-hover:opacity-100"
            aria-label="Previous"
          >
            <svg width="11" height="20" viewBox="0 0 11 20" fill="none">
              <path
                d="M10.617 0.924C10.888 1.195 10.888 1.635 10.617 1.906L1.802 10.279L10.617 19.535C10.888 19.807 10.888 20.246 10.617 20.518C10.346 20.789 9.906 20.789 9.635 20.518L0.566 11.449C0.164 11.047 0.164 10.395 0.566 9.993L9.635 0.924C9.906 0.653 10.346 0.653 10.617 0.924Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-32 top-[280px] w-12 h-12 rounded-full bg-[#272724] text-white flex items-center justify-center hover:bg-black transition-all z-10 opacity-0 group-hover:opacity-100"
            aria-label="Next"
          >
            <svg width="11" height="20" viewBox="0 0 11 20" fill="none">
              <path
                d="M0.383 0.924C0.112 1.195 0.112 1.635 0.383 1.906L9.198 10.279L0.383 19.535C0.112 19.807 0.112 20.246 0.383 20.518C0.654 20.789 1.094 20.789 1.365 20.518L10.434 11.449C10.836 11.047 10.836 10.395 10.434 9.993L1.365 0.924C1.094 0.653 0.654 0.653 0.383 0.924Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Carousel Container - 20% Larger */}
          <div className="overflow-hidden bg-white w-full" ref={carouselRef}>
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 744}px)` }}
            >
              {timeline.map((item, idx) => {
                const hasImage = item.image && item.image.startsWith("http");

                return (
                  <div
                    key={idx}
                    className={`flex-shrink-0 py-8 pl-4 ${
                      hasImage ? "w-[744px]" : "w-[480px]"
                    }`}
                  >
                    {/* Card - 20% Larger */}
                    <div className="flex gap-6">
                      {/* Image - 20% Larger */}
                      {hasImage && (
                        <div className="w-[360px] flex-shrink-0">
                          <div
                            className="relative w-full overflow-hidden"
                            style={{ aspectRatio: "3 / 4" }}
                          >
                            <img
                              src={item.image}
                              alt={item.event}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.parentElement!.style.background =
                                  "#f0f0f0";
                                target.style.display = "none";
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Text Content - 20% Larger */}
                      <div
                        className={`flex-1 pt-3 pr-4 ${
                          hasImage ? "max-w-[336px]" : "max-w-[456px]"
                        }`}
                      >
                        <span className="block text-[62px] leading-[1] font-light text-[#272724] mb-4">
                          {item.year}
                        </span>
                        <p className="text-[20px] font-semibold text-[#272724] mb-3 leading-snug">
                          {item.event}
                        </p>
                        <p className="text-[19px] font-light text-[#4a4a4a] leading-[1.55]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Accordion View */}
      <div className="lg:hidden">
        <div className="relative border-r-2 border-gray-200 pl-6">
          {timeline.map((item, idx) => (
            <TimelineAccordionItem key={idx} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Product Range Carousel Component
function ProductRangeCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const products = [
    {
      image: "/discover-nail-care.avif",
      label: "Nail Care",
      to: "/nail-care",
    },
    {
      image: "/discover-nail-polish.avif",
      label: "Nail Polish",
      to: "/color",
    },
    {
      image: "/discover-eye-beauty.avif",
      label: "Eye Beauty",
      to: "/eye-beauty",
    },
    {
      image: "/discover-face-lips.avif",
      label: "Face and Lips",
      to: "/face-lips",
    },
    {
      image: "/discover-hand-care.avif",
      label: "Hand Care",
      to: "/hand-care",
    },
    {
      image: "/discover-foot-care.avif",
      label: "Foot Care",
      to: "/foot-care",
    },
  ];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const epsilon = 2;
      setCanScrollLeft(scrollLeft > epsilon);
      setCanScrollRight(
        scrollLeft + container.clientWidth < container.scrollWidth - epsilon
      );
    };

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    // Initialize state after layout
    requestAnimationFrame(handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 md:py-16 border-t border-gray-200">
      {/* Title aligned with max-w-5xl container above */}
      <div className="max-w-5xl mx-auto px-4 mb-10">
        <h2 className="text-[32px] md:text-[40px] font-light text-gray-900">
          Discover our range of products
        </h2>
      </div>

      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] group">
        {/* Left Scroll Button - Shows on both mobile and desktop when canScrollLeft is true */}
        <button
          onClick={scrollLeft}
          className={`flex absolute left-4 md:left-8 top-1/2 -translate-y-[calc(50%+20px)] z-10 w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-[#272724] shadow-xl text-white transition-all hover:scale-110 ${
            canScrollLeft
              ? "opacity-100 md:opacity-0 md:group-hover:opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={!canScrollLeft}
          tabIndex={canScrollLeft ? 0 : -1}
          aria-label="Scroll left"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
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

        {/* Right Scroll Button - Shows on both mobile and desktop when canScrollRight is true */}
        <button
          onClick={scrollRight}
          className={`flex absolute right-4 md:right-8 top-1/2 -translate-y-[calc(50%+20px)] z-10 w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-[#272724] shadow-xl text-white transition-all hover:scale-110 ${
            canScrollRight
              ? "opacity-100 md:opacity-0 md:group-hover:opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={!canScrollRight}
          tabIndex={canScrollRight ? 0 : -1}
          aria-label="Scroll right"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
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

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Gap of ~8px between images, ~3.5 images visible at a time */}
          {/* Left padding reduced by 45% */}
          <div className="flex gap-2 pl-[calc((100vw-64rem)/2*0.55+1rem)] pr-4 md:pl-[calc((100vw-64rem)/2*0.55+1rem)] md:pr-8">
            {products.map((product) => (
              <Link
                key={product.to}
                to={product.to}
                className="flex-shrink-0 group/card"
              >
                {/* Square aspect ratio (1:1), ~37.5vw width on md+, 66.66vw on mobile */}
                <div 
                  className="w-[66.66vw] md:w-[37.5vw] 2xl:w-[36.625rem] overflow-hidden rounded-[3px]"
                >
                  <div
                    className="relative w-full overflow-hidden rounded-[3px]"
                    style={{ aspectRatio: "1 / 1" }}
                  >
                    <img
                      src={product.image}
                      alt={product.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105 rounded-[3px]"
                      loading="lazy"
                    />
                  </div>
                </div>
                <p className="mt-3 text-[15px] md:text-[17px] font-normal text-[#272724] tracking-[0.2px]">
                  {product.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Accordion Item for Mobile Timeline
function TimelineAccordionItem({ item }: { item: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative mb-8 last:mb-0">
      {/* Timeline Dot */}
      <div className="absolute -right-[9px] top-2 w-4 h-4 bg-[#9e1b32] rounded-full border-4 border-white" />

      {/* Accordion Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <p className="text-3xl font-light text-gray-900">{item.year}</p>
            <h3 className="text-lg font-semibold text-gray-900 mt-1">
              {item.event}
            </h3>
          </div>
          <div
            className={`flex-shrink-0 w-6 h-6 text-gray-600 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="mt-4 space-y-4 animate-fadeIn">
          <div className="relative flex items-center justify-center">
            <img
              src={item.image}
              alt={item.event}
              className="max-w-full h-auto object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML = `
                  <div class="text-center p-4">
                    <div class="text-4xl font-light text-[#9e1b32]">${item.year}</div>
                  </div>
                `;
              }}
            />
          </div>
          <p className="text-base text-gray-700 leading-relaxed">
            {item.description}
          </p>
        </div>
      )}
    </div>
  );
}

export default function TheBrand() {
  const { brandData } = useLoaderData<typeof loader>();

  return (
    <div className="pt-[104px] md:pt-[112px] font-['Archivo'] bg-white">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-gray-900 mb-12">
          {brandData.hero_title}
        </h1>

        {/* Video Section */}
        {brandData.video_url && (
          <div className="max-w-4xl mx-auto mb-12">
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              <video
                src={brandData.video_url}
                className="absolute top-0 left-0 w-full h-full object-cover"
                controls
                autoPlay
                muted
                loop
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </section>

      {/* Our Mission Section */}
      {brandData.sections[0] && (
        <section className="py-12 md:py-16 border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
              {brandData.sections[0].title}
            </h2>
            {brandData.sections[0].subtitle && (
              <p className="text-lg md:text-xl font-semibold text-gray-900 mb-8 leading-relaxed">
                {brandData.sections[0].subtitle}
              </p>
            )}
            <div className="space-y-6">
              {brandData.sections[0].content.map((item, idx) => (
                <p
                  key={idx}
                  className="text-base md:text-lg text-gray-700 leading-relaxed"
                >
                  {item.text}
                </p>
              ))}
            </div>

            {/* Two Images Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 items-start">
              <div className="w-full">
                <img
                  src="/brand-mission-1.jpg"
                  alt="Hand with red nail polish"
                  className="w-full h-auto"
                  style={{ maxWidth: "100%", display: "block" }}
                  loading="lazy"
                  decoding="async"
                  width="1200"
                  height="1200"
                />
              </div>
              <div className="w-full">
                <img
                  src="/brand-mission-2.jpg"
                  alt="Woman applying lip product"
                  className="w-full h-auto"
                  style={{ maxWidth: "100%", display: "block" }}
                  loading="lazy"
                  decoding="async"
                  width="1200"
                  height="1200"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Our Expertise Section */}
      {brandData.sections[1] && (
        <section className="py-12 md:py-16 border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-8">
              {brandData.sections[1].title}
            </h2>
            <div className="space-y-6">
              {brandData.sections[1].content.map((item, idx) => {
                if (item.type === "paragraph") {
                  return (
                    <p
                      key={idx}
                      className="text-base md:text-lg text-gray-700 leading-relaxed"
                    >
                      {item.text}
                    </p>
                  );
                } else if (item.type === "bold") {
                  return (
                    <p
                      key={idx}
                      className="text-base md:text-lg font-bold text-gray-900 mt-4"
                    >
                      {item.text}
                    </p>
                  );
                } else if (item.type === "note") {
                  return (
                    <p
                      key={idx}
                      className="text-sm md:text-base italic text-gray-600"
                    >
                      {item.text}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </section>
      )}

      {/* Discover Our Range of Products Carousel */}
      <ProductRangeCarousel />

      {/* Our Commitments Section */}
      {brandData.sections[2] && (
        <section className="py-12 md:py-16 border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-12">
              {brandData.sections[2].title}
            </h2>

            {brandData.sections[2].subsections.map((subsection, subIdx) => (
              <div key={subIdx} className="mb-12 last:mb-0">
                <h3 className="text-2xl md:text-3xl font-light text-gray-900 mb-6">
                  {subsection.title}
                </h3>
                <div className="space-y-6">
                  {subsection.content.map((item, idx) => {
                    // For education section, insert image after first paragraph
                    const isEducation = subsection.id === "education";

                    const contentElement = (() => {
                      if (item.type === "paragraph") {
                        return (
                          <p
                            key={idx}
                            className="text-base md:text-lg text-gray-700 leading-relaxed"
                          >
                            {item.text}
                          </p>
                        );
                      } else if (item.type === "bullets") {
                        return (
                          <ul key={idx} className="space-y-3 ml-6">
                            {item.items.map((bullet, bIdx) => (
                              <li
                                key={bIdx}
                                className="text-base md:text-lg text-gray-700 leading-relaxed list-disc"
                              >
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        );
                      } else if (item.type === "bold") {
                        return (
                          <p
                            key={idx}
                            className="text-base md:text-lg font-bold text-gray-900 mt-4"
                          >
                            {item.text}
                          </p>
                        );
                      }
                      return null;
                    })();

                    // Return content with image after first paragraph in education section
                    if (isEducation && idx === 0) {
                      return (
                        <div key={idx}>
                          {contentElement}
                          <div className="my-8">
                            <img
                              src="https://cdn.sanity.io/images/m6hh3qbl/production/45cf1f08b14ac1a024755f87665c0df4a2e4d56e-1500x1060.jpg?w=1200&h=848&fit=crop&crop=center&auto=format"
                              alt="MAVALA education and training - London school 1969"
                              className="w-full h-auto"
                              loading="lazy"
                              style={{ aspectRatio: "1500 / 1060" }}
                            />
                          </div>
                        </div>
                      );
                    }

                    return contentElement;
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Our History Section */}
      {brandData.sections[3] && (
        <section className="py-12 md:py-16 border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-8">
              {brandData.sections[3].title}
            </h2>

            {/* Quote */}
            {brandData.sections[3].quote && (
              <div className="mb-12 p-6 md:p-8 border-l-4 border-[#9e1b32]">
                <p className="text-lg md:text-xl text-gray-700 italic leading-relaxed mb-4">
                  "{brandData.sections[3].quote.text}"
                </p>
                <p className="text-base text-gray-900 font-semibold">
                  — {brandData.sections[3].quote.author}
                </p>
              </div>
            )}

            {/* Timeline - Carousel on Desktop, Accordion on Mobile */}
            {brandData.sections[3].timeline && (
              <TimelineSection timeline={brandData.sections[3].timeline} />
            )}

            {/* Did You Know Facts */}
            {brandData.sections[3].facts && (
              <div>
                <h3 className="text-2xl font-light text-gray-900 mb-6">
                  Did you know?
                </h3>
                <div className="space-y-6">
                  {brandData.sections[3].facts.map((fact, idx) => (
                    <div
                      key={idx}
                      className="p-6 border border-gray-200 rounded-lg"
                    >
                      <p className="text-base font-semibold text-gray-900 mb-2">
                        {fact.question}
                      </p>
                      <p className="text-base text-gray-700">{fact.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
