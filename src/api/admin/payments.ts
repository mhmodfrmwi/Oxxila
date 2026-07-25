// src/api/admin/payments.ts
import { apiRequest } from '../../lib/api'
import type {
  DashboardPaymentSummary,
  DashboardPaymentSummaryParams,
} from '../../types/adminDashboard'

function toQuery(params: DashboardPaymentSummaryParams): string {
  const search = new URLSearchParams()
  if (params.period != null) search.set('period', String(params.period))
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** GET /api/v1/payments/summary?period= */
export function getAdminPaymentSummary(
  params: DashboardPaymentSummaryParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<DashboardPaymentSummary>(
    `/payments/summary${toQuery(params)}`,
    {
      method: 'GET',
      auth: true,
      signal: options?.signal,
    },
  )
}
