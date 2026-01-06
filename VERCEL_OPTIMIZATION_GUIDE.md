# Vercel Deployment Optimization Guide

## Problem
Your application has 4,300+ images which was causing:
- Deployment size issues on Vercel
- 404 errors for images
- Slow loading times
- Potential serverless function timeouts

## Solutions Implemented

### 1. Vercel Configuration (`vercel.json`)

Created a comprehensive Vercel configuration with:

- **Increased Function Timeout**: Set to 30 seconds for routes that load many products
- **Increased Memory**: 1024MB for better performance
- **Image Caching**: Aggressive caching (1 year) for all images
- **CDN Headers**: Proper cache-control headers for static assets
- **Image Optimization**: Configured for AVIF and WebP formats

### 2. Build Optimization (`vite.config.ts`)

Enhanced the Vite configuration:

- **Code Splitting**: Separates React and Remix vendor chunks
- **Manual Chunks**: Better caching for dependencies
- **Asset Optimization**: Inline small assets to reduce HTTP requests
- **Dependency Pre-bundling**: Faster cold starts

### 3. Progressive Image Loading (`OptimizedImage.tsx`)

Created a new optimized image component with:

- **Intersection Observer**: Only loads images when they're about to be visible
- **Loading States**: Shows placeholder while loading
- **Error Handling**: Automatic fallback to placeholder image
- **Priority Loading**: Option for above-the-fold images
- **Fade-in Animation**: Smooth loading experience

### 4. Deployment Size Reduction (`.vercelignore`)

Excludes unnecessary files from deployment:
- Development scripts
- Documentation (except README)
- Backup folders
- Analysis files
- Test images

## How to Use the OptimizedImage Component

### Basic Usage

```tsx
import { OptimizedImage } from '~/components/OptimizedImage';

<OptimizedImage
  src="/images/products/example.png"
  alt="Product name"
  className="w-full h-full object-contain"
/>
```

### With Aspect Ratio

```tsx
<OptimizedImage
  src={productImage}
  alt={productName}
  aspectRatio="4/5"
  className="w-full"
/>
```

### Priority Loading (for hero images)

```tsx
<OptimizedImage
  src="/hero.jpg"
  alt="Hero"
  priority={true}
  objectFit="cover"
/>
```

### With Custom Fallback

```tsx
<OptimizedImage
  src={imageUrl}
  alt={title}
  fallbackSrc="/custom-placeholder.png"
/>
```

## Recommended Updates to Existing Components

### 1. Update ProductCard.tsx

Replace the current `<img>` tag with `OptimizedImage`:

```tsx
// Before
<img
  src={productImage}
  alt={displayTitle}
  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
  loading="lazy"
  onError={(e) => {
    (e.target as HTMLImageElement).src = "/category-nail-care.png";
  }}
/>

// After
<OptimizedImage
  src={productImage}
  alt={displayTitle}
  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
  fallbackSrc="/category-nail-care.png"
/>
```

### 2. Update CategoryPageTemplate.tsx

```tsx
// Before
{image && (
  <img
    src={image}
    alt={product.title}
    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
    loading="lazy"
  />
)}

// After
<OptimizedImage
  src={image}
  alt={product.title}
  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
  aspectRatio="4/5"
/>
```

### 3. Update CategoryHero Component

```tsx
// Before
<img
  src={imageSrc}
  alt={alt}
  className="absolute inset-0 w-full h-full object-cover"
  style={{ objectPosition }}
/>

// After
<OptimizedImage
  src={imageSrc}
  alt={alt}
  className="absolute inset-0 w-full h-full object-cover"
  objectFit="cover"
  priority={true}  // Hero images should load immediately
/>
```

## Next Steps

### 1. Rebuild and Deploy

```bash
npm run build
git add .
git commit -m "Add Vercel optimizations and progressive image loading"
git push
```

### 2. Monitor Vercel Dashboard

After deployment, check:
- Build time (should be faster)
- Function execution time (should be under 30s)
- Asset size
- Cache hit rates

### 3. Optional: Image Optimization

Consider converting images to WebP format for smaller file sizes:

```bash
# Install sharp (if not already)
npm install sharp

# Create a conversion script
node scripts/convert-to-webp.js
```

### 4. Optional: Lazy Load Routes

For better performance, consider lazy loading routes with many products:

```tsx
// In your route file
export const handle = {
  hydrate: false, // Only hydrate when needed
};
```

## Performance Best Practices

1. **Use OptimizedImage for all product images** - Automatic lazy loading
2. **Keep hero images small** - Compress hero images (target <500KB)
3. **Use priority loading sparingly** - Only for above-the-fold content
4. **Monitor bundle size** - Run `npm run build` and check output
5. **Test on slow connections** - Use Chrome DevTools throttling

## Troubleshooting

### Images Still Not Loading?

1. Check the image paths in your data files
2. Verify images exist in the public folder
3. Check browser console for 404 errors
4. Ensure fallback images exist

### Deployment Failing?

1. Check Vercel build logs
2. Ensure all dependencies are in package.json
3. Verify no build errors locally: `npm run build`
4. Check deployment size in Vercel dashboard

### Slow Loading?

1. Verify Cache-Control headers are set (check Network tab)
2. Enable Vercel's Edge Network
3. Consider using Vercel's Image Optimization API
4. Reduce number of products loaded per page

## Resources

- [Vercel Configuration Docs](https://vercel.com/docs/projects/project-configuration)
- [Remix Performance Optimization](https://remix.run/docs/en/main/guides/performance)
- [Web Performance Best Practices](https://web.dev/fast/)

