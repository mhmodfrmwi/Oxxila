// src/api/admin/carriers.ts
import { apiRequest } from '../../lib/api'
import type {
  ApiAdminCarrier,
  ApiBostaCity,
  ApiCarrierCoverageItem,
  ApiCarrierPickup,
  CreateCarrierPayload,
  CreateCarrierPickupPayload,
  UpdateCarrierPayload,
} from '../../types/adminShipping'

/** GET /api/v1/admin/carriers — courier companies list. */
export function getAdminCarriers(options?: { signal?: AbortSignal }) {
  return apiRequest<ApiAdminCarrier[]>('/admin/carriers', {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** POST /api/v1/admin/carriers */
export function createAdminCarrier(
  payload: CreateCarrierPayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<{ carrier: ApiAdminCarrier }>('/admin/carriers', {
    method: 'POST',
    auth: true,
    body: payload,
    signal: options?.signal,
  })
}

/** PUT /api/v1/admin/carriers/:id */
export function updateAdminCarrier(
  id: string,
  payload: UpdateCarrierPayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<{ carrier: ApiAdminCarrier }>(
    `/admin/carriers/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      auth: true,
      body: payload,
      signal: options?.signal,
    },
  )
}

/** DELETE /api/v1/admin/carriers/:id */
export function deleteAdminCarrier(id: string, options?: { signal?: AbortSignal }) {
  return apiRequest<null>(`/admin/carriers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
    signal: options?.signal,
  })
}

/** GET /api/v1/admin/carriers/:id/coverage */
export function getAdminCarrierCoverage(
  id: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiCarrierCoverageItem[]>(
    `/admin/carriers/${encodeURIComponent(id)}/coverage`,
    { method: 'GET', auth: true, signal: options?.signal },
  )
}

/** PUT /api/v1/admin/carriers/:id/coverage — replaces the full coverage set. */
export function updateAdminCarrierCoverage(
  id: string,
  governorateIds: string[],
  options?: { signal?: AbortSignal },
) {
  return apiRequest<{ count: number }>(
    `/admin/carriers/${encodeURIComponent(id)}/coverage`,
    {
      method: 'PUT',
      auth: true,
      body: { governorateIds },
      signal: options?.signal,
    },
  )
}

/** GET /api/v1/admin/carriers/:id/pickups — Bosta carriers only. */
export function getAdminCarrierPickups(
  id: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiCarrierPickup[]>(
    `/admin/carriers/${encodeURIComponent(id)}/pickups`,
    { method: 'GET', auth: true, signal: options?.signal },
  )
}

/** POST /api/v1/admin/carriers/:id/pickups */
export function createAdminCarrierPickup(
  id: string,
  payload: CreateCarrierPickupPayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiCarrierPickup>(
    `/admin/carriers/${encodeURIComponent(id)}/pickups`,
    { method: 'POST', auth: true, body: payload, signal: options?.signal },
  )
}

/** PUT /api/v1/admin/carriers/:id/pickups/:pickupId/default */
export function setDefaultAdminCarrierPickup(
  id: string,
  pickupId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiCarrierPickup>(
    `/admin/carriers/${encodeURIComponent(id)}/pickups/${encodeURIComponent(pickupId)}/default`,
    { method: 'PUT', auth: true, signal: options?.signal },
  )
}

/** DELETE /api/v1/admin/carriers/:id/pickups/:pickupId */
export function deleteAdminCarrierPickup(
  id: string,
  pickupId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<null>(
    `/admin/carriers/${encodeURIComponent(id)}/pickups/${encodeURIComponent(pickupId)}`,
    { method: 'DELETE', auth: true, signal: options?.signal },
  )
}

/** POST /api/v1/admin/carriers/:id/bosta/sync-pickups */
export function syncAdminCarrierBostaPickups(
  id: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiCarrierPickup[]>(
    `/admin/carriers/${encodeURIComponent(id)}/bosta/sync-pickups`,
    { method: 'POST', auth: true, signal: options?.signal },
  )
}

/** POST /api/v1/admin/carriers/:id/bosta/sync-zones — full zone import. */
export function syncAdminCarrierBostaZones(
  id: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<Record<string, number>>(
    `/admin/carriers/${encodeURIComponent(id)}/bosta/sync-zones`,
    { method: 'POST', auth: true, signal: options?.signal },
  )
}

/** POST /api/v1/admin/carriers/:id/bosta/sync-coverage — light coverage refresh. */
export function syncAdminCarrierBostaCoverage(
  id: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<{ bostaCoveredTrue: number; bostaCoveredFalse: number }>(
    `/admin/carriers/${encodeURIComponent(id)}/bosta/sync-coverage`,
    { method: 'POST', auth: true, signal: options?.signal },
  )
}

/** GET /api/v1/admin/carriers/:id/bosta/districts-lookup — city/district dropdowns. */
export function getAdminCarrierBostaDistrictsLookup(
  id: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiBostaCity[]>(
    `/admin/carriers/${encodeURIComponent(id)}/bosta/districts-lookup`,
    { method: 'GET', auth: true, signal: options?.signal },
  )
}
