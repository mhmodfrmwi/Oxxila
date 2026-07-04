# Shop Page i18n Migration Report

**Date:** July 4, 2026  
**Scope:** Shop (`/shop`) and Shop-used shared components  
**i18n architecture / Language Switcher / RTL system:** Unchanged

---

## Summary

All user-facing static strings on the Shop page now use the existing `common` namespace via `useTranslation()`. Shop-specific keys live under `shop.*` in `common.json` (no config changes). Shared keys such as `actions.addToCart` and `home.skinConcerns.*` (via `SkinConcernSection`) are reused.

`npm run lint` and `npm run build` both pass.

---

## Files Modified

| File | Change |
|------|--------|
| `src/i18n/locales/en/common.json` | Added `shop.*` keys (EN) |
| `src/i18n/locales/ar/common.json` | Added `shop.*` keys (AR) |
| `src/pages/ShopPage.tsx` | Utility promo strings |
| `src/components/shop/ShopHeroCarousel.tsx` | Banner empty/error/aria; localized defaults |
| `src/components/shop/ShopCategoriesStrip.tsx` | Category names + aria |
| `src/components/shop/MoreReasonsSection.tsx` | Section + card titles/subtitles/alts |
| `src/components/shop/recommended/RecommendedProductsSection.tsx` | Section title + carousel aria |
| `src/components/shop/previously-browsed/PreviouslyBrowsedProductsSection.tsx` | Section title + aria |
| `src/components/shop/brand-stores/BrandStores.tsx` | Title, empty, error |
| `src/components/shop/recommended/ProductCard.tsx` | Wishlist/cart labels; logical positions |
| `src/components/shop/recommended/ProductCarousel.tsx` | Arrow labels; `dir="ltr"` track; logical arrows |
| `src/components/shop/ProductPromoCard.tsx` | `text-start` for RTL-safe typography |
| `src/components/promo-carousel/PromoCarouselSection.tsx` | Offers empty/error/aria |
| `src/hooks/useOffersCarousel.ts` | Offer titles + load error |
| `src/components/promo-carousel/CountdownTimer.tsx` | “open in” label |
| `src/components/carousel/PromoCarouselControls.tsx` | Slide controls aria; RTL chevrons |

**Not modified:** `src/i18n/index.ts`, Language Switcher, Home page files, Category / Product / Cart / Checkout / Orders / Profile / Auth pages.

**Already translated (shared):** Footer, Navbar, UtilityBar, `SkinConcernSection` (defaults from `home.skinConcerns.*`).

---

## Translation Keys Added (`shop.*`)

| Group | Keys |
|-------|------|
| Promo bar | `shop.promo.title`, `subtitle` |
| Banners | `ariaLabel`, `empty`, `loadError`, `specialOffer`, `shopNow`, `featured`, `brand` |
| Categories strip | `ariaLabel`, `items.{skin-care,hair-care,...}` |
| More reasons | `title`, `items.{new-arrivals,best-sellers,top-rated,offers-discounts,dermatologist}.{title,subtitle,imageAlt}` |
| Recommended | `title`, `ariaLabel` |
| Previously browsed | `title`, `ariaLabel` |
| Offers | `ariaLabel`, `empty`, `loadError`, `specialOffer`, `percentOff`, `percentOffWithName`, `openIn`, `carouselAria` |
| Brands | `title`, `empty`, `loadError` |
| Carousel | `previous`, `next`, `previousSlide`, `nextSlide`, `pagination`, `goToSlide`, `promotional` |
| Product | `addToWishlist` |

### Reused existing keys

| Key | Usage |
|-----|--------|
| `actions.addToCart` | Product card cart button |
| `home.skinConcerns.*` | Skin Concerns section (shared component defaults) |

---

## Strings Migrated (by section)

| Section | Migrated |
|---------|----------|
| Utility promo | Return within 20 days / from purchase date |
| Shop banners | Empty, error, aria, SHOP NOW, FEATURED, Special Offer |
| Categories strip | All category labels + aria |
| More Reasons To Shop | Section title + all 5 cards |
| Recommended for you | Title + carousel aria |
| Previously browsed | Title + aria |
| Offers / countdown | Empty, error, aria, % Off templates, “open in” |
| Official brand stores | Title, empty, error |
| Skin Concerns | Via existing `SkinConcernSection` translations |
| Product cards | Add to cart / wishlist aria |
| Carousel controls | Prev/next/pagination labels |

**Not on Shop page (listed in brief but Category-only):** filters, sort dropdown, product count, pagination, breadcrumb, page title — no Shop UI for these.

---

## Remaining Hardcoded Strings on Shop

| Item | Reason |
|------|--------|
| API product titles, brands, prices | Dynamic catalog data |
| Banner headlines from API | Admin-provided content (defaults localized) |
| Offer product names in titles | Dynamic product names |
| Brand store names / logo alts | Brand proper nouns from API |
| Category strip image assets | Non-text |

---

## RTL Issues Fixed

| Area | Fix |
|------|-----|
| Product cards | `start`/`end` for badge and action buttons |
| Product carousel | `dir="ltr"` on track (stable scroll math); `start`/`end` arrows; `pe-*` padding |
| Banner carousel | `dir="ltr"` wrapper (layered card motion unchanged) |
| Promo controls | `rtl:-scale-x-100` on chevrons |
| Promo card typography | `text-start` instead of `text-left` |

No redesign; spacing and sizes unchanged.

---

## Verification

```
npm run lint  ✅
npm run build ✅
```
