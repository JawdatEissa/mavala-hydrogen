// Keep this file safe to import from client code: define the minimal shape we need.
export type ScrapedProduct = {
  sizes?: unknown;
};

const MEASUREMENT_RE =
  /\b\d+(?:[.,]\d+)?\s?(?:ml|mL|g|kg|oz|fl\.?\s?oz|l|L)\b/;

function looksLikeMeasurement(value: string): boolean {
  return MEASUREMENT_RE.test(value);
}

/**
 * Meta shown alongside price on listing cards.
 * - Prefer a measurement-like entry from `sizes` (e.g. "10ml", "1.6 g")
 * - Otherwise, if `sizes` looks like shades/variants, show "{n} shades"
 */
export function getListingMeta(product: ScrapedProduct): string {
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];

  const measurement = sizes.find(
    (s) => typeof s === "string" && looksLikeMeasurement(s)
  );
  if (measurement) return measurement.trim();

  // If `sizes` is a list of shade names (often 2+), show count.
  if (sizes.length >= 2) return `${sizes.length} shades`;

  return "";
}

