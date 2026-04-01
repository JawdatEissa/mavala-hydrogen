# Shopify integration (custom Remix storefront)

This project is a **Remix (Vite) + TypeScript** storefront—not the `@shopify/hydrogen` npm package. It integrates with Shopify using the **Storefront API** from server-side loaders and `*.server.ts` modules so tokens stay off the client.

## Phase 1 — Storefront product read + PDP fallback (implemented)

Product detail pages (`/products/:handle`) try **live Shopify** first, then fall back to the **bundled JSON catalog** if the API returns no product or errors.

### New files

#### `app/lib/shopify-storefront.server.ts`

- Reads `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_VERSION`, and `PRIVATE_STOREFRONT_API_TOKEN` (fallback: `PUBLIC_STOREFRONT_API_TOKEN`).
- **`storefrontGraphQL()`** — `POST` to `https://{domain}/api/{version}/graphql.json` with header `X-Shopify-Storefront-Access-Token`.
- **`getStorefrontProductByHandle(handle)`** — Storefront GraphQL `product(handle: …)` with fields for pricing, images, collections, variants, descriptions, availability, etc.

#### `app/lib/shopify-product-mapper.server.ts`

- **`mapStorefrontProductToScrapedProduct()`** — Maps Shopify’s product node into the existing **`ScrapedProduct`** shape (slug, title, `price` / `price_from`, images, categories, `out_of_stock`, descriptions, `url` as `/products/{handle}`) so the current UI needs minimal changes.
- Attaches a small **`shopify`** object on the mapped product (`productGid`, `defaultVariantGid`, `variantCount`) for future cart/checkout work.
- **`enrichShopifyProductFromJson()`** — When the same handle exists in bundled JSON (`getProductBySlug`), overlays **local images**, **shades**, **gallery_images**, long-form copy, ratings, **sizes**, etc., so the site keeps manifest-backed assets and scraped content where available.

#### `app/lib/shopify-admin.server.ts`

- **Client credentials** Admin token exchange (same pattern as `scripts/test-shopify-connection.mjs`).
- In-memory token cache, refreshed about **60 seconds** before expiry.
- **`getAdminToken()`** and **`adminGraphQL()`** — available for future server-side Admin use; **not** wired to any route in Phase 1.

### Modified files

#### `app/routes/products.$handle.tsx`

Loader flow:

1. **Try Storefront** by URL `handle` → map to `ScrapedProduct`.
2. If JSON has the same slug, **merge** via `enrichShopifyProductFromJson`.
3. If Storefront returns nothing usable, use **`getProductBySlug(handle)`** only (previous behavior).
4. If still no product → **404**.

All logic after that (related products from `loadScrapedProducts()`, `COLOR_MAPPINGS`, shade manifest behavior) is **unchanged**.

### Intentionally unchanged

- `app/routes/color.tsx` and `app/data/color_mapping_*.json` behavior.
- AI chat: `app/routes/api.chat.tsx`, `app/lib/openai.server.ts`, `app/lib/supabase.server.ts`.
- `app/lib/scraped-products.server.ts` — still the JSON catalog and `getProductBySlug`.
- Collections and search routes (optional Storefront wiring can come later).

### Environment variables

Copy from `.env.example` to `.env.local` and fill in real values. **Never commit secrets.**

Relevant variables:

- `PUBLIC_STORE_DOMAIN`
- `PUBLIC_STOREFRONT_API_VERSION` (e.g. `2026-01`)
- `PUBLIC_STOREFRONT_API_TOKEN` / `PRIVATE_STOREFRONT_API_TOKEN`
- `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `SHOPIFY_API_VERSION` (Admin helper + connection test)

Wherever the **Node server** runs in production, these must be set in that environment—same names as local.

### Verification

```bash
npm run test:shopify
```

Confirms Storefront and (if configured) Admin client credentials. After adding products in Shopify with handles that match your routes, open `/products/{handle}` and confirm live title/price; JSON-only handles should still work when Shopify has no match.

### Build note

`npm run build` runs `prebuild`, which may regenerate `app/data/image-manifest.json`. That is unrelated to Shopify API logic.

## Roadmap (later phases)

- **Phase 2** — Cart: Storefront cart mutations, persist cart id (e.g. httpOnly cookie), wire `cart.tsx` and add-to-cart, redirect to `checkoutUrl`.
- **Phase 3** — Customer Account API / OAuth for real sign-in.
- **Phase 4** — Caching, rate limits, error handling; optional Storefront-backed collections/search with JSON fallback.

## References

- [Storefront API](https://shopify.dev/docs/api/storefront)
- [Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql)
- [Cart object / checkoutUrl](https://shopify.dev/docs/api/storefront/latest/objects/Cart)
