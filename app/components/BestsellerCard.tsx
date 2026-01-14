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
      <div className="relative w-[98%] mx-auto bg-[#f5f5f5] p-4 md:p-10 flex justify-center items-center aspect-[4/5] md:aspect-square overflow-hidden">
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

      {/* Info block under the grey image card (mavala.fr-like hierarchy) */}
      <div className="mt-4 text-left">
        <p className="font-['Archivo'] text-[calc(16px*var(--bestseller-text-scale))] leading-[calc(20px*var(--bestseller-text-scale))] font-normal text-[#272724]">
          {name}
        </p>

        {category ? (
          <p className="mt-1 font-['Archivo'] text-[calc(12px*var(--bestseller-text-scale))] leading-[calc(14px*var(--bestseller-text-scale))] font-light text-[#9ca3af]">
            {category}
          </p>
        ) : null}

        {priceCurrent || priceCompare || meta ? (
          <div className="mt-[10px] flex flex-wrap items-baseline gap-x-2 gap-y-1 font-['Archivo']">
            {priceCompareCad ? (
              <span className="text-[calc(13px*var(--bestseller-text-scale))] leading-[calc(16px*var(--bestseller-text-scale))] font-light text-[#b8b8b8] line-through">
                {priceCompareCad}
              </span>
            ) : null}
            {priceCurrentCad ? (
              <span className="text-[calc(13px*var(--bestseller-text-scale))] leading-[calc(16px*var(--bestseller-text-scale))] font-normal text-[#ae1932]">
                {priceCurrentCad}
              </span>
            ) : null}
            {meta ? (
              <span className="text-[calc(12px*var(--bestseller-text-scale))] leading-[calc(14px*var(--bestseller-text-scale))] font-light text-[#9ca3af]">
                {meta}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
