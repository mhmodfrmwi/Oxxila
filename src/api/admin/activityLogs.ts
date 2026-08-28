// src/api/admin/activityLogs.ts
import { apiRequest } from '../../lib/api'
import type { ApiAdminActivityLog } from '../../types/adminAudit'

export interface AdminActivityLogsQuery {
  page?: number
  limit?: number
  actor?: string
  tab?: string
  action?: string
  resourceType?: string
  resourceId?: string
  from?: string
  to?: string
  keyword?: string
  sort?: string
}

export function getAdminActivityLogs(
  params: AdminActivityLogsQuery = {},
  options?: { signal?: AbortSignal },
) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value != null && String(value).trim() !== '') {
      search.set(key, String(value))
    }
  }
  const qs = search.toString()
  return apiRequest<ApiAdminActivityLog[]>(
    `/admin/activity-logs${qs ? `?${qs}` : ''}`,
    { auth: true, signal: options?.signal },
  )
}
