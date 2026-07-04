# Cart Page i18n Migration Report

**Date:** July 4, 2026  
**Scope:** Cart page and shared cart components  
**i18n architecture / RTL / carousels:** Unchanged

---

## Summary

Cart UI labels use `cart.*` keys in existing `common.json`. Shared keys (`nav.home`, `nav.cart`, `actions.continueShopping`, `shop.promo`, quantity labels via `QuantitySelector`) are reused. Product names, prices, and coupon codes are not translated.

`npm run lint` and `npm run build` both pass.

---

## Files Modified

| File | Change |
|------|--------|
| `src/i18n/locales/en/common.json` | Added `cart.*` (EN) |
| `src/i18n/locales/ar/common.json` | Added `cart.*` (AR) |
| `src/pages/CartPage.tsx` | Utility promo (reuses `shop.promo`) |
| `src/components/cart/CartPageContent.tsx` | Title, breadcrumb, counts, errors, carousels |
| `src/components/cart/CartEmptyState.tsx` | Empty state + continue shopping |
| `src/components/cart/CartItemRow.tsx` | Delivery note, line total, aria labels |
| `src/components/cart/CartShippingBar.tsx` | Shipping to / change address |
| `src/components/cart/CartTrustBadges.tsx` | Trust badge labels (cart + payment variants) |
| `src/components/cart/OrderSummaryCard.tsx` | Summary rows, promo, CTA defaults |

**Not modified:** Checkout/Orders/Profile/Auth/Category pages, i18n config, RTL architecture, carousel logic.

**Already translated (shared):** `QuantitySelector` (`productDetail.*` quantity aria), Footer, Navbar.

---

## Translation Keys Added (`cart.*`)

| Group | Keys |
|-------|------|
| Page | `title`, `itemsAria`, `itemCount_one` / `itemCount_other` |
| Errors | `updateQuantityError`, `removeItemError` |
| Item row | `selectItem`, `removeItem`, `freeDelivery`, `lineTotal` |
| Empty | `empty.title`, `empty.description` |
| Shipping bar | `shipping.to`, `addAddress`, `changeAddress` |
| Summary | `title`, `reviewTitle`, `subtotal`, `discount`, `shipping`, `free`, `estimatedTax`, `storeCredit`, `total`, promo fields, CTA labels, `qty` |
| Trust | cart + payment badge labels |
| Sections | `recentlyViewed`, `buyAgain` (+ aria) |

### Reused keys

| Key | Usage |
|-----|--------|
| `nav.home` / `nav.cart` | Breadcrumb |
| `actions.continueShopping` | Empty state CTA |
| `shop.promo.*` | Utility promo bar |
| `productDetail.decreaseQuantity` / `increaseQuantity` / `quantityValue` | Via `QuantitySelector` |

---

## Components Migrated

| Component | UI strings |
|-----------|------------|
| `CartPage` | Return promo |
| `CartPageContent` | Shopping Cart, item count, errors, recently viewed, buy again |
| `CartEmptyState` | Empty title/description, continue shopping |
| `CartItemRow` | Free delivery, Total, select/remove aria |
| `CartShippingBar` | Shipping to, change address |
| `CartTrustBadges` | All trust labels |
| `OrderSummaryCard` | Order Summary/Review, line labels, promo, Apply/Remove, Proceed to checkout / Pay Now |

---

## Remaining Hardcoded Strings (intentional)

| Item | Reason |
|------|--------|
| Product names, images alts | API content |
| Prices / line totals (numeric) | Formatted currency values |
| Coupon code values | User/API data |
| Address text (street, city) | User data |
| API error messages from `ApiError` | Server-provided |
| Payment `footerNote` prop | Passed by checkout (out of scope) |

---

## RTL Fixes

| Item | Change |
|------|--------|
| Pay Now chevron | `rtl:-scale-x-100` on `ChevronRight` in review mode |

Cart layout already uses flex `space-between` and grid; no structural RTL changes required. Quantity selector and product carousels use existing shared RTL-safe components.

---

## Verification

```
npm run lint  ✅
npm run build ✅
```
