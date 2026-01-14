import { BESTSELLER_BADGE_TEXT } from "../lib/bestsellers";

export function BestsellerBadge({ text }: { text?: string }) {
  const label = (text ?? BESTSELLER_BADGE_TEXT).trim();
  if (!label) return null;

  // IMPORTANT: Keep these classes identical to the homepage Bestseller badge styling.
  return (
    <div className="absolute top-1 left-1 md:top-2 md:left-2 z-10 bg-white border border-[#e4e4e4] rounded-[2px] px-[6.9px] py-[5px] shadow-[0_1px_1px_rgba(0,0,0,0.04)] inline-flex">
      <span className="font-['Archivo'] text-[8.5px] leading-[1.05] font-medium uppercase tracking-[0.08em] text-[#7f7f7f]">
        {label}
      </span>
    </div>
  );
}
