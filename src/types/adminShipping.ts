// src/types/adminShipping.ts
import type { ApiAdminOrder } from './adminOrders'
import type { AdminAuditBlock, ApiAdminAuditBlock } from './adminAudit'

export type AdminCarrierType = 'api' | 'known' | 'internal'

/** Raw carrier from GET /api/v1/admin/carriers. */
export interface ApiAdminCarrier {
  _id: string
  name?: string
  code?: string
  type?: AdminCarrierType
  logo?: string
  deliveryDays?: string | null
  apiProvider?: 'bosta' | null
  apiBaseUrl?: string | null
  hasApiKey?: boolean
  isActive?: boolean
  coverage?: string[]
  createdAt?: string
  updatedAt?: string
  audit?: ApiAdminAuditBlock | null
}

/** Normalized courier row for Courier Companies table. */
export interface AdminCarrierRow {
  id: string
  name: string
  code: string
  type: AdminCarrierType
  logo: string | null
  deliveryDays: string | null
  /** Not on Carrier model — UI shows em dash. */
  cost: number | null
  coverageLabel: string
  isActive: boolean
  apiProvider: 'bosta' | null
  apiBaseUrl: string | null
  hasApiKey: boolean
  audit: AdminAuditBlock | null
}

export interface AdminCarrierFormValues {
  name: string
  code: string
  type: AdminCarrierType
  isActive: boolean
  deliveryDaysMin: string
  deliveryDaysMax: string
  apiKey: string
  apiBaseUrl: string
}

export interface AdminCarrierFormErrors {
  name?: string
  code?: string
  deliveryDays?: string
  deliveryDaysMin?: string
  deliveryDaysMax?: string
  apiKey?: string
}

export interface CreateCarrierPayload {
  name: string
  code: string
  type: AdminCarrierType
  isActive?: boolean
  deliveryDays?: string
  deliveryDaysMin?: number
  deliveryDaysMax?: number
  apiProvider?: 'bosta'
  apiKey?: string
  apiBaseUrl?: string
}

export interface UpdateCarrierPayload {
  name?: string
  deliveryDays?: string
  deliveryDaysMin?: number
  deliveryDaysMax?: number
  apiKey?: string
  apiBaseUrl?: string
  isActive?: boolean
}

/** Raw coverage row from GET /api/v1/admin/carriers/:id/coverage. */
export interface ApiCarrierCoverageItem {
  _id: string
  carrier: string
  governorate: { _id: string; name?: string } | string
  isActive?: boolean
}

/** Flattened governorate choice for the carrier coverage editor. */
export interface AdminGovernorateOption {
  id: string
  name: string
  countryId: string
  countryName: string
}

/** Raw pickup document from GET /api/v1/admin/carriers/:id/pickups. */
export interface ApiCarrierPickupContact {
  name?: string
  email?: string
  phone?: string
}

export interface ApiCarrierPickupAddress {
  firstLine?: string
  secondLine?: string
  city?: string
  cityId?: string
  zoneId?: string
  districtId?: string
  districtName?: string
}

export interface ApiCarrierPickup {
  _id: string
  carrier?: string
  locationName?: string
  bostaLocationId?: string
  isDefault?: boolean
  contactPerson?: ApiCarrierPickupContact
  address?: ApiCarrierPickupAddress
  createdAt?: string
  updatedAt?: string
}

export interface AdminCarrierPickupRow {
  id: string
  locationName: string
  isDefault: boolean
  contactName: string
  contactPhone: string
  addressLine: string
  cityLabel: string
}

export interface CreateCarrierPickupPayload {
  locationName: string
  isDefault?: boolean
  address: {
    firstLine: string
    secondLine?: string
    city: string
    cityId?: string
    zoneId: string
    districtId: string
    districtName?: string
  }
  contactPerson: {
    name: string
    email?: string
    phone: string
  }
}

export interface AdminPickupFormValues {
  locationName: string
  firstLine: string
  city: string
  cityId: string
  districtId: string
  districtName: string
  zoneId: string
  contactName: string
  contactPhone: string
  isDefault: boolean
}

export interface AdminPickupFormErrors {
  locationName?: string
  firstLine?: string
  city?: string
  districtId?: string
  zoneId?: string
  contactName?: string
  contactPhone?: string
}

/** Loosely typed — raw Bosta cities/districts passthrough. */
export interface ApiBostaDistrict {
  id?: number | string
  _id?: string
  name?: string
  zoneId?: number | string
}

export interface ApiBostaCity {
  id?: number | string
  _id?: string
  name?: string
  districts?: ApiBostaDistrict[]
}

export type AdminShippingMethodType = 'api' | 'known' | 'internal'

/** Raw method setting from GET /api/v1/admin/shipping/methods. */
export interface ApiShippingMethod {
  _id: string
  type: AdminShippingMethodType
  name?: string
  isEnabled?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AdminShippingMethodRow {
  type: AdminShippingMethodType
  name: string
  isEnabled: boolean
}

/** Raw country from GET /api/v1/admin/countries. */
export interface ApiCountry {
  _id: string
  name?: string
  code?: string
  currency?: string
  flag?: string | null
  isActive?: boolean
}

export interface AdminCountryRow {
  id: string
  name: string
  code: string
  currency: string
  flag: string | null
  isActive: boolean
}

export interface CreateCountryPayload {
  name: string
  code: string
  currency: string
  flag?: string
}

export interface UpdateCountryPayload {
  name?: string
  code?: string
  currency?: string
  flag?: string
}

/** Raw governorate from GET /api/v1/admin/countries/:id/governorates. */
export interface ApiGovernorate {
  _id: string
  country?: string | { _id: string; name?: string }
  name?: string
  shippingPrice?: number
  isActive?: boolean
  districtCount?: number
}

export interface AdminGovernorateRow {
  id: string
  countryId: string
  name: string
  shippingPrice: number
  districtCount: number | null
  isActive: boolean
}

export interface CreateGovernoratePayload {
  country: string
  name: string
  shippingPrice: number
}

export interface UpdateGovernoratePayload {
  name?: string
  shippingPrice?: number
}

/** Raw district from GET /api/v1/admin/governorates/:id/districts. */
export interface ApiDistrict {
  _id: string
  governorate?: string | { _id: string; name?: string }
  name?: string
  shippingPrice?: number
  isCovered?: boolean
  bostaCovered?: boolean
}

export interface AdminDistrictRow {
  id: string
  governorateId: string
  name: string
  shippingPrice: number
  isCovered: boolean
  bostaCovered: boolean
}

export interface CreateDistrictPayload {
  governorate: string
  name: string
  shippingPrice: number
}

export interface UpdateDistrictPayload {
  name?: string
  shippingPrice?: number
  isCovered?: boolean
}

// --- Orders page: Assign Carrier (shared with useOrderAssign) ---

export type AdminShippingPackageSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'XLARGE'

/** Carrier option from GET /api/v1/admin/shipping/orders/:id (Assign Carrier drawer). */
export interface ApiAdminAssignCarrier {
  _id: string
  name: string
  code?: string
  type: AdminCarrierType
  apiProvider?: 'bosta' | null
  coversGovernorate: boolean
  hasPickups: boolean
}

export interface ApiAdminAssignPickup {
  _id: string
  locationName: string
  isDefault?: boolean
}

export interface ApiAdminShippingOrderDetail {
  order?: ApiAdminOrder
  carriers: ApiAdminAssignCarrier[]
  pickupsByCarrier: Record<string, ApiAdminAssignPickup[]>
  districtMeta?: { bostaCovered?: boolean | null } | null
}

export type AdminAssignShippingBody =
  | {
      carrierId: string
      pickupId: string
      size: AdminShippingPackageSize
      notes?: string
      markShipped?: boolean
    }
  | {
      /** Internal fleet — notes only, no driver fields. */
      carrierId: string
      notes?: string
      size: AdminShippingPackageSize
      markShipped?: boolean
    }
  | {
      carrierId: string
      driverName: string
      driverPhone: string
      trackingNumber?: string
      notes?: string
      size: AdminShippingPackageSize
      markShipped?: boolean
    }

export type AdminManualShippingStatus =
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'failed_attempt'
  | 'delivered'
  | 'returned'
  | 'cancelled'

export interface AdminManualShippingStatusBody {
  orderStatus: AdminManualShippingStatus
  notes?: string
}
