import { Link } from "@remix-run/react";
import { formatPriceToCad } from "../lib/currency";
import { BestsellerBadge } from "./BestsellerBadge";

interface BestsellerCardProps {
  to: string;
  imageSrc: string;
  imageAlt: string;
  badgeText?: string;
  name: string;
  category?: string;
  priceCurrent?: string;
  priceCompare?: string;
  meta?: string; // e.g. "4.5ml", "45ml", "24 shades"
  imageClassName?: string;
}

export function BestsellerCard({
  to,
  imageSrc,
  imageAlt,
  badgeText = "BESTSELLERS",
  name,
  category,
  priceCurrent,
  priceCompare,
  meta,
  imageClassName,
}: BestsellerCardProps) {
  const priceCurrentCad = priceCurrent ? formatPriceToCad(priceCurrent) : "";
  const priceCompareCad = priceCompare ? formatPriceToCad(priceCompare) : "";

  return (
    <Link
      to={to}
      className="flex flex-col group flex-shrink-0 w-[65%] sm:w-[40%] md:w-[24%] lg:w-[23.5%] snap-center snap-stop-always transition-all duration-300 ease-in-out"
    >
      <div className="relative w-[98%] mx-auto bg-[#f5f5f5] rounded-[3px] p-4 md:p-10 flex justify-center items-center aspect-[4/5] md:aspect-square overflow-hidden transition-shadow duration-300 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        {badgeText ? <BestsellerBadge text={badgeText} /> : null}
        <img
          src={imageSrc}
          alt={imageAlt}
          className={`w-full h-full max-w-[90%] max-h-[90%] object-contain transition-transform duration-300 group-hover:scale-110 ${
            imageClassName ?? ""
          }`}
          loading="lazy"
        />
      </div>

      {/* Info block under the grey image card (Mavala exact typography) */}
      <div
        className="mt-3 text-left w-[98%] mx-auto"
        style={{ fontFamily: "var(--bs-font-family)", paddingLeft: 0 }}
      >
        {/* Product Title - 16px, BLACK, aligned with gray box edge */}
        <p
          style={{
            fontSize: "var(--bs-title-size)",
            fontWeight: "var(--bs-title-weight)" as any,
            lineHeight: "var(--bs-title-line-height)",
            letterSpacing: "var(--bs-title-letter-spacing)",
            color: "var(--bs-title-color)",
            marginBottom: "var(--bs-title-margin-bottom)",
            marginLeft: "var(--bs-title-margin-left)",
            textTransform: "none",
          }}
        >
          {name}
        </p>

        {/* Category/Subtitle Label - 13px, light gray, aligned */}
        {category ? (
          <p
            style={{
              fontSize: "var(--bs-category-size)",
              fontWeight: "var(--bs-category-weight)" as any,
              lineHeight: "var(--bs-category-line-height)",
              color: "var(--bs-category-color)",
              marginBottom: "var(--bs-category-margin-bottom)",
              marginLeft: "var(--bs-category-margin-left)",
              textTransform: "none",
            }}
          >
            {category}
          </p>
        ) : null}

        {/* Price Row - All elements inline and baseline aligned */}
        {priceCurrent || priceCompare || meta ? (
          <div
            className="flex items-baseline"
            style={{
              marginLeft: "var(--bs-price-compare-margin-left)",
            }}
          >
            {/* Original/Compare Price (strikethrough) - 14px */}
            {priceCompareCad ? (
              <span
                className="line-through"
                style={{
                  fontSize: "var(--bs-price-compare-size)",
                  fontWeight: "var(--bs-price-compare-weight)" as any,
                  color: "var(--bs-price-compare-color)",
                  display: "inline",
                  marginRight: "var(--bs-price-compare-margin-right)",
                  textDecoration: "line-through",
                }}
              >
                {priceCompareCad}
              </span>
            ) : null}

            {/* Current/Sale Price - 18px medium (500 weight) red */}
            {priceCurrentCad ? (
              <span
                style={{
                  fontSize: "var(--bs-price-sale-size)",
                  fontWeight: "var(--bs-price-sale-weight)" as any,
                  color: "var(--bs-price-sale-color)",
                  display: "inline",
                  marginRight: "var(--bs-price-sale-margin-right)",
                }}
              >
                {priceCurrentCad}
              </span>
            ) : null}

            {/* Volume/Meta - 13px light gray */}
            {meta ? (
              <span
                style={{
                  fontSize: "var(--bs-meta-size)",
                  fontWeight: "var(--bs-meta-weight)" as any,
                  color: "var(--bs-meta-color)",
                  display: "inline",
                }}
              >
                {meta}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
