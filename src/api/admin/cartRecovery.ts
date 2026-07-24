// src/api/admin/cartRecovery.ts
import { apiRequest } from '../../lib/api'
import type {
  ApiCartRecovery,
  CartRecoveryMetrics,
} from '../../types/adminCartRecovery'

const DEFAULT_PERIOD_DAYS = 30

function mapToMetrics(data: ApiCartRecovery): CartRecoveryMetrics {
  return {
    recoveryRatePercent: data.recoveredPercent,
    abandonedRevenue: data.totalAbandoned,
    recoveredRevenue: data.recoveredRevenue,
  }
}

/** GET /api/v1/payments/cart-recovery?period= */
export async function getCartRecoveryMetrics(options?: {
  period?: number
  signal?: AbortSignal
}): Promise<CartRecoveryMetrics | null> {
  const period = options?.period ?? DEFAULT_PERIOD_DAYS
  const response = await apiRequest<ApiCartRecovery>(
    `/payments/cart-recovery?period=${period}`,
    {
      method: 'GET',
      auth: true,
      signal: options?.signal,
    },
  )
  const data = response.data
  if (!data) return null
  return mapToMetrics(data)
}
