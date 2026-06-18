import { apiRequest } from '../lib/api'
import type { ApiProduct } from '../types/catalog'

export interface GetProductsParams {
  limit?: number
  page?: number
  isBestSeller?: boolean
  concern?: string
}

function buildQuery(params?: GetProductsParams) {
  if (!params) return ''
  const search = new URLSearchParams()
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.isBestSeller !== undefined) search.set('isBestSeller', String(params.isBestSeller))
  if (params.concern) search.set('concern', params.concern)
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function getProducts(params?: GetProductsParams) {
  return apiRequest<ApiProduct[]>(`/products${buildQuery(params)}`)
}
