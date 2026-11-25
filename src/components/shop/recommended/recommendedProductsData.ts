export interface RecommendedProduct {
  id: string
  brand: string
  title: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  image: string
  imageAlt: string
  badge?: string
  href: string
  /** Present when stock is known from the API. */
  stock?: number
  /** Why this was recommended — shown as a small chip on rail cards. */
  reason?: 'category' | 'subCategory' | 'brand' | 'concerns' | 'popular'
}
