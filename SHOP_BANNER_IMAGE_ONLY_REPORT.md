# Shop Banner Image-Only Refinement Report

**Date:** July 4, 2026  
**Scope:** Shop hero banners — image-only promotional cards with API-driven navigation  
**Backend:** Not modified

---

## Summary

Shop banners now show only the API image (no title, brand, badge, CTA, or other overlays). The full card is a single link to the destination resolved from the banner API (`linkType`, `linkId`, `externalUrl`). Loading skeleton, error/empty states, dimensions, radius, and shadow are unchanged.

`npm run lint` and `npm run build` both pass.

**No backend files were modified.**

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/shop/ProductPromoCard.tsx` | Image-only clickable card (`Link` / external `<a>` / static `article`) |
| `src/components/shop/ShopHeroCarousel.tsx` | Dropped overlay i18n mapping; passes slides through |
| `src/components/shop/shopData.ts` | `ShopHeroSlide` reduced to `id`, `image`, `imageAlt`, `href` |
| `src/components/shop/index.ts` | Removed unused `ShopHeroSlideVariant` export |
| `src/utils/bannerMappers.ts` | Maps image + resolved `href` only |
| `src/styles/promo-banner.css` | Kept shell tokens (bg, border, shadow, active ring) |

Unchanged: `useShopBanners`, `getBanners` / banner API client (no extra requests).

---

## Navigation Behavior

| `linkType` | Fields used | Destination |
|------------|-------------|-------------|
| `product` | `linkId` | `/products/<linkId>` |
| `category` | `linkId` (+ catalog slug when available) | `/categories?category=<slug>`, or `/categories` if slug not resolved |
| `url` | `externalUrl` | External URL (`target="_blank"`, `rel="noopener noreferrer"`) |
| `none` (or missing target) | — | Not linkable (static card, no pointer) |

Destinations are derived only from the banner payload (plus already-loaded categories for slug resolution). No hardcoded marketing routes.

Interaction:

- Pointer cursor when linkable
- Hover lift + stronger shadow
- Focus-visible ring (`focusRingClasses`)
- `aria-label` from banner title / image alt

---

## Banner API Fields Used

| Field | Use |
|-------|-----|
| `id` | Slide key |
| `image` | Full-bleed card image (`object-cover`) |
| `title` | Image `alt` / accessible label (fallback: “Promotional banner”) |
| `linkType` | Navigation mode |
| `linkId` | Product or category target |
| `externalUrl` | External link target |

---

## Preserved UI

- Border radius (`rounded-card`)
- Shadow (including active ring)
- Responsive width/height breakpoints
- Loading skeleton
- Error and empty messages
- Carousel controls / autoplay

Removed: brand mark, headline, CTA, badge, stats, disclaimer, swirl overlays.

---

## Confirmation

- **Backend files modified:** none  
- **Additional API requests:** none  
- **Lint / build:** pass
