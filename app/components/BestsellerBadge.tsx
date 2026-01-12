import { BESTSELLER_BADGE_TEXT } from "../lib/bestsellers";

export function BestsellerBadge({ text }: { text?: string }) {
  const label = (text ?? BESTSELLER_BADGE_TEXT).trim();
  if (!label) return null;

  // IMPORTANT: Keep these classes identical to the homepage Bestseller badge styling.
  return (
    <div className="absolute top-2.5 left-2.5 z-10 bg-white border border-gray-200 rounded-sm px-2.5 py-0.5 shadow-sm">
      <span className="font-['Archivo'] text-[9px] font-medium uppercase tracking-[0.14em] text-[#272724]">
        {label}
      </span>
    </div>
  );
}

