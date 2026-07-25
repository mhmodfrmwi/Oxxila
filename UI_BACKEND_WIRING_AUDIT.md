# UI → Backend Wiring Audit

Read-only, screen-by-screen inspection of the Oxxila frontend (`oxilla`), performed as a simulated manual test of every route. Every interactive element was traced through its component → hook/context → API client → backend endpoint chain.

No code was modified for this report. Generated July 25, 2026.

**Status legend**

- ✅ **Fully connected** — handler → hook → API client → real endpoint, with response handling (toast/refresh)
- 🟡 **Partially connected** — wired but missing a piece (server-side behavior, toast, rollback, or the data is cosmetic)
- 🔴 **Not connected** — disabled, stubbed ("Soon"), placeholder, local-state only, or dead link

**Backend status** refers to whether the corresponding backend endpoint exists and is ready.

---

## Wiring Table — Admin

| Screen | Component | UI Status | Backend Status | Missing Connection | Priority |
|---|---|---|---|---|---|
| Dashboard | KPI cards (revenue / orders / conversion / abandoned) | ✅ Full | Ready | — (`GET /dashboard` → `kpis`) | — |
| Dashboard | Revenue chart + Daily/Weekly toggle + Retry | ✅ Full | Ready | — (`GET /dashboard/revenue`) | — |
| Dashboard | Customer Segments / Top Products / Low Stock / Recent Orders cards | ✅ Full | Ready | — (all from `GET /dashboard`) | — |
| Dashboard | Period selector | 🔴 None | Ready (`?period`) | Period hardcoded to 30 days; no selector UI | P2 |
| Dashboard | Header search | 🟡 Partial | N/A | Filters already-loaded card data client-side only | P2 |
| Products | Table (search / category filter / pagination / states) | ✅ Full | Ready | — (server-side `GET /products?keyword&category&page`) | — |
| Products | Add Formula + create/edit drawer (uploads, validation, toasts) | ✅ Full | Ready | — (`POST/PUT /products` multipart) | — |
| Products | Archive + confirm | ✅ Full | Ready | — (`PUT /products/:id { isActive:false }`) | — |
| Products | Bulk Actions menu | 🔴 None | Partial | Menu opens to `bulkSoon` text only; no bulk endpoints either | P1 |
| Products | Best Seller toggle | 🔴 None | Ready | `PATCH /products/:id/best-seller` has no client or UI | P1 |
| Products | Hard delete | 🔴 None | Ready | `DELETE /products/:id` unused (archive-only policy undocumented) | P1 |
| Products | Performance column | 🟡 Partial | Ready | Mapper always returns `null`; displays "—" | P2 |
| Orders | Table (status tabs / date filters / pagination / states) | ✅ Full | Ready | — (server-side `GET /orders`) | — |
| Orders | Search | 🟡 Partial | Partial | Exact Mongo ObjectId only; no keyword/customer search (needs BE support) | P1 |
| Orders | Order Details drawer (load, returns link, retry) | ✅ Full | Ready | — (`GET /orders/:id`) | — |
| Orders | Cancel + reason dialog | ✅ Full | Ready | — (`PATCH /orders/:id/cancel`) | — |
| Orders | Assign Carrier + manual status update | ✅ Full | Ready | — (`GET/POST/PATCH /admin/shipping/orders/:id*`) | — |
| Orders | B2B Order drawer (customer/product search, zones, create) | ✅ Full | Ready | — (`POST /orders/b2b`) | — |
| Orders | **Refund button** | 🔴 None | Ready | Disabled stub (`refundSoon`); `POST /orders/:id/refund` unconnected | **P0** |
| Orders | Invoice button | 🔴 None | Missing | Disabled stub (`invoiceSoon`); no BE endpoint either | P1 |
| Orders | Shipping method select (drawer) | 🔴 None | N/A | Permanently disabled display-only control | P2 |
| Orders | Direct status transition (outside shipping flow) | 🟡 Partial | Ready | `PATCH /orders/:id/status` unused; transitions only via assign flow | P1 |
| Customers | Table (search / segment tabs / pagination / states) | ✅ Full | Ready | — (server-side `GET /users?role=user`) | — |
| Customers | KPI cards (Total Customers, Avg LTV) | ✅ Full | Ready | — (`GET /users/stats`) | — |
| Customers | Details drawer (load, retry, contact mailto) | ✅ Full | Ready | — (`GET /users/:id`) | — |
| Customers | Block User button | 🔴 None | Ready | Disabled stub (`blockSoon`); `PATCH /users/activate/:id` + `PUT /users/:id` unused | P1 |
| Customers | Create / Edit / Delete / Reset password | 🔴 None | Ready | `POST/PUT/DELETE /users*` + `changePassword/:id` have no UI | P1 |
| Reviews | Table (search / tabs / pagination) + overview cards + flagged queue | ✅ Full | Ready | — (`GET /reviews/admin*`) | — |
| Reviews | Visibility + Flag toggles (optimistic + rollback + toast) | ✅ Full | Ready | — (`PATCH /reviews/:id/visibility\|flag`) | — |
| Reviews | Details drawer (Approve / Hide / Flag / Unflag) | ✅ Full | Ready | — | — |
| Returns | Table (status tabs / pagination / order deep-link) | ✅ Full | Ready | — (`GET /returns`) | — |
| Returns | Approve / Reject / Picked up / Received / Refund dialogs | ✅ Full | Ready | — (`PATCH /returns/:id/status`) | — |
| Returns | Schedule Bosta pickup | ✅ Full | Ready | — (`POST /returns/:id/bosta/schedule`) | — |
| Shipping | Carrier CRUD + coverage + Bosta pickups + sync buttons | ✅ Full | Ready | — (`/admin/carriers*` incl. sync-zones/coverage/pickups) | — |
| Shipping | Carrier search | 🟡 Partial | Ready | Client-side filter of full list; no server search/pagination | P2 |
| Shipping | Method enable toggles | 🟡 Partial | Ready | Wired with optimistic+rollback but **no toast** | P2 |
| Shipping | Zone Manager (country/governorate/district CRUD) | ✅ Full | Ready | — | — |
| Settings | Apply All button (header) | 🔴 None | N/A | Disabled stub (`applySoon`) | P2 |
| Settings | Payment gateways list + Enable | 🟡 Partial | Ready | Enable wired but **no toast, no disable action**; `PATCH` supports both | P1 |
| Settings | Gateway Configure / New Payment buttons | 🔴 None | Missing | Disabled stubs (`configureSoon`, `newPaymentSoon`) | P2 |
| Settings | Coupon list / create / edit | ✅ Full | Ready | — (`GET/POST/PUT /coupons`) | — |
| Settings | Coupon delete | 🔴 None | Ready | `DELETE /coupons/:id` has no client or UI | P1 |
| Settings | Offers list / create / edit | 🟡 Partial | Ready | List uses public `GET /offers` (may hide inactive offers) | P1 |
| Settings | Offer delete | 🔴 None | Ready | `DELETE /offers/:id` has no client or UI | P1 |
| Settings | Banners list / create / edit / active toggle | ✅ Full | Ready | — (`/banners*` incl. `includeInactive=true`) | — |
| Settings | Banner delete | 🟡 Partial | Ready | Delete works but **no success toast** (inline error only) | P2 |
| Settings | Cart Recovery card metrics | ✅ Full | Ready | — (`GET /payments/cart-recovery`) | — |
| Settings | Cart Recovery period selector / Automate button | 🔴 None | Partial | Period fixed at 30 days; Automate is `automateSoon` stub | P2 |
| Settings | Admin roles list / add / edit | ✅ Full | Ready | — (`GET/POST/PUT /admins`) | — |
| Settings | Admin lock/unlock | 🟡 Partial | Ready | Wired via `PUT /admins/:id {active}` but **no toast** | P2 |
| Settings | Admin delete | 🔴 None | Ready | `DELETE /admins/:id` has no client or UI | P1 |
| Settings | Shipping & Logistics card | ✅ Full | Ready | Read-only by design (`GET /admin/carriers`); hub map is a static asset | — |
| (Missing screens) | Categories / Brands / Subcategories admin management | 🔴 None | Ready | Full CRUD + image upload endpoints exist; no admin pages | P1 |
| (Missing screens) | FAQ admin management | 🔴 None | Ready | `POST/PUT/DELETE` FAQ endpoints exist; no admin UI | P1 |
| (Missing screens) | Payments summary widget | 🔴 None | Ready | `GET /payments/summary` unused | P1 |

## Wiring Table — Storefront, Auth, Account

| Screen | Component | UI Status | Backend Status | Missing Connection | Priority |
|---|---|---|---|---|---|
| Shell | Navbar cart badge / account menu / logout / search | ✅ Full | Ready | — (`GET /cart`, `POST /auth/logout`, search → `GET /products?keyword`) | — |
| Shell | Language switcher / theme toggle | ✅ Full | N/A | Client-side by design (i18n / localStorage) | — |
| Landing | Best sellers carousel / skin concerns / hero CTA | ✅ Full | Ready | — (catalog context → `GET /products`, `/categories`, `/brands`) | — |
| Landing | Contact form | 🔴 None | Missing | Explicitly disabled; no BE endpoint | P2 |
| Landing | Newsletter subscribe | 🔴 None | Missing | Explicitly disabled (`newsletterUnavailable`); no BE endpoint | P2 |
| Landing | How-it-works video dialog | 🔴 None | N/A | Opens `videoPlaceholder` text; no video URL | P2 |
| Landing/Footer | Policy links (about, terms, privacy, quality, authenticity, standards, contact) | 🔴 None | N/A | Routes do not exist — dead links | P1 |
| Landing/Footer | Shopping links (`/concerns`, `/brands`, `/shipping`, `/track`, `?filter=new\|best`) | 🔴 None | N/A | Unrouted paths or ignored query params | P1 |
| Landing | Instagram grid / social icons | 🟡 Partial | N/A | Generic platform URLs, not brand accounts | P2 |
| Docs | Authenticity CTA | 🔴 None | N/A | Navigates to unrouted `/authenticity` | P2 |
| Shop | Banner carousel / categories / recommendations / offers / brands / history | ✅ Full | Ready | — (banners, catalog, recommendations, offers, browsing-history APIs) | — |
| Shop | Product card Add to Cart / Wishlist heart | ✅ Full | Ready | — (`POST /cart`, `POST/DELETE /wishlist`) | — |
| Categories | Filter sidebar / sort / pagination | ✅ Full | Ready | Server-side; rating, multi-brand, in-stock are client-side (BE lacks params) | P2 |
| Search | Results / sort / pagination / states | ✅ Full | Ready | — (server-side `GET /products?keyword`) | — |
| Product | Add to cart / one-click checkout / wishlist / share | ✅ Full | Ready | — | — |
| Product | Shade / size selectors | 🟡 Partial | Missing | Local-only; variant not sent in `POST /cart` (BE cart has no variant field) | P2 |
| Product | Reviews (list / stats / write / like / delete own / load more) | ✅ Full | Ready | — | — |
| Product | Edit own review | 🔴 None | Ready | `PUT /reviews/:id` has no UI | P2 |
| Product | Ask Specialist form | ✅ Full | Ready | — (`POST /products/:id/faqs/ask`) — note: BE route lacks auth (security) | P1 |
| Cart | Load / quantity / remove / apply-remove coupon / retry | ✅ Full | Ready | — (`/cart*` endpoints) | — |
| Cart | Item checkboxes | 🔴 None | N/A | Local selection unused at checkout — cosmetic | P2 |
| Cart | Clear cart | 🔴 None | Ready | No UI and no client for `DELETE /cart`; logout clears local state only | P1 |
| Cart | Buy again section | 🟡 Partial | Partial | Uses `GET /users/recommendations`, not actual order history | P2 |
| Payment | Address load/select/create + zones + shipping price resolve | ✅ Full | Ready | — (addresses + `/shipping/*` APIs) | — |
| Payment | Pay Now — COD | ✅ Full | Ready | — (`POST /orders`) | — |
| Payment | Pay Now — Card (Stripe/Paymob) | ✅ Full | Ready | — (`POST /orders/payment-session` → redirect) | — |
| Payment | Coupon entry on summary | 🟡 Partial | Ready | `showPromo={false}`; coupon only applicable on cart page | P2 |
| Payment Callback | Session status polling | ✅ Full | Ready | — (`GET /orders/payment-session/:id`) | — |
| Payment Callback Preview | Entire page | 🔴 None | N/A | Hardcoded demo data (dev preview page) | P2 |
| Order Confirmation | Order load / track link / cart refresh | ✅ Full | Ready | — (`GET /orders/my-orders/:id`) | — |
| Track Order | Order load / status stepper | 🟡 Partial | Ready | Uses `GET /orders/my-orders/:id` instead of `/track/order/:id`; no public tracking-number UI | P1 |
| Track Order | Cancel order | ✅ Full | Ready | — (`PATCH /orders/:id/cancel`) | — |
| Track Order | "Back to Orders" link | 🟡 Partial | Ready | Links to the Account Orders placeholder | P0 (same fix) |
| Returns | Eligible orders / item select / reason / proof upload / submit | ✅ Full | Ready | — (`GET /returns/eligible-orders`, `POST /returns` multipart); DEV-gated preview mocks | — |
| Returns History | Returns list + image enrichment | ✅ Full | Ready | — (`GET /returns/my-returns`); DEV-gated preview mocks | — |
| Wishlist | List / card actions | ✅ Full | Ready | — (`GET /wishlist`) | — |
| Wishlist | Clear wishlist | 🔴 None | Ready | `clearWishlist` client exists but no UI ever calls it | P2 |
| Login | Form / validation / OAuth buttons | ✅ Full | Ready | — (`POST /auth/login`, OAuth redirects) | — |
| Register | Form / validation / OAuth | ✅ Full | Ready | — (`POST /auth/register`) | — |
| Forgot Password | Email submit + resend | ✅ Full | Ready | — (`POST /auth/forgot-password`) | — |
| Verify OTP | OTP entry | 🔴 None | N/A | Page is "check your email" only; `OtpInput` component never imported; no OTP endpoint | P2 |
| Change Password (reset) | Token form | ✅ Full | Ready | — (`POST /auth/reset-password/:token`) | — |
| Account | Profile load / edit / avatar upload / password change | ✅ Full | Ready | — (`GET /users/getMe`, `PATCH updateMe/updateMyAvatar/updateMyPassword`) | — |
| Account | Deactivate / reactivate account | 🔴 None | Ready | `PATCH /users/deactivateMe`, `/activateMe` have no UI | P2 |
| **Account Orders** | **Entire orders list** | 🔴 **None** | **Ready** | Placeholder empty state; `GET /orders/my-orders` has no client or UI | **P0** |
| Addresses | List / add / edit / delete | ✅ Full | Ready | — (`/users/profile/addresses*`) | — |
| Addresses | Set as default | 🟡 Partial | Ready | Dedicated `PATCH .../default` unused; default set via create/update flags only | P2 |
| Account (missing) | Browsing history clear | 🔴 None | Ready | `DELETE /users/browsing-history` has no client or UI | P2 |

---

## Table Checks Summary

| Table | Backend data | Search/filter | Pagination | Loading/Empty/Error |
|---|---|---|---|---|
| Admin Products | ✅ | Server (keyword, category) | Server | ✅ all three |
| Admin Orders | ✅ | Server (status, dates); search ObjectId-only 🟡 | Server | ✅ |
| Admin Customers | ✅ | Server (keyword, active) | Server | ✅ |
| Admin Reviews | ✅ | Server (keyword, tab) | Server | ✅ |
| Admin Returns | ✅ | Server (status, order) | Server | ✅ |
| Admin Carriers | ✅ | Client-side 🟡 | None 🟡 | ✅ |
| Admin Coupons/Offers/Banners/Admins | ✅ | — | Server (except banners full list) | ✅ |
| Storefront product grids | ✅ | Server (some filters client-side 🟡) | Server | ✅ |

No table has a page-size selector; sort is fixed `-createdAt` in admin lists.

## Dashboard Card Checks

All dashboard cards read real API fields (`GET /dashboard`, `GET /dashboard/revenue`) with skeletons, empty states, error + retry. No fake numbers or hardcoded statistics found. Gaps: fixed 30-day period (no selector), header search is client-side.

## Hardcoded / Mock / Stub Inventory

| Finding | Location |
|---|---|
| `*Soon` disabled stubs | `bulkSoon`, `invoiceSoon`, `refundSoon`, `blockSoon`, `applySoon`, `configureSoon`, `newPaymentSoon`, `automateSoon` |
| Placeholder page | `AccountOrdersPage` (`AccountSectionPlaceholder`) |
| Dev-gated mocks | `src/mocks/returns.ts` (requires `import.meta.env.DEV` + flag) |
| Preview/demo page | `PaymentCallbackPreviewPage` (hardcoded demo IDs) |
| Disabled forms (no BE) | `ContactForm.tsx`, `NewsletterForm.tsx` |
| Video placeholder | `HowItWorksSection` dialog |
| Dead routes in footer/Docs | `/about`, `/terms`, `/privacy`, `/quality`, `/authenticity`, `/standards`, `/contact`, `/concerns`, `/brands`, `/shipping`, `/track` |
| Cosmetic controls | Product shade/size selectors, cart item checkboxes, order drawer shipping-method select |
| Unused components/clients | `OtpInput` (auth), `clearWishlist`, `setMyDefaultAddress`, best-seller/delete clients absent |
| Stale i18n | `addSoon` key remains though Add Formula is wired |
| Dead data | `landingData.ts` `bestSellerProducts` array unused (live section is API-driven) |
| Console-only handlers / `href="#"` | None found |

---

## Final Summary — Implementation Backlog

### P0 — Critical (block "feature complete" claim)

| Item | Effort |
|---|---|
| Build Account Orders list: client for `GET /orders/my-orders` + list UI with loading/empty/error, pagination, track/cancel links (also fixes Track Order breadcrumb) | **Medium** |
| Wire Order Refund: mutation for `POST /orders/:id/refund` + confirm dialog + success/error toasts, replacing the `refundSoon` stub | **Medium** |

### P1 — Important

| Item | Effort |
|---|---|
| Coupon + Offer delete (clients + confirm UI); switch admin offers list off the public `GET /offers` (or add `includeInactive`) | Small |
| Admin delete (`DELETE /admins/:id`) + customer lifecycle actions (block/activate, edit, admin password reset) replacing `blockSoon` | Medium |
| Best-seller toggle + product hard-delete policy decision (wire `PATCH /best-seller`; either wire `DELETE` or document archive-only) | Small |
| Cart clear client (`DELETE /cart`) — call on logout and/or add UI | Small |
| Admin Categories / Brands / Subcategories management pages (BE CRUD + uploads ready) | **Large** |
| Admin FAQ management UI (BE CRUD ready) | Medium |
| Payments summary widget (`GET /payments/summary`) | Small |
| Orders keyword search (needs backend keyword support beyond ObjectId) | Medium |
| Track Order: adopt `/track/*` endpoints or document the my-orders contract; add public tracking-number lookup if desired | Small |
| Fix dead footer/Docs links (route, remove, or point to real pages) | Small |
| Payment gateway toggle: add disable action + toast | Small |
| Backend security: add auth/rate-limit to `POST /products/:id/faqs/ask` | Small |
| Bulk actions: implement or remove the `bulkSoon` menu | Medium |

### P2 — Nice to Have

| Item | Effort |
|---|---|
| Missing toasts: shipping-method toggle, admin lock/unlock, banner delete | Small |
| Dashboard + Cart Recovery period selectors (BE already accepts `?period`) | Small |
| Wishlist clear UI (client already exists) + browsing-history clear | Small |
| Review edit UI (`PUT /reviews/:id`) | Small |
| Account deactivate/reactivate UI | Small |
| Contact + newsletter forms (need new BE endpoints) or remove the disabled forms | Medium |
| Remove/repurpose cosmetic controls (shade/size selectors, cart checkboxes, disabled shipping-method select) or wire variants end-to-end (needs BE cart variant support) | Medium |
| Server-side carrier search/pagination; page-size selectors; sortable columns | Medium |
| Product performance column (currently always "—") | Small |
| Remove unused `OtpInput`, stale `addSoon` i18n key, dead `landingData` arrays, demo preview page gating | Small |
| Real social/Instagram links + video URL for How It Works | Small |

### Verdict

Core commerce flows (browse → cart → checkout → pay → track → return) and the admin operations for orders, returns, reviews, shipping, and settings are genuinely wired to the backend with proper loading/empty/error states and no fake dashboard data. The backlog above is dominated by **admin catalog management (missing pages)**, **the two P0 order-lifecycle gaps**, and a long tail of "Soon" stubs and cosmetic controls that would fail a manual test.
