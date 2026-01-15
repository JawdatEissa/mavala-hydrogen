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
      className="flex flex-col group flex-shrink-0 w-[65%] sm:w-[40%] md:w-[24%] lg:w-[23.5%] snap-center snap-stop-always active:scale-95 transition-transform"
    >
      <div className="relative w-[98%] mx-auto bg-[#f5f5f5] rounded-[3px] p-4 md:p-10 flex justify-center items-center aspect-[4/5] md:aspect-square overflow-hidden">
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

      {/* Info block under the grey image card (mavala.fr typography) */}
      <div
        className="mt-4 text-left w-[98%] mx-auto"
        style={{ fontFamily: "var(--bs-font-family)" }}
      >
        {/* Product Title */}
        <p
          style={{
            fontSize: "var(--bs-title-size)",
            fontWeight: "var(--bs-title-weight)" as any,
            lineHeight: "var(--bs-title-line-height)",
            letterSpacing: "var(--bs-title-letter-spacing)",
            color: "var(--bs-title-color)",
          }}
        >
          {name}
        </p>

        {/* Category Label */}
        {category ? (
          <p
            className="mt-1"
            style={{
              fontSize: "var(--bs-category-size)",
              fontWeight: "var(--bs-category-weight)" as any,
              color: "var(--bs-category-color)",
            }}
          >
            {category}
          </p>
        ) : null}

        {/* Price Row */}
        {priceCurrent || priceCompare || meta ? (
          <div className="mt-[10px] flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {priceCompareCad ? (
              <span
                className="line-through"
                style={{
                  fontSize: "var(--bs-price-size)",
                  fontWeight: "var(--bs-price-regular-weight)" as any,
                  color: "var(--bs-price-regular-color)",
                }}
              >
                {priceCompareCad}
              </span>
            ) : null}
            {priceCurrentCad ? (
              <span
                style={{
                  fontSize: "var(--bs-price-size)",
                  fontWeight: "var(--bs-price-discount-weight)" as any,
                  color: "var(--bs-price-discount-color)",
                }}
              >
                {priceCurrentCad}
              </span>
            ) : null}
            {meta ? (
              <span
                style={{
                  fontSize: "var(--bs-meta-size)",
                  fontWeight: "var(--bs-meta-weight)" as any,
                  color: "var(--bs-meta-color)",
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
