// src/api/admin/adminRoles.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminPermissionsMap,
  ApiAdminRole,
  ApiAdminRoleTabMeta,
} from '../../types/adminPermissions'

export function getAdminRoleTabs(options?: { signal?: AbortSignal }) {
  return apiRequest<ApiAdminRoleTabMeta[]>('/admin-roles/tabs', {
    auth: true,
    signal: options?.signal,
  })
}

export function getAdminRoles(options?: { signal?: AbortSignal }) {
  return apiRequest<ApiAdminRole[]>('/admin-roles', {
    auth: true,
    signal: options?.signal,
  })
}

export function getAdminRole(roleId: string, options?: { signal?: AbortSignal }) {
  return apiRequest<ApiAdminRole>(`/admin-roles/${encodeURIComponent(roleId)}`, {
    auth: true,
    signal: options?.signal,
  })
}

export interface AdminRoleWritePayload {
  name: string
  description?: string
  permissions: AdminPermissionsMap
}

export function createAdminRole(payload: AdminRoleWritePayload) {
  return apiRequest<ApiAdminRole>('/admin-roles', {
    method: 'POST',
    auth: true,
    body: payload,
  })
}

export function updateAdminRole(roleId: string, payload: Partial<AdminRoleWritePayload>) {
  return apiRequest<ApiAdminRole>(`/admin-roles/${encodeURIComponent(roleId)}`, {
    method: 'PUT',
    auth: true,
    body: payload,
  })
}

export function deleteAdminRole(roleId: string) {
  return apiRequest<null>(`/admin-roles/${encodeURIComponent(roleId)}`, {
    method: 'DELETE',
    auth: true,
  })
}
