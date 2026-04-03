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

## Customer auth — Customer Account API (OAuth) + quiz + chat limits (implemented)

Primary sign-in uses the **Shopify Customer Account API** (OAuth 2.0 / OpenID) with a **confidential** server client: discovery on **`https://{PUBLIC_STORE_DOMAIN}/.well-known/openid-configuration`**, authorization code flow, tokens stored in **httpOnly** [`createCookieSessionStorage`](https://remix.run/docs/utils/cookies#createcookiesessionstorage) (`mavala_ca_sess`) plus a short-lived signed pending cookie (`mavala_ca_oauth_pending`) for `state` / `nonce`. **Refresh tokens never go to the client bundle.**

Official guides: [Customer Account API](https://shopify.dev/docs/api/customer/latest), [Authenticate customers (headless)](https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/authenticate-customers).

### Routes

- **`/login`** — If Customer Account env is configured, **POST** `intent=oauth` redirects to Shopify’s authorization endpoint (optional **`login_hint`** from query or hidden field after `/join`). Callback: **`/auth/customer/callback`**. **Forgot password** still links to `https://{PUBLIC_STORE_DOMAIN}/account/recover` when the store domain is set.
- **Legacy fallback** — If **`PUBLIC_APP_URL`**, **`PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`**, and **`CUSTOMER_ACCOUNT_API_CLIENT_SECRET`** are **not** all set, `/login` shows **classic** email + password and sets **`mavala_customer_access_token`** (Storefront) for local/dev only.
- **`/join`** — Quiz creates the customer via Storefront **`customerCreate`**, writes quiz metafields via Admin, then returns **`loginHint`**; the client redirects to **`/login?login_hint=…`** so the user completes **one** Identity login (no classic session cookie on join).
- **`/sign-in`** — Redirects to **`/join`** for legacy links.
- **`/logout`** — Clears **all** auth cookies: Customer Account session, OAuth pending, legacy `mavala_customer_access_token`, and **`mavala_chat_anon_uses`**. If an **`id_token`** was stored (size-limited), redirects to OpenID **`end_session_endpoint`** for Shopify logout when configured.

Header **SIGN IN** → **`/login`**. Header **ACCOUNT** → **`https://{PUBLIC_STORE_DOMAIN}/account`** (`customerAccountUrl` in [`app/root.tsx`](../app/root.tsx)); after Customer Account OAuth, the browser’s Identity session matches hosted `/account` (no surprise second login within normal token/session rules).

### Session resolution

[`resolveCustomerSession`](../app/lib/auth.server.ts) (and **`getCustomerSession`**, which wraps it without surfacing Set-Cookie) **prefers** Customer Account tokens, refreshes access tokens when expired, then falls back to a valid **legacy** `mavala_customer_access_token` if present. **`customerId`** for chat rate limits comes from the Customer Account API **`customer { id }`** when using OAuth.

**Note:** Users with **only** a legacy cookie are still “logged in” on the headless site for header/chat, but **ACCOUNT** may prompt Identity until they complete OAuth once.

### Storefront API scopes (Headless token)

Keep **`unauthenticated_read_customers`** and **`unauthenticated_write_customers`** for **`/join`** provisioning. Cart/checkout unchanged (Storefront API).

### Admin API — quiz metafields

Unchanged: after **`customerCreate`**, Admin **`metafieldsSet`** on the customer (see table in previous revisions). Same metafield definitions and **`write_customers`** scope.

If your store is **New customer accounts** only and **`customerCreate`** fails or diverges from Identity, use Shopify-supported signup flows and adjust provisioning (document any change here).

### Shopify Admin checklist (Customer accounts → API credentials)

1. **Application type:** confidential (client secret on server).
2. **Redirect URL(s):** `{PUBLIC_APP_URL}/auth/customer/callback` (exact match).
3. **JavaScript origin(s):** origin of **`PUBLIC_APP_URL`** only (required for token endpoint **`Origin`** — 401 `invalid_token` if wrong).
4. **Logout redirect URL(s):** your site origin (e.g. `{PUBLIC_APP_URL}/`) if you use federated logout.
5. **`PUBLIC_STORE_DOMAIN`** must match the storefront host used for discovery (often `your-store.myshopify.com` or a primary domain that serves `/.well-known/...`).

### Environment variables

See [`.env.example`](../.env.example): **`PUBLIC_APP_URL`**, **`PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`**, **`CUSTOMER_ACCOUNT_API_CLIENT_SECRET`**, **`PUBLIC_STORE_DOMAIN`**, **`SESSION_SECRET`**. **`SESSION_SECRET`** also signs OAuth pending + anon chat cookies.

- **`MAVALA_AUTH_DEV_BYPASS=true`** — Optional fake session (never in production).
- Cookie **`mavala_dev_auth=true`** — Optional manual dev bypass.

### Chat

Logged-in customers (Customer Account session or legacy Storefront token) bypass the anonymous cap. **`/api/chat`** uses **`resolveCustomerSession`** and forwards **Set-Cookie** when tokens refresh. Anonymous behavior unchanged (`403` / **`CHAT_LIMIT_REACHED`**).

### Breaking changes (vs classic-only auth)

- Production sign-in is **OAuth**, not password on your domain (password UI only when Customer Account env is missing).
- **`/join`** no longer sets **`mavala_customer_access_token`**; users must complete **`/login`** after signup.
- Optional **dual-read** of legacy cookie remains for migration; remove once all users have OAuth sessions.

## Roadmap (later phases)

- **Phase 4** — Caching, rate limits, error handling; optional Storefront-backed collections/search with JSON fallback.

## References

- [Storefront API](https://shopify.dev/docs/api/storefront)
- [Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql)
- [Cart object / checkoutUrl](https://shopify.dev/docs/api/storefront/latest/objects/Cart)
- [Customer Account API](https://shopify.dev/docs/api/customer)

