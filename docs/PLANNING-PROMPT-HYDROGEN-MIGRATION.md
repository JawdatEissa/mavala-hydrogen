# Full planning prompt — Mavala Remix (Vercel) → Hydrogen (Oxygen)

**Use this document in two ways:** (1) read it as the project brief, or (2) copy everything under the horizontal rule into a **new Cursor chat** so the agent has full context.

---

## COPY BELOW THIS LINE INTO A NEW CHAT

---

### Role

You are helping migrate the **Mavala** custom storefront from **Remix + Vite on Vercel** to **Shopify Hydrogen on Oxygen**, without breaking **production on Vercel** until an explicit cutover.

### Two repositories (do not confuse)

| Repo | Role | Default for implementation? |
|------|------|------------------------------|
| **`mavala-hydrogen`** | Production on **Vercel** until DNS/OAuth cutover | **No** — do not use as default for Oxygen work unless the user says so. |
| **`mavala-hydrogen-oxygen`** | Migration / Oxygen target | **Yes** — all Hydrogen migration **code** edits go here. |

- **GitHub (oxygen):** `https://github.com/JawdatEissa/mavala-hydrogen-oxygen` branch **`main`** (~916 MB; large assets).
- **Local paths (typical):** `Mavala_Project/mavala-hydrogen` and `Mavala_Project/mavala-hydrogen-oxygen`.

### What is already achieved (as of 2026-04-04)

1. **Separate oxygen repo** with its own Git history; Vercel repo untouched for app code.
2. **Living migration plan** + runbooks in `mavala-hydrogen-oxygen/docs/` (and synced copies under `mavala-hydrogen/docs/` where noted).
3. **Hydrogen storefront “Mavala”** in Shopify Admin (**Sales channels → Hydrogen**), created with **“CI/CD later”** (GitHub not connected to oxygen repo yet due to earlier identity friction).
4. **CLI helper project** on disk (not in Mavala monorepo): **`C:\dev\mavala-h2-cli-helper`** — official **`npm create @shopify/hydrogen@latest`** quickstart, used only so Shopify CLI accepts commands.
5. **`shopify hydrogen login`** + **`shopify hydrogen link --storefront "Mavala"`** completed from that helper; **`shopify hydrogen env pull`** applied to helper `.env`.
6. **First Oxygen Preview deploy** via **`npx shopify hydrogen deploy --path .`** (Preview env). Example preview host used: **`https://01kndd5ytk6ycdfp567vhnp5aq-f6ac6655c2797ba22ee5.myshopify.dev`** — **redeploys may change this hostname**; always read the latest URL from CLI output or **Hydrogen → Oxygen deployments**.
7. **Shopify-supplied read-only env vars** visible in Admin for the Hydrogen storefront (e.g. `PRIVATE_STOREFRONT_API_TOKEN`, `PUBLIC_STOREFRONT_*`, `PUBLIC_CUSTOMER_ACCOUNT_API_*`, `SHOP_ID`, etc.); custom **`SESSION_SECRET`** in Preview/Production as appropriate.
8. **Customer Account API — Application setup** configured for the **preview** host: **Javascript origin** = preview origin only; **Callback URI** = `{preview_origin}/account/authorize` (Hydrogen template path, **not** Remix’s `/auth/customer/callback`); **Logout URI** = `{preview_origin}/`. **Vercel / production** OAuth entries must stay until cutover — **add**, do not replace.
9. **Sign in / sign out verified** on the Oxygen preview storefront (template shows live Mavala catalog).

### What is explicitly not done yet

- **`mavala-hydrogen-oxygen` is still Remix 2** (`remix vite:build`), **not** `shopify hydrogen build` — **GitHub → Oxygen CD** for that repo will fail until the Hydrogen port.
- **Hydrogen Admin → Connect GitHub** to **`JawdatEissa/mavala-hydrogen-oxygen`** still **pending** (optional until repo builds as Hydrogen + GitHub identity resolved).
- **Feature parity**: routes like `/color`, `/join`, `/api/chat`, diagnosis, blog, etc. are **not** on the Hydrogen template; they live in the Remix app under `mavala-hydrogen-oxygen/app/routes/`.
- **Cutover**: DNS, single OAuth set, Vercel standby — **Phase 4**, not started.

### Files and docs you must read or keep updated

| File | Purpose |
|------|---------|
| [`mavala-hydrogen-oxygen/docs/HYDROGEN-OXYGEN-MIGRATION.md`](./HYDROGEN-OXYGEN-MIGRATION.md) | **Living plan** — update checklists; **append only** to [Revision log](./HYDROGEN-OXYGEN-MIGRATION.md#revision-log-append-only). |
| [`mavala-hydrogen/docs/HYDROGEN-OXYGEN-MIGRATION.md`](../mavala-hydrogen/docs/HYDROGEN-OXYGEN-MIGRATION.md) | **Sync** from oxygen copy after edits (or edit one and copy per doc instructions). |
| [`mavala-hydrogen/docs/SHOPIFY-INTEGRATION.md`](../mavala-hydrogen/docs/SHOPIFY-INTEGRATION.md) | Deep reference: Storefront, Admin, cart, **Customer Account OAuth** (Remix callback path). |
| [`mavala-hydrogen-oxygen/docs/OXYGEN-HYDROGEN-PORT.md`](./OXYGEN-HYDROGEN-PORT.md) | Remix vs Hydrogen (React Router 7) / why `shopify hydrogen check` fails on oxygen repo today. |
| [`mavala-hydrogen-oxygen/docs/OXYGEN-SHOPIFY-ADMIN.md`](./OXYGEN-SHOPIFY-ADMIN.md) | Admin: GitHub connect, env parity, OAuth parallel run. |
| [`mavala-hydrogen-oxygen/docs/OXYGEN-SMOKE-TEST.md`](./OXYGEN-SMOKE-TEST.md) | Post-deploy smoke checklist. |
| [`mavala-hydrogen-oxygen/docs/HYDROGEN-CLI-LOGIN-AND-LINK.md`](./HYDROGEN-CLI-LOGIN-AND-LINK.md) | CLI login/link + helper-folder workaround. |
| [`mavala-hydrogen-oxygen/.env.example`](../.env.example) | Env names for Remix app (parity when copying secrets). |
| [`mavala-hydrogen-oxygen/OXYGEN-REPOSITORY.md`](../OXYGEN-REPOSITORY.md) | Repo rules + doc index. |

### Implementation rules

- **Code changes:** **`mavala-hydrogen-oxygen/`** by default. **`mavala-hydrogen/`** only if the user asks for a Vercel fix or backport.
- **OAuth during parallel run:** Always **add** Oxygen/preview URLs; **never remove** Vercel until go-live.
- **Hydrogen vs Remix auth paths:** Hydrogen quickstart uses **`/account/authorize`**; Mavala Remix uses **`/auth/customer/callback`** — register **both** if one Customer Account client serves both surfaces.
- **`.npmrc`:** `legacy-peer-deps=true` in oxygen repo for Remix installs until migration removes the conflict.

### Shopify MCP (documentation) — use for migration questions

The workspace may expose the **Shopify plugin MCP** (`plugin-shopify-plugin-shopify-mcp`). When answering Hydrogen, Storefront, Customer Account, or Admin GraphQL migration questions:

1. **Always start with `learn_shopify_api`** (mandatory first call). Use **`api: "hydrogen"`** for Hydrogen/Oxygen storefront work. Re-call with other APIs as needed, e.g. **`storefront-graphql`**, **`customer`** (Customer Account API), **`admin`** — pass the returned **`conversationId`** on every follow-up tool call.
2. Include **`model`** on `learn_shopify_api` (use `'none'` if unknown).
3. Then use **`search_docs_chunks`** with the same **`conversationId`** and a concrete prompt (e.g. “migrate Remix to Hydrogen 2026”, “Oxygen environment variables”, “createCustomerAccountClient”).
4. Use **`fetch_full_docs`** for full pages when chunks are insufficient.
5. For GraphQL in code, **`validate_graphql_codeblocks`** can validate operations against the schema.

**Do not rely on generic web search** for Shopify migration truth when MCP docs are available; prefer MCP + `shopify.dev` via these tools.

### Suggested next milestones (for planning sessions)

1. **Architecture decision:** Fresh Hydrogen scaffold **inside** `mavala-hydrogen-oxygen` (new branch?) vs. subfolder vs. replace — align with `shopify hydrogen build` + Oxygen.
2. **Port order:** Core storefront (home, collections, PDP, cart, checkout redirect) → auth edge cases → `/join`, `/color`, chat (`/api/chat`), diagnosis, blog, etc.
3. **GitHub → Oxygen:** Connect repo after `hydrogen deploy` succeeds from CI or local for **that** tree.
4. **OAuth:** When a **new** Oxygen URL exists for the **ported** app, add callback + JS origin again; keep Vercel.
5. **Update living doc** after each milestone (revision log append + checklists).

### User’s shop context (non-secret identifiers only)

- Store / Hydrogen work has used shop domain pattern **`*.myshopify.com`** (e.g. `rqavgg-q8.myshopify.com` in CLI) — **do not treat as the Oxygen preview host**; preview URLs are **`*.myshopify.dev`** from deploy output.

---

## END OF COPY-PASTE BLOCK

---

### Maintenance

When this prompt or migration state changes, **append** a row to [HYDROGEN-OXYGEN-MIGRATION.md](./HYDROGEN-OXYGEN-MIGRATION.md) **Revision log** and link this file from **Appendix A** if not already listed. Sync `HYDROGEN-OXYGEN-MIGRATION.md` to `mavala-hydrogen/docs/`.
