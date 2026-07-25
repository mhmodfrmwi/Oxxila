// src/api/admin/subcategories.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminSubcategoriesListParams,
  AdminSubcategoryWriteFields,
  ApiAdminSubcategory,
} from '../../types/adminSubcategories'

function toQuery(params: AdminSubcategoriesListParams): string {
  const search = new URLSearchParams()
  const entries: Array<[string, string | undefined]> = [
    ['keyword', params.keyword],
    ['category', params.category],
    ['sort', params.sort],
  ]
  for (const [key, value] of entries) {
    if (value === undefined || value === '') continue
    search.set(key, value)
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

function appendWriteFields(
  body: FormData,
  fields: AdminSubcategoryWriteFields,
) {
  body.append('name', fields.name)
  if (fields.isActive !== undefined) {
    body.append('isActive', String(fields.isActive))
  }
  if (fields.category) {
    body.append('category', fields.category)
  }
}

function toJsonBody(
  fields: AdminSubcategoryWriteFields,
): Record<string, unknown> {
  const body: Record<string, unknown> = { name: fields.name }
  if (fields.isActive !== undefined) body.isActive = fields.isActive
  if (fields.category) body.category = fields.category
  return body
}

function nestedPath(categoryId: string, subcategoryId?: string): string {
  const base = `/categories/${encodeURIComponent(categoryId)}/subcategories`
  return subcategoryId
    ? `${base}/${encodeURIComponent(subcategoryId)}`
    : base
}

/** GET /api/v1/subcategories — active only; no server pagination. */
export function getAdminSubcategories(
  params: AdminSubcategoriesListParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminSubcategory[]>(
    `/subcategories${toQuery(params)}`,
    {
      method: 'GET',
      auth: true,
      signal: options?.signal,
    },
  )
}

/** POST /api/v1/categories/:categoryId/subcategories */
export function createAdminSubcategory(
  categoryId: string,
  fields: AdminSubcategoryWriteFields,
  image?: File,
) {
  if (image) {
    const body = new FormData()
    appendWriteFields(body, fields)
    body.append('image', image)
    return apiRequest<ApiAdminSubcategory>(nestedPath(categoryId), {
      method: 'POST',
      auth: true,
      body,
    })
  }

  return apiRequest<ApiAdminSubcategory>(nestedPath(categoryId), {
    method: 'POST',
    auth: true,
    body: toJsonBody(fields),
  })
}

/** PUT /api/v1/categories/:categoryId/subcategories/:id */
export function updateAdminSubcategory(
  categoryId: string,
  subcategoryId: string,
  fields: AdminSubcategoryWriteFields,
  image?: File,
) {
  if (image) {
    const body = new FormData()
    appendWriteFields(body, fields)
    body.append('image', image)
    return apiRequest<ApiAdminSubcategory>(
      nestedPath(categoryId, subcategoryId),
      {
        method: 'PUT',
        auth: true,
        body,
      },
    )
  }

  return apiRequest<ApiAdminSubcategory>(
    nestedPath(categoryId, subcategoryId),
    {
      method: 'PUT',
      auth: true,
      body: toJsonBody(fields),
    },
  )
}

/** PUT nested path with only `isActive`. */
export function setAdminSubcategoryActive(
  categoryId: string,
  subcategoryId: string,
  isActive: boolean,
) {
  return apiRequest<ApiAdminSubcategory>(
    nestedPath(categoryId, subcategoryId),
    {
      method: 'PUT',
      auth: true,
      body: { isActive },
    },
  )
}

/** DELETE /api/v1/categories/:categoryId/subcategories/:id */
export function deleteAdminSubcategory(
  categoryId: string,
  subcategoryId: string,
) {
  return apiRequest<null>(nestedPath(categoryId, subcategoryId), {
    method: 'DELETE',
    auth: true,
  })
}
