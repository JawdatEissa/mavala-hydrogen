# Oxygen smoke test checklist

Run these against the **Oxygen preview URL** after a successful deployment and after `PUBLIC_APP_URL` + Customer Account OAuth entries match that host.

Replace `BASE` with your preview origin (no trailing slash).

| Step | URL / action | Pass criteria |
|------|----------------|---------------|
| 1 | `BASE/` | Home loads without 5xx |
| 2 | `BASE/products/{known-handle}` | PDP loads; live Shopify or JSON fallback behaves as on Vercel |
| 3 | `BASE/cart` | Cart page loads |
| 4 | Add to bag from PDP, then `BASE/cart` | Line items and **Proceed to Checkout** redirect to hosted Shopify `checkoutUrl` |
| 5 | `BASE/login` → OAuth | Redirects to Shopify Identity; after auth, returns via `BASE/auth/customer/callback` without `invalid_token` / origin errors |
| 6 | Header **ACCOUNT** / bag count | Matches session expectations (see [SHOPIFY-INTEGRATION.md](./SHOPIFY-INTEGRATION.md)) |

**Local build (Remix, not Oxygen worker):** from repo root, `npm install` and `npm run build` should succeed; use `npm run dev` for local QA only.

Record results and the preview URL in [HYDROGEN-OXYGEN-MIGRATION.md](./HYDROGEN-OXYGEN-MIGRATION.md) Phase 1 when done.
