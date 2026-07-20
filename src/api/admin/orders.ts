// src/api/admin/orders.ts
import { apiRequest } from '../../lib/api'
import type { ApiAdminOrder, AdminOrdersListParams } from '../../types/adminOrders'

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
