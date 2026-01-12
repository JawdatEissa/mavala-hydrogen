# Mavala Shop Website - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Website Structure](#website-structure)
3. [Navigation & Routing](#navigation--routing)
4. [Product Display Locations](#product-display-locations)
5. [Button Functionality](#button-functionality)
6. [File Structure](#file-structure)
7. [Data Sources](#data-sources)
8. [Testing Guide](#testing-guide)
9. [Known Issues & Fixes](#known-issues--fixes)

---

## Overview

The Mavala shop website is built with **Remix** (React Router) and **Tailwind CSS**. It displays 201 scraped products from `scraped_data/all_products.json` in a grid layout with category filtering.

**Base URL**: `http://localhost:5173`

---

## Website Structure

### 1. Header Navigation Bar
**Location**: Top of every page (fixed/sticky)
**Height**: 90px
**Layout**: 3-column grid on desktop

**Left Section** (aligned right):
- **SHOP** button → Navigates to `/collections/all`
- **DIAGNOSIS** link → Navigates to `/diagnosis`
- **BLOG** link → Navigates to `/blog`

**Center Section**:
- **MAVALA SWITZERLAND** logo (240px width) → Links to homepage `/`

**Right Section** (aligned left):
- **STORE LOCATOR** link
- **SEARCH** button
- **SIGN IN** link

**SHOP Dropdown Menu** (appears on hover):
- **ALL PRODUCTS** → `/collections/all`
- **NAIL CARE** → `/collections/nail-care`
- **NAIL POLISH** → `/collections/nail-polish`
- **MANICURE TOOLS** → `/collections/accessories`
- **HAND CARE** → `/collections/hand-care`
- **FOOT CARE** → `/collections/foot-care`
- **EYE CARE** → `/collections/eye-care`
- **EYE BEAUTY** → `/collections/eye-beauty`
- **LIPS** → `/collections/lips`
- **SKIN CARE** → `/collections/skincare`
- **COMPLEXION** → `/collections/complexion`
- **HAIR & BODY** → `/collections/hair-body`
- **GIFT SETS** → `/collections/gifts`

---

## Navigation & Routing

### Main Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/routes/_index.tsx` | Homepage with hero video, mission, new products, best sellers, categories, blog |
| `/collections/all` | `app/routes/collections.$handle.tsx` | **MAIN SHOP PAGE** - Shows all 201 products |
| `/collections/{category}` | `app/routes/collections.$handle.tsx` | Filtered products by category |
| `/products/{slug}` | `app/routes/products.$handle.tsx` | Individual product detail page |
| `/diagnosis` | `app/routes/diagnosis.tsx` | Skin diagnosis quiz |
| `/blog` | `app/routes/blog._index.tsx` | Blog listing page |
| `/blog/{slug}` | `app/routes/blog.$handle.tsx` | Individual blog post |
| `/cart` | `app/routes/cart.tsx` | Shopping cart page |

### How to Navigate to Shop

**Method 1: Click SHOP Button**
- Click the **"SHOP"** text in the top navigation bar (left side)
- Should navigate to: `http://localhost:5173/collections/all`
- **Current Implementation**: Uses `navigate('/collections/all')` in onClick handler

**Method 2: Use Dropdown Menu**
- Hover over **"SHOP"** button to see dropdown
- Click **"ALL PRODUCTS"** in the dropdown
- Navigates to: `http://localhost:5173/collections/all`

**Method 3: Direct URL**
- Type in browser: `http://localhost:5173/collections/all`

---

## Product Display Locations

### 1. Main Shop Page (`/collections/all`)

**URL**: `http://localhost:5173/collections/all`

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  Banner Image (MAVALA_GROUP.jpg)   │
│  Height: 60vh mobile, 70vh desktop │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Category Navigation Bar (Sticky)    │
│  - Filter button                    │
│  - All, Complexion, Cuticle Care...  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Results Count                       │
│  "201 products"                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Product Grid (5 columns desktop)   │
│  - Product Image                    │
│  - Product Title (Uppercase, Bold)  │
│  - Price                            │
└─────────────────────────────────────┘
```

**Product Grid**:
- **Desktop**: 5 columns
- **Tablet**: 4 columns
- **Mobile**: 2 columns
- **Gap**: 4-6px horizontal, 8-12px vertical
- **Product Cards**: Square aspect ratio, white background

**Product Card Structure**:
- Image container (aspect-square)
- Product title (Archivo font, uppercase, bold, gray-900)
- Price (Archivo font, gray-700, shows "from $XX.XX" when applicable)

### 2. Homepage Product Sections

**Location**: `http://localhost:5173/` (Homepage)

**Section 1: Best Sellers**
- **Location**: Below mission statement
- **Grid**: 6 products in a row (responsive)

---

## Bestsellers Badge (Reusable)

The site has a **reusable “BESTSELLERS” badge** that can appear on product cards anywhere in the app (not just on the homepage carousel).

### How it works
- **Source of truth**: `app/lib/bestsellers.ts`
  - `BESTSELLER_SLUGS`: set of product slugs considered bestsellers
  - `isBestsellerSlug(slug)`: helper used across the UI
- **Exact badge UI**: `app/components/BestsellerBadge.tsx`
  - Keeps the badge styling identical everywhere (top-left white label)

### Where it is already used
- **Homepage Best Sellers carousel**: `app/components/BestsellerCard.tsx`
- **All product cards across the store**: `app/components/ProductCard.tsx`
  - This covers most grids/lists (collections pages, category pages, search, related products, etc.)
- **Color page custom cards**: `app/routes/color.tsx`

### Add the badge to another product
1. Open `app/lib/bestsellers.ts`
2. Add the product’s **slug** to `BESTSELLER_SLUGS`
3. The badge will automatically appear anywhere that product is rendered using `ProductCard` (and in the color page cards).

### Add the badge to a new UI card
If you build a new product card component that doesn’t use `ProductCard`, you can show the badge like this:
- Import `isBestsellerSlug` from `app/lib/bestsellers.ts`
- Import `BestsellerBadge` from `app/components/BestsellerBadge.tsx`
- Render `<BestsellerBadge />` inside the **image container** when `isBestsellerSlug(slug)` is true.
- **Button**: "VIEW ALL PRODUCTS" → Links to `/collections/all`
- **File**: `app/routes/_index.tsx` (around line 150-250)

**Section 2: Shop by Category**
- **Location**: Below best sellers
- **Grid**: 10 category tiles with images
- **Categories**: Nail Care, Nail Polish, Hand Care, Foot Care, Eye Care, Eye Beauty, Lips, Skincare, Complexion, Hair & Body
- **Click Action**: Navigate to `/collections/{category-slug}`

### 3. Category Filtered Pages

**URL Pattern**: `http://localhost:5173/collections/{category-slug}`

**Examples**:
- `/collections/nail-care`
- `/collections/skincare`
- `/collections/hand-care`

**Layout**: Same as main shop page but filtered by category

---

## Button Functionality

### Header Buttons

| Button | Location | Action | Route |
|--------|----------|--------|-------|
| **SHOP** | Top nav (left) | Navigate to all products | `/collections/all` |
| **DIAGNOSIS** | Top nav (left) | Navigate to quiz | `/diagnosis` |
| **BLOG** | Top nav (left) | Navigate to blog | `/blog` |
| **STORE LOCATOR** | Top nav (right) | Navigate to store locator | `/store-locator` |
| **SEARCH** | Top nav (right) | Open search (not implemented) | - |
| **SIGN IN** | Top nav (right) | Navigate to account | `/account` |
| **Logo** | Center | Navigate to homepage | `/` |

### Shop Page Buttons

| Button | Location | Action |
|--------|----------|--------|
| **Filter** | Category nav bar | Toggle filter menu (not implemented) |
| **Category Links** | Category nav bar | Filter products by category |
| **Product Card** | Product grid | Navigate to product detail page |

### Homepage Buttons

| Button | Location | Action | Route |
|--------|----------|--------|-------|
| **VIEW ALL PRODUCTS** | Best Sellers section | Navigate to shop | `/collections/all` |
| **VIEW POP WAVE COLORS** | Promotional banner | Navigate to collection | `/collections/pop-wave` |
| **VIEW DOUBLE-BROW** | Promotional banner | Navigate to product | `/products/double-brow` |
| **Category Tiles** | Shop by Category | Navigate to category | `/collections/{slug}` |

---

## File Structure

### Key Files for Shop Functionality

```
mavala-hydrogen/
├── app/
│   ├── routes/
│   │   ├── _index.tsx                    # Homepage
│   │   ├── collections.$handle.tsx       # ⭐ MAIN SHOP ROUTE
│   │   ├── products.$handle.tsx          # Product detail pages
│   │   └── diagnosis.tsx                # Quiz page
│   ├── components/
│   │   ├── Header.tsx                    # ⭐ Navigation with SHOP button
│   │   ├── ProductCard.tsx               # ⭐ Product display component
│   │   ├── CategoryNav.tsx               # ⭐ Category filter navigation
│   │   ├── Footer.tsx                    # Site footer
│   │   └── HeroVideo.tsx                 # Homepage hero
│   └── lib/
│       ├── scraped-products.ts           # ⭐ Product data loader
│       └── mock-data.ts                  # Mock data (legacy)
├── public/
│   └── MAVALA_GROUP.jpg                  # Shop page banner image
└── scraped_data/                         # ⭐ Product data source
    ├── all_products.json                 # 201 products (main data)
    └── images/                           # Product images
        └── {product-slug}/
            └── *.jpg, *.png, *.webp
```

### Critical Files for Shop

1. **`app/routes/collections.$handle.tsx`**
   - Handles `/collections/all` and `/collections/{category}`
   - Loads products from `scraped-products.ts`
   - Renders banner, category nav, and product grid

2. **`app/components/Header.tsx`**
   - Contains SHOP button (line ~85-95)
   - Currently uses `navigate('/collections/all')` in onClick
   - Dropdown menu with category links

3. **`app/lib/scraped-products.ts`**
   - `loadScrapedProducts()` - Loads 201 products from JSON
   - `getProductsByCategory()` - Filters products by category
   - Path resolution for product images

4. **`app/components/ProductCard.tsx`**
   - Renders individual product cards
   - `ProductGrid` component for grid layout

5. **`app/components/CategoryNav.tsx`**
   - Category filter navigation bar
   - Links to `/collections/all?category={name}`

---

## Data Sources

### Product Data
- **Source**: `scraped_data/all_products.json`
- **Count**: 201 products
- **Structure**: Array of product objects with:
  - `url`, `slug`, `title`, `price`, `price_from`
  - `images[]` - Array of image URLs
  - `main_description`, `key_ingredients`, `how_to_use`
  - `sizes[]` - Available sizes

### Product Images
- **Local Path**: `scraped_data/images/{product-slug}/`
- **Public Path**: `/images/{product-slug}/{filename}`
- **Fallback**: CDN URLs from scraped data

### Categories
- **Source**: `app/lib/scraped-products.ts` - `CATEGORIES` array
- **Count**: 19 categories including "All"
- **Mapping**: `app/routes/collections.$handle.tsx` maps URL slugs to category names

---

## Testing Guide

### How to Test Shop Navigation

1. **Start Dev Server**:
   ```bash
   cd mavala-hydrogen
   npm run dev
   ```

2. **Test SHOP Button**:
   - Open `http://localhost:5173`
   - Click "SHOP" in top navigation
   - **Expected**: URL changes to `http://localhost:5173/collections/all`
   - **Expected**: Banner image appears
   - **Expected**: Category navigation bar appears
   - **Expected**: 201 products displayed in grid

3. **Test Category Filtering**:
   - On `/collections/all` page
   - Click a category in the navigation bar (e.g., "Skincare")
   - **Expected**: URL changes to `/collections/all?category=Skincare`
   - **Expected**: Products filtered to show only Skincare items

4. **Test Dropdown Menu**:
   - Hover over "SHOP" button
   - **Expected**: Dropdown menu appears
   - Click "ALL PRODUCTS"
   - **Expected**: Navigates to `/collections/all`

5. **Test Product Cards**:
   - Click any product card
   - **Expected**: Navigates to `/products/{product-slug}`
   - **Expected**: Product detail page loads

### Debugging Checklist

If SHOP button doesn't work:
- [ ] Check browser console for errors
- [ ] Verify route file exists: `app/routes/collections.$handle.tsx`
- [ ] Check `Header.tsx` line ~85-95 for SHOP button code
- [ ] Verify `navigate` is imported from `@remix-run/react`
- [ ] Check if `scraped_data/all_products.json` exists
- [ ] Check server terminal for loader errors

If products don't display:
- [ ] Check server console for "Collections loader" logs
- [ ] Verify JSON file path is correct
- [ ] Check browser console for "CollectionPage render" logs
- [ ] Verify `loadScrapedProducts()` returns products
- [ ] Check network tab for failed requests

---

## Known Issues & Fixes

### Issue 1: SHOP Button Navigates to Homepage
**Status**: Fixed
**Solution**: Changed from `Link` to `button` with explicit `navigate('/collections/all')`
**File**: `app/components/Header.tsx` line ~85-95

### Issue 2: Products Not Loading
**Status**: Should be fixed
**Solution**: 
- Added multiple path resolution attempts in `scraped-products.ts`
- Added error handling and logging
- Check server console for "✅ Loading products from:" message

### Issue 3: Category Navigation Links Wrong
**Status**: Fixed
**Solution**: Updated `CategoryNav.tsx` to use `/collections/all` instead of `/all-products`

### Issue 4: Same Route Navigation Doesn't Reload
**Status**: Partially fixed
**Solution**: Added `handleCategoryClick` function with refresh parameter
**Note**: May need refinement for better UX

---

## Current Implementation Status

### ✅ Working
- Route structure (`/collections/all`)
- Product data loading (201 products)
- Product grid display (5-column layout)
- Category filtering
- Banner image display
- Category navigation bar
- Product card rendering

### ⚠️ Needs Testing
- SHOP button navigation (recently changed to button)
- Image loading (local vs CDN fallback)
- Category filtering accuracy
- Mobile responsiveness

### ❌ Not Implemented
- Search functionality
- Filter menu (Filter button does nothing)
- Sort functionality
- Product detail pages (using mock data)
- Shopping cart functionality
- User authentication

---

## Quick Reference: How to Access Shop

1. **From Homepage**: Click "SHOP" button in top navigation
2. **Direct URL**: `http://localhost:5173/collections/all`
3. **From Dropdown**: Hover "SHOP" → Click "ALL PRODUCTS"
4. **From Homepage Button**: Click "VIEW ALL PRODUCTS" in Best Sellers section

---

## Code Locations Summary

| Feature | File | Line Range |
|---------|------|------------|
| SHOP Button | `app/components/Header.tsx` | ~85-95 |
| Shop Route | `app/routes/collections.$handle.tsx` | Entire file |
| Product Loading | `app/lib/scraped-products.ts` | `loadScrapedProducts()` |
| Product Display | `app/components/ProductCard.tsx` | `ProductGrid` component |
| Category Nav | `app/components/CategoryNav.tsx` | Entire file |
| Product Data | `scraped_data/all_products.json` | JSON file |

---

## Next Steps for New Developer

1. **Verify SHOP Button Works**:
   - Test clicking SHOP button
   - Check browser console for navigation logs
   - Verify URL changes to `/collections/all`

2. **Check Product Loading**:
   - Open browser console
   - Check for "Collections loader" logs
   - Verify product count is 201

3. **Test Category Filtering**:
   - Click different categories
   - Verify products filter correctly
   - Check URL updates with query params

4. **Fix Any Remaining Issues**:
   - Use debug logs in console
   - Check server terminal for errors
   - Verify file paths are correct

---

**Last Updated**: Based on current codebase state
**Route File**: `app/routes/collections.$handle.tsx` exists and is configured
**SHOP Button**: Uses `navigate('/collections/all')` in onClick handler










