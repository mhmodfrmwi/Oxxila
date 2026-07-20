// src/api/admin/customers.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminCustomersListParams,
  ApiAdminCustomer,
} from '../../types/adminCustomers'

function toQuery(params: AdminCustomersListParams): string {
  const search = new URLSearchParams()
  const entries: Array<[string, string | number | boolean | undefined]> = [
    ['page', params.page],
    ['limit', params.limit],
    ['sort', params.sort],
    ['keyword', params.keyword],
    ['role', params.role],
  ]
  for (const [key, value] of entries) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  if (params.active !== undefined) {
    search.set('active', String(params.active))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** GET /api/v1/users — admin users/customers list. */
export function getAdminCustomers(
  params: AdminCustomersListParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminCustomer[]>(`/users${toQuery(params)}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** GET /api/v1/users/:id — admin customer detail. */
export function getAdminCustomer(
  customerId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminCustomer>(`/users/${encodeURIComponent(customerId)}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}
