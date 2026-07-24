// src/types/adminReturns.ts

/** ReturnRequest.refundStatus state machine values. */
export type AdminReturnStatus =
  | 'pending'
  | 'approved'
  | 'picked_up'
  | 'received'
  | 'refunded'
  | 'rejected'

/** Status tab keys — `all` omits the `refundStatus` filter. */
export type AdminReturnsStatusTab = 'all' | AdminReturnStatus

export type AdminReturnReason =
  | 'damaged_item'
  | 'wrong_product'
  | 'allergic_reaction'
  | 'expired_product'
  | 'changed_mind'
  | 'other'

export type AdminReturnLogisticsHandler = 'bosta' | 'internal'

export interface ApiAdminReturnUser {
  _id?: string
  id?: string
  name?: string
  email?: string
  phone?: string
}

export interface ApiAdminReturnOrderRef {
  _id: string
  orderStatus?: string
  deliveredAt?: string | null
  totalPrice?: number
  paymentMethod?: 'cod' | 'card'
  paymentStatus?: string
  createdAt?: string
}

export interface ApiAdminReturnItem {
  orderItemId: string
  product: string
  name: string
  price: number
  quantity: number
}

export interface ApiAdminReturnProofImage {
  url: string
  publicId?: string | null
}

export interface ApiAdminReturnPickupAddress {
  firstLine: string
  secondLine?: string
  city: string
  governorateName: string
  governorateId?: string | null
  districtId?: string | null
  districtName?: string | null
}

export interface ApiAdminReturnCarrier {
  _id: string
  name?: string
  code?: string
  apiProvider?: string
}

export interface ApiAdminReturnDropOffPickup {
  _id: string
  locationName?: string
  bostaLocationId?: string | null
}

export interface ApiAdminReturnDropOffSnapshot {
  locationName?: string
  bostaLocationId?: string | null
  address?: unknown
}

/** Raw shape from `GET /returns` and `GET /returns/:id` (admin). */
export interface ApiAdminReturn {
  _id: string
  order?: string | ApiAdminReturnOrderRef | null
  user?: string | ApiAdminReturnUser | null
  items: ApiAdminReturnItem[]
  reason: AdminReturnReason
  note?: string
  proofImages?: ApiAdminReturnProofImage[]
  pickupAddress?: ApiAdminReturnPickupAddress
  contactPhone?: string | null
  logisticsHandler?: AdminReturnLogisticsHandler | null
  carrier?: string | ApiAdminReturnCarrier | null
  dropOffPickup?: string | ApiAdminReturnDropOffPickup | null
  dropOffSnapshot?: ApiAdminReturnDropOffSnapshot | null
  refundStatus: AdminReturnStatus
  refundAmount: number
  gatewayRefundId?: string | null
  adminNote?: string | null
  restocked?: boolean
  refundedAt?: string | null
  bostaExternalId?: string | null
  bostaTrackingNumber?: string | null
  bostaState?: string | null
  bostaStateLabel?: string | null
  logisticsScheduledAt?: string | null
  logisticsNotes?: string | null
  createdAt: string
  updatedAt?: string
}

/** Normalized row for the Returns list table. */
export interface AdminReturnRow {
  id: string
  shortId: string
  createdAt: string
  userName: string
  userEmail: string | null
  orderId: string | null
  orderShortLabel: string | null
  refundAmount: number
  refundStatus: AdminReturnStatus
}

export interface AdminReturnDetailItem {
  orderItemId: string
  name: string
  price: number
  quantity: number
}

export interface AdminReturnDetailProofImage {
  url: string
}

/** Normalized detail model for the Return details panel (Milestone 1 — read only). */
export interface AdminReturnDetail {
  id: string
  shortId: string
  createdAt: string
  refundStatus: AdminReturnStatus
  refundAmount: number
  reason: AdminReturnReason
  note: string
  adminNote: string | null
  userName: string
  userEmail: string | null
  userPhone: string | null
  orderId: string | null
  orderShortLabel: string | null
  logisticsHandler: AdminReturnLogisticsHandler | null
  dropOffLocationName: string | null
  bostaExternalId: string | null
  bostaTrackingNumber: string | null
  bostaStateLabel: string | null
  pickupAddress: {
    firstLine: string
    secondLine: string | null
    city: string
    governorateName: string
  } | null
  items: AdminReturnDetailItem[]
  proofImages: AdminReturnDetailProofImage[]
}

// --- Milestone 2: status mutation payloads ---

export interface UpdateReturnStatusApprovePayload {
  refundStatus: 'approved'
  logisticsHandler: 'internal'
}

export interface UpdateReturnStatusApproveBostaPayload {
  refundStatus: 'approved'
  logisticsHandler: 'bosta'
  carrierId: string
  dropOffPickupId: string
}

export interface UpdateReturnStatusRejectPayload {
  refundStatus: 'rejected'
  adminNote: string
}

export interface UpdateReturnStatusAdvancePayload {
  refundStatus: 'picked_up' | 'received'
}

/** Body for `PATCH /returns/:id/status` — shape depends on the target `refundStatus`. */
export type UpdateReturnStatusPayload =
  | UpdateReturnStatusApprovePayload
  | UpdateReturnStatusApproveBostaPayload
  | UpdateReturnStatusRejectPayload
  | UpdateReturnStatusAdvancePayload

/** Form-level approve payload — dialog resolves this into the right API body shape. */
export interface ApproveReturnFormPayload {
  logisticsHandler: AdminReturnLogisticsHandler
  carrierId?: string
  dropOffPickupId?: string
}

/** Response data from `POST /returns/:id/bosta/schedule`. */
export interface ApiScheduleBostaReturnResult {
  returnRequest: ApiAdminReturn
  trackingNumber?: string | null
  externalDeliveryId?: string | null
  alreadyScheduled?: boolean
}

export interface AdminReturnsListParams {
  page?: number
  limit?: number
  sort?: string
  /** Exact `refundStatus` filter (omitted for `all`). */
  refundStatus?: AdminReturnStatus
  /** Mongo `_id` of the linked order — ApiFeatures passes it straight to `ReturnRequest.find()`. */
  order?: string
}
