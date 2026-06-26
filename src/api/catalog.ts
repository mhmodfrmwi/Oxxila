import { apiRequest } from '../lib/api'
import type { ApiProduct, ApiProductDetail, ApiReview } from '../types/catalog'

export interface GetProductsParams {
  limit?: number
  page?: number
  isBestSeller?: boolean
  concern?: string
  brand?: string
  slug?: string
}

function buildQuery(params?: GetProductsParams) {
  if (!params) return ''
  const search = new URLSearchParams()
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.isBestSeller !== undefined) search.set('isBestSeller', String(params.isBestSeller))
  if (params.concern) search.set('concern', params.concern)
  if (params.brand) search.set('brand', params.brand)
  if (params.slug) search.set('slug', params.slug)
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function getProducts(params?: GetProductsParams) {
  return apiRequest<ApiProduct[]>(`/products${buildQuery(params)}`)
}

export function getProductById(id: string) {
  return apiRequest<ApiProductDetail>(`/products/${id}`)
}

export function getProductReviews(productId: string, params?: { limit?: number; page?: number }) {
  const search = new URLSearchParams()
  if (params?.limit !== undefined) search.set('limit', String(params.limit))
  if (params?.page !== undefined) search.set('page', String(params.page))
  const query = search.toString()
  return apiRequest<ApiReview[]>(`/products/${productId}/reviews${query ? `?${query}` : ''}`)
}
