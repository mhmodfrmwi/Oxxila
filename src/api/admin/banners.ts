// src/api/admin/banners.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminBannerWriteFields,
  ApiAdminBanner,
} from '../../types/adminBanners'

/** GET /api/v1/banners?includeInactive=true — admin list (active + inactive). */
export function getAdminBanners(options?: { signal?: AbortSignal }) {
  return apiRequest<ApiAdminBanner[]>('/banners?includeInactive=true', {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** Empty-string linkId/externalUrl tell the BE to null the field on update. */
function appendWriteFields(body: FormData, fields: AdminBannerWriteFields) {
  body.append('linkType', fields.linkType)
  body.append('title', fields.title ?? '')
  body.append('linkId', fields.linkId ?? '')
  body.append('externalUrl', fields.externalUrl ?? '')
  if (fields.isActive !== undefined) {
    body.append('isActive', String(fields.isActive))
  }
}

/** POST /api/v1/banners — multipart, image required. */
export function createAdminBanner(fields: AdminBannerWriteFields, image: File) {
  const body = new FormData()
  appendWriteFields(body, fields)
  body.append('image', image)
  return apiRequest<ApiAdminBanner>('/banners', {
    method: 'POST',
    auth: true,
    body,
  })
}

/** PUT /api/v1/banners/:id — multipart, image optional (kept when omitted). */
export function updateAdminBanner(
  id: string,
  fields: AdminBannerWriteFields,
  image?: File,
) {
  const body = new FormData()
  appendWriteFields(body, fields)
  if (image) body.append('image', image)
  return apiRequest<ApiAdminBanner>(`/banners/${encodeURIComponent(id)}`, {
    method: 'PUT',
    auth: true,
    body,
  })
}

/** PUT /api/v1/banners/:id with only `isActive` — quick toggle, keeps existing image. */
export function setAdminBannerActive(id: string, isActive: boolean) {
  return apiRequest<ApiAdminBanner>(`/banners/${encodeURIComponent(id)}`, {
    method: 'PUT',
    auth: true,
    body: { isActive },
  })
}

/** DELETE /api/v1/banners/:id */
export function deleteAdminBanner(id: string) {
  return apiRequest<null>(`/banners/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
  })
}
