// src/api/offers.ts
import { apiRequest } from '../lib/api'

export interface ApiOfferProduct {
  _id: string
  name: string
  slug: string
  price: number
  images: string[]
  isBundle?: boolean
}

export interface ApiOffer {
  _id: string
  product: ApiOfferProduct | string
  discountPercent?: number | null
  discountAmount?: number | null
  productCount?: number | null
  startDate: string
  endDate: string
  isActive: boolean
}

export interface GetOffersParams {
  page?: number
  limit?: number
  todayOffers?: boolean
}

function buildQuery(params?: GetOffersParams) {
  if (!params) return ''
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.limit != null) search.set('limit', String(params.limit))
  if (params.todayOffers != null) search.set('todayOffers', String(params.todayOffers))
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function getOffers(params?: GetOffersParams) {
  return apiRequest<ApiOffer[]>(`/offers${buildQuery(params)}`)
}

/** Nearest future active offer (startDate > now). */
export function getUpcomingOffer() {
  return apiRequest<ApiOffer | null>('/offers/upcoming')
}
