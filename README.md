# Mavala Hydrogen Store

A Shopify Hydrogen-based e-commerce store for Mavala Switzerland Australia.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to project
cd mavala-hydrogen

# Install dependencies
npm install

# Install Playwright for Remix
npx playwright install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

## 📁 Project Structure

```
mavala-hydrogen/
├── app/
│   ├── components/         # Reusable UI components
│   │   ├── Header.tsx      # Navigation & mega menu
│   │   ├── Footer.tsx      # Site footer
│   │   ├── ProductCard.tsx # Product display card
│   │   ├── BlogCard.tsx    # Blog post card
│   │   ├── HeroVideo.tsx   # Hero section with video
│   │   └── CategoryGrid.tsx # Category navigation
│   ├── routes/             # Page routes
│   │   ├── _index.tsx      # Homepage
│   │   ├── collections.$handle.tsx
│   │   ├── products.$handle.tsx
│   │   ├── blog._index.tsx
│   │   ├── blog.$handle.tsx
│   │   └── cart.tsx
│   ├── lib/
│   │   └── mock-data.ts    # Mock data from scraped JSON
│   ├── styles/
│   │   └── tailwind.css    # Global styles
│   └── root.tsx            # App shell
├── tailwind.config.js      # Tailwind configuration
├── package.json
└── vite.config.ts
```

## 🎨 Brand Colors

```css
--mavala-red: #E31837      /* Primary - CTAs, highlights */
--mavala-pink: #F5A5B8     /* Secondary accent */
--mavala-dark: #333333     /* Text */
--mavala-gray: #666666     /* Secondary text */
--mavala-light-gray: #F5F5F5  /* Backgrounds */
--mavala-gold: #C9A962     /* Premium accents */
```

## 📦 Features

- ✅ Homepage with YouTube hero video
- ✅ Product listing pages with filtering
- ✅ Product detail pages with tabs (ingredients, how-to, safety)
- ✅ Blog listing and post pages
- ✅ Shopping cart (UI ready)
- ✅ Responsive design
- ✅ Mock data from scraped content

## 🔄 Data Source

Currently using mock data from scraped JSON files:
- `../scraped_data/all_products.json` - 201 products
- `../scraped_data/all_blogs.json` - 76 blog posts

When Shopify account is ready, replace `mock-data.ts` with Storefront API queries.

## 🛠️ Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📝 Next Steps

1. **Get Shopify Account** - Create development store
2. **Import Products** - Use `../shopify_import/` scripts
3. **Connect API** - Replace mock data with Storefront API
4. **Add Cart Functionality** - Implement Shopify cart
5. **Deploy** - Deploy to Shopify Oxygen or Vercel

## 📚 Resources

- [Shopify integration (Phase 1)](docs/SHOPIFY-INTEGRATION.md) — Storefront PDP + JSON fallback, env, roadmap
- [Hydrogen Docs](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [Remix Docs](https://remix.run/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)













