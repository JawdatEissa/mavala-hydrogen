import { createCookie } from "@remix-run/node";

/** httpOnly cookie storing Storefront Cart `id` (GID). */
export const SHOPIFY_CART_COOKIE_NAME = "mavala_shopify_cart_id";

export const shopifyCartIdCookie = createCookie(SHOPIFY_CART_COOKIE_NAME, {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 14,
});
