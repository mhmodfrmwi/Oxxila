// src/types/adminShipping.ts
import type {
  AdminOrderStatus,
  ApiAdminOrder,
  ApiAdminOrderTrackingStep,
} from './adminOrders'

/** Figma Orders Shipping status pills. */
export type AdminShippingOrdersTab = 'all' | 'pending' | 'shipped' | 'delivered'

export type AdminCarrierType = 'api' | 'known' | 'internal'

/** Normalized courier row for Courier Companies table. */
export interface AdminCarrierRow {
  id: string
  name: string
  code: string
  type: AdminCarrierType
  logo: string | null
  deliveryDays: string | null
  /** Not on Carrier model — UI shows em dash. */
  cost: number | null
  coverageLabel: string
  isActive: boolean
}

/** How the order is fulfilled for the Method column. */
export type AdminShippingMethodKind = 'courier' | 'in_house' | 'unknown'

/** Normalized order-shipping row for Orders Shipping table. */
export interface AdminShippingOrderRow {
  id: string
  orderNumber: string
  customerName: string
  methodKind: AdminShippingMethodKind
  /** Carrier display name when methodKind is courier. */
  carrierName: string | null
  orderStatus: AdminOrderStatus
  statusLabel: string
  /** Tracking number from shipment/tracking — never invented. */
  trackingOrDriver: string
}

/** Raw carrier from GET /api/v1/admin/carriers. */
export interface ApiAdminCarrier {
  _id: string
  name?: string
  code?: string
  type?: AdminCarrierType
  logo?: string
  deliveryDays?: string | null
  isActive?: boolean
  coverage?: string[]
}

export interface AdminShippingOrdersParams {
  page?: number
  limit?: number
  sort?: string
  orderStatus?: AdminOrderStatus
  _id?: string
}

/** Raw shipment document from GET /api/v1/admin/shipping/orders/:id. */
export interface ApiAdminShipment {
  _id: string
  order?: string
  carrier?: string | null
  carrierName?: string | null
  carrierCode?: string | null
  carrierType?: AdminCarrierType | null
  status?: string | null
  trackingNumber?: string | null
  providerStateLabel?: string | null
  driverName?: string | null
  driverPhone?: string | null
  methodSnapshot?: {
    methodName?: string
    price?: number
  } | null
  assignedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

/** Raw payload from GET /api/v1/admin/shipping/orders/:id. */
export interface ApiAdminShipmentDetail {
  order: ApiAdminOrder
  shipment: ApiAdminShipment | null
}

/** Normalized read-only model for the Shipping Details drawer. */
export interface AdminShipmentDetail {
  /** Order id (drawer opens from Orders Shipping rows). */
  id: string
  shipmentId: string | null
  orderNumber: string
  createdAt: string
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  customerInitials: string
  orderStatus: AdminOrderStatus
  orderStatusLabel: string
  carrierName: string | null
  carrierCode: string | null
  carrierType: AdminCarrierType | null
  methodKind: AdminShippingMethodKind
  shippingMethodName: string
  trackingNumber: string | null
  /** Only when returned by the detail shipment document. */
  driverName: string | null
  shipmentStatus: string | null
  shipmentStatusLabel: string | null
  trackingSteps: ApiAdminOrderTrackingStep[]
}
