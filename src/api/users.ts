// src/api/users.ts
import { apiRequest } from '../lib/api'
import type { ApiProduct } from '../types/catalog'

export interface BrowsingHistoryEntry {
  product: ApiProduct
  category: string
  viewedAt: string
}

export function getBrowsingHistory() {
  return apiRequest<BrowsingHistoryEntry[]>('/users/browsing-history', { auth: true })
}

export function getRecommendations() {
  return apiRequest<ApiProduct[]>('/users/recommendations', { auth: true })
}

export interface UserAddress {
  _id: string
  city: string
  address: string
}

export function getMyAddresses() {
  return apiRequest<{ addresses: UserAddress[] }>('/users/profile/addresses', { auth: true })
}
