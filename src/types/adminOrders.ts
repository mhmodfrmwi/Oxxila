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

/** Status tab keys that map to Figma Orders Management filters. */
export type AdminOrdersStatusTab =
  | 'all'
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'returned'

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
  customerInitials: string
  totalPrice: number
  paymentStatus: AdminPaymentStatus
  paymentStatusLabel: string
  orderStatus: AdminOrderStatus
  orderStatusLabel: string
}

/** Raw list item from GET /api/v1/orders (admin). */
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
  totalPrice: number
  paymentStatus: AdminPaymentStatus
  paymentStatusLabel?: string
  orderStatus: AdminOrderStatus
  orderStatusLabel?: string
  createdAt: string
  updatedAt?: string
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
