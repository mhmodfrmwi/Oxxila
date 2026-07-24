// src/api/admin/returns.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminReturnsListParams,
  ApiAdminReturn,
  ApiScheduleBostaReturnResult,
  UpdateReturnStatusPayload,
} from '../../types/adminReturns'

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

/** PATCH /api/v1/returns/:id/status — approve/reject/advance a return request. */
export function updateAdminReturnStatus(
  returnId: string,
  payload: UpdateReturnStatusPayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminReturn>(`/returns/${encodeURIComponent(returnId)}/status`, {
    method: 'PATCH',
    auth: true,
    body: payload,
    signal: options?.signal,
  })
}

/** POST /api/v1/returns/:id/bosta/schedule — schedule a Bosta customer-return pickup. */
export function scheduleAdminBostaReturn(returnId: string, options?: { signal?: AbortSignal }) {
  return apiRequest<ApiScheduleBostaReturnResult>(
    `/returns/${encodeURIComponent(returnId)}/bosta/schedule`,
    {
      method: 'POST',
      auth: true,
      signal: options?.signal,
    },
  )
}
