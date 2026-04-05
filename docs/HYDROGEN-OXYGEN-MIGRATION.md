# Hydrogen / Oxygen migration plan (living document)

**Active migration workspace:** All Hydrogen/Oxygen implementation work happens in **`mavala-hydrogen-oxygen`** (local path + [GitHub `JawdatEissa/mavala-hydrogen-oxygen`](https://github.com/JawdatEissa/mavala-hydrogen-oxygen)). **Production on Vercel** remains **`mavala-hydrogen`** until an explicit cutover.

**Purpose:** Plan a possible move from the current **Remix (Vite) on Vercel** storefront to **Shopify’s official Hydrogen stack on Oxygen**, **without** compromising today’s production path on Vercel if the migration fails or stalls.

**Principles**

1. **`mavala-hydrogen` on `main` (or your default branch)** stays the **source of truth** for what ships on Vercel until a deliberate cutover.
2. **No requirement** to change this repo’s application code **for planning**; migration work happens in a **separate clone/fork/branch/repo** connected to Oxygen (see [Git and repository strategy](#git-and-repository-strategy)).
3. This file is a **living document**: every working session should **append** to the [Revision log](#revision-log) and **update** checklists / decisions / blockers—not replace history silently.

---

## Current state (context for any reader)

| Area | Vercel production (`mavala-hydrogen`) | Oxygen migration repo (`mavala-hydrogen-oxygen`) |
|------|--------------------------------------|--------------------------------------------------|
| Framework | Remix + TypeScript + Vite | Branch **`hydrogen-scaffold`**: Hydrogen **2026.1.x** + React Router 7 + `shopify hydrogen build`. Branch **`main`**: may still be the pre-migration Remix snapshot until merge. |
| Hosting | Vercel | Target **Oxygen** (GitHub CD when connected) |
| Shopify APIs | Storefront, Admin, Customer Account (OAuth) | Same; Hydrogen uses template Storefront + Customer Account routes under `/account/*` |
| Cart / checkout | Remix cart routes | Hydrogen `/cart` + template checkout redirect |
| Auth | `/auth/customer/callback` | Hydrogen **`/account/authorize`** (register **both** URLs in Customer Account API during parallel run) |
| Deep reference | Vercel repo: `mavala-hydrogen/docs/SHOPIFY-INTEGRATION.md` | [SHOPIFY-INTEGRATION.md](./SHOPIFY-INTEGRATION.md), [OXYGEN-HYDROGEN-PORT.md](./OXYGEN-HYDROGEN-PORT.md) |

---

## Target state (if migration completes)

| Area | Target |
|------|--------|
| Framework | Official **Hydrogen** patterns + packages as required by current Shopify docs / Oxygen |
| Hosting | **Oxygen** (deployments from GitHub or manual upload per Shopify UI) |
| Store connection | Hydrogen storefront in **Sales channels → Hydrogen**; ensure products/publications align with that channel |
| Env / OAuth | Same conceptual secrets; **`PUBLIC_APP_URL` (or Hydrogen equivalent)** must match **Oxygen** hostname until custom domain; add **additional** OAuth redirect URLs during parallel run—do **not** remove Vercel URLs until cutover |

---

## Shopify Admin: “Create storefront” and deployment options

From **Sales channels → Hydrogen → Create storefront**:

- **“Set up GitHub continuous deployment now”** — Connects a repo so pushes deploy to **Oxygen**. Best when the **connected repo** is the one you intend to be the Hydrogen app (often **not** the same default branch as Vercel production until you’re ready).
- **“Set up CI/CD or manual deployments later”** — Lets you **create the Hydrogen storefront record** without binding GitHub immediately. You can connect Git later or use whatever manual flow Shopify documents at that time.

**Effect on Vercel:** Creating a Hydrogen storefront or connecting GitHub **does not** automatically disable Vercel or remove Headless tokens. Risk appears at **cutover** (DNS, OAuth URLs only pointing to Oxygen, removing old deployments).

---

## Git and repository strategy

### Do you need a **new** Git repo?

**No, not strictly.** You have three common patterns:

| Approach | Pros | Cons |
|----------|------|------|
| **A. New remote / new GitHub repo** (copy or fork `mavala-hydrogen`) | Clearest separation; Oxygen webhooks only touch migration repo; **zero** risk to original repo settings | Two repos to keep in sync manually or via cherry-pick until cutover |
| **B. Same repo, long-lived branch** (e.g. `oxygen-hydrogen`) | Single history; easy to compare `main` vs branch | Easy to misconfigure GitHub → Oxygen if it tracks `main` by mistake; merge pressure |
| **C. Same repo, `main` + feature branches** | Standard Git flow | Same misconfiguration risk as B if Oxygen deploys `main` too early |

**Recommendation for your stated goal (“don’t change code here; need Vercel if migration fails”):**

- **Preferred:** **New GitHub repository** (or **fork**) created from a **snapshot** of `mavala-hydrogen`, used **only** for Hydrogen/Oxygen work until production cutover. Keep the **original** repo as the **Vercel** deployment source indefinitely until you explicitly switch.
- **Alternative:** Same repo, branch **`oxygen-migration`**, and in Shopify/Oxygen settings ensure deployments track **only that branch**—never `main` until cutover.

### Should you “copy files to a different folder” locally?

- **Yes, if** you use a **new repo**: clone empty repo (or `git clone` fork) and copy tree, or `git remote add` and push branch—your choice.
- **No need for a second folder** if you use **only a branch** in the same clone—but then discipline on Oxygen’s tracked branch is critical.

### “Start fresh” vs “incremental port”

- **Start fresh** from Shopify’s current Hydrogen template in the **migration repo**, then **port routes/features** one by one from `mavala-hydrogen` (often faster to get Oxygen greenfield, slower to reach feature parity).
- **Incremental** refactor of existing Remix app toward Hydrogen APIs in the **migration repo** (heavier upfront, fewer “two apps” mental models).

**Decision (fill in):**

- [x] Chosen strategy: **separate sibling folder + new Git history** — not a GitHub “fork” button (that would still tie to upstream PR flow); a **local clone → delete `.git` → `git init`** so Oxygen can use a **clean remote** without touching the Vercel repo’s remotes or `main`.
- [x] Template approach: **Target Oxygen on official Hydrogen stack (React Router 7 + `shopify hydrogen build`)** — implemented on branch **`hydrogen-scaffold`** (2026-04-04); see [OXYGEN-HYDROGEN-PORT.md](./OXYGEN-HYDROGEN-PORT.md).

---

## Oxygen workspace (local) — created 2026-04-04

**Vercel / production repo (unchanged):**

- Path: `Mavala_Project/mavala-hydrogen/`
- Same `origin`, same deployments — **no application code was modified** for this setup; only this doc was updated.

**Oxygen-only repo (new):**

- Path: `Mavala_Project/mavala-hydrogen-oxygen/`
- **GitHub:** [`https://github.com/JawdatEissa/mavala-hydrogen-oxygen`](https://github.com/JawdatEissa/mavala-hydrogen-oxygen) — **`origin`** set, branch **`main`** pushed (2026-04-04). First push size ~**916 MiB** (large tracked assets in tree; consider pruning or Git LFS later if clones/deploys get slow).
- **New** `.git` history: snapshot from `mavala-hydrogen` at clone time; **not** the same repo as Vercel.
- **Removed** from working tree setup: clone’s old `.git`, **`.vercel`** folder.
- **Added:** `OXYGEN-REPOSITORY.md` (root) — rules + remote instructions.
- **`.gitignore`:** `.claude/` ignored; `.claude` commit removed in oxygen repo only.

**Next — Shopify Admin (step-by-step):** [OXYGEN-SHOPIFY-ADMIN.md](./OXYGEN-SHOPIFY-ADMIN.md)

1. **Hydrogen → Connect GitHub** → select **`JawdatEissa/mavala-hydrogen-oxygen`**, deployment branch **`hydrogen-scaffold`** (recommended until merge) or **`main`** after Hydrogen is merged.
2. After first Oxygen deploy, paste preview URL into Phase 0 below and add **Customer Account API** redirect + JS origin for that host (**keep** Vercel URLs until cutover).

**Build note (2026-04-04):** Branch **`hydrogen-scaffold`** runs **`shopify hydrogen build`**; `npx shopify hydrogen check routes` passes; **`npm run build`** verified locally. Remix-era **`.npmrc` `legacy-peer-deps`** was removed on that branch (no longer required). Merge to **`main`** when ready, then point Oxygen CD at **`main`**.

**Syncing planning docs:** After editing this file under `mavala-hydrogen/docs/`, copy to the oxygen repo if you want both copies aligned:

`copy mavala-hydrogen\docs\HYDROGEN-OXYGEN-MIGRATION.md mavala-hydrogen-oxygen\docs\`

---

## Phased execution plan (fill in dates & owners)

### Phase 0 — Preconditions (no customer impact)

- [x] Read [SHOPIFY-INTEGRATION.md](./SHOPIFY-INTEGRATION.md) auth + env sections; server `process.env` inventory → [Server-side environment variables](#server-side-environment-variables-app-and-scripts) below.
- [x] In Shopify Admin, **Hydrogen** sales channel: storefront **Mavala** created and CLI-linked (`C:\dev\mavala-h2-cli-helper`).
- [x] **GitHub:** repo [`JawdatEissa/mavala-hydrogen-oxygen`](https://github.com/JawdatEissa/mavala-hydrogen-oxygen), `main` pushed.
- [ ] **Connect GitHub** in Hydrogen admin to **that** repo (not the Vercel project repo) — *operator* ([OXYGEN-SHOPIFY-ADMIN.md](./OXYGEN-SHOPIFY-ADMIN.md) §1). *First Oxygen deploy was **CLI** (`hydrogen deploy` preview) from helper app, not GitHub CD.*
- [x] Document **Oxygen preview URL** (first deploy, Preview env): `https://01kndd5ytk6ycdfp567vhnp5aq-f6ac6655c2797ba22ee5.myshopify.dev` — then set `PUBLIC_APP_URL` + OAuth; see [OXYGEN-SHOPIFY-ADMIN.md](./OXYGEN-SHOPIFY-ADMIN.md) §2–3.
- [x] **Repo docs:** Operator runbooks added — [OXYGEN-SHOPIFY-ADMIN.md](./OXYGEN-SHOPIFY-ADMIN.md), [OXYGEN-SMOKE-TEST.md](./OXYGEN-SMOKE-TEST.md), [OXYGEN-HYDROGEN-PORT.md](./OXYGEN-HYDROGEN-PORT.md).

### Phase 1 — Parity baseline (staging only)

- [ ] Storefront: home, collection/product routes, cart, checkout redirect smoke test on Oxygen — checklist [OXYGEN-SMOKE-TEST.md](./OXYGEN-SMOKE-TEST.md). *(Hydrogen template provides these on `hydrogen-scaffold`; smoke test still pending a linked deploy.)*
- [ ] Customer Account OAuth: add **Hydrogen** redirect (`/account/authorize`) + JS origin for Oxygen preview; **keep** Vercel Remix URLs — [OXYGEN-SHOPIFY-ADMIN.md](./OXYGEN-SHOPIFY-ADMIN.md) §3.
- [ ] Match **Storefront API version**, tokens, and scopes to Headless channel requirements.
- [x] Partial: **PDP** uses Storefront when available; **bundled JSON fallback** for handles in `app/data/products/all_products_new.json` when Storefront returns no product (`app/lib/scraped-products.server.js`).
- [x] Partial: **Home** title + **header** Mavala logo (`/brand/mavala-switzerland-logotype.webp`); collections/cart/account use Hydrogen defaults until further porting.
- [ ] List **routes not yet ported** (e.g. `/color`, `/join`, `/api/chat`, diagnosis, blog): attach to Phase 2+.

### Phase 2 — Feature port (iterative)

Use a table:

| Feature / route | Source file(s) in Remix app | Status | Notes |
|-----------------|------------------------------|--------|--------|
| Home / featured | `app/routes/_index.tsx` | partial | Hydrogen `_index.jsx` + Mavala meta title |
| Header / nav | `app/components/Header.tsx` | partial | Logo + Shopify menu (Hydrogen) |
| PDP + JSON fallback | `app/routes/products.$handle.tsx` | partial | Hydrogen PDP + `scraped-products.server.js` |
| Collections / cart / account | Hydrogen template | baseline | Standard Hydrogen routes |
| Chat | `app/routes/api.chat.tsx` | not started | |
| Color / join / diagnosis / blog | various `app/routes/*.tsx` | not started | |

### Phase 3 — Production readiness

- [ ] **Performance** (TTFB, edge regions if applicable).
- [ ] **SEO:** canonical base URL = final `PUBLIC_APP_URL`; sitemap/robots if adopted.
- [ ] **Security:** secrets only server-side; no token leak in client bundles.
- [ ] **Runbook:** rollback = repoint DNS + OAuth back to Vercel.

### Phase 4 — Cutover (explicit go/no-go)

- [ ] **DNS:** `mavala.ca` → Oxygen (or Shopify’s documented pattern).
- [ ] **Shopify Customer Account API:** redirect + origin → **only** production storefront URL (post-verify).
- [ ] **Vercel:** keep deployment as **warm standby** or scale to zero per policy.
- [ ] **Communication:** internal + any stakeholder note.

---

## Environment variables parity checklist

Copy from [`.env.example`](../.env.example) and mark each as **required on Oxygen**, **Vercel only**, or **both** during parallel run:

| Variable | Vercel prod | Oxygen staging | Oxygen prod | Notes |
|----------|-------------|----------------|-------------|--------|
| `PUBLIC_APP_URL` | ✓ | ✓ (preview URL) | ✓ | Must match OAuth redirect + JS origin for that host |
| `PUBLIC_STORE_DOMAIN` | ✓ | ✓ | ✓ | Often `.myshopify.com` until primary domain verified |
| `PUBLIC_STOREFRONT_API_VERSION` | ✓ | ✓ | ✓ | Align Headless token + Admin version fallback |
| `PUBLIC_STOREFRONT_API_TOKEN` | ✓ | ✓ | ✓ | Server-side; code may prefer private token |
| `PRIVATE_STOREFRONT_API_TOKEN` | ✓ | ✓ | ✓ | Preferred for Storefront server calls |
| `SHOPIFY_CLIENT_ID` | ✓ | ✓ | ✓ | Dev Dashboard Admin client credentials |
| `SHOPIFY_CLIENT_SECRET` | ✓ | ✓ | ✓ | |
| `SHOPIFY_STORE_DOMAIN` | ✓ | optional | optional | Admin fallback if differs from `PUBLIC_STORE_DOMAIN` |
| `SHOPIFY_API_VERSION` | ✓ | optional | optional | Defaults to Storefront version in code |
| `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` | ✓ | ✓ | ✓ | Customer Account API |
| `CUSTOMER_ACCOUNT_API_CLIENT_SECRET` | ✓ | ✓ | ✓ | Alias `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET` supported in code |
| `SESSION_SECRET` | ✓ | ✓ | ✓ | Cookies: session, OAuth pending, anon chat |
| `OPENAI_API_KEY` | ✓ | if chat | if chat | `/api/chat` |
| `SUPABASE_URL` | ✓ | if chat | if chat | |
| `SUPABASE_ANON_KEY` | ✓ | if chat | if chat | |
| `SUPABASE_SERVICE_ROLE` | ✓ | if chat / ingest | if chat / ingest | |
| `MAVALA_AUTH_DEV_BYPASS` | dev only | omit | omit | Never production |
| `NODE_ENV` | auto | auto | auto | Set by host |

### Server-side environment variables (`app/` and scripts)

References in **`app/`** (loaders, `*.server.ts`, routes):

| Variable | Where used (representative) |
|----------|----------------------------|
| `PUBLIC_STORE_DOMAIN` | `root.tsx`, `login.tsx`, `shopify-storefront.server.ts`, `shopify-admin.server.ts`, `shopify-customer-account.server.ts` |
| `PUBLIC_STOREFRONT_API_VERSION` | `shopify-storefront.server.ts`, `shopify-admin.server.ts` |
| `PRIVATE_STOREFRONT_API_TOKEN` / `PUBLIC_STOREFRONT_API_TOKEN` | `shopify-storefront.server.ts` |
| `SHOPIFY_STORE_DOMAIN` | `shopify-admin.server.ts` |
| `SHOPIFY_API_VERSION` | `shopify-admin.server.ts` |
| `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` | `shopify-admin.server.ts` |
| `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` | `shopify-customer-account.server.ts` |
| `CUSTOMER_ACCOUNT_API_CLIENT_SECRET`, `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET` | `shopify-customer-account.server.ts` |
| `PUBLIC_APP_URL` | `shopify-customer-account.server.ts` |
| `SESSION_SECRET` | `customer-account-session.server.ts`, `chat-anon-cookie.server.ts` |
| `SUPABASE_*` | `supabase.server.ts` |
| `OPENAI_API_KEY` | `openai.server.ts` |
| `MAVALA_AUTH_DEV_BYPASS` | `auth.server.ts` |
| `NODE_ENV` | cookies, `api.chat.tsx` |

**Scripts** under `scripts/*.mjs`, `scripts/ingest-content.ts` also use the Shopify and Supabase variables above for tooling (sync, verify, ingest).

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Oxygen deploy tracks wrong branch | Use **dedicated repo** or **named branch**; verify in Shopify UI |
| OAuth breaks during experiment | **Add** URLs, never **replace** until cutover |
| Product not visible on Hydrogen channel | Publications / sales channel assignment in Admin |
| Long migration | Keep Vercel **production**; use Oxygen **only** for staging until parity |
| Oxygen build fails on push | Ensure CD tracks **`hydrogen-scaffold`** (or merged `main` with Hydrogen). See [OXYGEN-HYDROGEN-PORT.md](./OXYGEN-HYDROGEN-PORT.md) |

---

## Open questions (2026-04-04)

- **Operator:** Register **Hydrogen** Customer Account redirect **`{oxygen_origin}/account/authorize`** (and JS origin); **keep** Vercel **`/auth/customer/callback`** — [OXYGEN-SHOPIFY-ADMIN.md](./OXYGEN-SHOPIFY-ADMIN.md) §3.
- **CLI:** Run **`npm run shopify:link`** then **`npm run shopify:env`** from **`mavala-hydrogen-oxygen`** on branch **`hydrogen-scaffold`** (interactive; cannot run in CI).
- **GitHub → Oxygen:** Connect repo and set deployment branch to **`hydrogen-scaffold`** until merge to `main`.

---

## Revision log (append only)

| Date (UTC) | Author / session | Change summary |
|------------|------------------|----------------|
| 2026-04-04 | Initial | Created living doc scaffold, repo strategy, phases, continuation prompt appendix |
| 2026-04-04 | Cursor | Created sibling `mavala-hydrogen-oxygen/` with new `git init` + 2 commits; added `OXYGEN-REPOSITORY.md`; untracked `.claude`; documented GitHub push + Shopify connect; **no code changes** in `mavala-hydrogen/` except this doc |
| 2026-04-04 | Jawdat | Pushed `main` to `https://github.com/JawdatEissa/mavala-hydrogen-oxygen.git` (~916 MiB); doc updated with active workspace + Phase 0 checklist |
| 2026-04-04 | Cursor session | Phase 0 runbooks: [OXYGEN-SHOPIFY-ADMIN.md](./OXYGEN-SHOPIFY-ADMIN.md), [OXYGEN-SMOKE-TEST.md](./OXYGEN-SMOKE-TEST.md), [OXYGEN-HYDROGEN-PORT.md](./OXYGEN-HYDROGEN-PORT.md); expanded env parity + `process.env` inventory; template decision (Hydrogen RR7 target); `.npmrc` `legacy-peer-deps`; verified `npm run build`. Shopify Admin connect + preview URL + OAuth additions remain **operator** steps. |
| 2026-04-04 | Cursor session | Added [HYDROGEN-CLI-LOGIN-AND-LINK.md](./HYDROGEN-CLI-LOGIN-AND-LINK.md) — Step 1 detail: `hydrogen login` + `hydrogen link --storefront "Mavala"` via a small **Hydrogen helper** folder (`--path`); Remix repo cannot run these commands until Hydrogen migration. |
| 2026-04-04 | Operator / session | First **Oxygen Preview** deploy from `C:\dev\mavala-h2-cli-helper` via `shopify hydrogen deploy` (Preview). Preview URL recorded in Phase 0. `hydrogen env pull` applied to helper `.env`. |
| 2026-04-04 | Cursor session | Added [PLANNING-PROMPT-HYDROGEN-MIGRATION.md](./PLANNING-PROMPT-HYDROGEN-MIGRATION.md) — full context + copy-paste continuation prompt, file index, Shopify MCP workflow (`learn_shopify_api` → `search_docs_chunks` / `fetch_full_docs`). |
| 2026-04-04 | Cursor session | Branch **`hydrogen-scaffold`**: replaced Remix app root with Shopify Hydrogen **2026.1.3** quickstart; `shopify hydrogen build` + `hydrogen check routes` green; removed `postcss.config.js` (tailwind) and root `tsconfig.json`; dropped `.npmrc` legacy-peer-deps on this branch. Mavala: header logo, home meta, PDP JSON fallback via `app/lib/scraped-products.server.js`. Updated `.env.example`, [OXYGEN-SHOPIFY-ADMIN.md](./OXYGEN-SHOPIFY-ADMIN.md) §3–4, [OXYGEN-HYDROGEN-PORT.md](./OXYGEN-HYDROGEN-PORT.md), [OXYGEN-REPOSITORY.md](../OXYGEN-REPOSITORY.md). `shopify hydrogen link` documented as interactive (`npm run shopify:link`). |

---

## Appendix A — Link to related docs

- [SHOPIFY-INTEGRATION.md](./SHOPIFY-INTEGRATION.md)
- [FUTURE-VERCEL-TO-HYDROGEN-MIGRATION.md](./FUTURE-VERCEL-TO-HYDROGEN-MIGRATION.md)
- [OXYGEN-SHOPIFY-ADMIN.md](./OXYGEN-SHOPIFY-ADMIN.md) — Hydrogen connect, Oxygen env, OAuth (parallel with Vercel)
- [OXYGEN-SMOKE-TEST.md](./OXYGEN-SMOKE-TEST.md) — Post-deploy checks
- [OXYGEN-HYDROGEN-PORT.md](./OXYGEN-HYDROGEN-PORT.md) — Remix vs Hydrogen build path
- [HYDROGEN-CLI-LOGIN-AND-LINK.md](./HYDROGEN-CLI-LOGIN-AND-LINK.md) — CLI `login` + `link` (helper-folder workaround for Remix)
- [PLANNING-PROMPT-HYDROGEN-MIGRATION.md](./PLANNING-PROMPT-HYDROGEN-MIGRATION.md) — **Full continuation prompt** for new Cursor chats + Shopify MCP usage

---

## Appendix B — Continuation prompt for Cursor (copy everything below the line into a new chat)

---

**CURSOR TASK — Hydrogen/Oxygen migration (living doc + optional code in oxygen repo)**

**Context — two workspaces**

1. **`mavala-hydrogen`** — **Production / Vercel** Remix storefront. Do **not** treat as the default folder for Oxygen migration **implementation** unless the user explicitly says so. Planning doc may be edited here: `docs/HYDROGEN-OXYGEN-MIGRATION.md`.
2. **`mavala-hydrogen-oxygen`** — **Default workspace for migration work.** GitHub: [`https://github.com/JawdatEissa/mavala-hydrogen-oxygen`](https://github.com/JawdatEissa/mavala-hydrogen-oxygen). **Hydrogen implementation:** branch **`hydrogen-scaffold`** (merge to **`main`** when ready). Shopify Hydrogen admin should connect to **this** repo. Copy of plan: `mavala-hydrogen-oxygen/docs/HYDROGEN-OXYGEN-MIGRATION.md` — keep in sync with `mavala-hydrogen/docs/` when you edit.

- Production stays on **Vercel** until explicit DNS/OAuth cutover. Add **extra** Customer Account API redirect URLs for Oxygen preview; do **not** remove Vercel URLs until go-live.
- **Living document:** **`docs/HYDROGEN-OXYGEN-MIGRATION.md`** (either repo). **Append** revision-log rows only; update Phase 0–4 checklists.

**Your job this session**

1. Open **`mavala-hydrogen/docs/HYDROGEN-OXYGEN-MIGRATION.md`** (and/or **`mavala-hydrogen-oxygen/docs/HYDROGEN-OXYGEN-MIGRATION.md`**) end-to-end.
2. Read **`mavala-hydrogen/docs/SHOPIFY-INTEGRATION.md`** for OAuth, env, cart, checkout.
3. **Implementation** (if asked): work in **`mavala-hydrogen-oxygen/`** by default; never change **`mavala-hydrogen/`** unless the user orders a backport or Vercel fix.
4. If the user gave new facts (Oxygen preview URL, Shopify connect done, env on Oxygen, blockers), **merge** into:
   - [Git and repository strategy](#git-and-repository-strategy) — **Decision** checkboxes and narrative.
   - [Phased execution plan](#phased-execution-plan) — checkboxes and dates.
   - [Environment variables parity checklist](#environment-variables-parity-checklist).
   - [Feature port table](#phase-2--feature-port-iterative) — add rows for routes/components from `app/` as needed.
5. **Append** one row to **[Revision log](#revision-log)** with today’s date (use user_info “Today’s date” if available), short summary of edits, and “session” as the editor.
6. If the user asks for a **risk review** or **go/no-go**, add a short subsection under **Risks** or Phase 4 with dated notes—do not remove old notes.
7. **Code changes:** only when the user asks — default target repo **`mavala-hydrogen-oxygen`**. For **doc-only** sessions, do not touch `app/` in either repo unless requested.

**Style**

- Prefer tables and checklists. Be explicit about **Vercel vs Oxygen** and **OAuth URL** implications.
- When unsure, add a **“Open questions”** bullet list at the bottom of the doc (dated) instead of guessing.

**Deliverable**

- Updated **`HYDROGEN-OXYGEN-MIGRATION.md`** with revision log entry and any filled decisions.

---

*End of continuation prompt*
