// src/types/adminCoupons.ts

export type AdminCouponDiscountType = 'percentage' | 'fixed'

/** Raw coupon from /api/v1/coupons. */
export interface ApiAdminCoupon {
  _id: string
  code: string
  discountType: AdminCouponDiscountType
  discountValue: number
  maxUsage?: number | null
  usageCount?: number
  expiresAt?: string | null
  minOrderAmount?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

/** Normalized row for Coupon Manager table. */
export interface AdminCouponRow {
  id: string
  code: string
  discountType: AdminCouponDiscountType
  discountValue: number
  discountLabel: string
  usageCount: number
  maxUsage: number | null
  usageLabel: string
  isActive: boolean
  expiresAt: string | null
  minOrderAmount: number
}

export interface AdminCouponsListParams {
  page?: number
  limit?: number
  sort?: string
}

/** Payload for POST /api/v1/coupons. */
export interface AdminCouponCreatePayload {
  code: string
  discountType: AdminCouponDiscountType
  discountValue: number
  maxUsage?: number | null
  expiresAt?: string | null
  minOrderAmount?: number
}

/** Payload for PUT /api/v1/coupons/:id. */
export interface AdminCouponUpdatePayload {
  code?: string
  discountType?: AdminCouponDiscountType
  discountValue?: number
  maxUsage?: number | null
  expiresAt?: string | null
  minOrderAmount?: number
  isActive?: boolean
}

/** Drawer form values (string inputs for controlled fields). */
export interface AdminCouponFormValues {
  code: string
  discountType: AdminCouponDiscountType
  discountValue: string
  maxUsage: string
  expiresAt: string
  minOrderAmount: string
  isActive: boolean
}

export type AdminCouponFormErrors = Partial<
  Record<keyof AdminCouponFormValues, string>
>
