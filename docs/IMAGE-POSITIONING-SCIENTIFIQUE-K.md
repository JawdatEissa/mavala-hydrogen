# Image Positioning Solution for Mavala Scientifique K+ Product Page

## Problem Statement

On the product page for `mavala-scientifique-k` (URL: `/products/mavala-scientifique-k`), the third image (image 03 in the gallery) was displaying inside a grey box but needed to be:
1. **Moved to the left** within its container
2. **Increased in size by 35%**

The challenge was to achieve this without causing the grey container box to shrink or collapse.

---

## Initial Attempts That Failed

### Attempt 1: Using Negative Margin
```jsx
style={{
  transform: 'scale(1.35)',
  transformOrigin: 'left center',
  marginLeft: '-50%'
}}
```
**Result**: The grey container box **shrank in width** because negative margins affect the element's box model and cause the parent container to collapse around the shifted content.

### Attempt 2: Using `minWidth` on Container
```jsx
// Container
style={{ minWidth: '100%' }}

// Image
style={{
  transform: 'scale(1.35)',
  transformOrigin: 'left center',
  marginLeft: '-50%'
}}
```
**Result**: Still didn't work. The `minWidth` couldn't overcome the layout collapse caused by the negative margin.

### Attempt 3: Using Absolute Positioning with Transform
```jsx
// Container
className="relative aspect-square"

// Image
className="absolute"
style={{
  transform: 'scale(1.35)',
  transformOrigin: 'top left',
  top: '0',
  left: '-45%',
  width: '100%',
  height: '100%',
  objectFit: 'contain'
}}
```
**Result**: The container width still collapsed because the absolute positioning with negative `left` values still affected the layout calculation.

---

## The Solution That Works

The key insight was to use **flexbox centering** combined with **CSS transforms**, and let `overflow: hidden` handle the clipping.

### Why This Works:
1. **Flexbox centering** (`flex items-center justify-center`) positions the image in the center of the container first
2. **CSS transforms** (`scale` and `translateX`) modify the visual rendering WITHOUT affecting the box model or layout
3. **`overflow: hidden`** clips any content that extends beyond the container boundaries
4. The container maintains its size because transforms don't affect layout flow

### Final Code Implementation

```jsx
{/* Second additional image - scaled 35% larger and moved left */}
{additionalImages[1] && (
  <div
    className="bg-[#f5f5f5] border-none outline-none shadow-none cursor-pointer hover:opacity-95 transition-opacity overflow-hidden flex items-center justify-center"
    style={{ aspectRatio: '1/1' }}
    onClick={() => openLightbox(2)}
  >
    <img
      src={additionalImages[1]}
      alt={`${alt} - 3`}
      className="max-w-full max-h-full object-contain border-none outline-none"
      style={{ 
        transform: 'scale(1.35) translateX(-20%)'
      }}
      loading="lazy"
    />
  </div>
)}
```

---

## How to Control the Image

### Container Classes Explained:
| Class | Purpose |
|-------|---------|
| `bg-[#f5f5f5]` | Grey background color |
| `overflow-hidden` | **Critical** - Clips the scaled/translated image |
| `flex items-center justify-center` | Centers the image before transforms are applied |
| `aspectRatio: '1/1'` | Maintains a square container |

### Transform Properties:

#### 1. Scale (Size)
```css
transform: scale(1.35)
```
- `1.0` = 100% (original size)
- `1.35` = 135% (35% larger)
- `1.5` = 150% (50% larger)

#### 2. TranslateX (Horizontal Position)
```css
transform: scale(1.35) translateX(-20%)
```
- `translateX(0%)` = Centered (no horizontal shift)
- `translateX(-20%)` = Move left by 20% of the image width
- `translateX(-50%)` = Move left by 50% of the image width
- `translateX(20%)` = Move right by 20% of the image width

#### 3. TranslateY (Vertical Position)
```css
transform: scale(1.35) translateX(-20%) translateY(-10%)
```
- `translateY(0%)` = Centered vertically
- `translateY(-10%)` = Move up by 10%
- `translateY(10%)` = Move down by 10%

### Combined Example:
```css
/* Scale 35% larger, move 20% left, move 10% up */
transform: scale(1.35) translateX(-20%) translateY(-10%)
```

---

## Important Notes

### Order of Transforms Matters
CSS transforms are applied **right to left**. So:
```css
transform: scale(1.35) translateX(-20%)
```
Means: First translate, then scale. The translation is based on the **original** size, not the scaled size.

### Why Negative Margins Don't Work
Negative margins affect the **layout box model**:
- They pull adjacent elements closer
- They can cause parent containers to collapse
- They affect how the browser calculates available space

### Why Transforms Do Work
CSS transforms are applied **after layout**:
- They don't affect the element's position in the document flow
- They don't cause parent containers to resize
- They're purely visual modifications
- Combined with `overflow: hidden`, content is simply clipped

---

## File Location

This styling is applied in:
```
app/routes/products.$handle.tsx
```

Within the `ImageGallery` component, specifically in the "Special 3-image grid layout" section used for products like:
- `mavala-scientifique-k`
- `mavala-scientifique-1`
- `mavala-stop`
- `nailactan-1`

---

## Quick Reference for Future Changes

To adjust the third image positioning for `mavala-scientifique-k`:

1. Find the code block starting with `{/* Second additional image - scaled 35% larger and moved left */}`
2. Modify the `transform` property:
   - **Size**: Change `scale(1.35)` to your desired scale
   - **Left/Right**: Change `translateX(-20%)` (negative = left, positive = right)
   - **Up/Down**: Add `translateY(-10%)` if needed (negative = up, positive = down)

Example adjustments:
```jsx
// Bigger and more to the left
transform: 'scale(1.5) translateX(-30%)'

// Smaller and centered
transform: 'scale(1.2) translateX(0%)'

// Bigger, left, and up
transform: 'scale(1.35) translateX(-20%) translateY(-15%)'
```
