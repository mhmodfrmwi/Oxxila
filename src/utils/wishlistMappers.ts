// src/utils/wishlistMappers.ts
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import type { ApiProduct } from '../types/catalog'
import type { WishlistItem, WishlistProduct } from '../types/wishlist'
import { mapApiProductToRecommendedProduct } from './productDetailMappers'

function toApiProductShape(product: WishlistProduct): ApiProduct {
  return {
    _id: product._id,
    name: product.name,
    images: product.images ?? [],
    price: product.price,
    priceAfterDiscount: product.priceAfterDiscount ?? null,
    offerEndsAt: product.offerEndsAt ?? null,
    slug: product.slug,
    concerns: [],
    isBestSeller: product.isBestSeller ?? false,
    ratingsAverage: product.ratingsAverage ?? 0,
    ratingsQuantity: product.ratingsQuantity ?? 0,
    stock: product.stock,
    isActive: product.isActive,
    brand: product.brand,
    category: product.category,
    subCategory: product.subCategory,
    description: product.description,
  }
}

export function mapWishlistItemToRecommended(
  item: WishlistItem,
): RecommendedProduct | null {
  const product = item.product
  if (!product?._id || !product.slug) return null
  return mapApiProductToRecommendedProduct(toApiProductShape(product))
}

export function mapWishlistItemsToRecommended(
  items: readonly WishlistItem[],
): RecommendedProduct[] {
  return items
    .map(mapWishlistItemToRecommended)
    .filter((product): product is RecommendedProduct => product != null)
}
