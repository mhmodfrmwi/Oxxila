// src/types/wishlist.ts
import type { ApiProduct } from './catalog'

/** Product fields returned by wishlist populate (may be a partial ApiProduct). */
export type WishlistProduct = Pick<
  ApiProduct,
  | '_id'
  | 'name'
  | 'slug'
  | 'images'
  | 'price'
  | 'priceAfterDiscount'
  | 'stock'
  | 'isActive'
> &
  Partial<
    Pick<
      ApiProduct,
      | 'brand'
      | 'category'
      | 'subCategory'
      | 'ratingsAverage'
      | 'ratingsQuantity'
      | 'soldCount'
      | 'isBestSeller'
      | 'description'
    >
  >

export interface WishlistItem {
  _id: string
  product: WishlistProduct
  addedAt?: string
}

export interface Wishlist {
  _id: string
  user: string
  items: WishlistItem[]
  createdAt?: string
  updatedAt?: string
}
