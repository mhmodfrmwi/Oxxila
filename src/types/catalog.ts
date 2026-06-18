export interface ApiBrand {
  _id: string
  name: string
  logo: string
  slug: string
  isActive?: boolean
}

export interface ApiCategory {
  _id: string
  name: string
  image: string
  slug: string
  isActive?: boolean
  subcategories?: Array<{
    _id: string
    name: string
    slug: string
    image?: string
  }>
}

export interface ApiProduct {
  _id: string
  name: string
  images: string[]
  price: number
  priceAfterDiscount: number | null
  slug: string
  concerns: string[]
  isBestSeller: boolean
  ratingsAverage: number
  ratingsQuantity: number
  soldCount?: number
  brand?: ApiBrand
  category?: { _id: string; name: string; slug: string }
}

export interface SkinConcernDisplay {
  id: string
  name: string
  image: string
  slug: string
  href: string
}

export interface FeaturedImage {
  id: string
  src: string
  alt: string
}
