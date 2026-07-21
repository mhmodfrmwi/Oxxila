// src/api/admin/dashboard.ts
import { apiRequest } from '../../lib/api'
import type {
  DashboardOverviewData,
  DashboardOverviewParams,
  DashboardRevenueChartData,
  DashboardRevenueParams,
} from '../../types/adminDashboard'

function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** GET /api/v1/dashboard */
export function getAdminDashboardOverview(
  params: DashboardOverviewParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<DashboardOverviewData>(
    `/dashboard${toQuery({
      period: params.period,
      limit: params.limit,
      lowStockThreshold: params.lowStockThreshold,
    })}`,
    { auth: true, signal: options?.signal },
  )
}

/** GET /api/v1/dashboard/revenue */
export function getAdminDashboardRevenue(
  params: DashboardRevenueParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<DashboardRevenueChartData>(
    `/dashboard/revenue${toQuery({
      period: params.period,
      interval: params.interval,
    })}`,
    { auth: true, signal: options?.signal },
  )
}
