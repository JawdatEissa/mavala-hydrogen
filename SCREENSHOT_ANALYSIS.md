# All-Products Page Screenshot Analysis

## Layout Structure

### 1. Banner Image Section
- **Location**: Top of page, below header
- **Image**: MAVALA_GROUP.jpg (5079x6260px)
- **Content**: Large photograph of 5 young people (group portrait)
- **Styling**: 
  - Full-width image
  - Uses `object-fit: cover` or similar
  - Positioned with `top: -136.452px` (negative offset for focal point)
  - Aspect ratio: ~1.1 (data-parent-ratio="1.1")

### 2. Category Navigation Bar
- **Location**: Below banner image
- **Structure**: Horizontal list (`<ul class="category-nav-links">`)
- **Categories** (in order):
  1. Filter (non-link, toggle button)
  2. All (active link, href="/all-products")
  3. Complexion
  4. Cuticle Care
  5. Eye Colour
  6. Eyebrows & Lashes
  7. Foot Care
  8. Gift Sets
  9. Hair & Body
  10. Hand care
  11. Lip balm
  12. Lip Colour
  13. Makeup Removers
  14. Manicure Essentials
  15. Nail Colour
  16. Nail Polish Collections
  17. Nail Polish Removers
  18. Nail Repair
  19. Skincare

- **URL Pattern**: `/all-products?category=Category+Name` (URL encoded)
- **Styling**: 
  - Horizontal flex layout
  - Wraps to multiple rows on smaller screens
  - Active link has class `active-link all`
  - Links are uppercase text

### 3. Product Grid Section
- **Layout**: 5-column grid on desktop
- **Product Card Structure**:
  - Product image (with reflection/shadow effect)
  - Product name (bold, uppercase)
  - Price (below name, "from $XX.XX" format)
  
- **Visible Products** (from screenshots):
  1. MAVALA SCIENTIFIQUE K+ - from $37.95
  2. MAVALA SCIENTIFIQUE - from $24.95
  3. NAILACTAN - $39.95
  4. MAVA-FLEX - $37.95
  5. MAVADERMA - from $27.95
  6. MAVAPEN (partially visible)
  7. LIGHTENING NAIL SCRUB (partially visible)
  8. CUTICLE REMOVER (partially visible)
  9. CUTICLE CREAM (partially visible)
  10. CUTICLE OIL (partially visible)

- **Image Styling**:
  - Products shown with red/white boxes
  - Actual product bottles/tubes visible
  - Images have subtle reflection beneath
  - Aspect ratio appears square or slightly vertical

## Typography & Colors
- **Font**: Archivo (matching rest of site)
- **Product Names**: Uppercase, bold
- **Prices**: Standard weight, includes "from" prefix when applicable
- **Category Links**: Uppercase, similar to header navigation

## Responsive Behavior
- Grid collapses to fewer columns on mobile
- Category navigation wraps to multiple rows
- Banner image scales proportionally










