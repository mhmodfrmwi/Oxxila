// src/api/cart.ts
import { apiRequest } from '../lib/api'
import type { ApiCart } from '../types/cart'

export function getCart() {
  return apiRequest<ApiCart>('/cart', { auth: true })
}

export function addToCart(productId: string, quantity = 1) {
  return apiRequest<ApiCart>('/cart', {
    method: 'POST',
    auth: true,
    body: { productId, quantity },
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
