# Product Card Image Adjustments (Scale & Vertical Offset)

## Problem Statement

Some product images on the **Color page** (and other listing pages) appear too small, too large, or vertically misaligned within the standard product card grid. A per-product system is needed to fine-tune image **scale** and **vertical position** without affecting other cards.

The challenge: there are **two separate product card components** rendering products across the site:

| Component | File | Used On |
|-----------|------|---------|
| `ProductCard` | `app/components/ProductCard.tsx` | Most listing pages (nail-care, hand-care, etc.) |
| `ColorProductCard` | `app/routes/color.tsx` | Color page only |

Adjustments must be added to **both** components for full coverage.

---

## How It Works

Each component has two lookup objects keyed by product slug:

### 1. Vertical Offset (`imageOffsetAdjustments`)
```ts
const imageOffsetAdjustments: Record<string, string> = {
  "mavala-stop-pen": "6.5%",
  "blue-nail-polish-remover": "-6.5%",
};
```
- **Negative values** (`"-6.5%"`) move the image **up**
- **Positive values** (`"6.5%"`) move the image **down**
- Uses `translateY()` under the hood

### 2. Scale (`imageScaleAdjustments`)
```ts
const imageScaleAdjustments: Record<string, number> = {
  "mavala-stop": 1.38,
  "mavala-stop-pen": 1.21,
  "blue-nail-polish-remover": 1.9,
};
```
- `1.0` = original size (no change)
- `1.38` = 38% larger
- `1.9` = 90% larger
- Uses `scale()` under the hood

### Combined Transform

Both values are combined into a single `transform` string:
```css
transform: translateY(-6.5%) scale(1.9)
```

Products not listed in these objects get no adjustment (default rendering).

---

## File Locations

### `app/components/ProductCard.tsx`

The adjustments are defined inside the `ProductCard` function body (~line 130). The combined transform is applied to a **wrapper `<div>`** around the `<img>`:

```tsx
<div
  style={{
    ...((imageOffset || imageScale)
      ? {
          transform: [
            imageOffset ? `translateY(${imageOffset})` : "",
            imageScale ? `scale(${imageScale})` : "",
          ]
            .filter(Boolean)
            .join(" "),
        }
      : {}),
  }}
>
  <img ... />
</div>
```

### `app/routes/color.tsx`

The adjustments are defined inside the `ColorProductCard` function body (~line 398). The transform is applied directly as an inline style on the `<img>` tag:

```tsx
<img
  src={image}
  alt={displayTitle}
  className="absolute inset-0 w-full h-full object-contain p-2 ..."
  style={imageTransform ? { transform: imageTransform } : undefined}
/>
```

---

## How to Add or Edit Adjustments

### Adding a new product

1. Find the product's **slug** (e.g. `"crystal-nail-polish-remover"`)
2. Add an entry to one or both lookup objects
3. Do this in **both** `ProductCard.tsx` **and** `color.tsx` if the product appears on the color page

Example — make "crystal-nail-polish-remover" 20% bigger and shift up:
```ts
// In imageOffsetAdjustments:
"crystal-nail-polish-remover": "-5%",

// In imageScaleAdjustments:
"crystal-nail-polish-remover": 1.2,
```

### Editing an existing product

Change the value in the lookup object. Each slug must appear **only once** per object (duplicate keys cause warnings and only the last value is kept).

---

## Common Pitfalls

### 1. Duplicate keys in object literals
```ts
// BAD — Vite will warn, and only the second value is used
const offsets = {
  "blue-nail-polish-remover": "-10%",
  "blue-nail-polish-remover": "-6.5%",  // this overwrites the first
};
```
Always keep one entry per slug.

### 2. Editing the wrong component
The Color page uses `ColorProductCard` (in `color.tsx`), **not** the shared `ProductCard`. If changes aren't reflecting on the Color page, you're likely editing the wrong file.

### 3. `overflow: hidden` on the parent container
Both card components have `overflow-hidden` on the image container. This means scaled-up images are **clipped** at the container boundary — the image zooms in rather than overflowing. This is intentional.

### 4. The `|| null` fallback with `0` values
```ts
const imageScale = imageScaleAdjustments[slug] || null;
```
A scale of `0` would be falsy and fall back to `null` (no transform). Don't use `0` as a scale value. Use `1.0` for "no change".

---

## Quick Reference

| What you want | Property | Example value |
|---------------|----------|---------------|
| Make image bigger | `imageScaleAdjustments` | `1.5` (50% bigger) |
| Make image smaller | `imageScaleAdjustments` | `0.8` (20% smaller) |
| Move image up | `imageOffsetAdjustments` | `"-10%"` |
| Move image down | `imageOffsetAdjustments` | `"10%"` |
| No change (default) | Don't add an entry | — |
