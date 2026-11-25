// src/types/cart.ts
export interface ApiCartProduct {
  _id: string
  name: string
  nameEn?: string
  nameAr?: string
  slug?: string
  images: string[]
  price: number
  priceAfterDiscount: number | null
  stock: number
  isActive: boolean
}

export interface ApiCartItem {
  _id: string
  product: ApiCartProduct
  quantity: number
  price: number
}

export interface ApiCart {
  _id?: string
  items: ApiCartItem[]
  couponCode: string | null
  /** True when the applied coupon waives shipping. */
  freeShipping?: boolean
  discountType?: 'percentage' | 'fixed' | 'freeShipping' | null
  /** Percent for percentage coupons, EGP for fixed ones. */
  discountValue?: number | null
  discountAmount: number
  storeCreditBalance: number
  storeCreditApplied: number
  subtotal: number
  totalPrice: number
}
