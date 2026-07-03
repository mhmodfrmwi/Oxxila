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
  brand?: string
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
