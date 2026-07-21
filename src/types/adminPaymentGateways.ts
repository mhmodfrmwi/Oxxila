// src/types/adminPaymentGateways.ts

/** Gateway codes from PaymentGateway model. */
export type AdminPaymentGatewayCode = 'stripe' | 'paymob' | 'cod'

/** Raw item from GET /api/v1/payments/gateways. */
export interface ApiAdminPaymentGateway {
  _id: string
  code: AdminPaymentGatewayCode
  name: string
  isEnabled: boolean
  createdAt?: string
  updatedAt?: string
}

/** Normalized row for the Payment Gateways card. */
export interface AdminPaymentGatewayRow {
  id: string
  code: AdminPaymentGatewayCode
  name: string
  isEnabled: boolean
}
