// src/api/catalog.ts
import { apiRequest } from '../lib/api'
import type {
  ApiBrand,
  ApiCategory,
  ApiFaq,
  ApiProduct,
  ApiProductDetail,
  ApiReview,
  ApiReviewStats,
  ApiSubCategory,
} from '../types/catalog'

export interface GetProductsParams {
  page?: number
  limit?: number
  sort?: string
  fields?: string
  keyword?: string
  category?: string
  subCategory?: string
  /** One id or comma-separated ids. */
  brand?: string
  ratingMin?: number
  inStock?: boolean
  concerns?: string
  isSensitiveSkin?: boolean
  isCertified?: boolean
  isBestSeller?: boolean
  isBundle?: boolean
  priceMin?: number
  priceMax?: number
  allOffers?: boolean
  todayOffers?: boolean
  noOffers?: boolean
}

function buildSearchQuery(params?: Record<string, string | number | boolean | undefined>) {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

function buildQuery(params?: GetProductsParams) {
  if (!params) return ''
  const search = new URLSearchParams()
  const entries: Array<[string, string | number | boolean | undefined]> = [
    ['page', params.page],
    ['limit', params.limit],
    ['sort', params.sort],
    ['fields', params.fields],
    ['keyword', params.keyword],
    ['category', params.category],
    ['subCategory', params.subCategory],
    ['brand', params.brand],
    ['concerns', params.concerns],
    ['isSensitiveSkin', params.isSensitiveSkin],
    ['isCertified', params.isCertified],
    ['isBestSeller', params.isBestSeller],
    ['isBundle', params.isBundle],
    ['priceMin', params.priceMin],
    ['priceMax', params.priceMax],
    ['allOffers', params.allOffers],
    ['todayOffers', params.todayOffers],
    ['noOffers', params.noOffers],
  ]
  for (const [key, value] of entries) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function getProducts(params?: GetProductsParams) {
  return apiRequest<ApiProduct[]>(`/products${buildQuery(params)}`)
}

/** Related products for a product page (public). */
export function getRelatedProducts(id: string, limit = 12) {
  return apiRequest<ApiProduct[]>(`/products/${id}/related?limit=${limit}`)
}

/** Hydrate product ids (guest browsing history), order preserved. */
export function getProductsByIds(ids: string[]) {
  return apiRequest<ApiProduct[]>('/products/by-ids', { method: 'POST', body: { ids } })
}

export function getProductById(id: string, auth = false) {
  return apiRequest<ApiProductDetail>(`/products/${id}`, { auth })
}

export function getCategories(params?: { page?: number; limit?: number; keyword?: string }) {
  return apiRequest<ApiCategory[]>(`/categories${buildSearchQuery(params)}`)
}

export function getCategoryById(id: string) {
  return apiRequest<ApiCategory>(`/categories/${id}`)
}

export function getSubCategories(params?: { category?: string; keyword?: string; sort?: string }) {
  return apiRequest<ApiSubCategory[]>(`/subcategories${buildSearchQuery(params)}`)
}

export function getBrands(params?: {
  page?: number
  limit?: number
  category?: string
  keyword?: string
}) {
  return apiRequest<ApiBrand[]>(`/brands${buildSearchQuery(params)}`)
}

export function getProductReviews(productId: string, params?: { limit?: number; page?: number; sort?: string }) {
  return apiRequest<ApiReview[]>(`/products/${productId}/reviews${buildSearchQuery(params)}`)
}

export function getProductReviewStats(productId: string) {
  return apiRequest<ApiReviewStats>(`/products/${productId}/reviews/stats`)
}

export function getProductFaqs(productId: string) {
  return apiRequest<ApiFaq[]>(`/products/${productId}/faqs`)
}

/** POST /products/:productId/faqs/ask — body: `{ question }` */
export function askSpecialist(productId: string, question: string) {
  return apiRequest<undefined>(`/products/${productId}/faqs/ask`, {
    method: 'POST',
    auth: true,
    body: { question },
  })
}

export interface CreateProductReviewPayload {
  rating: number
  comment: string
  title?: string
}

/** POST /products/:productId/reviews — auth required */
export function createProductReview(productId: string, payload: CreateProductReviewPayload) {
  return apiRequest<ApiReview>(`/products/${productId}/reviews`, {
    method: 'POST',
    auth: true,
    body: payload,
  })
}

/** POST /reviews/:id/like — toggles like; returns `{ likesCount, liked }` */
export function toggleReviewLike(reviewId: string) {
  return apiRequest<{ likesCount: number; liked: boolean }>(`/reviews/${reviewId}/like`, {
    method: 'POST',
    auth: true,
  })
}

/** DELETE /reviews/:id — owner or admin */
export function deleteReview(reviewId: string) {
  return apiRequest<undefined>(`/reviews/${reviewId}`, {
    method: 'DELETE',
    auth: true,
  })
}

export interface SearchSuggestion {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  image: string | null
  price: number
  priceAfterDiscount: number | null
  brand: { nameEn: string; nameAr: string } | null
}

export interface SearchSuggestionEntity {
  id: string
  slug?: string
  nameEn: string
  nameAr: string
}

export interface SearchSuggestions {
  products: SearchSuggestion[]
  brands: SearchSuggestionEntity[]
  categories: SearchSuggestionEntity[]
}

/** Smart suggestions: Arabic-normalized, typo-tolerant. Empty `q` returns popular products. */
export function getSearchSuggestions(q: string, options?: { signal?: AbortSignal; limit?: number }) {
  const search = new URLSearchParams({ q, limit: String(options?.limit ?? 6) })
  return apiRequest<SearchSuggestions>(`/search/suggest?${search.toString()}`, {
    signal: options?.signal,
  })
}
