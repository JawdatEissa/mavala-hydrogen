# Category Page Hero Image Settings Guide

## How to Customize Hero Images for Each Page

Each category page can use different settings for the hero image. The `CategoryHero` component accepts custom values:

```tsx
<CategoryHero
  imageSrc="/your-image.jpg"
  alt="Your alt text"
  height="95vh"              // Customize this
  objectPosition="50% 20%"   // Customize this
/>
```

## Common Settings by Category

### Nail Polish / Color Page
```tsx
<CategoryHero
  imageSrc="/color-hero.jpg"
  alt="Mavala Mini Color Nail Polishes"
  height="95vh"
  objectPosition="50% 20%"
/>
```
**Why:** Portrait-oriented image with subject at top

---

### Nail Care Page
```tsx
<CategoryHero
  imageSrc="/nail-care-hero.jpg"
  alt="Swiss Quality Nail Care"
  height="90vh"
  objectPosition="50% 35%"
/>
```
**Why:** Close-up product application image, needs center focus

---

### Hand Care Page (Example)
```tsx
<CategoryHero
  imageSrc="/hand-care-hero.jpg"
  alt="Mavala Hand Care"
  height="85vh"
  objectPosition="50% 40%"
/>
```
**Why:** Landscape-oriented, subject in middle

---

### Foot Care Page (Example)
```tsx
<CategoryHero
  imageSrc="/foot-care-hero.jpg"
  alt="Mavala Foot Care"
  height="95vh"
  objectPosition="50% 50%"
/>
```
**Why:** Centered composition

---

## Parameter Guide

### `height` Options:
- `"100vh"` - Full screen (very tall)
- `"95vh"` - Almost full screen (default for color page)
- `"90vh"` - Slightly shorter
- `"85vh"` - Medium height
- `"80vh"` - Shorter
- `"70vh"` - Compact
- `"600px"` - Fixed pixel height

### `objectPosition` Guide:
```
"50% 0%"   - Focus at very top, centered horizontally
"50% 20%"  - Focus near top (good for tall portraits)
"50% 30%"  - Focus upper-middle
"50% 35%"  - Focus slightly above center
"50% 40%"  - Focus middle-upper
"50% 50%"  - Perfect center (default)
"50% 60%"  - Focus lower-middle
"50% 70%"  - Focus near bottom
"50% 100%" - Focus at very bottom

"30% 50%"  - Left side, vertically centered
"70% 50%"  - Right side, vertically centered
```

## How to Find the Right Settings

### Method 1: Visual Testing
1. Start with defaults: `height="95vh"` and `objectPosition="50% 50%"`
2. Open page in browser: `http://localhost:5173/your-page`
3. Open browser DevTools (F12)
4. Inspect the `<img>` element
5. In Styles panel, change `object-position` values
6. Try: `50% 20%`, `50% 30%`, `50% 40%`, etc.
7. Once you find the right position, update your code

### Method 2: Image Analysis
- **Portrait images** (tall): Use `objectPosition="50% 20%"` to `"50% 30%"`
- **Landscape images** (wide): Use `objectPosition="50% 40%"` to `"50% 60%"`
- **Square/centered subjects**: Use `objectPosition="50% 50%"`
- **Product close-ups**: Use `objectPosition="50% 30%"` to `"50% 40%"`

## Quick Copy Templates

### Tall Portrait Image
```tsx
height="95vh"
objectPosition="50% 25%"
```

### Product Close-up
```tsx
height="90vh"
objectPosition="50% 35%"
```

### Landscape/Wide Image
```tsx
height="85vh"
objectPosition="50% 50%"
```

### Action/Lifestyle Shot
```tsx
height="90vh"
objectPosition="50% 40%"
```

## Example: Complete Category Page

```tsx
import { CategoryHero, CategoryProductSection } from "../components/CategoryPageTemplate";

export default function HandCarePage() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Custom hero settings for hand care image */}
      <CategoryHero
        imageSrc="/hand-care-hero.jpg"
        alt="Mavala Hand Care Products"
        height="85vh"
        objectPosition="50% 45%"
      />

      {/* Product sections */}
      <CategoryProductSection
        title="HAND CARE ESSENTIALS"
        products={products}
      />
    </div>
  );
}
```

## Tips

✅ **DO:**
- Test different positions to find what looks best
- Use DevTools to preview changes before updating code
- Keep heights consistent across similar page types
- Document your choices for future reference

❌ **DON'T:**
- Use the same settings for all images
- Go below `70vh` (too short for hero images)
- Use extreme positions like `"0% 0%"` or `"100% 100%"`
- Forget to update the `alt` text for each image

---

## Current Settings Summary

| Page | Height | Position | Image Type |
|------|--------|----------|------------|
| Color | 95vh | 50% 20% | Tall portrait |
| Nail Care | 90vh | 50% 35% | Product close-up |
| Hand Care | TBD | TBD | TBD |
| Foot Care | TBD | TBD | TBD |
| Eye Care | TBD | TBD | TBD |
| Skincare | TBD | TBD | TBD |

Update this table as you add more category pages!

