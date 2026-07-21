// src/api/admin/paymentGateways.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminPaymentGatewayCode,
  ApiAdminPaymentGateway,
} from '../../types/adminPaymentGateways'

/** GET /api/v1/payments/gateways */
export function getAdminPaymentGateways(options?: { signal?: AbortSignal }) {
  return apiRequest<ApiAdminPaymentGateway[]>('/payments/gateways', {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** PATCH /api/v1/payments/gateways/:code — toggle isEnabled. */
export function updateAdminPaymentGateway(
  code: AdminPaymentGatewayCode,
  isEnabled: boolean,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminPaymentGateway>(
    `/payments/gateways/${encodeURIComponent(code)}`,
    {
      method: 'PATCH',
      auth: true,
      body: { isEnabled },
      signal: options?.signal,
    },
  )
}
