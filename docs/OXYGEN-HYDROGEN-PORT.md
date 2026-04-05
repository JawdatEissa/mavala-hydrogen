# Remix → Hydrogen (Oxygen build) — technical note

## Current state (branch `hydrogen-scaffold`, 2026-04-04)

- `mavala-hydrogen-oxygen` on **`hydrogen-scaffold`** is **Shopify Hydrogen** with **React Router 7**, `@shopify/hydrogen` **2026.1.x**, and **`shopify hydrogen build`** (see root `package.json`, `server.js`, `vite.config.js`).
- `npx shopify hydrogen check routes` should report standard routes present.
- Branch **`main`** may still point at the historical **Remix 2** snapshot until merge.

## Historical note (pre-scaffold)

The tree originally matched **Remix 2** + Vite (`remix vite:build`). That layout could not satisfy `shopify hydrogen check` until the Hydrogen migration landed on `hydrogen-scaffold`.

## Target stack (Shopify template, 2026)

Official quickstart from `npm create @shopify/hydrogen@latest` uses:

- **React Router 7** (not Remix 2 package names)
- `@shopify/hydrogen` (calendar version e.g. `2026.1.x`)
- `@shopify/cli` — `shopify hydrogen build`, `shopify hydrogen dev`, `shopify hydrogen deploy`

## Next steps for parity

1. **GitHub → Oxygen:** connect the repo and track **`hydrogen-scaffold`** (or merge to `main` and track `main`).
2. **CLI:** from repo root, run `npm run shopify:link -- --storefront "Mavala"` (interactive) then `npm run shopify:env` — see [HYDROGEN-CLI-LOGIN-AND-LINK.md](./HYDROGEN-CLI-LOGIN-AND-LINK.md).
3. **Feature port:** reintroduce remaining Remix-only routes (`/color`, `/join`, `/api/chat`, diagnosis, blog, etc.) incrementally; PDP includes a **bundled JSON fallback** when Storefront has no product for the handle (`app/lib/scraped-products.server.js`).
4. **Secrets / OAuth:** keep **parallel** Customer Account redirect + JS origins for Vercel (Remix callback path) and Oxygen (Hydrogen `/account/authorize`) until cutover — [OXYGEN-SHOPIFY-ADMIN.md](./OXYGEN-SHOPIFY-ADMIN.md) §3.

## Local verification

- `npm install` then `npm run build`.
- Optional: `npm run dev` for Hydrogen dev server (requires env).
