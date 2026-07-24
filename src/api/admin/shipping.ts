// src/api/admin/shipping.ts
import { apiRequest } from '../../lib/api'
import type { ApiAdminOrder } from '../../types/adminOrders'
import type {
  AdminAssignShippingBody,
  AdminManualShippingStatusBody,
  AdminShippingMethodType,
  ApiAdminShippingOrderDetail,
  ApiCountry,
  ApiDistrict,
  ApiGovernorate,
  ApiShippingMethod,
  CreateCountryPayload,
  CreateDistrictPayload,
  CreateGovernoratePayload,
  UpdateCountryPayload,
  UpdateDistrictPayload,
  UpdateGovernoratePayload,
} from '../../types/adminShipping'

/** GET /api/v1/admin/shipping/methods */
export function getAdminShippingMethods(options?: { signal?: AbortSignal }) {
  return apiRequest<ApiShippingMethod[]>('/admin/shipping/methods', {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** PATCH /api/v1/admin/shipping/methods/:type */
export function updateAdminShippingMethod(
  type: AdminShippingMethodType,
  isEnabled: boolean,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiShippingMethod>(
    `/admin/shipping/methods/${encodeURIComponent(type)}`,
    {
      method: 'PATCH',
      auth: true,
      body: { isEnabled },
      signal: options?.signal,
    },
  )
}

// --- Zone Manager: Countries ---

/** GET /api/v1/admin/countries */
export function getAdminCountries(options?: { signal?: AbortSignal }) {
  return apiRequest<ApiCountry[]>('/admin/countries', {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** POST /api/v1/admin/countries */
export function createAdminCountry(
  payload: CreateCountryPayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiCountry>('/admin/countries', {
    method: 'POST',
    auth: true,
    body: payload,
    signal: options?.signal,
  })
}

/** PUT /api/v1/admin/countries/:id */
export function updateAdminCountry(
  id: string,
  payload: UpdateCountryPayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiCountry>(`/admin/countries/${encodeURIComponent(id)}`, {
    method: 'PUT',
    auth: true,
    body: payload,
    signal: options?.signal,
  })
}

/** DELETE /api/v1/admin/countries/:id — cascades governorates + districts. */
export function deleteAdminCountry(id: string, options?: { signal?: AbortSignal }) {
  return apiRequest<null>(`/admin/countries/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
    signal: options?.signal,
  })
}

/** GET /api/v1/admin/countries/:id/governorates */
export function getAdminCountryGovernorates(
  countryId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiGovernorate[]>(
    `/admin/countries/${encodeURIComponent(countryId)}/governorates`,
    { method: 'GET', auth: true, signal: options?.signal },
  )
}

// --- Zone Manager: Governorates ---

/** POST /api/v1/admin/governorates */
export function createAdminGovernorate(
  payload: CreateGovernoratePayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiGovernorate>('/admin/governorates', {
    method: 'POST',
    auth: true,
    body: payload,
    signal: options?.signal,
  })
}

/** PUT /api/v1/admin/governorates/:id */
export function updateAdminGovernorate(
  id: string,
  payload: UpdateGovernoratePayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiGovernorate>(
    `/admin/governorates/${encodeURIComponent(id)}`,
    { method: 'PUT', auth: true, body: payload, signal: options?.signal },
  )
}

/** DELETE /api/v1/admin/governorates/:id */
export function deleteAdminGovernorate(
  id: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<null>(`/admin/governorates/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
    signal: options?.signal,
  })
}

/** GET /api/v1/admin/governorates/:id/districts */
export function getAdminGovernorateDistricts(
  governorateId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiDistrict[]>(
    `/admin/governorates/${encodeURIComponent(governorateId)}/districts`,
    { method: 'GET', auth: true, signal: options?.signal },
  )
}

// --- Zone Manager: Districts ---

/** POST /api/v1/admin/districts */
export function createAdminDistrict(
  payload: CreateDistrictPayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiDistrict>('/admin/districts', {
    method: 'POST',
    auth: true,
    body: payload,
    signal: options?.signal,
  })
}

/** PUT /api/v1/admin/districts/:id */
export function updateAdminDistrict(
  id: string,
  payload: UpdateDistrictPayload,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiDistrict>(`/admin/districts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    auth: true,
    body: payload,
    signal: options?.signal,
  })
}

/** DELETE /api/v1/admin/districts/:id */
export function deleteAdminDistrict(id: string, options?: { signal?: AbortSignal }) {
  return apiRequest<null>(`/admin/districts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
    signal: options?.signal,
  })
}

// --- Orders page: Assign Carrier (shared with useOrderAssign) ---

/** GET /api/v1/admin/shipping/orders/:id — Assign Carrier drawer context. */
export function getAdminOrderShippingDetail(
  orderId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminShippingOrderDetail>(
    `/admin/shipping/orders/${encodeURIComponent(orderId)}`,
    { method: 'GET', auth: true, signal: options?.signal },
  )
}

/** POST /api/v1/admin/shipping/orders/:id/assign */
export function assignAdminOrderShipping(
  orderId: string,
  body: AdminAssignShippingBody,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminOrder>(
    `/admin/shipping/orders/${encodeURIComponent(orderId)}/assign`,
    { method: 'POST', auth: true, body, signal: options?.signal },
  )
}

/** PATCH /api/v1/admin/shipping/orders/:id/status — manual carriers only. */
export function updateAdminManualOrderShippingStatus(
  orderId: string,
  body: AdminManualShippingStatusBody,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminOrder>(
    `/admin/shipping/orders/${encodeURIComponent(orderId)}/status`,
    { method: 'PATCH', auth: true, body, signal: options?.signal },
  )
}
