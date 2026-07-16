// src/api/orders.ts
import { apiRequest } from '../lib/api'
import type { ApiOrder } from '../types/order'

/** Inline address fields — mutually exclusive with `addressId` on the backend. */
export interface InlineCheckoutAddressPayload {
  governorateId: string
  districtId?: string | 'other'
  addressLine: string
  saveAddress?: boolean
  label?: string
  setAsDefault?: boolean
}

/** Prefer saved address id when selecting from the address book. */
export interface SavedCheckoutAddressPayload {
  addressId: string
}

export type CheckoutAddressPayload =
  | SavedCheckoutAddressPayload
  | InlineCheckoutAddressPayload

export interface CreateCodOrderPayload extends InlineCheckoutAddressPayload {
  paymentMethod: 'cod'
  addressId?: never
}

export interface CreateCodOrderWithAddressIdPayload {
  paymentMethod: 'cod'
  addressId: string
}

export interface CreatePaymentSessionPayload extends InlineCheckoutAddressPayload {
  provider: 'stripe' | 'paymob'
  addressId?: never
}

export interface CreatePaymentSessionWithAddressIdPayload {
  provider: 'stripe' | 'paymob'
  addressId: string
}

export interface PaymentSessionResponse {
  paymentSessionId: string
  provider: 'stripe' | 'paymob'
  totalPrice: number
  expiresAt: string
  url?: string
}

export function createCodOrder(
  payload: CreateCodOrderPayload | CreateCodOrderWithAddressIdPayload,
) {
  return apiRequest<ApiOrder>('/orders', {
    method: 'POST',
    auth: true,
    body: payload,
  })
}

export function createPaymentSession(
  payload: CreatePaymentSessionPayload | CreatePaymentSessionWithAddressIdPayload,
) {
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
