import { createCookie } from "@remix-run/node";

export const CUSTOMER_ACCESS_TOKEN_COOKIE = "mavala_customer_access_token";

/** httpOnly cookie holding Storefront customer access token (opaque). */
export const customerAccessTokenCookie = createCookie(
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
  },
);

/**
 * maxAge seconds from Shopify expiresAt (ISO), capped to 14 days.
 */
export function maxAgeFromExpiresAt(expiresAt: string | null): number {
  const cap = 60 * 60 * 24 * 14;
  if (!expiresAt) {
    return cap;
  }
  const ms = Date.parse(expiresAt);
  if (Number.isNaN(ms)) {
    return cap;
  }
  const sec = Math.floor((ms - Date.now()) / 1000);
  return Math.min(Math.max(sec, 60), cap);
}
