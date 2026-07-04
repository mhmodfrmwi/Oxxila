# Checkout Flow i18n Migration Report

**Date:** July 4, 2026  
**Scope:** Add Address, Payment, Order Confirmation, Track Order  
**i18n architecture / RTL / carousels:** Unchanged

---

## Summary

Checkout UI labels use `checkout.*` keys in existing `common.json`. Shared keys (`nav.home`, `nav.cart`, `cart.summary.*`, `cart.shipping.*`, `actions.continueShopping`, `shop.promo`, `cart.summary.payNow`) are reused. Backend data (order IDs, tracking numbers, names, addresses, Stripe/Paymob, product names) is not translated.

`npm run lint` and `npm run build` both pass.

---

## Files Modified

### Locale
| File | Change |
|------|--------|
| `src/i18n/locales/en/common.json` | Added `checkout.*` (EN) |
| `src/i18n/locales/ar/common.json` | Added `checkout.*` (AR) |

### Pages
| File | Change |
|------|--------|
| `src/pages/PaymentPage.tsx` | Utility promo |
| `src/pages/OrderConfirmationPage.tsx` | Utility promo |
| `src/pages/TrackOrderPage.tsx` | Utility promo |

### Checkout components
| File | Change |
|------|--------|
| `src/components/checkout/CheckoutStepper.tsx` | Step labels, progress aria |
| `src/components/checkout/PaymentPageContent.tsx` | Breadcrumb, Back, Payment title, security note |
| `src/components/checkout/PaymentMethodSection.tsx` | Billing form, COD, change address |
| `src/components/checkout/OrderConfirmationContent.tsx` | Success copy, meta labels, actions |
| `src/components/checkout/OrderStatusStepper.tsx` | Status step labels |
| `src/components/checkout/TrackOrderPageContent.tsx` | Breadcrumb, cancel, continue |

### Order components
| File | Change |
|------|--------|
| `src/components/order/OrderDeliveryBanner.tsx` | On-the-way copy, tracking label |
| `src/components/order/OrderPageHeader.tsx` | Order #, placed on, status labels |
| `src/components/order/OrderShippingInfoCard.tsx` | Shipping info labels |
| `src/components/order/OrderSummarySection.tsx` | Reuses `cart.summary.title` / total |

### Address components
| File | Change |
|------|--------|
| `src/components/account/AddAddressPageContent.tsx` | Form, breadcrumb, save/update |
| `src/components/account/SavedAddressCard.tsx` | Edit/delete, phone label |

### Hooks
| File | Change |
|------|--------|
| `src/hooks/useAddAddressPage.ts` | Validation + toast messages |
| `src/hooks/usePaymentPage.ts` | Validation + toast messages |
| `src/hooks/useTrackOrderPage.ts` | Load/cancel error fallbacks |

**Not modified:** Home, Shop, Product Details, Cart pages, Categories, Profile, Auth, i18n config, RTL, carousel logic.

---

## Translation Keys Added (`checkout.*`)

| Group | Contents |
|-------|----------|
| Root | `title`, `progress`, `back`, `steps.*` |
| `address.*` | Page/form labels, validation, toasts, edit/delete |
| `payment.*` | Payment UI, billing form, COD, security note, toasts |
| `confirmation.*` | Thank you, order meta, shipping, track CTA |
| `track.*` | Track page, delivery banner, cancel, temperature note |
| `status.*` | Approved, Confirmed, Processing, Shipping, Delivery, Delivered, Cancelled, Pending |

### Reused keys

| Key | Usage |
|-----|--------|
| `nav.home` | Breadcrumbs |
| `nav.cart` / `checkout.steps.cart` | Stepper |
| `cart.summary.*` | Order summary titles/totals |
| `cart.shipping.*` | Shipping bar (payment page) |
| `cart.summary.payNow` | Payment CTA |
| `actions.continueShopping` | Confirmation / track CTAs |
| `shop.promo.*` | Utility promo on payment/confirmation/track |

---

## Components Migrated

| Area | Components |
|------|------------|
| Stepper | `CheckoutStepper` |
| Address | `AddAddressPageContent`, `SavedAddressCard`, `useAddAddressPage` |
| Payment | `PaymentPageContent`, `PaymentMethodSection`, `usePaymentPage` |
| Confirmation | `OrderConfirmationContent`, `OrderStatusStepper` |
| Track | `TrackOrderPageContent`, `OrderPageHeader`, `OrderDeliveryBanner`, `OrderShippingInfoCard`, `OrderSummarySection`, `useTrackOrderPage` |

---

## Remaining Hardcoded Strings (intentional)

| Item | Reason |
|------|--------|
| Order / tracking IDs | Backend identifiers |
| Customer name, email, phone, addresses | User/backend data |
| Stripe / Paymob labels | Payment provider names (not translated) |
| `order.orderStatusLabel` | Backend status label |
| Shipping method names from API | Backend data (fallback “Standard Shipping” is translated) |
| Delivery date ranges | Formatted dates (locale-aware formatters unchanged) |
| Governorate / district option names | Backend location data |
| API error messages from `ApiError` | Server-provided |

---

## RTL Fixes

| Item | Change |
|------|--------|
| Payment / Track back links | `rtl:-scale-x-100` on `ArrowLeft` |
| Add Address close button | `end-*` / `pe-*` instead of `right-*` / `pr-*` |
| Saved address card | `text-start` |

No changes to RTL architecture or carousel logic.

---

## Verification

```
npm run lint  ✅
npm run build ✅
```
