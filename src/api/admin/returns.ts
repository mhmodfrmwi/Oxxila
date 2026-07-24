// src/api/admin/returns.ts
import { apiRequest } from '../../lib/api'
import type { AdminReturnsListParams, ApiAdminReturn } from '../../types/adminReturns'

function toQuery(params: AdminReturnsListParams): string {
  const search = new URLSearchParams()
  const entries: Array<[string, string | number | undefined]> = [
    ['page', params.page],
    ['limit', params.limit],
    ['sort', params.sort],
    ['refundStatus', params.refundStatus],
    ['order', params.order],
  ]
  for (const [key, value] of entries) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** GET /api/v1/returns — admin return requests list. */
export function getAdminReturns(
  params: AdminReturnsListParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminReturn[]>(`/returns${toQuery(params)}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** GET /api/v1/returns/:id — admin return request detail. */
export function getAdminReturn(returnId: string, options?: { signal?: AbortSignal }) {
  return apiRequest<ApiAdminReturn>(`/returns/${encodeURIComponent(returnId)}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}
