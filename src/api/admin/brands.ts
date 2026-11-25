// src/api/admin/brands.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminBrandsListParams,
  AdminBrandWriteFields,
  ApiAdminBrand,
} from '../../types/adminBrands'

function toQuery(params: AdminBrandsListParams): string {
  const search = new URLSearchParams()
  const entries: Array<[string, string | number | undefined]> = [
    ['page', params.page],
    ['limit', params.limit],
    ['sort', params.sort],
    ['keyword', params.keyword],
    ['category', params.category],
  ]
  for (const [key, value] of entries) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

function appendWriteFields(body: FormData, fields: AdminBrandWriteFields) {
  body.append('nameEn', fields.nameEn)
  body.append('nameAr', fields.nameAr)
  if (fields.description !== undefined) {
    body.append('description', fields.description)
  }
  if (fields.category) {
    body.append('category', fields.category)
  }
  if (fields.isActive !== undefined) {
    body.append('isActive', String(fields.isActive))
  }
}

function toJsonBody(fields: AdminBrandWriteFields): Record<string, unknown> {
  const body: Record<string, unknown> = {
    nameEn: fields.nameEn,
    nameAr: fields.nameAr,
  }
  if (fields.description !== undefined) {
    body.description = fields.description
  }
  if (fields.category) {
    body.category = fields.category
  }
  if (fields.isActive !== undefined) {
    body.isActive = fields.isActive
  }
  return body
}

/** GET /api/v1/brands — active brands only. */
export function getAdminBrands(
  params: AdminBrandsListParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminBrand[]>(`/brands${toQuery(params)}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** GET /api/v1/brands/:id — active brand only. */
export function getAdminBrand(
  brandId: string,
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminBrand>(`/brands/${encodeURIComponent(brandId)}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** POST /api/v1/brands — JSON or multipart when uploading `logo`. */
export function createAdminBrand(fields: AdminBrandWriteFields, logo?: File) {
  if (logo) {
    const body = new FormData()
    appendWriteFields(body, fields)
    body.append('logo', logo)
    return apiRequest<ApiAdminBrand>('/brands', {
      method: 'POST',
      auth: true,
      body,
    })
  }

  return apiRequest<ApiAdminBrand>('/brands', {
    method: 'POST',
    auth: true,
    body: toJsonBody(fields),
  })
}

/** PUT /api/v1/brands/:id — JSON or multipart when replacing `logo`. */
export function updateAdminBrand(
  brandId: string,
  fields: AdminBrandWriteFields,
  logo?: File,
) {
  if (logo) {
    const body = new FormData()
    appendWriteFields(body, fields)
    body.append('logo', logo)
    return apiRequest<ApiAdminBrand>(
      `/brands/${encodeURIComponent(brandId)}`,
      {
        method: 'PUT',
        auth: true,
        body,
      },
    )
  }

  return apiRequest<ApiAdminBrand>(`/brands/${encodeURIComponent(brandId)}`, {
    method: 'PUT',
    auth: true,
    body: toJsonBody(fields),
  })
}

/** PUT /api/v1/brands/:id with only `isActive`. */
export function setAdminBrandActive(brandId: string, isActive: boolean) {
  return apiRequest<ApiAdminBrand>(`/brands/${encodeURIComponent(brandId)}`, {
    method: 'PUT',
    auth: true,
    body: { isActive },
  })
}

/** DELETE /api/v1/brands/:id — hard delete. */
export function deleteAdminBrand(brandId: string) {
  return apiRequest<null>(`/brands/${encodeURIComponent(brandId)}`, {
    method: 'DELETE',
    auth: true,
  })
}
