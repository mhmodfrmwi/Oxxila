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
  tracking: ApiOrderTracking
  shipment?: {
    trackingNumber?: string | null
  } | null
}
