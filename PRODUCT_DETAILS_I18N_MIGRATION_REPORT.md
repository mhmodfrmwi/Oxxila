# Product Details i18n Migration Report

**Date:** July 4, 2026  
**Scope:** Product Details page and exclusive product components  
**i18n architecture / RTL system:** Unchanged

---

## Summary

All Product Details UI labels use the existing `common` namespace under `productDetail.*`. Shared keys (`nav.home`, `actions.addToCart`, `shop.product.addToWishlist`) are reused. API/dynamic content is not translated.

`npm run lint` and `npm run build` both pass.

---

## Files Modified

| File | Change |
|------|--------|
| `src/i18n/locales/en/common.json` | Added `productDetail.*` (EN) |
| `src/i18n/locales/ar/common.json` | Added `productDetail.*` (AR) |
| `src/types/productDetail.ts` | Added `offerEndsAt` for locale-aware formatting |
| `src/utils/productDetailMappers.ts` | Populate `offerEndsAt` |
| `src/pages/ProductPage.tsx` | Utility promo strings |
| `src/components/product/ProductPageContent.tsx` | Breadcrumb, errors |
| `src/components/product/ProductHero.tsx` | Purchase card labels, cart messages, meta |
| `src/components/product/ProductDescriptionCard.tsx` | Tab labels |
| `src/components/product/ProductImageGallery.tsx` | Gallery aria labels |
| `src/components/product/QuantitySelector.tsx` | Quantity aria labels |
| `src/components/product/VariantSelector.tsx` | Options aria |
| `src/components/product/QuestionsSafetySection.tsx` | Section defaults |
| `src/components/product/reviews/ReviewsSection.tsx` | Empty / view all |
| `src/components/product/reviews/RatingSummaryCard.tsx` | Summary labels |
| `src/components/product/reviews/ReviewCard.tsx` | Helpful / Translate |
| `src/components/product/MoreFromMACCosmetics.tsx` | Section title |
| `src/components/product/PreviouslyBrowsedRelated.tsx` | Section title |

**Not modified:** Home, Shop, Category, Cart, Checkout, Orders, Profile, Auth pages; i18n config; RTL architecture.

---

## Translation Keys Added (`productDetail.*`)

Promo, errors, price/stock labels, media/before-after, shade/size/quantity, CTAs, meta (SKU, category, brand, availability, tags), badges, cart messages, description tabs, gallery, questions & safety, reviews, more-from-brand, previously browsed related.

### Reused keys

| Key | Usage |
|-----|--------|
| `nav.home` | Breadcrumb |
| `actions.addToCart` | Primary CTA |
| `shop.product.addToWishlist` | Wishlist button |

---

## Components Migrated

| Component | UI strings |
|-----------|------------|
| `ProductPage` | Return promo |
| `ProductPageContent` | Breadcrumb Home, not found / load error |
| `ProductHero` | Stock, quantity, CTAs, meta labels, cart feedback, badges, offer ends |
| `ProductDescriptionCard` | Description / Advantages / Composition tabs |
| `ProductImageGallery` | Gallery navigation aria |
| `QuantitySelector` | Increase / decrease / quantity value |
| `VariantSelector` | Options group aria |
| `QuestionsSafetySection` | Title, subtitle, ask specialist |
| `ReviewsSection` | Empty, view all |
| `RatingSummaryCard` | Based on N reviews, write review |
| `ReviewCard` | Helpful, Translate |
| `MoreFromMACCosmetics` | More from {brand} |
| `PreviouslyBrowsedRelated` | Section title |

---

## Remaining Hardcoded Strings (intentional)

| Item | Reason |
|------|--------|
| Product name, brand, description, advantages, composition | API content |
| Category / subcategory / tag names | API content |
| FAQ questions & answers | API content |
| Review title, comment, author, date | API content |
| Variant option values (shade/size codes) | Product data |
| SKU value | Product ID |
| Delivery estimate text from API | Dynamic backend string |
| API error messages from `ApiError` | Server-provided |

---

## RTL Fixes

No new RTL changes required. Gallery nav already uses `dir="ltr"` (from prior carousel audit). Related/recommended carousels use shared `CarouselFrame`. Quantity controls and tabs use existing layout; no redesign.

---

## Verification

```
npm run lint  ✅
npm run build ✅
```
