const DEFAULT_CAD_PER_EUR = 1.45;

function readEnvNumber(key: string): number | null {
  // Vite-style env (client + server during build)
  try {
    const viteEnv = (import.meta as any)?.env?.[key];
    const n = Number(viteEnv);
    if (Number.isFinite(n) && n > 0) return n;
  } catch {
    // ignore
  }

  // Node env (Remix server runtime)
  try {
    const nodeEnv = (process as any)?.env?.[key];
    const n = Number(nodeEnv);
    if (Number.isFinite(n) && n > 0) return n;
  } catch {
    // ignore
  }

  return null;
}

export function getCadPerEur(): number {
  // Allow overriding without redeploying code styles:
  // - `VITE_CAD_PER_EUR` for client bundles
  // - `CAD_PER_EUR` for server runtime
  return (
    readEnvNumber("VITE_CAD_PER_EUR") ??
    readEnvNumber("CAD_PER_EUR") ??
    DEFAULT_CAD_PER_EUR
  );
}

export type ParsedPrice = {
  amount: number;
  currency: "EUR" | "CAD" | "UNKNOWN";
  prefix?: "from";
};

export function parsePrice(raw: string): ParsedPrice | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  const hasFrom = lower.startsWith("from ");
  const withoutFrom = hasFrom ? trimmed.slice(5).trim() : trimmed;

  const currency: ParsedPrice["currency"] =
    /€|\beur\b/i.test(withoutFrom)
      ? "EUR"
      : /\bca\$|\bcad\b/i.test(withoutFrom) || /\$/.test(withoutFrom)
        ? "CAD"
        : "UNKNOWN";

  // Extract first number (supports "12.10" and "12,10")
  const match = withoutFrom.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return null;

  const numeric = match[1].replace(",", ".");
  const amount = Number(numeric);
  if (!Number.isFinite(amount)) return null;

  return {
    amount,
    currency,
    prefix: hasFrom ? "from" : undefined,
  };
}

export function formatCad(amount: number): string {
  // Match the screenshot style: currency symbol immediately followed by amount.
  return `CA$${amount.toFixed(2)}`;
}

export function formatPriceToCad(raw: string): string {
  const parsed = parsePrice(raw);
  if (!parsed) return "";

  let cadAmount = parsed.amount;
  if (parsed.currency === "EUR") {
    cadAmount = parsed.amount * getCadPerEur();
  }

  const formatted = formatCad(cadAmount);
  return parsed.prefix ? `from ${formatted}` : formatted;
}

