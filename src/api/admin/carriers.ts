// src/api/admin/carriers.ts
import { apiRequest } from '../../lib/api'
import type { ApiAdminCarrier } from '../../types/adminShipping'

/** GET /api/v1/admin/carriers — settings Shipping Protocols list. */
export function getAdminCarriers(options?: { signal?: AbortSignal }) {
  return apiRequest<ApiAdminCarrier[]>('/admin/carriers', {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}
