// src/api/wishlist.ts
import { apiRequest } from '../lib/api'
import type { Wishlist } from '../types/wishlist'

export function getWishlist() {
  return apiRequest<Wishlist>('/wishlist', { auth: true })
}

export function addToWishlist(productId: string) {
  return apiRequest<Wishlist>('/wishlist', {
    method: 'POST',
    auth: true,
    body: { productId },
  })
}

export function removeFromWishlist(productId: string) {
  return apiRequest<Wishlist>(`/wishlist/${productId}`, {
    method: 'DELETE',
    auth: true,
  })
}

export function clearWishlist() {
  return apiRequest<null>('/wishlist', {
    method: 'DELETE',
    auth: true,
  })
}
