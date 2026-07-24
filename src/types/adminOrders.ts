// src/types/adminOrders.ts

/** Order fulfillment statuses from the Order model. */
export type AdminOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'failed_attempt'
  | 'returned'
  | 'partially_returned'
  | 'delivered'
  | 'cancelled'

/** Payment statuses from the Order model. */
export type AdminPaymentStatus = 'pending' | 'paid' | 'refunded'

/** Status tab keys that map to Figma Orders Management filters (full contract list). */
export type AdminOrdersStatusTab =
  | 'all'
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'failed_attempt'
  | 'delivered'
  | 'partially_returned'
  | 'returned'
  | 'cancelled'

export interface AdminOrderUser {
  id: string
  name: string
  email: string | null
  phone: string | null
}

/** Normalized row for the Orders list table. */
export interface AdminOrderRow {
  id: string
  orderNumber: string
  createdAt: string
  customerName: string
  customerEmail: string | null
  customerInitials: string
  totalPrice: number
  orderStatus: AdminOrderStatus
  orderStatusLabel: string
  /** `shipment.carrierName` — null when no committed carrier yet (shows Assign button). */
  carrierName: string | null
  hasCommittedCarrier: boolean
  /** `shipment.trackingNumber` / `providerStateLabel` / `tracking.trackingNumber`. */
  trackingLabel: string | null
}

export interface ApiAdminOrderItem {
  product: string
  name: string
  image: string | null
  price: number
  quantity: number
}

export interface ApiAdminOrderShippingAddress {
  countryName: string
  governorateName: string
  districtName: string
  addressLine: string
  isOther?: boolean
}

export interface ApiAdminOrderTrackingStep {
  key: string
  label: string
  order: number
  status: 'completed' | 'active' | 'upcoming'
}

export interface ApiAdminOrderTracking {
  phase: string
  currentStep: string
  steps: ApiAdminOrderTrackingStep[]
  trackingNumber: string | null
  carrierName?: string | null
  carrierStatusLabel?: string | null
}

/** Raw list/detail item from GET /api/v1/orders (admin). */
export interface ApiAdminOrder {
  _id: string
  user?:
    | string
    | {
        _id?: string
        id?: string
        name?: string
        email?: string
        phone?: string
      }
    | null
  items?: ApiAdminOrderItem[]
  itemCount?: number
  shippingAddress?: ApiAdminOrderShippingAddress
  shipping?: {
    methodName?: string
    price?: number
  }
  subtotal?: number
  shippingPrice?: number
  discountAmount?: number
  storeCreditApplied?: number
  totalPrice: number
  couponCode?: string | null
  paymentMethod?: 'cod' | 'card'
  paymentProvider?: 'stripe' | 'paymob' | null
  paymentStatus: AdminPaymentStatus
  paymentStatusLabel?: string
  isPaid?: boolean
  orderStatus: AdminOrderStatus
  orderStatusLabel?: string
  createdAt: string
  updatedAt?: string
  tracking?: ApiAdminOrderTracking
  shipment?: {
    carrier?: string | null
    carrierName?: string | null
    carrierCode?: string | null
    carrierType?: 'api' | 'known' | 'internal' | null
    trackingNumber?: string | null
    externalDeliveryId?: string | null
    status?: string | null
    carrierStatusLabel?: string | null
    providerStateLabel?: string | null
    driverName?: string | null
  } | null
}

/** Normalized detail model for the Order Details drawer. */
export interface AdminOrderDetail {
  id: string
  orderNumber: string
  createdAt: string
  customerId: string | null
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  customerInitials: string
  paymentMethod: 'cod' | 'card' | null
  paymentProvider: 'stripe' | 'paymob' | null
  paymentStatus: AdminPaymentStatus
  paymentStatusLabel: string
  paymentSummary: string
  orderStatus: AdminOrderStatus
  orderStatusLabel: string
  shippingMethodName: string
  items: ApiAdminOrderItem[]
  trackingSteps: ApiAdminOrderTrackingStep[]
  trackingNumber: string | null
  totalPrice: number
  /** Carrier committed on the shipment (null when unassigned). */
  carrierName: string | null
  carrierType: 'api' | 'known' | 'internal' | null
  hasAssignedCarrier: boolean
  /** Fetched separately via GET /users/:id — nice-to-have, not always loaded. */
  userOrdersCount?: number | null
}

/** POST /api/v1/orders/b2b line item. */
export interface AdminB2BOrderItem {
  productId: string
  quantity: number
  unitPrice?: number
}

/** POST /api/v1/orders/b2b request body. */
export interface AdminB2BOrderPayload {
  userId: string
  items: AdminB2BOrderItem[]
  addressId?: string
  governorateId?: string
  districtId?: string
  addressLine?: string
  couponCode?: string
  freeShipping?: boolean
  paymentMethod: 'cod'
  markPaid?: boolean
}

export interface AdminOrdersListParams {
  page?: number
  limit?: number
  sort?: string
  /** Exact orderStatus filter (omitted for All). */
  orderStatus?: AdminOrderStatus
  paymentStatus?: AdminPaymentStatus
  /** Mongo `_id` when search is a valid ObjectId. */
  _id?: string
  /** ISO date strings for createdAt range (`createdAt[gte]` / `createdAt[lte]`). */
  createdAtGte?: string
  createdAtLte?: string
}
