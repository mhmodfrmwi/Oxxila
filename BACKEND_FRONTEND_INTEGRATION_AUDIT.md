# Oxxila Backend ↔ Frontend Integration Audit

Read-only comparison of `oxxila-backend-api` (`/api/v1`) and the `oxilla` React client.

Sources: backend route files, controllers and `app.js` mounts; frontend `src/api`, hooks, pages, and components. Generated July 25, 2026.

> Endpoint coverage below uses grouped rows where routes share the same integration status. Shipping admin alone has more than 30 CRUD/sync routes. Webhooks are backend-only by design.

## Executive Summary

| Metric | Score |
|---|---:|
| Backend completion | ≈92% |
| Frontend completion | ≈78% |
| Integration completion | ≈74% |
| API contract score | 82/100 |
| Production readiness | Ready with known gaps |

The storefront and core admin operations are broadly functional. The order lifecycle is not complete until the P0 account-order, refund, and status-transition gaps are resolved.

## Architecture Notes

- **Frontend data layer:** Custom hooks and `fetch` through `src/lib/api.ts`; no React Query. The shared client handles Bearer authentication, refresh cookies, and `ApiError`.
- **Authentication:** JWT access token plus HTTP-only refresh-token cookie. Backend roles are `user` and `admin`, enforced with `allowTo`; `RequireAdmin` gates `/admin/*` in the frontend.
- **Backend integrations:** Bosta shipping/returns, Stripe and Paymob payments/webhooks, Cloudinary uploads, Google/Facebook OAuth, offer cron, and Bosta coverage-sync job.
- **API base:** The frontend uses relative `/api/v1` requests. Vite/Vercel forwards them to `https://oxxila-api-01ced6342147.herokuapp.com`.

## Feature Matrix

| Feature | Backend | Frontend | Integration | Notes |
|---|---|---|---|---|
| Authentication | Complete | Complete | PASS | Login, registration, refresh, OAuth, and password reset are wired |
| Dashboard | Complete | Complete | PASS | Overview and revenue are live; `lowStock` shape is fixed |
| Products (storefront) | Complete | Complete | PASS | List, detail, search, and filters |
| Products (admin) | Complete | Partial | FAIL | CRUD/archive works; no hard-delete or best-seller toggle UI |
| Categories | Complete | Partial | FAIL | Storefront read-only; no admin CRUD UI |
| Brands | Complete | Partial | FAIL | Storefront read-only; no admin CRUD UI |
| Subcategories | Complete | Partial | PASS | Reads are used in browsing and product forms |
| Users (self) | Complete | Partial | FAIL | Profile, avatar, and password work; no deactivate/activate UI |
| Customers (admin) | Complete | Partial | FAIL | List, detail, and stats work; no create/update/delete/activate/password actions |
| Admins / Roles | Complete | Partial | FAIL | List/create/update work; delete is unused |
| Orders (storefront) | Complete | Partial | FAIL | Checkout and COD/card payment work; account order list is a placeholder |
| Orders (admin) | Complete | Partial | FAIL | List/detail/B2B/cancel/assign work; refund and direct status update are not wired |
| Shipping (storefront) | Complete | Complete | PASS | Countries, governorates, zones, and resolve are used |
| Shipping (admin) | Complete | Complete | PASS | Methods, zones, carriers, pickups, and Bosta sync |
| Reviews (storefront) | Complete | Complete | PASS | List, stats, create, like, and delete |
| Reviews (admin) | Complete | Partial | PASS | Overview/list/flag/visibility; overview replaces separate summary clients |
| Coupons | Complete | Partial | FAIL | Admin create/read/update and cart apply work; delete is missing |
| Offers | Complete | Partial | FAIL | Admin create/update work; delete and upcoming-only client are missing |
| Banners | Complete | Complete | PASS | Storefront and admin CRUD/toggle |
| Returns (storefront) | Complete | Complete | PASS | Eligible orders, create, and history; preview mocks are development-gated |
| Returns (admin) | Complete | Complete | PASS | List/detail/approve/reject/refund/Bosta schedule |
| Wishlist | Complete | Complete | PASS | CRUD is wired; `clearWishlist` client exists but is unused |
| Cart | Complete | Partial | FAIL | Add/update/remove/coupon work; server-side clear is not wired |
| Addresses | Complete | Complete | PASS | CRUD and default-address behavior |
| Notifications | Missing | Missing | FAIL | No module |
| Analytics / Reports | Partial | Partial | FAIL | Dashboard and cart recovery only; payment summary and exports are absent |
| Settings | Partial | Partial | PASS | Gateways, banners, coupons, offers, roles, and cart recovery |
| Uploads | Complete | Partial | PASS | Avatar, product, and banner uploads; no category/brand image admin UI |
| Search / Filter / Sort / Page | Complete | Complete | PASS | Storefront and admin lists |
| Export / Import | Missing | Missing | FAIL | No endpoints |
| Tracking | Complete | Partial | FAIL | Frontend uses order detail instead of `/track/*` |
| FAQs / Ask Specialist | Complete | Partial | FAIL | Storefront list/ask works; no admin FAQ CRUD UI |
| Payments / Webhooks | Complete | Partial | PASS | Sessions are wired; webhooks are correctly backend-only |

## Endpoint Integration Status

### Authentication

| Method | Route | Status | Frontend consumer | Gap |
|---|---|---|---|---|
| POST | `/auth/register` | Fully integrated | `api/auth` → Register page | — |
| POST | `/auth/login` | Fully integrated | `api/auth` → Login page | — |
| POST | `/auth/refresh` | Fully integrated | `lib/api.ts` refresh flow | — |
| POST | `/auth/logout` | Fully integrated | `api/auth` → Auth context | — |
| GET | `/auth/me` | Fully integrated | `api/auth.getMe` | — |
| POST | `/auth/forgot-password` | Fully integrated | Forgot Password page | — |
| GET | `/auth/reset-password/:token` | Not integrated | — | No frontend verify-token call; backend serves HTML |
| POST | `/auth/reset-password/:token` | Fully integrated | Change Password page | — |
| GET | `/auth/google` and callback | Fully integrated | OAuth redirect helper | — |
| GET | `/auth/facebook` and callback | Fully integrated | OAuth redirect helper | Feature depends on backend configuration |

### Users and Addresses

| Method | Route | Status | Frontend consumer | Gap |
|---|---|---|---|---|
| GET | `/users/getMe` | Fully integrated | `getUserProfile` | Overlaps `/auth/me` |
| PATCH | `/users/updateMe` | Fully integrated | Account page | — |
| PATCH | `/users/updateMyAvatar` | Fully integrated | Account page | — |
| PATCH | `/users/updateMyPassword` | Fully integrated | Account Change Password page | — |
| PATCH | `/users/deactivateMe` | Not integrated | — | Missing UI and client |
| PATCH | `/users/activateMe` | Not integrated | — | Missing UI and client |
| GET | `/users/profile/addresses` | Fully integrated | Addresses and checkout | — |
| POST | `/users/profile/addresses` | Fully integrated | Add Address page | — |
| PATCH | `/users/profile/addresses/:id` | Fully integrated | Addresses page | — |
| PATCH | `/users/profile/addresses/:id/default` | Partially integrated | Unused `setMyDefaultAddress` client | Default is set through create/update flags |
| DELETE | `/users/profile/addresses/:id` | Fully integrated | Addresses page | — |
| GET | `/users/browsing-history` | Fully integrated | `useBrowsingHistory` | — |
| DELETE | `/users/browsing-history` | Not integrated | — | Missing clear action |
| GET | `/users/recommendations` | Fully integrated | Landing / buy-again UI | — |

### Customers and Admins

| Method | Route | Status | Frontend consumer | Gap |
|---|---|---|---|---|
| GET | `/users/stats` | Fully integrated | `useAdminCustomerStats` | — |
| GET | `/users` | Fully integrated | `useAdminCustomers` | Backend has no VIP/frequent segment filters |
| GET | `/users/:id` | Fully integrated | Customer drawer | — |
| POST | `/users` | Not integrated | — | No admin create-customer action |
| PUT | `/users/:id` | Not integrated | — | No admin edit-customer action |
| DELETE | `/users/:id` | Not integrated | — | No admin delete-customer action |
| PATCH | `/users/activate/:id` | Not integrated | — | No activate action |
| PATCH | `/users/changePassword/:id` | Not integrated | — | No admin password-reset action |
| GET/POST/PUT | `/admins` | Fully integrated | Admin Roles card | — |
| DELETE | `/admins/:id` | Not integrated | — | No delete-admin UI |

### Catalog and Products

| Method | Route | Status | Frontend consumer | Gap |
|---|---|---|---|---|
| GET | `/categories`, `/brands`, `/subcategories` | Fully integrated | Storefront catalog and product form | — |
| POST/PUT/DELETE | `/categories*` | Not integrated | — | No admin Categories page |
| POST/PUT/DELETE | `/brands*` | Not integrated | — | No admin Brands page |
| POST/PUT/DELETE | `/categories/:categoryId/subcategories*` | Partially integrated | Product form reads only | No admin subcategory management |
| GET | `/products` | Fully integrated | Shop and Admin Products | — |
| GET | `/products/:id` | Fully integrated | Product page and formula drawer | Admin reads increment product views |
| POST | `/products` | Fully integrated | Product/formula drawer | Multipart is supported |
| PUT | `/products/:id` | Fully integrated | Edit, upload, and archive actions | — |
| PATCH | `/products/:id/best-seller` | Not integrated | — | No client or toggle UI |
| DELETE | `/products/:id` | Not integrated | — | Frontend archives with `isActive:false` |

### Reviews and FAQs

| Method | Route | Status | Frontend consumer | Gap |
|---|---|---|---|---|
| GET | `/products/:id/reviews` and `/stats` | Fully integrated | Product reviews section | — |
| POST | `/products/:id/reviews` | Fully integrated | Write Review flow | — |
| GET | `/reviews/:id` | Partially integrated | Review flows use list data | No direct consumer identified |
| POST | `/reviews/:id/like` | Fully integrated | Review like action | — |
| DELETE | `/reviews/:id` | Fully integrated | Delete-own-review action | — |
| PUT | `/reviews/:id` | Not integrated | — | No edit-review UI |
| GET | `/reviews/admin/*` | Partially integrated | Admin Reviews hooks | Summary/distribution endpoints are unused because overview covers them |
| PATCH | `/reviews/:id/visibility` and `/flag` | Fully integrated | Review drawer actions | — |
| GET | `/products/:id/faqs` | Fully integrated | Product FAQs | — |
| POST | `/products/:id/faqs/ask` | Fully integrated | Ask Specialist | Backend route is publicly callable despite frontend login gate |
| POST | `/products/:id/faqs` | Not integrated | — | No admin FAQ creation |
| PUT/DELETE | `/faqs/:id` | Not integrated | — | No admin FAQ edit/delete |

### Offers, Coupons, and Banners

| Method | Route | Status | Frontend consumer | Gap |
|---|---|---|---|---|
| GET | `/offers` | Fully integrated | Storefront and admin list | — |
| GET | `/offers/upcoming` | Not integrated | — | No client |
| POST/PUT | `/offers` and `/offers/:id` | Fully integrated | Offer drawer | — |
| DELETE | `/offers` and `/offers/:id` | Not integrated | — | No client or UI; bulk route deletes all offers |
| GET/POST/PUT | `/coupons*` | Fully integrated | Coupon manager and cart | — |
| DELETE | `/coupons/:id` | Not integrated | — | No delete action |
| GET/POST/PUT/DELETE | `/banners*` | Fully integrated | Storefront and Banner manager | — |

### Cart and Wishlist

| Method | Route | Status | Frontend consumer | Gap |
|---|---|---|---|---|
| GET/POST/PUT/DELETE | `/cart` item and coupon routes | Fully integrated | Cart context | — |
| DELETE | `/cart` | Not integrated | — | Local clear only; no server `clearCart` call |
| GET/POST/DELETE | `/wishlist*` | Fully integrated | Wishlist context/page | `clearWishlist` client exists but is unused |

### Orders

| Method | Route | Status | Frontend consumer | Gap |
|---|---|---|---|---|
| POST | `/orders` | Fully integrated | COD checkout | — |
| POST | `/orders/payment-session` | Fully integrated | Payment page | — |
| GET | `/orders/payment-session/:id` | Fully integrated | Payment callback | — |
| GET | `/orders/my-orders` | Not integrated | Account Orders placeholder | Missing list client and UI |
| GET | `/orders/my-orders/:id` | Fully integrated | Tracking, confirmation, and returns | — |
| PATCH | `/orders/:id/cancel` | Fully integrated | Tracking page and admin cancel | — |
| GET | `/orders` | Fully integrated | `useAdminOrders` | — |
| GET | `/orders/:id` | Fully integrated | Order Details drawer | — |
| POST | `/orders/b2b` | Fully integrated | B2B Order drawer | — |
| POST | `/orders/:id/refund` | Not integrated | Disabled refund button | Missing mutation and UI |
| PATCH | `/orders/:id/status` | Not integrated | — | Status changes happen only through shipping flows |

### Shipping and Tracking

| Method | Route | Status | Frontend consumer | Gap |
|---|---|---|---|---|
| GET | `/shipping/*` | Fully integrated | `api/shipping.ts` | — |
| GET/PATCH | `/admin/shipping/methods*` | Fully integrated | Shipping Methods | — |
| CRUD | `/admin/countries`, `/governorates`, `/districts` | Fully integrated | Zone Manager | — |
| CRUD + sync | `/admin/carriers*` | Fully integrated | Carriers, coverage, and pickups | Aggregate `/carriers/bosta-pickups` read is unused |
| GET/POST/PATCH | `/admin/shipping/orders/:id*` | Fully integrated | Assign Carrier and Manual Status flows | — |
| GET | `/track/order/:orderId` | Not integrated | — | Frontend uses `/orders/my-orders/:id` |
| GET | `/track/:trackingNumber` | Not integrated | — | No public tracking-number UI |

### Returns, Dashboard, and Payments

| Method | Route | Status | Frontend consumer | Gap |
|---|---|---|---|---|
| GET | `/returns/eligible-orders` | Fully integrated | Returns page | Development preview mocks are optional |
| POST | `/returns` | Fully integrated | Returns page | Multipart proof images supported |
| GET | `/returns/my-returns` and `/:id` | Fully integrated | Returns History page | `getMyReturn` export is unused |
| GET/PATCH/POST | Admin `/returns*` routes | Fully integrated | Admin Returns and actions | — |
| GET | `/dashboard` | Fully integrated | `useAdminDashboardOverview` | `lowStock` object is normalized |
| GET | `/dashboard/revenue` | Fully integrated | `useAdminDashboardRevenue` | — |
| GET | `/payments/cart-recovery` | Fully integrated | Cart Recovery card | — |
| GET | `/payments/summary` | Not integrated | — | No settings/analytics UI |
| GET/PATCH | `/payments/gateways*` | Fully integrated | Payment Gateways card | — |
| POST/GET | `/webhooks/*` | Fully integrated by design | Backend-only | Correctly absent from the frontend |

## API Contract Audit

| Area | Backend contract | Frontend behavior | Assessment |
|---|---|---|---|
| Dashboard `lowStock` | `{ threshold, alertCount, items[] }` | Normalized with `getDashboardLowStockAlerts` | Fixed; previously caused a crash |
| Cart recovery | `recoveredPercent`, `totalAbandoned`, `recoveredRevenue` | Mapped to frontend view fields | Aligned through explicit mapping |
| Admin product archive | `DELETE /products/:id` or update `isActive` | Uses `PUT { isActive:false }` only | Behavioral mismatch / policy decision |
| Order refund | `POST /orders/:id/refund` | Disabled `refundSoon` button; no client | Missing integration |
| Order status | `PATCH /orders/:id/status` | No client; shipping-assignment routes used instead | Partial alternate path |
| Tracking | `/track/order/:id` and `/track/:trackingNumber` | Tracking page reads `/orders/my-orders/:id` | Alternate contract / drift risk |
| Auth profile | `/auth/me` and `/users/getMe` | Both are used in different places | Duplication and drift risk |
| Pagination | `{ currentPage, numberOfPages, totalDocuments, ... }` | `ApiPagination` matches | Aligned |
| Review summaries | Separate summary/distribution plus overview | Frontend uses overview only | Intentional unused backend routes |
| Customer segments | Users list has no VIP/frequent filters | Frontend reduced tabs to all/inactive | Aligned after cleanup |
| Unpaginated reads | Subcategories, carriers, and pickup lists return arrays | Frontend expects arrays | Functionally aligned but inconsistent at scale |

## Dashboard Audit

| Widget | Endpoint / source | Fake data | Status |
|---|---|---|---|
| Revenue, orders, conversion, abandoned-cart KPIs | `GET /dashboard` → `kpis` | No | Live |
| Revenue chart | `GET /dashboard/revenue` | No | Live |
| Customer segments | `GET /dashboard` → `customerSegments` | No | Live |
| Top products | `GET /dashboard` → `topProducts` | No | Live |
| Low stock | `GET /dashboard` → `lowStock.items` | No | Live; shape fixed |
| Recent orders | `GET /dashboard` → `recentOrders` | No | Live |
| Greeting | `GET /dashboard` → `greeting` | i18n fallback only | Live |
| Search filtering | Client-side filtering | Not applicable | Local |

No hard-coded KPI or chart series were found. Storefront returns-preview mocks are separate and restricted to development/preview mode.

## Admin Action Reachability

| Action | Reaches backend | Detail |
|---|---|---|
| Product create/edit | Yes | `POST/PUT /products` with multipart support |
| Product archive | Yes | `PUT` with `isActive:false` |
| Product hard delete | No | `DELETE /products/:id` is unused |
| Product best-seller toggle | No | Toggle endpoint is unused |
| Order cancel | Yes | `PATCH /orders/:id/cancel` |
| Order refund | No | UI is a `refundSoon` stub |
| Order assign carrier | Yes | `POST /admin/shipping/orders/:id/assign` |
| B2B order create | Yes | `POST /orders/b2b` |
| Return approve/reject/advance | Yes | `PATCH /returns/:id/status` |
| Return refund | Yes | Admin return refund flow |
| Return Bosta schedule | Yes | `POST /returns/:id/bosta/schedule` |
| Review visibility/flag moderation | Yes | Visibility and flag patches |
| Coupon/offer create/edit | Yes | `POST/PUT` |
| Coupon/offer delete | No | No frontend client |
| Banner CRUD/toggle | Yes | Full integration |
| Carrier/zone/method CRUD | Yes | Full shipping-admin integration |
| Bosta zone/coverage/pickup sync | Yes | All sync flows are wired |
| Admin create/edit | Yes | `POST/PUT /admins` |
| Admin delete | No | Delete endpoint is unused |
| Payment-gateway toggle | Yes | `PATCH /payments/gateways/:code` |
| Category/brand admin CRUD | No | No admin UI |
| FAQ admin CRUD | No | No admin UI |
| Export/import/download | No | No backend module |

## Error, Loading, Empty-State, and Security Findings

### High

1. **Ask Specialist backend route is publicly callable.** `POST /products/:productId/faqs/ask` has no authentication middleware despite its documentation indicating a private route. It sends email to the admin address, creating a spam/abuse surface. The frontend login gate is not a security boundary.
2. **Account Orders is a placeholder.** The account page does not consume `GET /orders/my-orders`, so the core order-history UI has no real loading, empty, or error behavior.

### Medium

1. **Order refund is a silent non-action.** The button is disabled and no mutation reaches `POST /orders/:id/refund`.
2. **Cart clear is local-only.** The UI can clear local state without calling `DELETE /cart`, risking state restoration from the server.
3. **Admin product reads affect analytics.** `GET /products/:id` increments views and may record browsing history; the admin detail flow uses this same endpoint.
4. **Bulk offer deletion is high-impact.** `DELETE /offers` deletes every offer. It is not used by the frontend but should have strong safeguards or be removed if unnecessary.

### Low

1. `GET /subcategories` and admin carrier/pickup reads return unpaginated arrays, unlike most list endpoints.
2. The dashboard overview hook has no `AbortController`; the revenue hook does.
3. Development-only returns preview mocks remain in the repository but are gated.
4. Unused frontend exports remain: `refreshAccessToken`, `clearWishlist`, `setMyDefaultAddress`, `getCategoryById`, `getMyReturn`, `uploadImages`, `useCollectionProducts`, and `useAdminSettingsShell`.

### Existing Strengths

- Central `ApiError` and toast patterns are used by most admin mutations.
- Access-token refresh is single-flight and emits session-expiry notification.
- List hooks resolve loading after out-of-range page clamping.
- Shared `isAbortError` is used widely.
- Banner toggles show success/error toasts.
- Optimistic updates generally roll back on failure.

## Production Verdict

**Ready with known gaps.**

The current application can support storefront and most admin operations, but it should not be described as having a complete order lifecycle until these P0 items are closed:

- Account order history consumes the real backend list.
- Admin refund reaches the payment refund endpoint and exposes success/failure clearly.
- Direct order-status transitions are wired or the shipping-only transition policy is explicitly documented and enforced.

The public Ask Specialist email endpoint is a backend security/abuse concern and should also be fixed before broad exposure.

## Remaining Work Roadmap

Size guide: **S** ≤ 1 day, **M** 1–3 days, **L** multi-day.

### P0 — Critical

| Work item | Size | Reason |
|---|---:|---|
| Wire Account Orders to `GET /orders/my-orders` | M | Core account feature is a placeholder |
| Wire admin Order Refund to `POST /orders/:id/refund` | M | Visible money-flow action is stubbed |
| Add a frontend client for `PATCH /orders/:id/status`, or document/enforce shipping-only transitions | S | Admin status transitions are incomplete outside assignment |

### P1 — Important

| Work item | Size | Reason |
|---|---:|---|
| Add authentication and rate limiting to `POST /products/:id/faqs/ask` | S | Public endpoint can send admin email |
| Add coupon and offer delete clients/UI | S | Promotions cannot be removed in admin |
| Add admin deletion and customer activate/password actions | M | Admin/customer lifecycle is incomplete |
| Wire cart clear, best-seller toggle, and decide product hard-delete policy | S | Backend capabilities are not represented |
| Add admin Categories and Brands management | L | Catalog administration is incomplete |
| Add admin FAQ CRUD | M | Content operations are blocked |
| Add Payment Summary UI for `GET /payments/summary` | S | Existing analytics endpoint is unused |
| Align Track Order with `/track/*` or document the intentional order-detail contract | S | Prevent contract drift |

### P2 — Nice to Have

| Work item | Size | Reason |
|---|---:|---|
| Consume `GET /offers/upcoming` and add browsing-history clear | S | UX polish |
| Add a dedicated admin product-detail endpoint without view side effects | M | Prevent admin traffic from affecting analytics |
| Add Notifications and Export/Import modules | L | Missing on both sides |
| Prune unused frontend exports | S | Repository hygiene |

## Method

The inventory was built from backend routes/controllers and frontend API clients, hooks, pages, and components. “Fully integrated” means a client and reachable UI path exist; “Partially integrated” means either the client or UI is incomplete; “Not integrated” means no frontend consumer was found.

The percentages are engineering estimates for release planning, not automated coverage metrics.
