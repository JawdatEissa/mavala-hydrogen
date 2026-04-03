/**
 * Simple in-memory rate limit for auth routes (IP-based).
 */

const buckets = new Map<string, { t: number; n: number }>();

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 20;

export function isAuthRateLimited(request: Request): boolean {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const key = `auth:${ip}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.t > WINDOW_MS) {
    buckets.set(key, { t: now, n: 1 });
    return false;
  }
  b.n += 1;
  return b.n > MAX_ATTEMPTS;
}
