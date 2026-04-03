# Future migration: Vercel (Remix) → Shopify Hydrogen / Oxygen

This document records **strategy only**. The codebase today follows **[SHOPIFY-INTEGRATION.md](./SHOPIFY-INTEGRATION.md)**: Remix on Vite, optional **Vercel** preset, **Storefront API**, Shopify-hosted **checkout**. Nothing here requires an immediate migration.

## Can we migrate later without hurting SEO or “how we run the business”?

**Yes, if the migration is planned.** Moving the **frontend** from Vercel to **Hydrogen on Oxygen** does **not** replace your **Shopify store** (catalog, Admin, payments, `checkoutUrl`). You are changing **where the HTML/JS runs**, not the commerce backend.

SEO and operations stay healthy when you preserve **URLs**, **redirects**, and **one canonical domain**.

---

## SEO — what to preserve

| Risk | Mitigation |
|------|------------|
| Broken inbound links | Keep **the same path structure** where possible (e.g. `/products/:handle`, `/collections/:handle`, key marketing URLs). This repo already uses **handle-based** product URLs aligned with Shopify. |
| Duplicate or split authority | Use **one** primary domain (e.g. `www.example.com`). Canonical tags (`rel="canonical"`) should always point to **that** domain + path, not `*.myshopify.com`. |
| Path changes | If any URL **must** change, ship a **301 redirect** map (old path → new path) before or at cutover. Update **sitemap.xml** and resubmit in **Google Search Console** (or equivalent). |
| Content drops | Avoid removing unique copy or indexable pages without replacements; parity checks per URL after migration. |

**Checkout URLs** on `checkout.shopify.com` / `*.myshopify.com` are normal for payment and are **not** a substitute for your site’s canonical product URLs.

---

## Domain and DNS

- **Today:** Your **apex / www** points at **Vercel** (or another host) for the Remix app.
- **After Hydrogen + Oxygen:** Point the **same** hostname(s) at **Oxygen** (Shopify will document the exact DNS targets for your deployment). Customers can keep the **same** public domain.
- **Recommended:** Run **staging** on a separate hostname (e.g. `preview.example.com` or Shopify’s preview URL) until QA passes, then **switch DNS** (low TTL first) for production.

No inherent requirement to change the **brand domain** for SEO reasons.

---

## Other operations (what keeps working conceptually)

| Area | Notes |
|------|--------|
| **Shopify Admin** | Unchanged — same products, orders, customers, apps. |
| **Storefront API + checkout** | Same platform; Hydrogen apps still use Storefront GraphQL and **`checkoutUrl`**. Implementation moves into Hydrogen’s **`storefront` context** and patterns. |
| **Custom app / tokens** | Same Dev Dashboard app can often power Storefront + Admin tokens; confirm Oxygen **environment variable** names when you migrate. |
| **This repo’s scripts** | `scripts/test-shopify-*.mjs`, sync scripts, etc. remain valid **against the same store**; they do not depend on Vercel. |
| **AI chat (`api.chat`), Supabase, OpenAI** | Must be **re-wired** in the new app (loaders/routes/server modules). Behavior can be identical; code location changes. |
| **Bundled JSON / `public/` assets** | Portable in principle; validate **bundle size** and **runtime limits** on Oxygen during a spike. |
| **Webhooks / third-party integrations** | Point callbacks to **new** URLs if anything today targets Vercel-specific domains. |

---

## What “migration” actually means for this codebase

Hydrogen + Oxygen is a **large frontend rewrite / re-platform**, not a config toggle:

- Replace **Remix + `@vercel/remix`** with a **Hydrogen** app scaffold (`@shopify/hydrogen`, Shopify CLI, Oxygen deploy).
- Port **routes, components, and server logic** (including large surfaces like `products.$handle` and `color`).
- Reimplement **cart session** using Hydrogen’s recommended cart APIs (conceptually same as today’s cookie + Storefront cart).

See **[SHOPIFY-INTEGRATION.md](./SHOPIFY-INTEGRATION.md)** for the current non-Hydrogen architecture.

Official references:

- [Hydrogen](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [Hydrogen and Oxygen fundamentals](https://shopify.dev/docs/custom-storefronts/hydrogen/fundamentals)

---

## Summary

- **Shorter path now:** Remix on Vercel (or any Node host) + Storefront API + Shopify checkout — **already compatible** with your domain and SEO if URLs and canonicals stay consistent.
- **Later:** You **may** migrate to **Hydrogen on Oxygen** without **inherently** losing rankings or changing customer-facing domain, provided you keep **stable URLs**, **301s** for any changes, and **one canonical host**.
- **Pricing / plan:** Confirm current **Shopify plan** and any **headless / Oxygen** terms with [Shopify Pricing](https://www.shopify.com/pricing) or Support at migration time.

This file should be updated when a real migration project starts (dates, owners, redirect spreadsheet, Search Console property).
