// src/api/users.ts
import { apiRequest } from '../lib/api'
import type { ApiProduct } from '../types/catalog'
import type { ApiAdminRole } from '../types/adminPermissions'

export interface BrowsingHistoryEntry {
  product: ApiProduct
  category: string
  viewedAt: string
}

export interface UserProfile {
  _id?: string
  id?: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role?: string
  adminRole?: ApiAdminRole | null
  storeCreditBalance?: number
}

export interface UpdateProfilePayload {
  name?: string
  email?: string
  phone?: string
}

export interface UpdatePasswordPayload {
  oldPassword: string
  newPassword: string
}

export function getBrowsingHistory() {
  return apiRequest<BrowsingHistoryEntry[]>('/users/browsing-history', { auth: true })
}

export function getRecommendations() {
  return apiRequest<ApiProduct[]>('/users/recommendations', { auth: true })
}

export function getUserProfile() {
  return apiRequest<UserProfile>('/users/getMe', { auth: true })
}

export function updateUserProfile(payload: UpdateProfilePayload) {
  return apiRequest<UserProfile>('/users/updateMe', {
    method: 'PATCH',
    auth: true,
    body: payload,
  })
}

export function uploadUserAvatar(file: File) {
  const body = new FormData()
  body.append('avatar', file)
  return apiRequest<UserProfile>('/users/updateMyAvatar', {
    method: 'PATCH',
    auth: true,
    body,
  })
}

export function updateUserPassword(payload: UpdatePasswordPayload) {
  return apiRequest('/users/updateMyPassword', {
    method: 'PATCH',
    auth: true,
    body: payload,
  })
}

/** Matches backend User.addresses subdocument (`GET /users/profile/addresses`). */
export interface UserAddressZoneRef {
  id: string
  name: string
}

export interface UserAddress {
  _id: string
  label: string
  governorate: UserAddressZoneRef
  district: UserAddressZoneRef | null
  addressLine: string
  /** Delivery phone for this address (older addresses may not have one). */
  phone?: string
  isOther: boolean
  isDefault: boolean
}

export interface CreateAddressPayload {
  governorateId: string
  districtId?: string | 'other' | null
  addressLine: string
  phone?: string
  label?: string
  isDefault?: boolean
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>

export function getMyAddresses() {
  return apiRequest<{ addresses: UserAddress[] }>('/users/profile/addresses', { auth: true })
}

export function createMyAddress(payload: CreateAddressPayload) {
  return apiRequest<{ address: UserAddress }>('/users/profile/addresses', {
    method: 'POST',
    auth: true,
    body: payload,
  })
}

export function updateMyAddress(addressId: string, payload: UpdateAddressPayload) {
  return apiRequest<{ address: UserAddress }>(`/users/profile/addresses/${addressId}`, {
    method: 'PATCH',
    auth: true,
    body: payload,
  })
}

export function setMyDefaultAddress(addressId: string) {
  return apiRequest<{ address: UserAddress }>(`/users/profile/addresses/${addressId}/default`, {
    method: 'PATCH',
    auth: true,
  })
}

export function deleteMyAddress(addressId: string) {
  return apiRequest(`/users/profile/addresses/${addressId}`, {
    method: 'DELETE',
    auth: true,
  })
}
