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
  /** Stripe Checkout Session URL */
  url?: string
  /** Paymob hosted iframe URL */
  iframeUrl?: string
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

export type PaymentGatewayCode = 'stripe' | 'paymob' | 'cod'

export interface EnabledPaymentGateway {
  code: PaymentGatewayCode
  name: string
}

/** GET /api/v1/payments/gateways/enabled — enabled gateways for checkout. */
export function getEnabledPaymentGateways(options?: { signal?: AbortSignal }) {
  return apiRequest<EnabledPaymentGateway[]>('/payments/gateways/enabled', {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

export interface GetMyOrdersParams {
  page?: number
  limit?: number
  sort?: string
}

export function getMyOrders(
  params: GetMyOrdersParams = {},
  options?: { signal?: AbortSignal },
) {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.limit) search.set('limit', String(params.limit))
  if (params.sort) search.set('sort', params.sort)
  const query = search.toString()
  return apiRequest<ApiOrder[]>(`/orders/my-orders${query ? `?${query}` : ''}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

export function getMyOrder(orderId: string, options?: { signal?: AbortSignal }) {
  return apiRequest<ApiOrder>(`/orders/my-orders/${orderId}`, {
    auth: true,
    signal: options?.signal,
  })
}

export function cancelMyOrder(orderId: string, reason?: string) {
  return apiRequest<ApiOrder>(`/orders/${orderId}/cancel`, {
    method: 'PATCH',
    auth: true,
    body: reason ? { reason } : {},
  })
}
