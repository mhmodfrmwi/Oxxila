// src/api/admin/offers.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminOfferCreatePayload,
  AdminOffersListParams,
  AdminOfferUpdatePayload,
  ApiAdminOffer,
} from '../../types/adminOffers'

function toQuery(params: AdminOffersListParams): string {
  const search = new URLSearchParams()
  const entries: Array<[string, string | number | undefined]> = [
    ['page', params.page],
    ['limit', params.limit],
    ['sort', params.sort],
  ]
  for (const [key, value] of entries) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** GET /api/v1/offers — public live-offers list (no admin-all endpoint exists). */
export function getAdminOffers(
  params: AdminOffersListParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminOffer[]>(`/offers${toQuery(params)}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** GET /api/v1/offers/:id */
export function getAdminOffer(
  offerId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminOffer>(
    `/offers/${encodeURIComponent(offerId)}`,
    {
      method: 'GET',
      auth: true,
      signal: options?.signal,
    },
  )
}

/** POST /api/v1/offers */
export function createAdminOffer(
  payload: AdminOfferCreatePayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminOffer>('/offers', {
    method: 'POST',
    auth: true,
    body: payload,
    signal: options?.signal,
  })
}

/** PUT /api/v1/offers/:id */
export function updateAdminOffer(
  offerId: string,
  payload: AdminOfferUpdatePayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminOffer>(
    `/offers/${encodeURIComponent(offerId)}`,
    {
      method: 'PUT',
      auth: true,
      body: payload,
      signal: options?.signal,
    },
  )
}
