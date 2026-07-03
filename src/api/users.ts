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

export interface CreateAddressPayload {
  city: string
  address: string
}

export function createMyAddress(payload: CreateAddressPayload) {
  return apiRequest<{ address: UserAddress }>('/users/profile/addresses', {
    method: 'POST',
    auth: true,
    body: payload,
  })
}

export function updateMyAddress(addressId: string, payload: Partial<CreateAddressPayload>) {
  return apiRequest<{ address: UserAddress }>(`/users/profile/addresses/${addressId}`, {
    method: 'PUT',
    auth: true,
    body: payload,
  })
}

export function deleteMyAddress(addressId: string) {
  return apiRequest(`/users/profile/addresses/${addressId}`, {
    method: 'DELETE',
    auth: true,
  })
}
