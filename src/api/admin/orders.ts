// src/api/admin/orders.ts
import { apiRequest } from '../../lib/api'
import type {
  ApiAdminOrder,
  AdminB2BOrderPayload,
  AdminOrdersListParams,
} from '../../types/adminOrders'

function toQuery(params: AdminOrdersListParams): string {
  const search = new URLSearchParams()
  const entries: Array<[string, string | number | undefined]> = [
    ['page', params.page],
    ['limit', params.limit],
    ['sort', params.sort],
    ['orderStatus', params.orderStatus],
    ['paymentStatus', params.paymentStatus],
    ['_id', params._id],
  ]
  for (const [key, value] of entries) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  if (params.createdAtGte) search.set('createdAt[gte]', params.createdAtGte)
  if (params.createdAtLte) search.set('createdAt[lte]', params.createdAtLte)
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** GET /api/v1/orders — admin orders list. */
export function getAdminOrders(
  params: AdminOrdersListParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminOrder[]>(`/orders${toQuery(params)}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** GET /api/v1/orders/:id — admin order detail. */
export function getAdminOrder(orderId: string, options?: { signal?: AbortSignal }) {
  return apiRequest<ApiAdminOrder>(`/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** POST /api/v1/orders/b2b — create a B2B order from the admin dashboard (no cart). */
export function createAdminB2BOrder(body: AdminB2BOrderPayload) {
  return apiRequest<ApiAdminOrder>('/orders/b2b', {
    method: 'POST',
    auth: true,
    body,
  })
}

/** PATCH /api/v1/orders/:id/cancel — admin or owner cancel (`reason` optional). */
export function cancelAdminOrder(orderId: string, reason?: string) {
  const trimmed = reason?.trim()
  return apiRequest<ApiAdminOrder>(
    `/orders/${encodeURIComponent(orderId)}/cancel`,
    {
      method: 'PATCH',
      auth: true,
      body: trimmed ? { reason: trimmed } : {},
    },
  )
}
