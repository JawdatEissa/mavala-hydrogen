# Shade Collection Secondary Images - Layout Fix

## Problem

Secondary images on shade collection product pages (products with slugs ending in `-shades` or `-colors`, such as `pink-shades`, `nude-shades`, `pearl-colors`, etc.) were appearing "zoomed in" or cropped, cutting off parts of the nail polish bottles.

The user wanted to:
1. Show more of the bottle (zoom out)
2. Keep the container/border dimensions intact
3. Maintain the same visual layout as other product pages

## Failed Approaches

### 1. Using `object-contain` instead of `object-cover`
- **Result:** Broke the grid layout - containers became taller/narrower
- **Why it failed:** The standard grid layout uses `md:grid-rows-2` with `items-stretch` and `h-full` on containers. When using `object-contain`, the image doesn't fill the container, causing layout issues.

### 2. Using `transform: scale()` on images
- **Result:** Caused layout overflow issues and visible background bleeding
- **Why it failed:** Scaling affects the element's visual size but the container doesn't adjust properly.

### 3. Adding padding to containers
- **Result:** Created ugly visible borders/gaps around images
- **Why it failed:** Padding creates space inside the container that's visually noticeable.

### 4. Reducing grid max-height
- **Result:** Made containers shorter but images still appeared wrong
- **Why it failed:** Didn't address the core issue of image sizing within containers.

## Solution

### Key Insight
The `mavala-scientifique-k` product page already had secondary images that displayed correctly without cropping. This product uses a "special grid layout" that:
- Uses `flex flex-col gap-2` for the secondary images column
- Uses `object-contain` on images
- Does NOT force `h-full` on containers
- Allows images to size naturally

### Implementation

1. **Added shade collections to the special grid layout:**

```typescript
// In ImageGallery component (products.$handle.tsx)
const isShadeCollection = productSlug.endsWith("-shades") || productSlug.endsWith("-colors");

const useSpecialGridLayout = isMavalaStop || isScientifique1 || isScientifiqueK || isNailactan || isShadeCollection;
```

2. **Added height constraint and crop-from-bottom for shade collections:**

```jsx
{/* Additional Images Column - Right - Clickable */}
<div className="flex flex-col gap-2">
  {additionalImages.slice(0, 2).map((img, idx) => (
    <div
      key={idx}
      className="bg-white ... overflow-hidden"
      onClick={() => openLightbox(idx + 1)}
      style={isShadeCollection ? { maxHeight: '589px' } : undefined}
    >
      <img
        src={img}
        alt={`${alt} - ${idx + 2}`}
        className={isShadeCollection 
          ? "block w-full h-full object-cover object-top border-none outline-none"
          : "block w-full object-contain border-none outline-none"
        }
        loading="lazy"
      />
    </div>
  ))}
</div>
```

### How It Works

For shade collections:
- **Container:** `maxHeight: '589px'` limits the height
- **Image:** `object-cover` fills the container completely
- **Positioning:** `object-top` anchors the image at the top, so cropping happens from the bottom
- **Result:** Shows the bottle cap and label (important parts) while cropping the less important bottom portion

For other products using the special layout (scientifique-k, mavala-stop, etc.):
- **Image:** `object-contain` shows the full image
- **No height constraint:** Images size naturally

## File Location

The relevant code is in:
- `app/routes/products.$handle.tsx` - `ImageGallery` component (around line 393)
- Look for `useSpecialGridLayout` and `isShadeCollection` variables

## Adjusting the Crop Amount

To change how much is cropped from the bottom:
- **More cropping:** Decrease the `maxHeight` value (e.g., `500px`)
- **Less cropping:** Increase the `maxHeight` value (e.g., `650px`)

Current value: `589px`

## Related Products

This fix affects all products with slugs ending in:
- `-shades` (e.g., `pink-shades`, `nude-shades`, `red-shades`, etc.)
- `-colors` (e.g., `pearl-colors`, `cream-colors`, etc.)
