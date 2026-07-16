// src/api/returns.ts
import { apiRequest } from '../lib/api'

export const RETURN_REASONS = [
  'damaged_item',
  'wrong_product',
  'allergic_reaction',
  'expired_product',
  'changed_mind',
  'other',
] as const

export type ReturnReason = (typeof RETURN_REASONS)[number]

export const RETURN_REFUND_STATUSES = [
  'pending',
  'approved',
  'picked_up',
  'received',
  'refunded',
  'rejected',
] as const

export type ReturnRefundStatus = (typeof RETURN_REFUND_STATUSES)[number]

export const PROOF_REQUIRED_REASONS: ReadonlySet<ReturnReason> = new Set([
  'damaged_item',
  'wrong_product',
  'allergic_reaction',
])

export interface EligibleReturnItem {
  orderItemId: string
  product: string
  name: string
  image: string | null
  price: number
  quantity: number
  purchasedQuantity: number
  returnableQuantity: number
}

export interface EligibleReturnOrder {
  _id: string
  orderStatus: string
  deliveredAt: string
  daysSinceDelivery: number
  totalPrice: number
  paymentMethod: 'cod' | 'card'
  items: EligibleReturnItem[]
}

export interface ReturnPickupAddress {
  firstLine: string
  city: string
  governorateName: string
  secondLine?: string
  governorateId?: string
  districtId?: string | 'other'
  districtName?: string
}

export interface CreateReturnItemInput {
  orderItemId: string
  quantity: number
}

export interface CreateReturnPayload {
  orderId: string
  items: CreateReturnItemInput[]
  reason: ReturnReason
  note?: string
  contactPhone?: string
  pickupAddress: ReturnPickupAddress
  proofImages?: File[]
}

export interface ReturnRequestItem {
  orderItemId: string
  product: string
  name: string
  price: number
  quantity: number
  /** Optional display variant (e.g. size). Not always present from API. */
  variant?: string
  /** Not stored on return docs — enriched client-side from the related order when available. */
  image?: string | null
}

export interface ReturnRequestOrderRef {
  _id: string
  orderStatus?: string
  deliveredAt?: string
  totalPrice?: number
  paymentMethod?: 'cod' | 'card'
  paymentStatus?: string
  createdAt?: string
  items?: Array<{
    product: string
    name: string
    image: string | null
    price: number
    quantity: number
  }>
}

export interface ReturnRequestCarrierRef {
  _id?: string
  name?: string
  code?: string
  apiProvider?: string
}

export interface ReturnRequest {
  _id: string
  order: string | ReturnRequestOrderRef
  items: ReturnRequestItem[]
  reason: ReturnReason
  note?: string
  refundStatus: ReturnRefundStatus
  refundAmount: number
  logisticsHandler?: 'bosta' | 'internal' | null
  carrier?: string | ReturnRequestCarrierRef | null
  bostaExternalId?: string | null
  bostaTrackingNumber?: string | null
  bostaState?: string | null
  bostaStateLabel?: string | null
  logisticsScheduledAt?: string | null
  logisticsNotes?: string | null
  adminNote?: string | null
  refundedAt?: string | null
  createdAt: string
  updatedAt?: string
}

/** @deprecated Prefer ReturnRequest — kept for create-response callers. */
export type ReturnRequestSummary = Pick<
  ReturnRequest,
  '_id' | 'refundStatus' | 'refundAmount' | 'reason' | 'createdAt'
>

export function getEligibleReturnOrders(params?: { page?: number; limit?: number }) {
  const search = new URLSearchParams()
  if (params?.page) search.set('page', String(params.page))
  if (params?.limit) search.set('limit', String(params.limit))
  const query = search.toString()
  return apiRequest<EligibleReturnOrder[]>(
    `/returns/eligible-orders${query ? `?${query}` : ''}`,
    { auth: true },
  )
}

export function getMyReturns(params?: {
  refundStatus?: ReturnRefundStatus
  limit?: number
  page?: number
}) {
  const search = new URLSearchParams()
  if (params?.refundStatus) search.set('refundStatus', params.refundStatus)
  if (params?.limit) search.set('limit', String(params.limit))
  if (params?.page) search.set('page', String(params.page))
  search.set('sort', '-createdAt')
  const query = search.toString()
  return apiRequest<ReturnRequest[]>(`/returns/my-returns?${query}`, {
    auth: true,
  })
}

export function getMyReturn(id: string) {
  return apiRequest<ReturnRequest>(`/returns/my-returns/${id}`, { auth: true })
}

export function createReturnRequest(payload: CreateReturnPayload) {
  const body = new FormData()
  body.append('order', payload.orderId)

  payload.items.forEach((item, index) => {
    body.append(`items[${index}][orderItemId]`, item.orderItemId)
    body.append(`items[${index}][quantity]`, String(item.quantity))
  })

  body.append('reason', payload.reason)
  if (payload.note?.trim()) body.append('note', payload.note.trim())
  if (payload.contactPhone?.trim()) {
    body.append('contactPhone', payload.contactPhone.trim())
  }

  const { pickupAddress } = payload
  body.append('pickupAddress[firstLine]', pickupAddress.firstLine.trim())
  body.append('pickupAddress[city]', pickupAddress.city.trim())
  body.append('pickupAddress[governorateName]', pickupAddress.governorateName.trim())
  if (pickupAddress.secondLine?.trim()) {
    body.append('pickupAddress[secondLine]', pickupAddress.secondLine.trim())
  }
  if (pickupAddress.governorateId) {
    body.append('pickupAddress[governorateId]', pickupAddress.governorateId)
  }
  if (pickupAddress.districtId) {
    body.append('pickupAddress[districtId]', pickupAddress.districtId)
  }
  if (pickupAddress.districtName?.trim()) {
    body.append('pickupAddress[districtName]', pickupAddress.districtName.trim())
  }

  for (const file of payload.proofImages?.slice(0, 5) ?? []) {
    body.append('proofImages', file)
  }

  return apiRequest<ReturnRequest>('/returns', {
    method: 'POST',
    auth: true,
    body,
  })
}
