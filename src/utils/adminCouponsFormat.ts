// src/utils/adminCouponsFormat.ts
import type {
  AdminCouponCreatePayload,
  AdminCouponFormErrors,
  AdminCouponFormValues,
  AdminCouponRow,
  AdminCouponUpdatePayload,
  ApiAdminCoupon,
} from '../types/adminCoupons'
import { formatDashboardMoney, resolveDashboardLocale } from './adminDashboardFormat'

export function formatCouponDiscount(
  type: ApiAdminCoupon['discountType'],
  value: number,
  locale = 'en',
): string {
  if (type === 'freeShipping') return 'Free Shipping'
  if (type === 'percentage') return `${value}% OFF`
  return `${formatDashboardMoney(value, locale)} Credit`
}

export function formatCouponUsage(
  usageCount: number,
  maxUsage: number | null,
): string {
  if (maxUsage == null) return `${usageCount} / —`
  return `${usageCount} / ${maxUsage}`
}

export function mapApiCouponToAdminRow(
  coupon: ApiAdminCoupon,
  locale = 'en',
): AdminCouponRow {
  const usageCount = coupon.usageCount ?? 0
  const maxUsage =
    typeof coupon.maxUsage === 'number' && Number.isFinite(coupon.maxUsage)
      ? coupon.maxUsage
      : null

  return {
    id: String(coupon._id),
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountLabel: formatCouponDiscount(
      coupon.discountType,
      coupon.discountValue,
      locale,
    ),
    usageCount,
    maxUsage,
    usageLabel: formatCouponUsage(usageCount, maxUsage),
    isActive: coupon.isActive !== false,
    expiresAt: coupon.expiresAt ?? null,
    minOrderAmount: coupon.minOrderAmount ?? 0,
  }
}

export function emptyCouponFormValues(): AdminCouponFormValues {
  return {
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxUsage: '',
    expiresAt: '',
    minOrderAmount: '',
    isActive: true,
  }
}

export function couponToFormValues(coupon: ApiAdminCoupon): AdminCouponFormValues {
  let expiresAt = ''
  if (coupon.expiresAt) {
    const date = new Date(coupon.expiresAt)
    if (!Number.isNaN(date.getTime())) {
      // datetime-local expects local YYYY-MM-DDTHH:mm
      const pad = (n: number) => String(n).padStart(2, '0')
      expiresAt = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
    }
  }

  return {
    code: coupon.code ?? '',
    discountType: coupon.discountType,
    discountValue:
      coupon.discountValue === undefined || coupon.discountValue === null
        ? ''
        : String(coupon.discountValue),
    maxUsage:
      coupon.maxUsage == null || coupon.maxUsage === undefined
        ? ''
        : String(coupon.maxUsage),
    expiresAt,
    minOrderAmount:
      coupon.minOrderAmount && coupon.minOrderAmount > 0
        ? String(coupon.minOrderAmount)
        : '',
    isActive: coupon.isActive !== false,
  }
}

/** Client validation aligned with coupon.validator.js. */
export function validateCouponForm(
  values: AdminCouponFormValues,
  mode: 'create' | 'edit',
): AdminCouponFormErrors {
  const errors: AdminCouponFormErrors = {}
  const code = values.code.trim()

  if (mode === 'create' || code) {
    if (!code) {
      errors.code = 'Coupon code is required'
    } else if (code.length < 3 || code.length > 20) {
      errors.code = 'Code must be 3-20 characters'
    } else if (!/^[A-Za-z0-9_-]+$/.test(code)) {
      errors.code = 'Code can only contain letters, numbers, - and _'
    }
  }

  if (mode === 'create' || values.discountType) {
    if (
      values.discountType !== 'percentage' &&
      values.discountType !== 'fixed' &&
      values.discountType !== 'freeShipping'
    ) {
      errors.discountType = 'Discount type must be percentage, fixed, or free shipping'
    }
  }

  // Free shipping always zeroes discountValue server-side — skip validation.
  const discountRaw = values.discountValue.trim()
  if (
    values.discountType !== 'freeShipping' &&
    (mode === 'create' || discountRaw !== '')
  ) {
    if (discountRaw === '') {
      errors.discountValue = 'Discount value is required'
    } else {
      const discountValue = Number(discountRaw)
      if (!Number.isFinite(discountValue) || discountValue < 0) {
        errors.discountValue = 'Discount value must be positive'
      } else if (
        values.discountType === 'percentage' &&
        discountValue > 100
      ) {
        errors.discountValue = 'Percentage discount cannot exceed 100%'
      }
    }
  }

  const maxUsageRaw = values.maxUsage.trim()
  if (maxUsageRaw !== '') {
    const maxUsage = Number(maxUsageRaw)
    if (!Number.isInteger(maxUsage) || maxUsage < 1) {
      errors.maxUsage = 'Max usage must be at least 1'
    }
  }

  const expiresRaw = values.expiresAt.trim()
  if (expiresRaw !== '') {
    const expires = new Date(expiresRaw)
    if (Number.isNaN(expires.getTime())) {
      errors.expiresAt = 'Expiry date must be a valid date'
    } else if (expires <= new Date()) {
      // Create must use a future date. Edit may keep an already-expired value
      // (omitted from the update payload — see formValuesToUpdatePayload).
      if (mode === 'create') {
        errors.expiresAt = 'Expiry date must be in the future'
      }
    }
  }

  const minOrderRaw = values.minOrderAmount.trim()
  if (minOrderRaw !== '') {
    const minOrder = Number(minOrderRaw)
    if (!Number.isFinite(minOrder) || minOrder < 0) {
      errors.minOrderAmount = 'Minimum order amount must be positive'
    }
  }

  return errors
}

export function formValuesToCreatePayload(
  values: AdminCouponFormValues,
): AdminCouponCreatePayload {
  const payload: AdminCouponCreatePayload = {
    code: values.code.trim().toUpperCase(),
    discountType: values.discountType,
    discountValue:
      values.discountType === 'freeShipping' ? 0 : Number(values.discountValue),
  }

  const maxUsageRaw = values.maxUsage.trim()
  if (maxUsageRaw !== '') {
    payload.maxUsage = Number(maxUsageRaw)
  } else {
    payload.maxUsage = null
  }

  const expiresRaw = values.expiresAt.trim()
  if (expiresRaw !== '') {
    payload.expiresAt = new Date(expiresRaw).toISOString()
  } else {
    payload.expiresAt = null
  }

  const minOrderRaw = values.minOrderAmount.trim()
  if (minOrderRaw !== '') {
    payload.minOrderAmount = Number(minOrderRaw)
  }

  return payload
}

export function formValuesToUpdatePayload(
  values: AdminCouponFormValues,
): AdminCouponUpdatePayload {
  const payload: AdminCouponUpdatePayload = {
    ...formValuesToCreatePayload(values),
    isActive: values.isActive,
  }

  // BE rejects past expiresAt when the field is present. Omit an already-expired
  // value so other fields (e.g. isActive) can still update.
  const expiresRaw = values.expiresAt.trim()
  if (expiresRaw !== '') {
    const expires = new Date(expiresRaw)
    if (!Number.isNaN(expires.getTime()) && expires <= new Date()) {
      delete payload.expiresAt
    }
  }

  return payload
}

export function formatCouponExpiry(value: string | null, locale = 'en'): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(resolveDashboardLocale(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
