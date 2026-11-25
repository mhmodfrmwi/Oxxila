// src/types/order.ts
export interface ApiOrderItem {
  product: string
  name: string
  image: string | null
  price: number
  quantity: number
}

export interface ApiOrderShippingAddress {
  countryName: string
  governorateName: string
  districtName: string
  addressLine: string
  /** Delivery contact captured at checkout (may be absent on older orders). */
  phone?: string
  isOther?: boolean
}

export interface ApiOrderTrackingStep {
  key: string
  label: string
  order: number
  status: 'completed' | 'active' | 'upcoming'
}

export interface ApiOrderTracking {
  phase: string
  currentStep: string
  steps: ApiOrderTrackingStep[]
  trackingNumber: string | null
  carrierName?: string | null
}

export interface ApiOrderDeliveryEstimate {
  carrierName: string | null
  deliveryDaysLabel: string | null
  minBusinessDays: number
  maxBusinessDays: number
  estimatedFrom: string
  estimatedTo: string
  assignedAt: string | null
}

export interface ApiOrder {
  _id: string
  /** Present on detail responses; list responses may omit heavy item payloads. */
  items?: ApiOrderItem[]
  /** Enriched on list responses when `items` is projected out. */
  itemCount?: number
  shippingAddress: ApiOrderShippingAddress
  shipping: {
    methodName: string
    price: number
  }
  subtotal: number
  shippingPrice: number
  discountAmount: number
  storeCreditApplied: number
  totalPrice: number
  couponCode: string | null
  paymentMethod: 'cod' | 'card'
  paymentProvider: 'stripe' | 'paymob' | null
  paymentStatus: string
  paymentStatusLabel: string
  orderStatus: string
  orderStatusLabel: string
  createdAt: string
  deliveredAt?: string | null
  cancelledAt?: string | null
  /** Server-owned action flags (single source of truth for the Cancel/Return buttons). */
  canCancel?: boolean
  canReturn?: boolean
  returnWindowDays?: number
  returnWindowEndsAt?: string | null
  tracking: ApiOrderTracking
  /** Populated after admin assigns a carrier with a delivery window. */
  delivery?: ApiOrderDeliveryEstimate | null
  shipment?: {
    trackingNumber?: string | null
    carrierName?: string | null
    assignedAt?: string | null
  } | null
}
