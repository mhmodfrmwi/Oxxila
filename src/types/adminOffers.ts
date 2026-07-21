// src/types/adminOffers.ts

/** Populated product on offer responses. */
export interface ApiAdminOfferProduct {
  _id: string
  name: string
  slug?: string
  price?: number
  images?: string[]
  isBundle?: boolean
}

/** Raw offer from /api/v1/offers. */
export interface ApiAdminOffer {
  _id: string
  product: ApiAdminOfferProduct | string
  discountPercent?: number | null
  discountAmount?: number | null
  productCount?: number | null
  startDate: string
  endDate: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

/** Normalized row for Offers Manager table. */
export interface AdminOfferRow {
  id: string
  productId: string
  productName: string
  discountPercent: number | null
  discountAmount: number | null
  discountLabel: string
  productCount: number | null
  amountLabel: string
  startDate: string
  endDate: string
  startLabel: string
  endLabel: string
  isActive: boolean
}

export interface AdminOffersListParams {
  page?: number
  limit?: number
  sort?: string
}

/** Payload for POST /api/v1/offers. */
export interface AdminOfferCreatePayload {
  product: string
  /** Active mode value, or `null` when amount mode (never `0` as placeholder). */
  discountPercent: number | null
  /** Active mode value, or `null` when percent mode (never `0` as placeholder). */
  discountAmount: number | null
  productCount?: number
  startDate: string
  endDate: string
}

/** Payload for PUT /api/v1/offers/:id. */
export interface AdminOfferUpdatePayload {
  product?: string
  discountPercent?: number | null
  discountAmount?: number | null
  productCount?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
}

export type AdminOfferDiscountMode = 'percent' | 'amount'

/** Drawer form values (string inputs for controlled fields). */
export interface AdminOfferFormValues {
  product: string
  discountMode: AdminOfferDiscountMode
  discountValue: string
  productCount: string
  startDate: string
  endDate: string
  isActive: boolean
}

export type AdminOfferFormErrors = Partial<
  Record<keyof AdminOfferFormValues, string>
>
