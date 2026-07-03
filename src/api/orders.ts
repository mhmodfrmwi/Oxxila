// src/api/orders.ts
import { apiRequest } from '../lib/api'
import type { ApiOrder } from '../types/order'

export interface CheckoutAddressPayload {
  governorateId: string
  districtId?: string | 'other'
  addressLine: string
}

export interface CreateCodOrderPayload extends CheckoutAddressPayload {
  paymentMethod: 'cod'
}

export interface CreatePaymentSessionPayload extends CheckoutAddressPayload {
  provider: 'stripe' | 'paymob'
}

export interface PaymentSessionResponse {
  paymentSessionId: string
  provider: 'stripe' | 'paymob'
  totalPrice: number
  expiresAt: string
  url?: string
}

export function createCodOrder(payload: CreateCodOrderPayload) {
  return apiRequest<ApiOrder>('/orders', {
    method: 'POST',
    auth: true,
    body: payload,
  })
}

export function createPaymentSession(payload: CreatePaymentSessionPayload) {
  return apiRequest<PaymentSessionResponse>('/orders/payment-session', {
    method: 'POST',
    auth: true,
    body: payload,
  })
}

export function getPaymentSessionStatus(sessionId: string) {
  return apiRequest<{
    _id: string
    status: string
    provider: string
    totalPrice: number
    order?: ApiOrder | string
  }>(`/orders/payment-session/${sessionId}`, { auth: true })
}

export function getMyOrder(orderId: string) {
  return apiRequest<ApiOrder>(`/orders/my-orders/${orderId}`, { auth: true })
}

export function cancelMyOrder(orderId: string, reason?: string) {
  return apiRequest<ApiOrder>(`/orders/${orderId}/cancel`, {
    method: 'PATCH',
    auth: true,
    body: reason ? { reason } : {},
  })
}
