// src/api/admin/customers.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminCustomerCreateFields,
  AdminCustomersListParams,
  AdminCustomerUpdateFields,
  ApiAdminCustomer,
  ApiAdminCustomerStats,
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

/** GET /api/v1/users/stats — Total Customers + Average LTV. */
export function getAdminCustomerStats(options?: { signal?: AbortSignal }) {
  return apiRequest<ApiAdminCustomerStats>('/users/stats', {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
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
  return apiRequest<ApiAdminCustomer>(
    `/users/${encodeURIComponent(customerId)}`,
    {
      method: 'GET',
      auth: true,
      signal: options?.signal,
    },
  )
}

/** POST /api/v1/users — create customer (admin). */
export function createAdminCustomer(fields: AdminCustomerCreateFields) {
  return apiRequest<ApiAdminCustomer>('/users', {
    method: 'POST',
    auth: true,
    body: fields,
  })
}

/** PUT /api/v1/users/:id — update customer (password/role ignored by BE). */
export function updateAdminCustomer(
  customerId: string,
  fields: AdminCustomerUpdateFields,
) {
  return apiRequest<ApiAdminCustomer>(
    `/users/${encodeURIComponent(customerId)}`,
    {
      method: 'PUT',
      auth: true,
      body: fields,
    },
  )
}

/**
 * Deactivate / block — no dedicated deactivate route exists.
 * Uses PUT /users/:id with `{ active: false }`.
 */
export function deactivateAdminCustomer(customerId: string) {
  return updateAdminCustomer(customerId, { active: false })
}

/** PATCH /api/v1/users/activate/:id — set active: true. */
export function activateAdminCustomer(customerId: string) {
  return apiRequest<ApiAdminCustomer>(
    `/users/activate/${encodeURIComponent(customerId)}`,
    {
      method: 'PATCH',
      auth: true,
      body: {},
    },
  )
}

/** DELETE /api/v1/users/:id — hard delete customer. */
export function deleteAdminCustomer(customerId: string) {
  return apiRequest<null>(`/users/${encodeURIComponent(customerId)}`, {
    method: 'DELETE',
    auth: true,
  })
}

/** PATCH /api/v1/users/changePassword/:id — admin-set password. */
export function changeAdminCustomerPassword(
  customerId: string,
  password: string,
) {
  return apiRequest<ApiAdminCustomer>(
    `/users/changePassword/${encodeURIComponent(customerId)}`,
    {
      method: 'PATCH',
      auth: true,
      body: { password },
    },
  )
}
