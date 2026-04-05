# Step 1 — Shopify CLI: login + link storefront “Mavala”

Your **`mavala-hydrogen-oxygen`** app is still **Remix**, not a **Hydrogen** project. The Shopify CLI therefore refuses to run `hydrogen login`, `hydrogen link`, etc. **from that folder alone** (it shows “outside of a Hydrogen project”).

**Nobody else can log in for you** — `hydrogen login` uses your browser and your Shopify credentials. This doc is the full Step 1; you run the commands on your machine.

---

## Part A — One-time “CLI helper” Hydrogen folder (only for Shopify CLI)

You need **any** valid Hydrogen project directory so the CLI accepts `--path`. Easiest:

1. Pick a folder **outside** or **beside** your real app, e.g.  
   `C:\dev\mavala-h2-cli-helper` (do not replace `mavala-hydrogen-oxygen` with this).
2. In PowerShell:

```powershell
cd C:\dev
npm create @shopify/hydrogen@latest -- --quickstart --language typescript --path mavala-h2-cli-helper
cd .\mavala-h2-cli-helper
```

Wait for install to finish. This folder exists **only** so `shopify hydrogen *` commands work with `--path` to it.

---

## Part B — Log in to Shopify (you must do this)

Use the **same Shopify account** you use for **Admin** (the one that created the “Mavala” Hydrogen storefront). Replace `your-store` with your real shop handle or domain.

```powershell
cd C:\dev\mavala-h2-cli-helper
npx shopify hydrogen login --path . --shop your-store.myshopify.com
```

- A **browser** window (or URL) will appear — complete sign-in there.
- If your store uses **SSO**, use the same method you use for Admin.

If you already logged in earlier on this machine, the CLI may skip the browser; that is fine.

---

## Part C — Link this machine to storefront **“Mavala”**

Still inside the **helper** folder:

```powershell
npx shopify hydrogen link --path . --storefront "Mavala"
```

- If prompted, pick the correct shop / storefront.
- The CLI will write **link metadata** into this project (and may update **`.env`**). That ties **this folder** to the **Mavala** Hydrogen storefront in Admin.

**Important:** That **does not** turn `mavala-hydrogen-oxygen` into Hydrogen yet. It only links the **helper** project. For your real app you will either migrate it to Hydrogen or copy/link patterns later; see [OXYGEN-HYDROGEN-PORT.md](./OXYGEN-HYDROGEN-PORT.md).

---

## Part D — Pull environment variables (optional but useful)

From the **same helper** folder, after link:

```powershell
npx shopify hydrogen env pull --path .
```

Copy values you need into **`mavala-hydrogen-oxygen/.env.local`** (never commit secrets). Align names with [`.env.example`](../.env.example).

---

## Part E — What happens to `mavala-hydrogen-oxygen`?

- On branch **`hydrogen-scaffold`**, the repo **is** a Hydrogen project: run **`npm run shopify:link`** and **`npm run shopify:env`** from the repo root (same as any linked Hydrogen app).
- On **`main`** (if it still matches the old Remix snapshot), **`hydrogen link` from that folder may still fail** — use the **helper folder + `--path .`** workaround from Parts A–D, or check out **`hydrogen-scaffold`**.

---

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| “Outside of a Hydrogen project” | Always pass `--path` to the **helper** Hydrogen folder, or `cd` into it first. |
| Identity / email errors | Same Shopify login as Admin; same GitHub/email policy as when connecting GitHub in Admin. |
| Wrong storefront | Re-run `hydrogen link --path . --storefront "Mavala"` or use `hydrogen unlink` then link again (see `npx shopify hydrogen unlink --help`). |

Official reference: [Hydrogen CLI](https://shopify.dev/docs/api/shopify-cli/hydrogen).
