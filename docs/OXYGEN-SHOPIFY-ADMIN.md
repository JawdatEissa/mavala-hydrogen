# Shopify Admin + Oxygen — operator checklist (Phase 0)

Use this when connecting the migration repo to **Hydrogen / Oxygen**. Production on **Vercel** (`mavala-hydrogen`) is unchanged until explicit cutover.

**Related:** [HYDROGEN-OXYGEN-MIGRATION.md](./HYDROGEN-OXYGEN-MIGRATION.md), [SHOPIFY-INTEGRATION.md](./SHOPIFY-INTEGRATION.md).

---

## 1. Hydrogen storefront + GitHub

1. Shopify Admin → **Sales channels** → **Hydrogen**.
2. Create a storefront if needed (e.g. **Mavala Hydrogen Oxygen**).
3. **Connect GitHub** (continuous deployment):
   - Repository: **`JawdatEissa/mavala-hydrogen-oxygen`**
   - Branch: **`hydrogen-scaffold`** while that branch is the Hydrogen app (or **`main`** after merge).
4. **Do not** connect the Vercel production repository here.

---

## 2. Environment variables on Oxygen

In the Hydrogen / Oxygen deployment settings, define variables to mirror [`.env.example`](../.env.example) and production Vercel (same names).

| Variable | Oxygen staging | Notes |
|----------|----------------|-------|
| `PUBLIC_APP_URL` | Optional on Hydrogen | Remix/Vercel and some scripts still use this name. **Hydrogen/Oxygen** Customer Account flow uses the **deployment origin** and routes under `/account/*`; mirror Shopify **env pull** variable names on Oxygen (`PUBLIC_STOREFRONT_ID`, `SHOP_ID`, etc. — see [`.env.example`](../.env.example)). |
| `PUBLIC_STORE_DOMAIN` | Required | Usually `your-store.myshopify.com` or primary domain used for discovery. |
| `PUBLIC_STOREFRONT_API_VERSION` | Required | Align with Headless token (e.g. `2025-01` / `2026-01`). |
| `PUBLIC_STOREFRONT_API_TOKEN` | If used | Server-side; see codebase fallback to private token. |
| `PRIVATE_STOREFRONT_API_TOKEN` | Required for cart/PDP | Preferred for server-only Storefront calls. |
| `SHOPIFY_CLIENT_ID` | Required | Dev Dashboard app — Admin API client credentials. |
| `SHOPIFY_CLIENT_SECRET` | Required | |
| `SHOPIFY_STORE_DOMAIN` | Optional | Fallback when different from `PUBLIC_STORE_DOMAIN` for Admin. |
| `SHOPIFY_API_VERSION` | Optional | Defaults to Storefront version in code. |
| `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` | Required | Customer Account API confidential client. |
| `CUSTOMER_ACCOUNT_API_CLIENT_SECRET` | Required | Never expose to client. |
| `SESSION_SECRET` | Required | Strong random; can differ from Vercel during parallel run. |
| `OPENAI_API_KEY` | If chat on Oxygen | |
| `SUPABASE_URL` | If chat on Oxygen | |
| `SUPABASE_ANON_KEY` | If needed | |
| `SUPABASE_SERVICE_ROLE` | If chat ingest / server | |

After the first deployment, copy the **preview URL** into [HYDROGEN-OXYGEN-MIGRATION.md](./HYDROGEN-OXYGEN-MIGRATION.md) Phase 0.

CLI (from repo root, **interactive** login): `npm run shopify:link -- --storefront "Mavala"` then `npm run shopify:env` — see [HYDROGEN-CLI-LOGIN-AND-LINK.md](./HYDROGEN-CLI-LOGIN-AND-LINK.md) and [Shopify Hydrogen getting started](https://shopify.dev/docs/storefronts/headless/hydrogen/getting-started).

---

## 3. Customer Account API — parallel redirects + JS origins (Vercel Remix + Hydrogen Oxygen)

Per [SHOPIFY-INTEGRATION.md](./SHOPIFY-INTEGRATION.md) (Customer auth section) for the **Vercel** app, and this section for **Hydrogen**.

1. Shopify Admin → **Settings** → **Customer accounts** → **API credentials** (confidential app).

2. **Vercel / Remix (production until cutover)** — **keep** these as long as `mavala-hydrogen` ships there:

   - **Redirect URL:** `{VERCEL_PUBLIC_APP_URL}/auth/customer/callback`
   - **JavaScript origin:** origin of `VERCEL_PUBLIC_APP_URL` only

3. **Hydrogen on Oxygen** — **add** (do not remove Vercel entries):

   - **Redirect URL:** `{OXYGEN_ORIGIN}/account/authorize`  
     (Hydrogen template route; **not** `/auth/customer/callback`.)

   Example: if preview is `https://abcd-12.hydrogen.shop`, register:

   `https://abcd-12.hydrogen.shop/account/authorize`

4. **JavaScript origin(s):** **add** the **origin only** of the Oxygen deployment (same scheme + host, no path):

   `https://abcd-12.hydrogen.shop`

5. **Logout redirect URL(s):** if you use federated logout, **add** the Oxygen home (e.g. `{OXYGEN_ORIGIN}/`) **alongside** existing Vercel logout URLs.

6. Until go-live, **keep** every Vercel production / preview redirect and origin that production still uses.

---

## 4. Build expectation (current repo)

On branch **`hydrogen-scaffold`**, the app is **Shopify Hydrogen** (`shopify hydrogen build`). Local: `npm install` then `npm run build` and `npx shopify hydrogen check routes`.

**`main`** may still reflect the older Remix snapshot until you merge the Hydrogen branch. Point **GitHub → Oxygen** at the branch that contains the Hydrogen build.
