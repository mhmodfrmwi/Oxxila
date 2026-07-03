// src/api/shipping.ts
import { apiRequest } from '../lib/api'

export interface ShippingCountry {
  _id: string
  name: string
  code: string
}

export interface ShippingGovernorate {
  _id: string
  name: string
  shippingPrice?: number
}

export interface ShippingDistrict {
  _id: string
  name: string
  shippingPrice?: number
}

export interface ShippingZonesResponse {
  hasDistricts: boolean
  shippingPrice?: number
  districts?: ShippingDistrict[]
  other?: { label: string; shippingPrice: number }
}

export interface ResolvedShippingPrice {
  shippingPrice: number
  isOther: boolean
}

export function getShippingCountries() {
  return apiRequest<ShippingCountry[]>('/shipping/countries')
}

export function getShippingGovernorates(countryId: string) {
  return apiRequest<ShippingGovernorate[]>(`/shipping/countries/${countryId}/governorates`)
}

export function getShippingZones(governorateId: string) {
  return apiRequest<ShippingZonesResponse>(`/shipping/governorates/${governorateId}/zones`)
}

export function resolveShippingPrice(governorateId: string, districtId?: string) {
  const params = new URLSearchParams({ governorateId })
  if (districtId) params.set('districtId', districtId)
  return apiRequest<ResolvedShippingPrice>(`/shipping/resolve?${params.toString()}`)
}
