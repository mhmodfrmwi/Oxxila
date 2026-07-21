// src/api/admin/admins.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminUserCreatePayload,
  AdminUsersListParams,
  AdminUserUpdatePayload,
  ApiAdminUser,
} from '../../types/adminUsers'

function toQuery(params: AdminUsersListParams): string {
  const search = new URLSearchParams()
  const entries: Array<[string, string | number | undefined]> = [
    ['page', params.page],
    ['limit', params.limit],
    ['sort', params.sort],
    ['keyword', params.keyword],
  ]
  for (const [key, value] of entries) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** GET /api/v1/admins */
export function getAdminUsers(
  params: AdminUsersListParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminUser[]>(`/admins${toQuery(params)}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** GET /api/v1/admins/:id */
export function getAdminUser(
  adminId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminUser>(
    `/admins/${encodeURIComponent(adminId)}`,
    {
      method: 'GET',
      auth: true,
      signal: options?.signal,
    },
  )
}

/** POST /api/v1/admins */
export function createAdminUser(
  payload: AdminUserCreatePayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminUser>('/admins', {
    method: 'POST',
    auth: true,
    body: payload,
    signal: options?.signal,
  })
}

/** PUT /api/v1/admins/:id */
export function updateAdminUser(
  adminId: string,
  payload: AdminUserUpdatePayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminUser>(
    `/admins/${encodeURIComponent(adminId)}`,
    {
      method: 'PUT',
      auth: true,
      body: payload,
      signal: options?.signal,
    },
  )
}
