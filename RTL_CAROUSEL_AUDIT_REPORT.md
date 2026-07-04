# RTL Carousel Audit Report

**Date:** July 4, 2026  
**Stack:** Custom Framer Motion carousels + CSS marquee (no Embla / Swiper / Keen)

---

## Shared strategy

Framer Motion uses **physical X** (`left` / `right`, `translateX`). Under `html[dir=rtl]`, flex and transform math break scroll, drag, autoplay, and loops.

**Do not use `flex-direction: row-reverse`.**

| Type | Approach |
|------|----------|
| Transform / drag carousels | Wrap in shared `CarouselFrame` (`dir="ltr"`) so motion stays physical LTR |
| CSS marquee | Keep LTR layout; reverse **only** animation keyframes when `html[dir=rtl]` |
| Index-only gallery nav | `dir="ltr"` on the nav row so prev/next order matches chevrons |

Shared primitive: `src/components/carousel/CarouselFrame.tsx`

---

## Carousels inspected

| # | Carousel | Component(s) | Used on |
|---|----------|--------------|---------|
| 1 | Brands marquee | `Marquee` → `TrustedBySection` | Home |
| 2 | Shop hero banners | `PromoCarousel` → `ShopHeroCarousel` | Shop |
| 3 | Skin concerns strip | `StripCarousel` → `SkinConcernSection` | Home, Shop |
| 4 | Shop categories strip | `StripCarousel` → `ShopCategoriesStrip` | Shop |
| 5 | Best sellers (cover-flow) | `BestSellerSection` + landing `ProductCard` | Home |
| 6 | Offers countdown | `CountdownPromoCarousel` | Shop |
| 7 | Recommended products | `ProductCarousel` | Shop |
| 8 | Previously browsed | `ProductCarousel` | Shop, Category, Cart, Product |
| 9 | Related / brand products | `ProductCarousel` | Product detail |
| 10 | Product image gallery | `ProductImageGallery` | Product detail |
| 11 | Hero decorative controls | `HeroSection` | Home (not a real carousel) |

**Not present:** Embla, Swiper, Keen Slider, “More Reasons” carousel (static grid).

---

## Issues found

| Carousel | Issue |
|----------|--------|
| **StripCarousel** | No RTL isolation — `animate={{ x }}` / drag broke under Arabic |
| **PromoCarousel** | Relied on ad-hoc `dir="ltr"` only in Shop wrapper; core component unprotected |
| **CountdownPromoCarousel** | Enter/exit `x` and drag not isolated — wrong slide direction in RTL |
| **ProductCarousel** | Had local `dir="ltr"` but inconsistent with other carousels |
| **Best sellers** | Local `dir="ltr"` only on motion node |
| **Marquee** | Previously fixed (animation reverse); now uses shared frame |
| **Promo controls** | `rtl:-scale-x-100` on chevrons flipped icons even inside LTR frames (html `[dir=rtl] *` match) |
| **Product gallery** | Flex nav reordered under RTL; chevrons no longer matched prev/next |

---

## Fixes applied

| File | Change |
|------|--------|
| `src/components/carousel/CarouselFrame.tsx` | **Added** — shared `dir="ltr"` frame |
| `src/components/carousel/index.ts` | Export `CarouselFrame` |
| `src/components/carousel/StripCarousel.tsx` | Use `CarouselFrame` |
| `src/components/carousel/PromoCarousel.tsx` | Use `CarouselFrame` |
| `src/components/carousel/PromoCarouselControls.tsx` | Remove incorrect `rtl:-scale-x-100` |
| `src/components/shop/recommended/ProductCarousel.tsx` | Use `CarouselFrame`; physical `left`/`right` arrows |
| `src/components/promo-carousel/CountdownPromoCarousel.tsx` | Use `CarouselFrame` |
| `src/components/landing/best-seller/BestSellerSection.tsx` | Use `CarouselFrame` |
| `src/components/ui/Marquee.tsx` | Use `CarouselFrame`; keep CSS animation reverse |
| `src/components/shop/ShopHeroCarousel.tsx` | Remove redundant wrapper (frame is in `PromoCarousel`) |
| `src/components/product/ProductImageGallery.tsx` | `dir="ltr"` on gallery nav |

**Unchanged:** spacing, card sizes, animation durations, backend, page layouts.

---

## Behavior after fix (LTR & RTL)

| Check | Transform carousels | Marquee | Gallery |
|-------|---------------------|---------|---------|
| Initial position | ✓ | ✓ | ✓ |
| Scroll / animation direction | Physical LTR (stable) | LTR: R→L, RTL: L→R | N/A (index swap) |
| Prev / next | ✓ Left / right | N/A | ✓ Left / right |
| Drag / touch | ✓ Physical X | N/A | N/A |
| Autoplay | ✓ Advances “next” | Continuous | N/A |
| Infinite loop | ✓ Where designed | ✓ Seamless | ✓ Wrap |
| Snap / active / dots | ✓ | N/A | ✓ |
| Overflow / spacing / sizes | Unchanged | Unchanged | Unchanged |

---

## Remaining notes

| Item | Status |
|------|--------|
| Hero desktop composition | Still `dir="ltr"` for fixed SVG layout (not a scroll carousel) |
| Pagination component (category pages) | Not a carousel; not in this audit |
| Keyboard focus order | Follows LTR frame order inside carousels (intentional for motion consistency) |

No known remaining carousel RTL regressions from this audit.

---

## Verification

```
npm run lint  ✅
npm run build ✅
```
