# Split-Page Sticky Layout Implementation

## Overview

This document describes the implementation of a split-page sticky layout for product pages, inspired by bccannabisstores.com. The layout keeps the purchase information (title, price, add to cart) visible at all times while users scroll through product details.

## How It Works

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  LEFT COLUMN (60%)              │  RIGHT COLUMN (40%)           │
│  ───────────────────            │  ─────────────────            │
│  [Image Gallery Grid]           │  Title                        │
│                                 │  Volume                       │
│                                 │  Description                  │
│                                 │  • Feature bullets            │
│                                 │  ─────────────────            │
│                                 │  Shade Selector               │
│  ─────────────────────          │  Quantity [+][-]              │
│  Product details | Ingredients  │  [Add to Cart]                │
│  ═══════════════                │  Share                        │
│                                 │                               │
│  [Tab content area]             │  ← STICKY                     │
│  - How to Use                   │  (stays fixed in viewport)    │
│  - Safety Directions            │                               │
│  - Key Ingredients              │                               │
│  - Full Ingredients             │                               │
├─────────────────────────────────────────────────────────────────┤
│                    YOU MIGHT ALSO LIKE                          │
│              [Product] [Product] [Product] [Product]            │
└─────────────────────────────────────────────────────────────────┘
```

### Tab Navigation

The left column uses **horizontal tabs** (like bccannabisstores.com) instead of vertical accordions:

- **"Product details"** tab: Shows description, how to use, safety directions
- **"Ingredients"** tab: Shows key ingredients and full ingredients list

The active tab has a blue underline indicator (#1a7eb8).

### Behavior

1. **Left Column (Scrollable)**: Contains the image gallery and product detail accordions. This column scrolls normally with the page.

2. **Right Column (Sticky)**: Contains purchase-critical information:
   - Product title
   - Volume/size
   - Description
   - Feature bullets
   - Shade selector (for nail polish products)
   - Quantity selector
   - Add to Cart button
   - Share button

3. **Sticky Stops When**: The user scrolls past all left column content. The "You Might Also Like" section and footer then scroll normally.

## Files Modified

### 1. `app/styles/tailwind.css`

Added CSS variables and classes for the split-page layout:

```css
/* CSS Variables (in :root) */
--pp-title-size: 42px;           /* Increased from 35px (+20%) */
--pp-volume-size: 17px;          /* Increased from 15px (+13%) */
--pp-description-size: 17px;     /* Increased from 15px (+13%) */
--pp-feature-size: 19px;         /* Increased from 17.1px (+11%) */
--pp-heading-size: 17px;         /* Increased from 15px (+13%) */
--pp-accordion-text-size: 15px;  /* Increased from 14px (+7%) */

/* New Add to Cart button variables */
--pp-add-to-cart-size: 15px;
--pp-add-to-cart-padding-x: 4rem;
--pp-add-to-cart-padding-y: 1.1rem;
```

```css
/* New Component Classes */

/* Add to Cart Button - Larger, more prominent */
.product-page-add-to-cart {
  font-family: var(--bs-font-family);
  font-size: var(--pp-add-to-cart-size);
  padding: var(--pp-add-to-cart-padding-y) var(--pp-add-to-cart-padding-x);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border-width: 2px;
  border-color: #9e1b32;
  color: #9e1b32;
  background: transparent;
  transition: all 0.2s ease;
}

.product-page-add-to-cart:hover {
  background-color: #9e1b32;
  color: white;
}

/* Sticky right column */
.product-info-sticky {
  position: sticky;
  top: 7rem;                        /* Offset for header height */
  align-self: flex-start;
  max-height: calc(100vh - 8rem);   /* Prevents overflow */
  overflow-y: auto;                 /* Scrollbar if content too tall */
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

/* Left column (no special styling needed) */
.product-content-scrollable {
  /* Scrolls naturally with page */
}
```

### 2. `app/routes/products.$handle.tsx`

Restructured the desktop product layout:

**Before:**
```jsx
<div className="grid lg:grid-cols-[60%_40%]">
  {/* Left: Image Gallery */}
  <ImageGallery ... />
  
  {/* Right: Product Info + Accordions */}
  <div className="lg:pl-8 lg:pt-12">
    <h1>Title</h1>
    ...
    <button>Add to Cart</button>
    <div>Accordions</div>  {/* Was here */}
  </div>
</div>
```

**After:**
```jsx
<div className="grid lg:grid-cols-[60%_40%]">
  {/* Left: Image Gallery + Accordions (scrollable) */}
  <div className="product-content-scrollable">
    <ImageGallery ... />
    <div>Accordions</div>  {/* Moved here */}
  </div>
  
  {/* Right: Product Info (sticky) */}
  <div className="product-info-sticky lg:pl-8 lg:pt-12">
    <h1>Title</h1>
    ...
    <button className="product-page-add-to-cart">Add to Cart</button>
  </div>
</div>
```

## Typography Changes

| Element | Before | After | Change |
|---------|--------|-------|--------|
| Title (H1) | 35px | 42px | +20% |
| Volume | 15px | 17px | +13% |
| Description | 15px | 17px | +13% |
| Feature bullets | 17.1px | 19px | +11% |
| Section headings | 15px | 17px | +13% |
| Accordion text | 14px | 15px | +7% |
| Add to Cart button | 14px | 15px | +7% |
| Add to Cart padding | px-16 py-4 | 4rem × 1.1rem | Larger |

## Mobile Behavior

The sticky layout is **desktop-only** (lg: breakpoint and above). On mobile:
- Single column layout
- Content order: Images → Title/Info/Add to Cart → Tabs → Related Products
- No sticky positioning
- Tabs appear AFTER product info (not before)

### Mobile Tab Placement

On mobile, the horizontal tabs are duplicated and shown after the product info section:
- Desktop tabs: Inside left column with `hidden lg:block`
- Mobile tabs: After grid closes with `lg:hidden`

This ensures the proper content order on mobile devices.

## Technical Details

### Sticky Positioning

The `position: sticky` CSS property is used with:
- `top: 7rem` - Offset to account for the fixed header (~112px)
- `align-self: flex-start` - Prevents the sticky element from stretching
- `max-height: calc(100vh - 8rem)` - Ensures content doesn't overflow viewport
- `overflow-y: auto` - Adds scrollbar if right column content is too tall

### Why This Approach?

1. **UX**: Users can browse product details while always having "Add to Cart" visible
2. **Conversion**: Purchase actions are never hidden by scrolling
3. **Modern**: Common pattern used by major e-commerce sites
4. **Performance**: Pure CSS solution, no JavaScript needed

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: Not supported (sticky not supported)

## Customization

### Adjusting Sticky Offset

If your header height changes, update the `top` value in `.product-info-sticky`:

```css
.product-info-sticky {
  top: 7rem; /* Change this to match your header height + some padding */
}
```

### Adjusting Max Height

If the right column content is being cut off:

```css
.product-info-sticky {
  max-height: calc(100vh - 8rem); /* Adjust the subtracted value */
}
```

### Disabling Sticky

To disable the sticky behavior, remove the `product-info-sticky` class from the right column div.

## Testing Checklist

- [ ] Desktop: Right column stays fixed while scrolling left column
- [ ] Desktop: Sticky stops at end of left column content
- [ ] Desktop: Accordions expand/collapse correctly in left column
- [ ] Desktop: Add to Cart button is larger and more prominent
- [ ] Mobile: Layout is single column (no sticky)
- [ ] Mobile: All content accessible
- [ ] All breakpoints: No horizontal overflow
- [ ] All breakpoints: Text is readable at new sizes
