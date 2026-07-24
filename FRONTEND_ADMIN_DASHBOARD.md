# Oxxila Admin Dashboard — Frontend API & Forms Guide

دليل للفرونت: **كل سكشن في السايدبار** → الشاشات/الفورمز → الـ requests المستخدمة، مع مراعاة التعديلات الحالية وتقسيمة الداشبورد في التصميم.

**Base URL:** `/api/v1`  
**Auth:** `Authorization: Bearer <admin_token>` على كل الـ admin endpoints  
**Envelope:** `{ success, statusCode, message, data?, pagination? }`

مرجع تنفيذ الشحن/الـ assign: `public/shipping-admin.html` + `public/js/shipping-admin.app.js` + `shipping-admin.pickups.js` (السلوك صحيح؛ في الداشبورد الحقيقي قسّم الـ UI كما بالأسفل).

---

## تقسيمة الداشبورد (مهم)

حسب صور الفرونت:

| سايدبار | المحتوى في الداشبورد |
|--------|------------------------|
| **Shipping** | Shipping Methods toggles + Courier Companies (carriers) + Zone Manager (countries / governorates / districts) + Bosta pickups/sync |
| **Orders** | Orders table + filters + **Add Order (B2B)** + Order Details drawer + **Assign Carrier** + Update Tracking Status |
| **Returns** | Return requests table + detail panel + Approve / Refund modals (لينك من Orders لحالات returned) |
| **Settings** | Payment gateways + Coupons + Offers + **Banners** |
| باقي الأقسام | Dashboard / Products / Customers / Reviews |

> في `shipping-admin.html` الـ Orders Shipping موجود في نفس الصفحة كـ prototype. في الداشبورد النهائي: **الـ Assign يعيش تحت Orders**، و**الشركات/المناطق تحت Shipping**.

---

## قواعد سلوك حديثة (لازم الفرونت يراعيها)

1. **Assign بدون Confirm:** من `pending` اعمل Assign مباشرة — مفيش زر Confirm منفصل. الـ API بيعدّي حالة `confirmed`.
2. **Shipping method toggles:** `api` / `known` / `internal` — لو النوع Off، الـ carriers بتاعه مش هتظهر في Assign.
3. **Bosta ≠ Known/Internal** في فورم الـ Assign (تفصيل تحت).
4. **Reviews:** `isFlagged` فقط — مفيش resolve / moderationStatus.
5. **Products list:** كل منتج فيه `performance` (رقم % للمقارنة).
6. **Coupons:** نوع `freeShipping` يصفّر الشحن حتى لو المنطقة ليها سعر.
7. **Customers:** `orders`, `totalPaid`, `totalSpend` (= totalPaid), `lastOrder` في الـ list والـ detail. KPIs: `GET /users/stats` → Total Customers + Average LTV فقط (شيل VIP / Retention من الـ UI).
8. **B2B:** `POST /orders/b2b` من الداشبورد — من غير كارت العميل.
9. **Flagged queue:** `count`/`urgent` + `items` مع `page`/`limit` pagination.
10. **Cart Recovery (Settings):** `GET /payments/cart-recovery` → `recoveredPercent`, `totalAbandoned`, `recoveredRevenue`.

---

## 0) Auth (لكل الداشبورد)

| متى | Request |
|-----|---------|
| Login | `POST /auth/login` `{ email, password }` → خزّن `token` |
| أنا مين | `GET /auth/me` |

---

## 1) Dashboard (Executive Overview)

**الشاشة:** KPI cards + Revenue chart + Customer segment + Best sellers + Low stock + Recent orders.

| Widget | Request | ملاحظات UI |
|--------|---------|------------|
| الصفحة كاملة | `GET /dashboard?period=30&limit=5&lowStockThreshold=10` | KPIs, segments, topProducts, lowStock, recentOrders |
| Revenue Daily/Weekly | `GET /dashboard/revenue?period=30&interval=daily\|weekly` | زر Daily / Weekly فقط |

**حقول مهمة في الـ response:**
- `kpis.*.value` + `kpis.*.trend` (موجب أخضر / سالب أحمر)
- `customerSegments.returningPercent`, `loyalPatients`, `newClients`
- `topProducts[]`: `name`, `image`, `unitsSold`, `price`
- `lowStock.items[]`: `name`, `stock`, `isCritical`
- `recentOrders[]`: `id`, `customerName`, `totalAmount`, `status` (`PAID` / `PROCESSING` …), `createdAt`

---

## 2) Products (Products Catalog)

**الشاشة:** جدول + Search + Filters + Add/Edit drawer (Formula Specs).

### Table columns → API fields

| عمود UI | Field |
|---------|--------|
| Product details | `name`, `images[0]`, `slug` (SKU اختياري من slug) |
| Category | `category.name` |
| Inventory | `stock` → In Stock / Low Stock |
| Price | `price` / `priceAfterDiscount` |
| Performance | `performance` → `+14%` أخضر أو `-2%` أحمر |
| Actions | Edit → `GET /products/:id` ثم `PUT` |

### Requests

| Action | Request |
|--------|---------|
| List | `GET /products?page=&limit=&keyword=&category=&period=30` |
| Detail / Edit load | `GET /products/:id` |
| Create | `POST /products` **multipart** |
| Update | `PUT /products/:id` **multipart** |
| Toggle best seller | `PATCH /products/:id/best-seller` |
| Delete / Archive | `DELETE /products/:id` |
| Categories dropdown | `GET /categories` |
| Subcategories | `GET /categories/:categoryId/subcategories` |
| Brands | `GET /brands` |

### Form: Formula Specs (Add / Edit)

| حقل الفورم | Body / multipart |
|-----------|------------------|
| Images | `images` files (max 5) |
| Shop title | `name` |
| Sensitive skin | `isSensitiveSkin` boolean |
| Real unit price | `price` |
| Stock | `stock` |
| Category | `category` (ObjectId) |
| Sub category | `subCategory` (array of ids) |
| Concerns checkboxes | `concerns[]`: `acne`, `pigmentation`, `sensitive-skin`, `drought`, `wrinkles`, `wide-pores` |
| Description / Advantages / Composition | `description`, `advantages`, `composition` |
| Certification image | `certificationImage` file |
| Catalog PDF | `catalog` file |
| Bundle / Best seller / Active | `isBundle`, `isBestSeller`, `isActive` |

**Save Formulation** → `POST` أو `PUT`  
**Archive** → `DELETE` أو `PUT` مع `isActive: false` (حسب قرار المنتج؛ الـ API الحالي فيه Delete + isActive).

### Product FAQs (تاب FAQ في الـ drawer)

استخدم endpoints الـ FAQs المرتبطة بالمنتج (`/products/:productId/faqs` إن وُجدت في الـ collection) — قائمة + Create/Update/Delete لكل سؤال.

---

## 3) Orders (Orders Management)

**الشاشة:** Tabs حسب الحالة + جدول + زر **+ Add New Order (B2B)** + drawer تفاصيل/Assign.

### Status tabs → `orderStatus` filter

`all` | `pending` | `processing` | `shipped` | `out_for_delivery` | `failed_attempt` | `delivered` | `partially_returned` | `returned` | `cancelled`

> **ملاحظة:** مفيش خطوة Confirm إجبارية. الطلبات `pending` تقدر تعمل لها Assign مباشرة.

### Table columns

| عمود | Source |
|------|--------|
| ORDER ID | `_id` (اختصار آخر 6 أحرف أو كامل) |
| DATE | `createdAt` |
| CUSTOMER | `user.name`, `user.email`, avatar |
| STATUS | `orderStatus` / `orderStatusLabel` |
| CARRIER | `shipment.carrierName` أو زر **Assign** لو مفيش carrier ملتزم |
| TRACKING | `shipment.trackingNumber` / `providerStateLabel` |
| TOTAL | `totalPrice` |
| ACTION | ⋯ → Detail / Cancel / Refund |

### Requests — Orders desk

| Action | Request |
|--------|---------|
| List | `GET /orders?page=&limit=&sort=-createdAt&orderStatus=` |
| Detail | `GET /orders/:id` |
| **Add Order B2B** | `POST /orders/b2b` |
| Update status (generic) | `PATCH /orders/:id/status` `{ orderStatus }` |
| Cancel | `PATCH /orders/:id/cancel` `{ reason? }` |
| Refund card | `POST /orders/:id/refund` |
| **Assign drawer data** | `GET /admin/shipping/orders/:id` |
| **Confirm Assign** | `POST /admin/shipping/orders/:id/assign` |
| **Manual tracking update** | `PATCH /admin/shipping/orders/:id/status` |

### Form: Add Order B2B

يفتح من الزر البنفسجي في Orders.

| Field | Body |
|-------|------|
| Customer | `userId` (من Customers search) |
| Line items | `items: [{ productId, quantity, unitPrice? }]` |
| Address | إما `addressId` **أو** `governorateId` + `addressLine` (+ `districtId` اختياري / `"other"`) |
| Coupon | `couponCode?` |
| Free shipping override | `freeShipping?: boolean` |
| Payment | `paymentMethod: "cod"` فقط حالياً |
| Mark paid | `markPaid?: boolean` |

**لا يمسح كارت العميل.** يخصم الـ stock.

مثال:
```json
{
  "userId": "...",
  "items": [{ "productId": "...", "quantity": 2 }],
  "governorateId": "...",
  "districtId": "...",
  "addressLine": "Clinic warehouse gate 3",
  "paymentMethod": "cod",
  "markPaid": false,
  "freeShipping": false
}
```

### Drawer: Order Details & Tracking

مكونات مشتركة من الصور:
- Customer card: name, phone, zone, total, payment method, **orders count** من `GET /users/:id` → `orders`
- Stepper tracking من `order.tracking` / `OxxilaTracking` helpers
- Items purchased من `order.items[]`
- Footer: Total · Invoice · Cancel · primary action

#### حالة A — Assign Carrier (قبل التعيين)

بعد `GET /admin/shipping/orders/:id`:

**حقول مشتركة**
- Package size → `size`: `SMALL|MEDIUM|LARGE|XLARGE`
- Carrier radio من `data.carriers[]` (مفلترة بالـ method toggles + coverage)

**لو اخترت Bosta (`type=api`, `apiProvider=bosta`)**
- أظهر **Pickup location** (required) من `data.pickupsByCarrier[carrierId]`
- **متبعتش** driverName / driverPhone
- Body:
```json
{
  "carrierId": "...",
  "pickupId": "...",
  "size": "MEDIUM",
  "notes": "",
  "markShipped": true
}
```
- شروط تعطيل الخيار في الـ UI:
  - `coversGovernorate === false`
  - `hasPickups === false`
  - `districtMeta.bostaCovered === false`

**لو اخترت Known أو Internal**
- أظهر: Driver name, Driver phone, Tracking (optional), Notes
- Body:
```json
{
  "carrierId": "...",
  "driverName": "...",
  "driverPhone": "...",
  "trackingNumber": "",
  "notes": "",
  "size": "MEDIUM",
  "markShipped": true
}
```

Primary button: **Assign Carrier** → `POST .../assign`

#### حالة B — بعد التعيين (Manual carriers فقط)

- Order Status dropdown
- Primary: **Update Tracking Status** → `PATCH /admin/shipping/orders/:id/status`
```json
{ "orderStatus": "shipped", "notes": "" }
```
Allowed: `processing | shipped | out_for_delivery | failed_attempt | delivered | returned | cancelled`

> Bosta: الحالة بتتحدث من الـ webhook — متستخدمش الـ PATCH اليدوي لـ API carriers.

---

## 4) Customers (Customer Intelligence)

**الشاشة:** Metric cards (أول اتنين فقط) + جدول All Patients + زر تفاصيل.

### Metric cards (أول اتنين فقط — شيل الباقي من الـ UI)

| كارت UI | API field | ملاحظات |
|---------|-----------|---------|
| TOTAL CUSTOMERS | `totalCustomers.value` | `trendLabel` مثل `+420 this month` |
| AVERAGE LTV | `averageLtv.value` | `trend` % vs last year + `trendLabel` |

> **فرونت:** امسح كروت **VIP Concentration** و **Retention Rate** من التصميم — الـ API مش بيرجعهم.

| Action | Request |
|--------|---------|
| KPI cards | `GET /users/stats` |
| List | `GET /users?role=user&page=&limit=&keyword=&sort=-createdAt` |
| Detail | `GET /users/:id` → فيه `orders`, `totalPaid`, **`totalSpend`**, `lastOrder` |
| Update | `PUT /users/:id` |
| Activate | `PATCH /users/activate/:id` |

### Table → API

| عمود UI | Field |
|---------|--------|
| Customer name | `name`, `email`, `avatar` |
| Orders | `orders` |
| Total Paid | `totalPaid` أو `totalSpend` (نفس القيمة) |
| Last Order | `lastOrder` |
| Actions › | `GET /users/:id` |

في Order Details لو محتاج "12 Orders" تحت اسم العميل: نادِ `GET /users/:id` واستخدم `orders` (+ `totalSpend` لو عايز تعرض الإنفاق).

---

## 5) Reviews & Reputation

**الشاشة:** Average Rating + Sentiment + Flagged Queue + Recent Submissions table.

| Widget | Request |
|--------|---------|
| كل الصفحة | `GET /reviews/admin/overview?limit=10&queuePage=1&queueLimit=5` |
| Avg only | `GET /reviews/admin/summary` |
| Sentiment | `GET /reviews/admin/rating-distribution` |
| Flagged card | `GET /reviews/admin/flagged?page=1&limit=5` |
| Table | `GET /reviews/admin?tab=all\|visible\|hidden\|flagged&keyword=&page=&limit=` |
| Eye detail | `GET /reviews/admin/:id` |
| Visibility toggle | `PATCH /reviews/:id/visibility` `{ "isVisible": true\|false }` |
| Flag / Unflag | `PATCH /reviews/:id/flag` `{ "isFlagged": true\|false }` |

### Moderation Queue (flagged)

Response shape:
```json
{
  "count": 3,
  "urgent": 3,
  "items": [
    { "id": "...", "reviewRef": "#9421", "snippet": "...", "updatedAt": "..." }
  ],
  "pagination": { "currentPage": 1, "limit": 5, "numberOfPages": 1, "totalDocuments": 3 }
}
```

- Badge **"N Urgent"** → `count` أو `urgent`
- List → `items[]` مع pagination عشان يشوف كل الـ flagged

**Tabs UI:** All / Visible(Approved) / Hidden / Flagged  
**ممنوع:** resolve flow / `moderationStatus` / `flagReason` — اتشالوا.

List row: `user.name`, `user.avatar`, `user.totalOrders`, `product.name`, `rating`, `feedback`, `isVisible`, `isFlagged`.

---

## 6) Shipping (شركات + مناطق + Method toggles)

مرجع السلوك: `public/shipping-admin.html`.

### 6.1 Shipping Methods (3 toggles)

| UI | API |
|----|-----|
| Load | `GET /admin/shipping/methods` |
| Toggle API / Known / Internal | `PATCH /admin/shipping/methods/:type` `{ "isEnabled": true\|false }` |

`:type` = `api` | `known` | `internal`

لما تطفى نوع → الـ Assign مش هيعرض carriers من النوع ده.

### 6.2 Courier Companies (Carriers table)

| Action | Request |
|--------|---------|
| List | `GET /admin/carriers` |
| Create | `POST /admin/carriers` |
| Update | `PUT /admin/carriers/:id` |
| Delete | `DELETE /admin/carriers/:id` |
| Coverage editor | `GET` / `PUT /admin/carriers/:id/coverage` `{ governorateIds: [] }` |

#### Form: Add / Edit Carrier

**حقول مشتركة**
- Name, Code
- Type select: `known` | `internal` | `api`
- Active toggle → `isActive`
- Coverage chips → `governorateIds` بعد الحفظ

**لو type = known | internal**
- Delivery days (مطلوب)
- **مفيش** apiKey / pickups / Bosta sync

**لو type = api (Bosta)**
- `apiProvider: "bosta"`
- `apiKey` (مطلوب عند الإنشاء)
- `apiBaseUrl` اختياري
- قسم Pickups:
  - List: `GET /admin/carriers/:id/pickups`
  - Sync from Bosta: `POST /admin/carriers/:id/bosta/sync-pickups`
  - Add pickup form: `POST /admin/carriers/:id/pickups`
  - Set default: `PUT /admin/carriers/:id/pickups/:pickupId/default`
  - Delete: `DELETE /admin/carriers/:id/pickups/:pickupId`
  - City/District dropdowns: `GET /admin/carriers/:id/bosta/districts-lookup`
- Sync zones (full): `POST /admin/carriers/:id/bosta/sync-zones`
- Sync coverage light: `POST /admin/carriers/:id/bosta/sync-coverage`

#### Form: Add Bosta Pickup (inline)

| Field | Body path |
|-------|-----------|
| Location name | `locationName` |
| First line | `address.firstLine` |
| City | `address.city` + `address.cityId` |
| District | `address.districtId` + zone من option |
| Zone id | `address.zoneId` (required) |
| Contact name | `contactPerson.name` |
| Contact phone | `contactPerson.phone` |
| Default | `isDefault` |

### 6.3 Zone Manager

ثلاث أعمدة: Countries → Governorates → Districts

| Form | Request | Fields |
|------|---------|--------|
| Add Country | `POST /admin/countries` | `name`, `code`, `flag?`, `currency` |
| Edit/Delete Country | `PUT` / `DELETE /admin/countries/:id` | |
| List govs | `GET /admin/countries/:id/governorates` | |
| Add Governorate | `POST /admin/governorates` | `country`, `name`, `shippingPrice` |
| Update gov price | `PUT /admin/governorates/:id` | `shippingPrice` |
| Add District | `POST /admin/districts` | `governorate`, `name`, `shippingPrice` |
| Update district price / Covered | `PUT /admin/districts/:id` | `shippingPrice`, `isCovered` |
| Delete | `DELETE` على نفس الموارد | |

**Covered / Closed** على الـ district = `isCovered` (checkout).  
**Bosta covered** badge = من sync Bosta (`bostaCovered`) — للـ assign فقط.

---

## 7) Settings (System Configuration)

### Payment Gateways

| Action | Request |
|--------|---------|
| Summary KPIs | `GET /payments/summary?period=30` |
| Cart Recovery card | `GET /payments/cart-recovery?period=30` |
| List | `GET /payments/gateways` |
| Toggle | `PATCH /payments/gateways/:code` `{ "isEnabled": true\|false }` |

`code`: `stripe` | `paymob` | `cod`

#### Cart Recovery widget

| UI | Field |
|----|--------|
| Ring % RECOVERED | `recoveredPercent` |
| Total Abandoned | `totalAbandoned` |
| Recovered Rev | `recoveredRevenue` |

`totalAbandoned` = قيمة السلات المفتوحة + جلسات الدفع غير المكتملة في الفترة.  
`recoveredRevenue` = مجموع الأوردرات المدفوعة في الفترة.  
`recoveredPercent` = `recoveredRevenue / (recoveredRevenue + totalAbandoned) * 100`.

زر **Automate Recovery** حالياً UI فقط (مفيش automation endpoint لسه).

### Coupon Manager

| Action | Request |
|--------|---------|
| List | `GET /coupons` |
| Create | `POST /coupons` |
| Update / Delete | `PUT` / `DELETE /coupons/:id` |

#### Form: Add Coupon

| Field | Body |
|-------|------|
| Name / Code | `code` |
| Type | `discountType`: `percentage` \| `fixed` \| **`freeShipping`** |
| Discount % | `discountValue` (لو percentage) |
| Discount $ | `discountValue` (لو fixed) |
| Limit | `maxUsage` |
| Min order | `minOrderAmount?` |
| Expiry | `expiresAt?` |
| Active | `isActive` |

لو `freeShipping`: `discountValue` يتبعت `0` أو يتساب — الـ backend بيصفره. في الـ TYPE column اعرض `Free Shipping`.

### Offer Manager

| Action | Request |
|--------|---------|
| List | `GET /offers` |
| Create | `POST /offers` |
| Update / Delete | `PUT` / `DELETE /offers/:id` |

#### Form: Add Offer

| Field | Body |
|-------|------|
| Product | `product` |
| Fixed vs % | `discountAmount` و/أو `discountPercent` |
| Start / End | `startDate`, `endDate` |
| Product count | `productCount?` |

---

## مقارنة سريعة: Bosta vs Carrier عادي

| الموضوع | Bosta (API) | Known / Internal |
|---------|-------------|------------------|
| إنشاء الشركة | type `api` + apiKey | type `known`/`internal` + deliveryDays |
| Pickups | مطلوب + sync/import | لا |
| Zone sync | `sync-zones` / `sync-coverage` | Coverage = اختيار محافظات فقط |
| Assign body | `pickupId` إجباري | `driverName` / `driverPhone` / tracking اختياري |
| تحديث الحالة بعد الإرسال | Webhook / Bosta | `PATCH .../status` يدوي |
| Method toggle | `api` | `known` أو `internal` |

---

## خريطة سريعة: زر UI → Request

| زر / تفاعل في التصميم | Request |
|------------------------|---------|
| Dashboard load | `GET /dashboard` |
| Revenue Daily/Weekly | `GET /dashboard/revenue` |
| Products table | `GET /products` |
| + Add New Product / Save Formulation | `POST` / `PUT /products` |
| Orders tabs | `GET /orders?orderStatus=` |
| + Add New Order (B2B) | `POST /orders/b2b` |
| Assign (في عمود Carrier) | `GET` ثم `POST /admin/shipping/orders/:id/assign` |
| Update Tracking Status | `PATCH /admin/shipping/orders/:id/status` |
| Customers table | `GET /users?role=user` |
| Customer › detail | `GET /users/:id` (`totalSpend`) |
| Reviews overview | `GET /reviews/admin/overview` |
| Review visibility toggle | `PATCH /reviews/:id/visibility` |
| Review flag | `PATCH /reviews/:id/flag` |
| Shipping method toggles | `GET`/`PATCH /admin/shipping/methods` |
| + ADD COMPANY | `POST /admin/carriers` |
| Zone Add Country/Gov/District | `POST /admin/countries|governorates|districts` |
| Create Coupon (Free Shipping) | `POST /coupons` `discountType: freeShipping` |
| Create Offer | `POST /offers` |
| Gateway Update | `PATCH /payments/gateways/:code` |
| Returns list / detail | `GET /returns` · `GET /returns/:id` |
| Approve / advance return | `PATCH /returns/:id/status` |
| Schedule Bosta return | `POST /returns/:id/bosta/schedule` |
| Banners admin list | `GET /banners?includeInactive=true` |
| Create / Update / Delete banner | `POST` / `PUT` / `DELETE /banners` |

---

## 8) Returns (Return requests)

**مكانها في السايدبار:** سكشن مستقل **Returns** (مش جوه Shipping).  
من Orders لو الأوردر `returned` / `partially_returned` فيه لينك يفتح Returns مفلتر بـ `?orderId=`.

**مرجع سلوك جاهز:** `public/returns-admin.html` + `public/js/returns-admin.app.js`

### شكل الصفحة المقترح

```
┌─────────────────────────────────────────────────────────────┐
│ Return requests                                              │
│ Review, assign logistics, refund                             │
├─────────────────────────────────────────────────────────────┤
│ [All] [pending] [approved] [picked_up] [received]            │
│ [refunded] [rejected]                                        │
├──────────────────────────────┬──────────────────────────────┤
│ Table                        │ Detail panel (يمين)           │
│ ID · User · Order · Amount · │ Return #… · status            │
│ Status                       │ Refund amount · reason · note │
│                              │ Logistics · tracking · items  │
│                              │ Proof images                  │
│                              │ [Approve] [Reject] …          │
└──────────────────────────────┴──────────────────────────────┘
```

Dark theme زي باقي الداشبورد: جدول + بانل تفاصيل، مودالز للـ Approve والـ Refund.

### Status machine (tabs = `refundStatus`)

```
pending → approved → picked_up → received → refunded
       ↘ rejected
```

| من | إلى | زر UI | Body |
|----|-----|-------|------|
| `pending` | `approved` | Approve | انظر فورم Approve |
| `pending` | `rejected` | Reject | `{ "refundStatus": "rejected" }` |
| `approved` | `picked_up` | Mark picked up | `{ "refundStatus": "picked_up" }` |
| `picked_up` | `received` | Mark received | `{ "refundStatus": "received" }` |
| `received` | `refunded` | Refund (confirm modal) | `{ "refundStatus": "refunded" }` |

### Requests (Admin)

| Action | Request |
|--------|---------|
| List + filter | `GET /returns?page=&limit=25&sort=-createdAt&refundStatus=` |
| Detail | `GET /returns/:id` |
| Change status | `PATCH /returns/:id/status` |
| Schedule Bosta pickup | `POST /returns/:id/bosta/schedule` (بعد Approve بـ Bosta لو مفيش `bostaExternalId`) |
| Carriers للـ Approve | `GET /admin/carriers` (فلتر `type=api` + `apiProvider=bosta`) |
| Drop-off pickups | `GET /admin/carriers/:id/pickups` |

### Table columns

| عمود | Field |
|------|--------|
| ID | `_id` (قصير) |
| User | `user.name` / `user.email` |
| Order | `order._id` |
| Amount | `refundAmount` |
| Status | `refundStatus` (pill ملوّن) |

### Detail panel — يعرض

- Order id + status pill
- `refundAmount`, `reason`, `note`
- `logisticsHandler` (`bosta` | `internal`)
- Drop-off warehouse name لو Bosta
- `bostaTrackingNumber` لو موجود
- Customer pickup address: `pickupAddress.firstLine`, city, governorate
- Items: `items[].name × quantity (price)`
- Proof links: `proofImages[].url`
- أزرار حسب الحالة الحالية فقط (مش كل الأزرار مرة واحدة)

### Modal: Approve return

| Field | متى يظهر | Body |
|-------|----------|------|
| Who handles pickup? | دائماً | `logisticsHandler`: `internal` \| `bosta` |
| Bosta carrier | لو `bosta` | `carrierId` |
| Drop-off warehouse | لو `bosta` | `dropOffPickupId` (من pickups الـ carrier) |

```json
{
  "refundStatus": "approved",
  "logisticsHandler": "bosta",
  "carrierId": "...",
  "dropOffPickupId": "..."
}
```

أو internal:
```json
{ "refundStatus": "approved", "logisticsHandler": "internal" }
```

**بعد Approve بـ Bosta:** لو مفيش `bostaExternalId` → زر **Schedule Bosta** → `POST /returns/:id/bosta/schedule`.

### Modal: Process refund

نص مختلف حسب طريقة دفع الأوردر:
- **COD:** store credit بنفس `refundAmount` على حساب العميل
- **Card:** refund على البوابة + restock

Confirm → `PATCH .../status` `{ "refundStatus": "refunded" }`

### فرق Internal vs Bosta في الـ Returns

| | Internal | Bosta |
|--|----------|-------|
| Approve | `logisticsHandler: internal` فقط | + `carrierId` + `dropOffPickupId` |
| Schedule | مش محتاج | `POST .../bosta/schedule` |
| Tracking | يدوي / Mark picked up | من Bosta + webhook ممكن يحدّث الحالة |
| Mark picked up / received | يدوي من الأدمن | يدوي أو من webhook حسب الـ state |

### لينك من Orders

لو `orderStatus` = `returned` أو `partially_returned`:
```
/returns-admin?orderId=<orderId>
```
أو في React router: `/admin/returns?orderId=`

---

## 9) Banners (Homepage banners)

**مكانها في السايدبار:** تحت **Settings** أو سكشن Media / Marketing (زي ما التصميم يحب — غالباً جوه System Configuration جنب Coupons/Offers).

### شكل الصفحة المقترح

```
┌──────────────────────────────────────────────────┐
│ Banners                          [+ Add Banner]  │
├──────────────────────────────────────────────────┤
│ Grid أو Table:                                   │
│ [thumbnail] Title · Link type · Active · Actions │
│ Edit · Delete · Toggle active                    │
└──────────────────────────────────────────────────┘
         │
         ▼ Drawer / Modal: Add / Edit Banner
```

### Requests

| Action | Request |
|--------|---------|
| Admin list (كل الحالات) | `GET /banners?includeInactive=true` **+ Admin Bearer** |
| Storefront (نشطة فقط) | `GET /banners` بدون توكن |
| Create | `POST /banners` **multipart** `image` + fields |
| Update | `PUT /banners/:id` **multipart** اختياري `image` |
| Delete | `DELETE /banners/:id` |
| Product dropdown | `GET /products?limit=50` |
| Category dropdown | `GET /categories` |

### Form: Add / Edit Banner

| Field UI | Body / multipart | قواعد |
|----------|------------------|--------|
| Image | file field `image` | مطلوب عند الإنشاء |
| Title | `title` | اختياري، max 200 |
| Link type | `linkType` | `none` \| `product` \| `category` \| `url` |
| Product / Category | `linkId` | مطلوب لو `product` أو `category` |
| External URL | `externalUrl` | مطلوب لو `linkType=url` |
| Active | `isActive` | boolean — يتحكم في ظهوره في الـ storefront |

**تفرّع الفورم حسب `linkType`:**
- `none` → اخفِ linkId و externalUrl
- `product` → dropdown منتجات → `linkId`
- `category` → dropdown فئات → `linkId`
- `url` → input URL → `externalUrl`

### Table / Card row

| عمود | Field |
|------|--------|
| Preview | `image` |
| Title | `title` |
| Link | `linkType` + `linkId` أو `externalUrl` |
| Status | `isActive` toggle → `PUT` بنفس الـ id مع `isActive` |
| Actions | Edit / Delete |

### ملاحظات UX

- Toggle Active سريع = `PUT /banners/:id` بدون صورة جديدة، body: `{ "isActive": false }`
- استبدال الصورة = نفس `PUT` مع file `image`
- الـ storefront ما يشوفش غير `isActive: true`

---

## Checklist تنفيذ فرونت

- [ ] سايدبار مطابق للصور؛ Shipping ≠ Orders
- [ ] Assign من Orders drawer؛ بدون Confirm step
- [ ] فورم Assign يتفرع: Bosta (pickup) vs Manual (driver)
- [ ] Method toggles مربوطة بـ `/admin/shipping/methods`
- [ ] Products تعرض `performance`
- [ ] Customers تعرض `orders` / `totalSpend` / `lastOrder`
- [ ] Reviews: visibility + isFlagged فقط
- [ ] Coupons تدعم `freeShipping`
- [ ] B2B order form مربوط بـ `POST /orders/b2b`
- [ ] **Returns:** tabs حسب `refundStatus` + Approve (internal/bosta) + Refund modal
- [ ] **Banners:** list مع `includeInactive=true` + فورم linkType متفرع

---

*آخر تحديث: Returns + Banners pages، performance, freeShipping, method toggles, isFlagged, B2B, assign-from-pending, totalSpend, banners includeInactive.*
