# Product Browsing Flow Simplification Report

**Date:** July 4, 2026  
**Scope:** Categories navigation, category/collection filters, product card add-to-cart  
**Backend:** Not modified

---

## Summary

Categories is now the single product listing experience. Nav “Categories” opens the full catalog with no filters. Category and collection entry points apply filters via query parameters on `/categories`. Legacy `/categories/:slug` and `/collections/:slug` routes redirect into that listing. Product card cart buttons add items in place using `CartContext` (toast + cart count update, no redirect).

`npm run lint` and `npm run build` both pass.

**No backend files were modified.**

---

## Routes Modified

| Route | Before | After |
|-------|--------|-------|
| `/categories` | Categories landing grid | Product listing + filter sidebar (all products, no filters) |
| `/categories/:slug` | Dedicated category listing page | Redirect → `/categories?category=:slug` |
| `/collections/:slug` | Dedicated collection listing page | Redirect → `/categories?collection=:slug` |

Legacy routes remain as thin redirects so old links keep working.

---

## Navigation Changes

| Entry point | Destination |
|-------------|-------------|
| Navbar **Categories** | `/categories` (no query params) |
| Category chip / category link | `/categories?category=<slug>` |
| New Arrivals | `/categories?collection=new-arrivals` |
| Best Sellers | `/categories?collection=best-sellers` |
| Trending | `/categories?collection=trending` |
| Offers | `/categories?collection=offers` |
| Featured | `/categories?collection=featured` |
| Banner category links | `/categories?category=<slug>` |
| Product detail category link | `/categories?category=<slug>` |
| Footer New Arrivals / Best Sellers | Collection browse URLs above |
| Home best-sellers “View all” | Best Sellers collection browse URL |

Helpers: `categoryBrowsePath()`, `collectionBrowsePath()`, `getCollectionHref()` (now points at Categories).

---

## Filters Affected

Filter application uses **query parameters** (existing listing + `FilterState` / `buildProductQueryParams` — no duplicate filter engine).

| Preset | Query | Applied filters |
|--------|-------|-----------------|
| (none) | `/categories` | Defaults only |
| Category | `?category=<slug>` | Main category only |
| New Arrivals | `?collection=new-arrivals` | Sort = `newest` |
| Best Sellers | `?collection=best-sellers` | Offers = `best-seller` |
| Trending | `?collection=trending` | Sort = `featured` (sold/trending sort) |
| Offers | `?collection=offers` | Offers = `on-sale` (`allOffers`) |
| Featured | `?collection=featured` | `isCertified=true` |

Selecting a category from the sidebar navigates with **only** that category (other filters reset). Clear-all navigates to bare `/categories`.

`useCategoryProducts` now loads **all products** when no category id is set, and supports `isCertified`.

---

## Components / Files Updated

| File | Change |
|------|--------|
| `src/utils/categoryBrowseParams.ts` | **Created** — parse/build browse query params |
| `src/pages/CategoriesPage.tsx` | Renders listing (`CategoryPageContent`) |
| `src/pages/CategoryPage.tsx` | Redirect to category query |
| `src/pages/CollectionPage.tsx` | Redirect to collection query |
| `src/components/category/CategoryPageContent.tsx` | Single listing driven by search params |
| `src/components/category/filters/CategoryFilter.tsx` | Navigates with `?category=` |
| `src/hooks/useCategoryProducts.ts` | Optional category; certified support |
| `src/utils/productQueryParams.ts` | `isCertified` option |
| `src/config/collections.ts` | `getCollectionHref` → Categories |
| `src/utils/bannerMappers.ts` | Category links use browse path |
| `src/utils/productDetailMappers.ts` | Category href uses browse path |
| `src/components/shop/moreReasonsData.ts` | Unchanged data; hrefs via `getCollectionHref` |
| `src/components/landing/best-seller/BestSellerSection.tsx` | View-all → best sellers browse |
| `src/components/landing/footer/Footer.tsx` | New Arrivals / Best Sellers links |
| `src/components/category/CategoriesLandingContent.tsx` | Category links updated (unused by route) |
| `src/components/shop/recommended/ProductCard.tsx` | Add to cart in place |
| `src/components/landing/best-seller/ProductCard.tsx` | Add to cart in place |
| `src/components/ui/IconActionButton.tsx` | Optional `disabled` |

---

## Product Card Add to Cart

- Calls `useCart().addToCart(productId, 1)`
- Stays on the current page (no cart redirect)
- Success/error toasts come from **CartContext** (existing behavior)
- Navbar cart counter updates via existing cart state

---

## Confirmation

- **Backend files modified:** none  
- **New pages created:** none (only redirects + listing reuse)  
- **UI redesign:** none — same listing/sidebar/toolbar components  
- **Lint / build:** pass
