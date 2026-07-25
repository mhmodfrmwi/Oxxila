// src/api/admin/coupons.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminCouponCreatePayload,
  AdminCouponsListParams,
  AdminCouponUpdatePayload,
  ApiAdminCoupon,
} from '../../types/adminCoupons'

function toQuery(params: AdminCouponsListParams): string {
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

/** GET /api/v1/coupons */
export function getAdminCoupons(
  params: AdminCouponsListParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminCoupon[]>(`/coupons${toQuery(params)}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** GET /api/v1/coupons/:id */
export function getAdminCoupon(
  couponId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminCoupon>(
    `/coupons/${encodeURIComponent(couponId)}`,
    {
      method: 'GET',
      auth: true,
      signal: options?.signal,
    },
  )
}

/** POST /api/v1/coupons */
export function createAdminCoupon(
  payload: AdminCouponCreatePayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminCoupon>('/coupons', {
    method: 'POST',
    auth: true,
    body: payload,
    signal: options?.signal,
  })
}

/** DELETE /api/v1/coupons/:id */
export function deleteAdminCoupon(
  couponId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<null>(`/coupons/${encodeURIComponent(couponId)}`, {
    method: 'DELETE',
    auth: true,
    signal: options?.signal,
  })
}

/** PUT /api/v1/coupons/:id */
export function updateAdminCoupon(
  couponId: string,
  payload: AdminCouponUpdatePayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminCoupon>(
    `/coupons/${encodeURIComponent(couponId)}`,
    {
      method: 'PUT',
      auth: true,
      body: payload,
      signal: options?.signal,
    },
  )
}
