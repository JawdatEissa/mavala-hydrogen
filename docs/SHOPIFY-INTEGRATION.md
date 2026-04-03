# Shopify integration (custom Remix storefront)

This project is a **Remix (Vite) + TypeScript** storefront—not the `@shopify/hydrogen` npm package. It integrates with Shopify using the **Storefront API** from server-side loaders and `*.server.ts` modules so tokens stay off the client.

**Future option:** You can migrate hosting from **Vercel (or any Node host)** to **Shopify Hydrogen / Oxygen** later without automatically sacrificing domain or SEO, if URLs, canonicals, and redirects are handled deliberately — see **[FUTURE-VERCEL-TO-HYDROGEN-MIGRATION.md](./FUTURE-VERCEL-TO-HYDROGEN-MIGRATION.md)**.

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
- AI chat: `app/routes/api.chat.tsx`, `app/lib/openai.server.ts`, `app/lib/supabase.server.ts` (no Storefront wiring there yet).
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

**Product publication vs sales channels**

```bash
npm run verify:shopify-publications
```

Uses the Admin API ([`publications`](https://shopify.dev/docs/api/admin-graphql/latest/queries/publications), [`Product.resourcePublications`](https://shopify.dev/docs/api/admin-graphql/latest/objects/ResourcePublication)) and compares to your Storefront token’s `products` query. Requires **`read_publications`** on the Dev Dashboard app for the full per-channel breakdown; without it, the script still lists **ACTIVE** products and compares **Storefront vs Admin** visibility (strong signal that the Headless channel is wired). Add `read_publications` to the scopes in [`scripts/shopify-scopes-copy-paste.txt`](../scripts/shopify-scopes-copy-paste.txt), release a new app version, and re-approve the app if Shopify prompts you.

**Checkout, shipping, and test payment**

```bash
npm run test:shopify-checkout
```

Creates a Storefront cart with one **available** variant, prints **`checkoutUrl`**. Open the URL in a browser to confirm **shipping** options and complete payment with **Bogus gateway** (or your test provider). Treat checkout URLs as **single-use / sensitive**; run the script again for a fresh link.

### Build note

`npm run build` runs `prebuild`, which may regenerate `app/data/image-manifest.json`. That is unrelated to Shopify API logic.

### Bulk catalog sync (Admin scripts)

To push **`all-products.json`** and **shade** data from `color_mapping_*.json` / `image-manifest.json` into Shopify (including staged local images), see **[SHOPIFY-CATALOG-SYNC-SCRIPTS.md](./SHOPIFY-CATALOG-SYNC-SCRIPTS.md)**. Typical full runs:

`node scripts/sync-catalog-to-shopify.mjs --delay 500` and `node scripts/sync-shades-to-shopify.mjs --delay 500`. To create a **smart collection** that groups all synced shade products, run `node scripts/ensure-shade-collection.mjs` (or `npm run ensure:shopify-shade-collection`).

## Phase 2 — Cart & checkout (implemented)

### Behavior

- **`app/lib/cart-cookie.server.ts`** — httpOnly cookie **`mavala_shopify_cart_id`** (`path: /`, `sameSite: lax`, `secure` in production, 14-day `maxAge`) stores the Storefront **Cart** GID. The private Storefront token is never sent to the browser.
- **`app/lib/shopify-cart.server.ts`** — `fetchCartById`, `createCartWithLines`, `addCartLines`, `updateCartLines`, `removeCartLines`, `addLineToCart` (create-or-reuse cookie cart), `getMerchandiseIdForHandle` (resolves default purchasable variant for quick-add). All GraphQL was validated against the Storefront schema (Shopify Dev MCP / `validate_graphql_codeblocks`).
- **`app/routes/cart.tsx`** — Loader reads the cart from Shopify; **`action`** supports `intent`: `add` (optional `merchandiseId` and/or `handle` + `quantity`), `update` (`lineId`, `quantity`; quantity `0` removes the line), `remove`, `checkout` (**redirect** to `cart.checkoutUrl`). **Proceed to Checkout** uses Shopify-hosted checkout only.
- **`app/root.tsx` (loader)** — Reads the cart id from the request cookie, calls **`fetchCartById`**, and returns **`cartItemCount`** (`cart.totalQuantity`, or `0` on missing cart / error). This keeps the **header bag** in sync on full page loads without duplicating cart fetches on every route.
- **`app/components/Header.tsx`** — **Bag** control (desktop after **SIGN IN**, mobile bar + full-screen menu) links to **`/cart`**. When `cartItemCount > 0`, a small badge shows the count (capped display e.g. **99+**). This is the primary “view cart” entry point; PDP and cards do not duplicate a “View cart” link.
- **`app/routes/products.$handle.tsx`** — PDP add controls post to `/cart` via `useFetcher` when `product.shopify.defaultVariantGid` exists; JSON-only products show *not available for online checkout* (no fake checkout). On successful add, **`useRevalidator()`** runs so the **root** loader refetches and the **header count updates** without a full navigation (fetcher submissions do not revalidate the root route by default). A slim green **“Added to bag.”** confirmation strip may appear; it intentionally does **not** link to `/cart` (the bag in the header does).
- **`app/components/ProductCard.tsx`** — Optional **`showQuickAdd`** posts `handle` for server-side variant resolution (used on *You Might Also Like*). If the handle has no live Shopify product, the action returns an error message. On success, **`useRevalidator()`** updates the header count; inline copy is **“Added to bag.”** (no separate “view cart” link).

### Storefront access scopes (cart)

Ensure the Headless / Storefront token includes **unauthenticated read/write checkout** scopes so the Cart object is available:

- `unauthenticated_read_checkouts`
- `unauthenticated_write_checkouts`

See [Shopify access scopes — unauthenticated](https://shopify.dev/docs/api/usage/access-scopes#unauthenticated-access-scopes).

### Hosted checkout URL (domains)

**Proceed to Checkout** always **redirects** to Shopify’s hosted checkout (`checkoutUrl` from the Cart). That URL is not served by this Remix app; it is expected and required for PCI and Shopify Checkout.

For a cohesive brand at go-live:

- Point the **storefront** at your main site (e.g. **`mavala.ca`** on Vercel).
- In **Shopify Admin**, configure a **checkout / shop domain** you control (e.g. **`checkout.mavala.ca`**) so customers do not stay on a raw `myshopify.com` hostname. That hostname still hits **Shopify’s** servers—it is not a Remix route like `/checkout` on Vercel.

### Production / Vercel

If **`PUBLIC_STORE_DOMAIN`**, **`PUBLIC_STOREFRONT_API_VERSION`**, and **`PRIVATE_STOREFRONT_API_TOKEN`** (or **`PUBLIC_STOREFRONT_API_TOKEN`**) are missing or wrong on the **Vercel** project, the PDP cannot resolve live variants and will behave like “not available for online checkout” for everything. Mirror **`.env.example`** into the Vercel environment for Production and Preview as needed.

### Verification

Same as Phase 1: `npm run test:shopify`, then add a line item from a PDP or quick-add, confirm the **header bag** count updates, open **`/cart`**, and use **Proceed to Checkout** to confirm the hosted checkout URL.

## Customer auth (Storefront) + quiz profile + chat limits (implemented)

This storefront uses **classic Storefront API customers** (`customerCreate`, `customerAccessTokenCreate`, `customer` query with access token)—not the **Customer Account API** OAuth flow. Migrating to new customer accounts later is optional; see [Customer Account API](https://shopify.dev/docs/api/customer).

### Routes

- **`/login`** — Email + password sign-in; sets httpOnly cookie `mavala_customer_access_token`. Link to **Forgot password** points at `https://{PUBLIC_STORE_DOMAIN}/account/recover` when the store domain is configured.
- **`/join`** — Multi-step signup quiz; creates the customer, obtains an access token, sets the same cookie, then writes quiz metafields via Admin (see below).
- **`/sign-in`** — Redirects to **`/join`** for legacy links.
- **`/logout`** — Clears customer session cookie and anonymous chat usage cookie.

Header **SIGN IN** points to **`/login`**.

### Storefront API scopes (Headless token)

In addition to cart scopes, the Storefront token needs:

- `unauthenticated_read_customers`
- `unauthenticated_write_customers`

so signup and login mutations succeed.

### Admin API — quiz metafields

After signup, the server calls Admin **`metafieldsSet`** on the new customer for:

| Namespace | Key             | Type                 |
| --------- | --------------- | -------------------- |
| `custom`  | `quiz_gender`   | Single line text     |
| `custom`  | `quiz_age_range`| Single line text     |
| `custom`  | `quiz_interests`| Single line text     |

Create matching **Customer metafield definitions** in Shopify Admin (**Settings → Custom data → Customers**) so writes are accepted. The Dev Dashboard app needs **`write_customers`** (and **`read_customers`**) on the Admin API; see [`scripts/shopify-scopes-copy-paste.txt`](../scripts/shopify-scopes-copy-paste.txt).

If Admin is misconfigured, signup still completes; metafield errors are logged server-side only.

### Environment variables

- **`SESSION_SECRET`** — Signs the httpOnly **`mavala_chat_anon_uses`** cookie used to enforce **5 free assistant replies** for anonymous visitors on **`/api/chat`**. Set a strong random value in production (see `.env.example`).
- **`MAVALA_AUTH_DEV_BYPASS=true`** — Optional; forces a fake logged-in session for local testing. Do not set in production.
- Cookie **`mavala_dev_auth=true`** — Optional manual dev bypass (same as above).

### Chat

Logged-in customers (valid Storefront access token) are **not** subject to the 5-message anonymous cap. Anonymous users get a signed, tamper-resistant usage counter; after the limit, the API returns `403` with `code: "CHAT_LIMIT_REACHED"`.

## Roadmap (later phases)

- **Phase 3** — Optional migration to **Customer Account API** / OAuth (replace or complement Storefront customer access tokens).
- **Phase 4** — Caching, rate limits, error handling; optional Storefront-backed collections/search with JSON fallback.

## References

- [Storefront API](https://shopify.dev/docs/api/storefront)
- [Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql)
- [Cart object / checkoutUrl](https://shopify.dev/docs/api/storefront/latest/objects/Cart)
