// src/api/admin/shipping.ts
import { apiRequest } from '../../lib/api'
import type { ApiAdminOrder } from '../../types/adminOrders'
import type {
  AdminShippingOrdersParams,
  ApiAdminCarrier,
  ApiAdminShipmentDetail,
} from '../../types/adminShipping'

function toOrdersQuery(params: AdminShippingOrdersParams): string {
  const search = new URLSearchParams()
  const entries: Array<[string, string | number | undefined]> = [
    ['page', params.page],
    ['limit', params.limit],
    ['sort', params.sort],
    ['orderStatus', params.orderStatus],
    ['_id', params._id],
  ]
  for (const [key, value] of entries) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** GET /api/v1/admin/carriers — courier companies list. */
export function getAdminCarriers(options?: { signal?: AbortSignal }) {
  return apiRequest<ApiAdminCarrier[]>('/admin/carriers', {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/**
 * Orders used by the Shipping page “Orders Shipping” table.
 * Reuses GET /api/v1/orders (no dedicated shipment list endpoint).
 */
export function getAdminShippingOrders(
  params: AdminShippingOrdersParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminOrder[]>(`/orders${toOrdersQuery(params)}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/**
 * Order shipping detail (shipment + enriched order).
 * GET /api/v1/admin/shipping/orders/:id — `:id` is the order id.
 */
export function getAdminShipment(
  orderId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminShipmentDetail>(
    `/admin/shipping/orders/${encodeURIComponent(orderId)}`,
    {
      method: 'GET',
      auth: true,
      signal: options?.signal,
    },
  )
}
