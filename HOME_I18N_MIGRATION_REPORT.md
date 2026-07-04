# Home Page i18n Migration Report

**Date:** July 4, 2026  
**Scope:** Home (`/home` / `LandingPage`) only  
**i18n architecture / configuration:** Unchanged

---

## Summary

All user-facing static strings on the Home page now use the existing `common` namespace via `useTranslation()`. Page-specific keys live under `home.*` in `common.json` (no `home.json` namespace registration, so i18n config was not modified). Shared keys such as `actions.addToCart` are reused.

`npm run lint` and `npm run build` both pass.

---

## Files Modified

| File | Change |
|------|--------|
| `src/i18n/locales/en/common.json` | Added `home.*` keys (EN) |
| `src/i18n/locales/ar/common.json` | Added `home.*` keys (AR) |
| `src/pages/LandingPage.tsx` | Passes translated skin-concern title/subtitle |
| `src/components/landing/HeroSection.tsx` | Hero copy, CTAs, a11y labels |
| `src/components/landing/TrustedBySection.tsx` | Section aria-label; logical padding |
| `src/components/landing/SkinConcernSection.tsx` | Titles, aria, concern names |
| `src/components/landing/CategoryCard.tsx` | RTL arrow flip (`rtl:-scale-x-100`) |
| `src/components/landing/best-seller/BestSellerSection.tsx` | Titles, CTA, empty state; carousel `dir="ltr"` |
| `src/components/landing/best-seller/ProductCard.tsx` | Badge, wishlist/cart aria; logical positions |
| `src/components/landing/best-seller/CarouselControls.tsx` | Carousel aria labels |
| `src/components/landing/how-it-works/HowItWorksSection.tsx` | Title, video dialog, a11y |
| `src/components/landing/how-it-works/HowItWorksAccordion.tsx` | Step titles/descriptions |
| `src/components/landing/contact/ContactSection.tsx` | Title, contact card labels |
| `src/components/landing/contact/ContactForm.tsx` | Fields, validation, submit states |

**Not modified:** `src/i18n/index.ts`, Shop / Categories / Product / Cart / Checkout / Orders / Profile pages.

**Already translated (prior work):** Footer, Navbar, UtilityBar (shared shell).

---

## Translation Keys Added (`home.*`)

### Hero
`home.hero.title`, `titleLine1`, `titleLine2`, `subtitle`, `subtitleDesktop`, `startShopping`, `contactUs`, `productsAlt`, `previousSlide`, `nextSlide`

### Trusted by (brands marquee)
`home.trustedBy.ariaLabel`

### Skin concerns
`home.skinConcerns.title`, `titleCompact`, `subtitle`, `ariaLabel`  
`home.skinConcerns.items.{acne,pigmentation,sensitive-skin,drought,wrinkles,wide-pores}`

### Best sellers (product collection carousel)
`home.bestSellers.title`, `subtitle`, `badge`, `viewAll`, `carouselAria`, `goToProduct`, `addToWishlist`, `empty`

### How it works
`home.howItWorks.title`, `stepsAria`, `playVideo`, `thumbAlt`, `videoDialog`, `closeVideo`, `close`, `videoPlaceholder`  
`home.howItWorks.steps.{concern,explanations,checkout}.{title,description}`

### Contact
`home.contact.title`, `name`, `email`, `message`, `send`, `sending`, `sent`  
`home.contact.nameRequired`, `emailRequired`, `emailInvalid`, `messageRequired`  
`home.contact.call`, `emailLabel`, `location`

### Reused from existing `common.json`
| Key | Usage |
|-----|--------|
| `actions.addToCart` | Best-seller card cart button aria-label |

---

## Strings Migrated (by section)

| Section | Migrated |
|---------|----------|
| **Hero Banner** | Headline, subtitle, Start Shopping, Contact Us, image alt, slide controls |
| **Brands (Trusted By)** | Section aria-label |
| **Skin Concerns** | Section title/subtitle, card names, carousel aria |
| **Product Collections (Best Sellers)** | Title, subtitle, badge, View all, empty state, carousel controls |
| **Buttons** | Hero CTAs, View all products, contact Send / Sending / Sent, card action aria |
| **Section Titles** | All Home section headers |
| **Empty States** | Best sellers empty message |
| **Loading** | Skeleton UI only (no text); contact/newsletter loading labels translated |

**Note:** Home does not include Shop-only sections (Offers countdown, More Reasons To Shop). Those remain on Shop and were not migrated.

---

## Remaining Hardcoded Strings on Home

| Item | Reason |
|------|--------|
| Product titles / prices from API | Dynamic catalog data (backend language) |
| Brand logo `alt` text in `trustedLogos.ts` | Brand names (proper nouns) |
| Contact phone / email / address values | Real contact data, not UI chrome |
| Utility promo bar (“Free shipping…”) | Layout promo prop; not Home-section content |
| Footer social network names | Proper nouns (Facebook, etc.) |

---

## RTL Notes (no redesign)

| Area | Approach |
|------|----------|
| Hero desktop composition | `dir="ltr"` on fixed SVG layout so decorative positions stay correct |
| Best-seller 3D carousel | `dir="ltr"` on motion stage so offsets/drag stay consistent |
| Cards / forms / icons | Logical properties (`start`/`end`/`ms`) and `rtl:-scale-x-100` on concern arrows |
| Centered typography | Unchanged (`text-center`) — works in both directions |
| Section spacing | Unchanged |

---

## Verification

```
npm run lint  ✅
npm run build ✅
```
