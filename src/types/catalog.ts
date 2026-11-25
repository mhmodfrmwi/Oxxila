export interface ApiBrand {
  _id: string
  name: string
  nameEn?: string
  nameAr?: string
  logo: string
  slug: string
  isActive?: boolean
  category?: string | { _id: string; name?: string; nameEn?: string; nameAr?: string; slug?: string }
}

export interface ApiCategory {
  _id: string
  name: string
  nameEn?: string
  nameAr?: string
  image: string
  slug: string
  isActive?: boolean
  subcategories?: Array<{
    _id: string
    name: string
    nameEn?: string
    nameAr?: string
    slug: string
    image?: string
    isActive?: boolean
  }>
}

export interface ApiProduct {
  _id: string
  /** Why the server recommended this (set by /recommendations and /related). */
  recommendationReason?: 'category' | 'subCategory' | 'brand' | 'concerns' | 'popular'
  name: string
  nameEn?: string
  nameAr?: string
  descriptionAr?: string
  advantagesAr?: string
  compositionAr?: string
  images: string[]
  price: number
  priceAfterDiscount: number | null
  slug: string
  concerns: string[]
  isBestSeller: boolean
  ratingsAverage: number
  ratingsQuantity: number
  soldCount?: number
  /**
   * Period-over-period units-sold trend (%) from GET /products (`period` query, default 30).
   * Present on list responses only — not on single-product GET.
   */
  performance?: number
  brand?: ApiBrand
  category?: { _id: string; name: string; nameEn?: string; nameAr?: string; slug: string }
  description?: string
  advantages?: string
  composition?: string
  stock?: number
  offerEndsAt?: string | null
  subCategory?: ApiSubCategory[]
  isSensitiveSkin?: boolean
  isBundle?: boolean
  catalog?: string | null
  certificationImage?: string | null
  isCertified?: boolean
  isActive?: boolean
  views?: number
  createdAt?: string
  updatedAt?: string
}

export interface ApiSubCategory {
  _id: string
  name: string
  nameEn?: string
  nameAr?: string
  slug: string
  image?: string
}

export type ApiProductDetail = ApiProduct

export interface ApiReviewUser {
  _id?: string
  name?: string
  avatar?: string
  photo?: string
}

export interface ApiReview {
  _id: string
  rating: number
  title?: string
  comment?: string
  review?: string
  createdAt?: string
  likesCount?: number
  likes?: Array<string | { _id?: string }>
  user?: ApiReviewUser | string
}

export interface ApiReviewBreakdown {
  star: number
  count: number
  percentage: number
}

export interface ApiReviewStats {
  ratingsAverage: number
  ratingsQuantity: number
  breakdown: ApiReviewBreakdown[]
}

export interface ApiFaq {
  _id: string
  question: string
  answer: string
  isActive?: boolean
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
