// src/api/admin/categories.ts
import { apiRequest } from '../../lib/api'
import type {
  AdminCategoriesListParams,
  AdminCategoryWriteFields,
  ApiAdminCategory,
} from '../../types/adminCategories'

function toQuery(params: AdminCategoriesListParams): string {
  const search = new URLSearchParams()
  const entries: Array<[string, string | number | boolean | undefined]> = [
    ['page', params.page],
    ['limit', params.limit],
    ['sort', params.sort],
    ['keyword', params.keyword],
    ['includeInactive', params.includeInactive ? true : undefined],
  ]
  for (const [key, value] of entries) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

function appendWriteFields(body: FormData, fields: AdminCategoryWriteFields) {
  body.append('name', fields.name)
  if (fields.isActive !== undefined) {
    body.append('isActive', String(fields.isActive))
  }
}

/** GET /api/v1/categories — active categories only (public list, admin uses auth). */
export function getAdminCategories(
  params: AdminCategoriesListParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiAdminCategory[]>(`/categories${toQuery(params)}`, {
    method: 'GET',
    auth: true,
    signal: options?.signal,
  })
}

/** GET /api/v1/categories/:id — pass includeInactive for admin detail of hidden categories. */
export function getAdminCategory(
  categoryId: string,
  options?: { signal?: AbortSignal; includeInactive?: boolean },
) {
  const query = options?.includeInactive ? '?includeInactive=true' : ''
  return apiRequest<ApiAdminCategory>(
    `/categories/${encodeURIComponent(categoryId)}${query}`,
    {
      method: 'GET',
      auth: true,
      signal: options?.signal,
    },
  )
}

/** POST /api/v1/categories — JSON or multipart when uploading `image`. */
export function createAdminCategory(
  fields: AdminCategoryWriteFields,
  image?: File,
) {
  if (image) {
    const body = new FormData()
    appendWriteFields(body, fields)
    body.append('image', image)
    return apiRequest<ApiAdminCategory>('/categories', {
      method: 'POST',
      auth: true,
      body,
    })
  }

  return apiRequest<ApiAdminCategory>('/categories', {
    method: 'POST',
    auth: true,
    body: fields,
  })
}

/** PUT /api/v1/categories/:id — JSON or multipart when replacing `image`. */
export function updateAdminCategory(
  categoryId: string,
  fields: AdminCategoryWriteFields,
  image?: File,
) {
  if (image) {
    const body = new FormData()
    appendWriteFields(body, fields)
    body.append('image', image)
    return apiRequest<ApiAdminCategory>(
      `/categories/${encodeURIComponent(categoryId)}`,
      {
        method: 'PUT',
        auth: true,
        body,
      },
    )
  }

  return apiRequest<ApiAdminCategory>(
    `/categories/${encodeURIComponent(categoryId)}`,
    {
      method: 'PUT',
      auth: true,
      body: fields,
    },
  )
}

/** PUT /api/v1/categories/:id with only `isActive`. */
export function setAdminCategoryActive(categoryId: string, isActive: boolean) {
  return apiRequest<ApiAdminCategory>(
    `/categories/${encodeURIComponent(categoryId)}`,
    {
      method: 'PUT',
      auth: true,
      body: { isActive },
    },
  )
}

/** DELETE /api/v1/categories/:id — hard-deletes category + subcategories. */
export function deleteAdminCategory(categoryId: string) {
  return apiRequest<null>(`/categories/${encodeURIComponent(categoryId)}`, {
    method: 'DELETE',
    auth: true,
  })
}
