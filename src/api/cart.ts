// src/api/cart.ts
import { apiRequest, ApiError } from '../lib/api'
import type { ApiCart } from '../types/cart'

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i

export function getCart() {
  return apiRequest<ApiCart>('/cart', { auth: true })
}

export function addToCart(productId: string, quantity = 1) {
  const normalizedId = productId.trim()
  if (!OBJECT_ID_PATTERN.test(normalizedId)) {
    return Promise.reject(new ApiError('Invalid product ID.', 400))
  }

  return apiRequest<ApiCart>('/cart', {
    method: 'POST',
    auth: true,
    body: {
      productId: normalizedId,
      quantity: Math.max(1, Math.floor(Number(quantity))),
    },
  })
}

export function updateCartItem(itemId: string, quantity: number) {
  return apiRequest<ApiCart>(`/cart/${itemId}`, {
    method: 'PUT',
    auth: true,
    body: { quantity },
  })
}

export function removeCartItem(itemId: string) {
  return apiRequest<ApiCart>(`/cart/${itemId}`, {
    method: 'DELETE',
    auth: true,
  })
}

export function clearCart() {
  return apiRequest('/cart', {
    method: 'DELETE',
    auth: true,
  })
}

export function applyCoupon(code: string) {
  return apiRequest<ApiCart>('/cart/coupon', {
    method: 'POST',
    auth: true,
    body: { code },
  })
}

export function removeCoupon() {
  return apiRequest<ApiCart>('/cart/coupon', {
    method: 'DELETE',
    auth: true,
  })
}

export interface GuestCartLine {
  productId: string
  quantity: number
}

/** POST /cart/preview — price a guest (localStorage) cart. Public; line `_id` = product id. */
export function previewGuestCart(items: GuestCartLine[]) {
  return apiRequest<ApiCart>('/cart/preview', {
    method: 'POST',
    body: { items },
  })
}

/** POST /cart/merge — fold the guest cart into the signed-in user's cart. */
export function mergeGuestCart(items: GuestCartLine[]) {
  return apiRequest<ApiCart>('/cart/merge', {
    method: 'POST',
    auth: true,
    body: { items },
  })
}

export interface GuestCouponPreview {
  couponCode: string
  discountType: 'percentage' | 'fixed' | 'freeShipping'
  /** Percent for percentage coupons, EGP for fixed ones. */
  discountValue?: number
  freeShipping: boolean
  discountAmount: number
  subtotal: number
  totalPrice: number
}

/** POST /cart/coupon/preview — how much a code would save a guest. Does NOT consume the code. */
export function previewGuestCoupon(code: string, items: GuestCartLine[]) {
  return apiRequest<GuestCouponPreview>('/cart/coupon/preview', {
    method: 'POST',
    body: { code, items },
  })
}
