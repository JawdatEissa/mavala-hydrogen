# Vercel Deployment Guide - Mavala Hydrogen

This document explains the Vercel deployment configuration for the Mavala Hydrogen project, including the problems we encountered and how they were solved.

---

## Table of Contents
1. [The Problem](#the-problem)
2. [Root Cause Analysis](#root-cause-analysis)
3. [The Solution](#the-solution)
4. [File Structure](#file-structure)
5. [How to Edit in the Future](#how-to-edit-in-the-future)
6. [Troubleshooting](#troubleshooting)

---

## The Problem

### Initial Error
When deploying to Vercel, the build failed with this error:

```
Error: The Vercel Function "index" is 1.2gb which exceeds the maximum size limit of 300mb.
```

Later, after adding the Vercel preset:
```
Error: The Vercel Function "collections/:handle" is 1.2gb which exceeds the maximum size limit of 300mb.
```

### What Was Happening
- The `public/images` folder contains **4,306 image files** totaling **~1.3GB**
- Vercel's serverless functions have a **300MB size limit**
- All 1.3GB of images were being bundled INTO each serverless function instead of being served as static files

---

## Root Cause Analysis

### Issue 1: Missing Vercel Remix Preset
The original `vite.config.ts` did not include the `@vercel/remix` preset, which is required for proper Vercel deployment of Remix apps.

**Without the preset:** Vercel doesn't know how to properly separate static assets from serverless functions.

### Issue 2: Runtime Filesystem Scanning (THE MAIN CULPRIT)
The server code was using Node.js `fs` module to scan directories at runtime:

**In `app/lib/scraped-products.server.ts`:**
```typescript
// ❌ BAD - This caused Vercel's file tracing to bundle ALL images
import { readFileSync, existsSync, readdirSync } from 'fs';

const imageDirPath = join(process.cwd(), 'public', 'images', folder);
const files = readdirSync(imageDirPath);  // Scans public/images at runtime
```

**In `app/routes/products.$handle.tsx`:**
```typescript
// ❌ BAD - Also scanning the shades folder at runtime
const shadesDir = join(process.cwd(), 'public', 'images', 'shades');
const shadeFolders = readdirSync(shadesDir, { withFileTypes: true });
```

**Why This Matters:**
Vercel uses `@vercel/nft` (Node File Tracing) to determine what files each serverless function needs. When it sees `readdirSync('public/images')`, it thinks: *"This function might need ANY file in that directory"* and bundles ALL 1.3GB of images into the function.

### Issue 3: Products Data Not Deployed
The products data (`all_products_new.json`) was stored in `../scraped_data/` - a folder OUTSIDE the project directory. This worked locally but the file was never deployed to Vercel.

```typescript
// ❌ BAD - This file doesn't exist on Vercel
const jsonPath = join(process.cwd(), '..', 'scraped_data', 'all_products_new.json');
```

---

## The Solution

### Step 1: Install Vercel Remix Package

```bash
npm install @vercel/remix --legacy-peer-deps --save
```

### Step 2: Configure Vite with Vercel Preset

**File: `vite.config.ts`**
```typescript
import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import { vercelPreset } from '@vercel/remix/vite';  // ✅ ADD THIS
import path from 'path';

export default defineConfig({
  plugins: [
    remix({
      presets: [vercelPreset()],  // ✅ ADD THIS
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
      },
    }),
  ],
  // ... rest of config
});
```

### Step 3: Create Build-Time Image Manifest

Instead of scanning the filesystem at runtime, we generate a manifest of all images at BUILD TIME.

**File: `scripts/generate-image-manifest.mjs`**

This script:
1. Scans `public/images/` for all product image folders
2. Scans `public/images/shades/` for all shade image folders
3. Generates `app/data/image-manifest.json` with all image paths

**Run automatically via `package.json`:**
```json
{
  "scripts": {
    "prebuild": "node scripts/generate-image-manifest.mjs",
    "build": "npx remix vite:build"
  }
}
```

### Step 4: Update Server Code to Use Manifest

**File: `app/lib/scraped-products.server.ts`**

Before (BAD):
```typescript
import { readFileSync, existsSync, readdirSync } from 'fs';

function getLocalImages(slug: string): string[] {
  const imageDirPath = join(process.cwd(), 'public', 'images', folder);
  const files = readdirSync(imageDirPath);  // ❌ Runtime fs scan
  // ...
}
```

After (GOOD):
```typescript
// ✅ Import pre-generated manifest (no fs scanning)
import imageManifest from '~/data/image-manifest.json';

function getLocalImages(slug: string): string[] {
  // ✅ Just lookup in the manifest object
  const images = manifest.products[folder];
  return images || [];
}
```

### Step 5: Bundle Products Data

Copy `all_products_new.json` into the app so it gets deployed:

**Location:** `app/data/all-products.json`

**Import directly instead of reading from filesystem:**
```typescript
// ✅ GOOD - Bundled with the app
import allProductsData from '~/data/all-products.json';

export function loadScrapedProducts(): ScrapedProduct[] {
  return allProductsData as ScrapedProduct[];
}
```

### Step 6: Create vercel.json

**File: `vercel.json`**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "remix",
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "npm run build"
}
```

---

## File Structure

After the fix, the relevant files are:

```
mavala-hydrogen/
├── app/
│   ├── data/
│   │   ├── all-products.json          # Products data (bundled)
│   │   ├── image-manifest.json        # Generated image paths
│   │   └── shade_colors.json          # Shade color data
│   ├── lib/
│   │   └── scraped-products.server.ts # Uses manifest, no fs
│   └── routes/
│       └── products.$handle.tsx       # Uses manifest, no fs
├── public/
│   └── images/                        # 1.3GB of images (static only)
├── scripts/
│   └── generate-image-manifest.mjs    # Generates manifest at build time
├── package.json                       # Has "prebuild" script
├── vercel.json                        # Vercel configuration
└── vite.config.ts                     # Has vercelPreset()
```

---

## How to Edit in the Future

### Adding New Product Images

1. Add images to `public/images/{product-slug}/`
2. Run the manifest generator:
   ```bash
   node scripts/generate-image-manifest.mjs
   ```
3. Commit and push - the `prebuild` script runs automatically on Vercel

### Adding New Shade Images

1. Add images to `public/images/shades/{shade-name}/`
2. Run the manifest generator:
   ```bash
   node scripts/generate-image-manifest.mjs
   ```
3. Commit and push

### Updating Products Data

1. Update `app/data/all-products.json` with new product data
2. Commit and push

### Modifying the Manifest Generator

**File:** `scripts/generate-image-manifest.mjs`

The generator creates this structure:
```json
{
  "products": {
    "double-lash": ["/images/double-lash/01_Double-lash.png", ...],
    "mini-color": ["/images/mini-color/01_mini.png", ...]
  },
  "shades": {
    "9 LISBOA": ["/images/shades/9 LISBOA/01_bottle.png", ...],
    "22 GENEVE": ["/images/shades/22 GENEVE/01_bottle.png", ...]
  },
  "generated": "2026-01-05T..."
}
```

### Modifying Vercel Configuration

**File:** `vercel.json`

Current minimal config:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "remix",
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "npm run build"
}
```

**Optional additions:**
```json
{
  "functions": {
    "api/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Modifying Vite Config

**File:** `vite.config.ts`

The critical part is:
```typescript
import { vercelPreset } from '@vercel/remix/vite';

remix({
  presets: [vercelPreset()],  // DO NOT REMOVE
  // ...
})
```

---

## Troubleshooting

### Error: "Function exceeds 300MB limit"

**Cause:** Something is reading from the filesystem at runtime.

**Check:**
```bash
# Search for fs operations in app code
grep -r "readdirSync\|readFileSync\|existsSync" app/
```

**Solution:** Replace with imports from `image-manifest.json` or bundle the data.

### Error: "Cannot find module '~/data/image-manifest.json'"

**Cause:** Manifest wasn't generated.

**Solution:**
```bash
node scripts/generate-image-manifest.mjs
```

### Error: "No products found"

**Cause:** `all-products.json` is missing or empty.

**Solution:**
1. Ensure `app/data/all-products.json` exists
2. Copy from `../scraped_data/all_products_new.json` if needed:
   ```bash
   cp ../scraped_data/all_products_new.json app/data/all-products.json
   ```

### Images Not Showing

**Cause:** Image paths in manifest don't match actual files.

**Solution:**
1. Regenerate manifest: `node scripts/generate-image-manifest.mjs`
2. Check that images exist in `public/images/`

### Build Takes Too Long

**Cause:** Too many images being processed.

**Note:** The build copies all `public/` files to the static output. This is normal but can take time with 1.3GB of images.

---

## Key Takeaways

1. **Never use `fs.readdirSync()` or similar in Remix server code** - it causes Vercel to bundle everything it might access

2. **Always use the `vercelPreset()`** in `vite.config.ts` for Remix on Vercel

3. **Bundle data as JSON imports** instead of reading from filesystem

4. **Generate manifests at build time** for directory listings

5. **Static files in `public/`** are served separately from serverless functions - they don't count toward the 300MB limit

---

## Summary of Changes Made

| File | Change |
|------|--------|
| `vite.config.ts` | Added `vercelPreset()` |
| `vercel.json` | Created with Remix framework config |
| `package.json` | Added `prebuild` script |
| `scripts/generate-image-manifest.mjs` | Created manifest generator |
| `app/data/image-manifest.json` | Generated at build time |
| `app/data/all-products.json` | Copied products data |
| `app/lib/scraped-products.server.ts` | Removed fs, use manifest |
| `app/routes/products.$handle.tsx` | Removed fs, use manifest |

---

*Last updated: January 2026*

