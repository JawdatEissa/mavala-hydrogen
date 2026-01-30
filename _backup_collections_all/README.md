# Backup: /collections/all Route Removal

**Date:** January 29, 2026

## What was removed

This backup contains files related to the `/collections/all` route and its 17-category filter bar that was deemed redundant.

## Files backed up

| Backup File              | Original Location                    | Status                                          |
| ------------------------ | ------------------------------------ | ----------------------------------------------- |
| `all-products.tsx`       | `app/routes/all-products.tsx`        | **DELETED**                                     |
| `CategoryNav.tsx`        | `app/components/CategoryNav.tsx`     | **DELETED**                                     |
| `constants.ts`           | `app/lib/constants.ts`               | **MODIFIED** (CATEGORIES removed)               |
| `collections.handle.tsx` | `app/routes/collections.$handle.tsx` | **MODIFIED** (removed "all" layout)             |
| `cart.tsx`               | `app/routes/cart.tsx`                | **MODIFIED** (changed "Continue Shopping" link) |

## How to restore

### Option 1: Restore everything

Copy files back to their original locations:

```powershell
cd mavala-hydrogen
copy "_backup_collections_all\all-products.tsx" "app\routes\all-products.tsx"
copy "_backup_collections_all\CategoryNav.tsx" "app\components\CategoryNav.tsx"
copy "_backup_collections_all\constants.ts" "app\lib\constants.ts"
copy "_backup_collections_all\collections.handle.tsx" "app\routes\collections.`$handle.tsx"
copy "_backup_collections_all\cart.tsx" "app\routes\cart.tsx"
```

### Option 2: Delete this backup folder when satisfied

Once you're confident the removal is working correctly, you can delete this folder:

```powershell
rm -r "_backup_collections_all"
```

## Why it was removed

1. The `/collections/all` page with its 17-category filter bar was not linked from the main navigation
2. Users could only reach it by typing the URL directly or from the cart page
3. The Header navigation already has dedicated category routes (`/nail-care`, `/color`, etc.)
4. The `all-products.tsx` route was a duplicate

## Code savings

- `all-products.tsx`: 83 lines deleted
- `CategoryNav.tsx`: 38 lines deleted
- `constants.ts`: ~20 lines removed (CATEGORIES array)
- `collections.$handle.tsx`: ~60 lines removed (all-products layout)

**Total: ~200 lines of code removed**
