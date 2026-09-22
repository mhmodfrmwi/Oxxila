# Payment Callback Flow — Angular

## المشكلة

لما اليوزر بيدفع بالكارت (Stripe / Paymob)، الـ Stripe بتعمل **حاجتين في نفس الوقت**:

1. **Webhook → السيرفر** — بيعمل الأوردر في الـ DB
2. **Redirect → الفرونت** — بيرجع اليوزر على الـ success URL

المشكلة إن اليوزر ممكن يوصل الفرونت **قبل** ما الـ Webhook يوصل السيرفر، يعني الأوردر لسه ما اتعملش في الـ DB.

لو رحنا order details على طول ← **404**.

---

## الحل: صفحة Polling وسيطة

```
/payment-callback?session=sess_abc123
```

الصفحة دي بتسأل السيرفر كل 3 ثواني لحد ما الأوردر يتعمل.

---

## Flow كامل

```
1. يوزر يضغط "ادفع بالكارت"
        ↓
2. POST /orders/payment-session
   ← { sessionId, url }
        ↓
3. الفرونت يفتح رابط Stripe
        ↓
4. اليوزر يدفع على Stripe
        ↓
5. Stripe تعمل حاجتين:
   ├── Webhook → السيرفر (يعمل الأوردر)
   └── Redirect → /payment-callback?session=sess_abc123
        ↓
6. صفحة /payment-callback تعمل Polling
   GET /orders/payment-session/:id كل 3 ثواني
        ↓
7. لما status === 'completed':
   router.navigate(['/track', orderId])
```

---

## شكل الصفحة (UI Mockup)

الصفحة بيكون عندها 3 حالات:

### حالة 1 — جاري التحقق (loading)
اليوزر بيشوف spinner وهو مستني الـ polling ينجح.

```
┌─────────────────────────────┐
│  /payment-callback?session= │
├─────────────────────────────┤
│                             │
│          ◌ (spinner)        │
│                             │
│     جاري التحقق من الدفع   │
│       برجاء الانتظار...     │
│                             │
│         •  ○  ○             │
│                             │
└─────────────────────────────┘
```

### حالة 2 — تم الدفع (success)
لما `status === 'completed'` بيتعرض رقم الطلب لثانية أو اتنين وبعدين redirect تلقائي لـ `/track/:orderId`.

```
┌─────────────────────────────┐
│  /payment-callback?session= │
├─────────────────────────────┤
│                             │
│          ✓ (أخضر)           │
│                             │
│        تم الدفع بنجاح!      │
│    جاري تحويلك لتتبع طلبك  │
│                             │
│  ┌───────────────────────┐  │
│  │ رقم الطلب   #ORD-7842 │  │
│  │ الإجمالي     450 ج.م  │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### حالة 3 — فشل (failed)
لو `status === 'failed'` أو وصلنا الـ 20 محاولة (timeout) بنعرضله زرار يحاول تاني.

```
┌─────────────────────────────┐
│  /payment-callback?session= │
├─────────────────────────────┤
│                             │
│          ✗ (أحمر)           │
│                             │
│      حدث خطأ في الدفع      │
│  لم نتمكن من التحقق من الدفع│
│                             │
│  ┌───────────────────────┐  │
│  │     حاول مرة أخرى    │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │   العودة للرئيسية    │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

---

## Implementation

### 1. الـ Route

```typescript
// app-routing.module.ts
{
  path: 'payment-callback',
  component: PaymentCallbackComponent,
  canActivate: [AuthGuard]
}
```

---

### 2. الـ Component

```typescript
// payment-callback.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription, of } from 'rxjs';
import { switchMap, takeWhile, catchError } from 'rxjs/operators';
import { CheckoutService } from '../core/services/checkout.service';

@Component({
  selector: 'app-payment-callback',
  templateUrl: './payment-callback.component.html',
})
export class PaymentCallbackComponent implements OnInit, OnDestroy {
  status: 'loading' | 'success' | 'failed' = 'loading';
  private pollSub?: Subscription;
  private MAX_ATTEMPTS = 20; // ~60 ثانية
  private attempts = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private checkoutService: CheckoutService
  ) {}

  ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('session');

    if (!sessionId) {
      this.status = 'failed';
      return;
    }

    this.startPolling(sessionId);
  }

  private startPolling(sessionId: string) {
    this.pollSub = interval(3000)
      .pipe(
        switchMap(() =>
          this.checkoutService.pollPaymentSession(sessionId).pipe(
            catchError(() => of(null))
          )
        ),
        takeWhile(() => {
          this.attempts++;
          return this.attempts <= this.MAX_ATTEMPTS;
        }, true)
      )
      .subscribe((res) => {
        if (!res) return;

        const { status, order } = res.data;

        if (status === 'completed' && order?._id) {
          this.status = 'success';
          this.pollSub?.unsubscribe();
          this.router.navigate(['/track', order._id]);
        } else if (status === 'failed') {
          this.status = 'failed';
          this.pollSub?.unsubscribe();
        } else if (this.attempts >= this.MAX_ATTEMPTS) {
          // timeout
          this.status = 'failed';
        }
      });
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }
}
```

---

### 3. الـ Template

```html
<!-- payment-callback.component.html -->
<div class="callback-container">

  <!-- Loading -->
  <ng-container *ngIf="status === 'loading'">
    <div class="spinner"></div>
    <p>جاري التحقق من الدفع...</p>
  </ng-container>

  <!-- Success -->
  <ng-container *ngIf="status === 'success'">
    <p>✅ تم الدفع بنجاح! جاري التحويل...</p>
  </ng-container>

  <!-- Failed -->
  <ng-container *ngIf="status === 'failed'">
    <p>❌ حدث خطأ في الدفع</p>
    <button routerLink="/checkout">حاول مرة أخرى</button>
  </ng-container>

</div>
```

---

### 4. الـ CheckoutService

```typescript
// checkout.service.ts
startCardCheckout(body: PaymentSessionBody) {
  return this.http.post<ApiRes<PaymentSessionDto>>(
    `${base}/orders/payment-session`,
    body
  );
}

pollPaymentSession(id: string) {
  return this.http.get<ApiRes<PaymentSessionStatusDto>>(
    `${base}/orders/payment-session/${id}`
  );
}
```

**الـ Interfaces:**

```typescript
export interface PaymentSessionDto {
  sessionId: string;
  url: string; // Stripe Checkout or Paymob Unified Checkout
}

export interface PaymentSessionStatusDto {
  status: 'pending' | 'completed' | 'failed';
  order?: { _id: string };
}
```

---

### 5. الـ Checkout Component (اللي بيبدأ الـ Flow)

```typescript
// checkout.component.ts
async onCardCheckout() {
  const body = {
    governorateId: this.form.value.governorateId,
    districtId: this.form.value.districtId,
    addressLine: this.form.value.addressLine,
    provider: 'stripe',
    shippingMethodCode: 'standard',
  };

  this.checkoutService.startCardCheckout(body).subscribe((res) => {
    const { sessionId, url } = res.data;

    // احفظ الـ sessionId في الـ URL لما يرجع
    // Stripe success URL: https://yourapp.com/payment-callback?session={sessionId}
    // هتحطها في الـ backend لما بتعمل الـ session

    window.location.href = url; // redirect لـ Stripe
  });
}
```

---

## Success URL اللي هتتحط في السيرفر

```
https://yourapp.com/payment-callback?session={SESSION_ID}
```

السيرفر هو اللي بيبعتها لـ Stripe لما بيعمل الـ session، مش الفرونت.

---

## ملخص

| خطوة | المسؤول | التفاصيل |
|------|---------|----------|
| POST /orders/payment-session | الفرونت | يبدأ الـ session ويوجه اليوزر لـ Stripe |
| Webhook | السيرفر تلقائياً | يعمل الأوردر لما الدفع ينجح |
| Redirect → /payment-callback | Stripe | ترجع اليوزر للفرونت |
| GET /orders/payment-session/:id | الفرونت (polling) | يتأكد إن الأوردر اتعمل |
| Navigate → /track/:orderId | الفرونت | لما status === 'completed' |
