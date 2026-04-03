# Shopify catalog sync scripts (Admin API)

Node scripts push catalog data from this repo into your Shopify store using the **Admin GraphQL API**. Product syncs are **idempotent**: re-running them updates existing products when the **handle** matches.

They load secrets from **`.env.local`** at the project root (`mavala-hydrogen/.env.local`).

---

## Shopify collections (what they are)

Under **Products → Collections**, Shopify groups products for merchandising (navigation, “shop all shades”, Headless/Storefront collection queries, etc.). There are two kinds:

| Kind | How it works |
|------|----------------|
| **Manual** | You pick products one by one. |
| **Smart (automated)** | You define **rules** (e.g. tag, product type, title). Matching products are included **automatically** — including new shades after the next `sync-shades-to-shopify` run. |

**Images are not “moved” into a collection.** Products keep their media; the collection is a **saved filter / grouping**. The same product can appear in multiple collections.

For **Mavala shades**, the sync script tags every shade product with **`shade`** and sets **product type** to **`Nail Polish`** (see **Script 2** below). Main catalog rows from `all-products.json` use **other** product types (e.g. “Nail Colour”, category names), so a smart collection with **both** rules is accurate for synced shades only:

1. Product tag **equals** `shade`  
2. Product type **equals** `Nail Polish`

### Automate the shade collection

```bash
node scripts/ensure-shade-collection.mjs
```

or:

```bash
npm run ensure:shopify-shade-collection
```

This creates a smart collection **`mavala-nail-shades`** (title **“Mavala nail shades”**) if it does not exist, then tries to **publish** it to all publications (same `read_publications` / `write_publications` caveat as product sync). Flags:

- `--skip-publish` — only create/verify the collection; turn on **Sales channels** manually in Admin if needed.

Re-run is safe: if the collection already exists, the script prints its id, rule summary, and approximate product count.

**Manual alternative (Admin UI):** Products → Collections → Create collection → **Automated** → add the two rules above → Save → enable **Online Store** / **Headless** under sales channels for the collection.

---

## Recommended full runs (with rate-friendly delay)

From the `mavala-hydrogen` directory:

```bash
node scripts/sync-catalog-to-shopify.mjs --delay 500
node scripts/sync-shades-to-shopify.mjs --delay 500
```

`--delay 500` waits **500 ms between each product** (after all API work for that item finishes). That reduces the chance of hitting Shopify throttling when each item triggers multiple Admin calls (especially **staged uploads** + **`productSet`**).

**npm shortcuts** (same scripts):

```bash
npm run sync:shopify
npm run sync:shopify-shades
```

Pass flags after `--`, e.g.:

```bash
npm run sync:shopify -- --delay 500
npm run sync:shopify-shades -- --delay 500
```

### Shade sync: test one product vs all ~205 shades

After you change **image order**, **variants** (5ml only), or **tags** in `sync-shades-to-shopify.mjs`, those updates apply only to products the script touches.

- **Spot check:**  
  `npm run sync:shopify-shades -- --delay 500 --limit 1`  
  Confirms one shade (e.g. `mavala-shade-1-ankara`) looks right in Admin.

- **Apply to every shade:**  
  **Yes — run the full sync** (no `--limit`) so all handles get the same behavior:

  ```bash
  npm run sync:shopify-shades -- --delay 500
  ```

  Same as: `node scripts/sync-shades-to-shopify.mjs --delay 500`

  Expect **several minutes** (each shade = staged uploads + `productSet`). Keep `--delay 500` (or higher) if you hit throttling.

- **Duplicate media:** If you already synced the same products with an **older** script version, Shopify may **append** new `files` instead of replacing them, so you can see **extra** images until you remove duplicates once in Admin. After a single full run on a clean product, you should see **up to three** product photos (01 → 02 → 03) plus optional swatch only when locals are missing.

---

## Prerequisites

### Environment variables

| Variable | Used for |
|----------|-----------|
| `PUBLIC_STORE_DOMAIN` | Shop host (e.g. `your-store.myshopify.com`) |
| `SHOPIFY_CLIENT_ID` | Admin **client credentials** app |
| `SHOPIFY_CLIENT_SECRET` | Same app |
| `SHOPIFY_API_VERSION` or `PUBLIC_STOREFRONT_API_VERSION` | Admin API version (default `2026-01` if unset) |

The scripts exchange a short-lived Admin access token via Shopify’s client-credentials endpoint (same pattern as `scripts/test-shopify-connection.mjs`).

### Admin API scopes

At minimum, the custom app needs permissions to create/update products and media. For the optional automatic **publish to all publications** step:

- `read_products`, `write_products`
- `read_publications`, `write_publications` (if you want the script to publish; otherwise it logs a warning and you publish manually in Admin)

### Local files

- **`public/images/...`** must exist for paths referenced in **`app/data/image-manifest.json`**. Missing files are skipped (no crash).

---

## Script 1: `sync-catalog-to-shopify.mjs` — main store products

**Source:** `app/data/all-products.json`  
**Shopify handle:** each product’s **`slug`** (must match your storefront URLs, e.g. `/products/:handle`).

### What it creates

- One Shopify **product** per JSON row.
- **Single variant** with option `Title` → `Default Title` (same pattern as early catalog sync).
- **Price** parsed from `price_from` / `price` (first numeric amount found).
- **Tags / product type** from `categories`.
- **Description** from `main_description` or `tagline` (truncated for API limits).

### Images (two channels)

1. **CDN (HTTPS)** — Up to **5** URLs from `all-products.json` → `images` (`https://` only). Used when the run does **not** attach staged extras for that product (see below).
2. **Local extras** — From **`image-manifest.json` → `products[slug]`**. Paths are like `/images/{slug}/01_....png` and are resolved under **`public/`**.  
   - The **first** manifest image is **skipped** (treated as the same “hero” as the CDN primary, to avoid duplicate media).  
   - Up to **4** additional existing files are **stage-uploaded** via Admin **`stagedUploadsCreate`**, then referenced in **`productSet`** as `files`.

**Re-run behavior:** When a product has local extras to upload, the script passes **only** the new staged `resourceUrl`s into `productSet` for that iteration so it does **not** re-send every CDN URL again (avoids duplicating the primary image on updates). A **first-time** run with no staged files uses CDN URLs only.

### GraphQL

- **`productSet`** (`synchronous: true`) with `identifier: { handle }` for upsert.
- **`stagedUploadsCreate`** + multipart `POST` to Shopify’s staging URL per file batch.
- Optionally **`publications`** + **`publishablePublish`** if scopes allow.

### CLI flags

| Flag | Effect |
|------|--------|
| `--dry-run` | Parse and log only; no Admin calls |
| `--limit N` | Process only the first **N** products |
| `--skip-publish` | Skip publication step |
| `--delay MS` | Sleep **MS** ms between products after each completes (default **300**) |

---

## Script 2: `sync-shades-to-shopify.mjs` — nail polish shades

**Sources:**

- All **`app/data/color_mapping_*.json`** files (`shade_details`: name, color group, HTTPS `image`).
- **`app/data/shade_colors.json`** — hex / RGB per shade name.
- **`app/data/image-manifest.json` → `shades`** — local gallery paths under **`public/images/shades/`**.

### Aggregation and deduplication

- Shades are merged across mapping files; **tags** include color groups and originating collection slugs (`product_slug`).
- Entries that share the same **leading shade number** (e.g. spelling variants) are **merged** so you get one Shopify product per shade number.

### What it creates

- **Handle:** `mavala-shade-{normalized-name}` (from shade name, e.g. `1 ANKARA` → `mavala-shade-1-ankara`).
- **Title:** `Mavala {number} {Rest Of Name}` (title-cased).
- **Product type:** `Nail Polish`.
- **Single variant** — **5ml mini** at **$9.95** (default `Title` option; no 10ml).

### Images (one product, one media gallery)

Order is tuned so the **bottle / product** shot is the **featured** image (Shopify uses the first media):

1. **Positions 1–3:** Local **`01`**, **`02`**, **`03`** from `image-manifest.json` → `public/images/shades/…` (**stage-uploaded**). `01` is the hero; the flat CDN swatch from `color_mapping` is **not** first.
2. **Optional last:** If fewer than three local files exist, the HTTPS swatch is appended as **“color swatch”** so the gallery can still reach three assets.

If there are **no** local files, the script falls back to the CDN image only.

**Tags:** The slug `10ml-bottles` from some `color_mapping_*` files is **not** applied (only 5ml mini is sold); **`5ml-mini`** is added for filtering.

**Re-sync note:** Each run sends the full `files` list again; Shopify may **append** duplicate media if the same URLs/resources are re-sent. If duplicates appear after multiple runs, remove extras once in Admin or adjust the script to use a media-replace flow later.

### CLI flags

Same as catalog script: `--dry-run`, `--limit N`, `--skip-publish`, `--delay MS`.

---

## Operational notes

### Order of runs

Order does not matter for Shopify; both scripts only touch products whose handles they define. **Catalog** uses **slugs**; **shades** use **`mavala-shade-*`**, so they do not collide.

### Storefront visibility

Creating/updating products in Admin does **not** automatically make them visible on the **Storefront API** until they are **published** to the right sales channels. If `read_publications` / `write_publications` are missing, the scripts still create products but you must **publish** in Shopify Admin (or add scopes and re-run).

### Duration

Full runs can take **many minutes** because of:

- Per-product **`productSet`**
- **Two or more** `stagedUploadsCreate` + upload rounds per item when extras exist

Use **`--delay 500`** (or higher) if you see throttling or HTTP errors.

### Verification

```bash
npm run test:shopify
```

Confirms Storefront + Admin connectivity; product counts in Admin should increase after syncs.

---

## Related documentation

- [SHOPIFY-INTEGRATION.md](./SHOPIFY-INTEGRATION.md) — Phase 1 & 2 storefront, cart, env vars, scopes for checkout.
- Shopify: [Admin GraphQL `productSet`](https://shopify.dev/docs/api/admin-graphql/latest/mutations/productSet), [staged uploads](https://shopify.dev/docs/api/admin-graphql/latest/mutations/stageduploadscreate).
