// src/api/admin/products.ts
import { apiRequest } from '../../lib/api'
import type { ApiResponse } from '../../lib/api'
import type { ApiProduct } from '../../types/catalog'
import type {
  AdminProductsListParams,
  AdminProductWriteFields,
  AdminProductWriteFiles,
} from '../../types/adminProducts'

function toQuery(params: AdminProductsListParams): string {
  const search = new URLSearchParams()
  const entries: Array<[string, string | number | boolean | undefined]> = [
    ['page', params.page],
    ['limit', params.limit],
    ['sort', params.sort],
    ['keyword', params.keyword],
    ['category', params.category],
    ['brand', params.brand],
    ['isBestSeller', params.isBestSeller],
    ['isBundle', params.isBundle],
    ['priceMin', params.priceMin],
    ['priceMax', params.priceMax],
    ['period', params.period],
  ]
  for (const [key, value] of entries) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/**
 * Multipart field parsers collapse one same-named key to a string, but the BE
 * validator requires `Array.isArray(concerns)`. Repeated keys become an array —
 * the same encoding used for multiple concerns.
 *
 * A single concern cannot become a length-1 array via multipart alone (multer
 * needs ≥2 same-named fields, which would duplicate the value). Callers apply
 * one concern via `normalizeSingleConcern` (JSON array) after the write.
 */
function appendConcerns(body: FormData, concerns: string[]) {
  if (concerns.length <= 1) return
  for (const concern of concerns) {
    body.append('concerns', concern)
  }
}

function appendWriteFields(body: FormData, fields: AdminProductWriteFields) {
  body.append('name', fields.name)
  body.append('price', String(fields.price))
  body.append('stock', String(fields.stock))
  body.append('category', fields.category)
  for (const id of fields.subCategory) {
    body.append('subCategory', id)
  }
  if (fields.concerns) {
    appendConcerns(body, fields.concerns)
  }
  if (fields.isSensitiveSkin !== undefined) {
    body.append('isSensitiveSkin', String(fields.isSensitiveSkin))
  }
  if (fields.description !== undefined) {
    body.append('description', fields.description)
  }
  if (fields.advantages !== undefined) {
    body.append('advantages', fields.advantages)
  }
  if (fields.composition !== undefined) {
    body.append('composition', fields.composition)
  }
  if (fields.isActive !== undefined) {
    body.append('isActive', String(fields.isActive))
  }
  if (fields.images) {
    for (const url of fields.images) {
      body.append('images', url)
    }
  }
}

function appendWriteFiles(body: FormData, files?: AdminProductWriteFiles) {
  if (!files) return
  for (const file of files.images ?? []) {
    body.append('images', file)
  }
  if (files.catalog) {
    body.append('catalog', files.catalog)
  }
}

/** JSON PUT so a single concern is stored as a true one-element array (no dup). */
function putConcernsArray(id: string, concerns: string[]) {
  return apiRequest<ApiProduct>(`/products/${id}`, {
    method: 'PUT',
    auth: true,
    body: { concerns },
  })
}

async function normalizeSingleConcern(
  response: ApiResponse<ApiProduct>,
  concerns: string[] | undefined,
): Promise<ApiResponse<ApiProduct>> {
  if (!concerns || concerns.length !== 1) return response
  const id = response.data?._id
  if (!id) return response
  return putConcernsArray(id, concerns)
}

/** GET /api/v1/products — catalog list for admin Products page. */
export function getAdminProducts(
  params: AdminProductsListParams = {},
  options?: { signal?: AbortSignal },
) {
  return apiRequest<ApiProduct[]>(`/products${toQuery(params)}`, {
    auth: true,
    signal: options?.signal,
  })
}

/**
 * GET /api/v1/products/:id
 *
 * No admin-specific product read exists (only storefront `GET /products/:id`
 * with `optionalAuth`). That handler increments `views` and, when authenticated,
 * writes browsing history — cannot be avoided without a new BE endpoint.
 */
export function getAdminProduct(id: string, options?: { signal?: AbortSignal }) {
  return apiRequest<ApiProduct>(`/products/${id}`, {
    auth: true,
    signal: options?.signal,
  })
}

function toJsonWriteBody(fields: AdminProductWriteFields) {
  return {
    name: fields.name,
    price: fields.price,
    stock: fields.stock,
    category: fields.category,
    subCategory: fields.subCategory,
    concerns: fields.concerns ?? [],
    isSensitiveSkin: fields.isSensitiveSkin ?? false,
    description: fields.description ?? '',
    advantages: fields.advantages ?? '',
    composition: fields.composition ?? '',
    ...(fields.images ? { images: fields.images } : {}),
    ...(fields.catalog !== undefined ? { catalog: fields.catalog } : {}),
    ...(fields.isActive !== undefined ? { isActive: fields.isActive } : {}),
  }
}

/** POST /api/v1/products — create formula (JSON when no files, else multipart). */
export async function createProduct(
  fields: AdminProductWriteFields,
  files?: AdminProductWriteFiles,
) {
  const hasFiles = Boolean(files?.images?.length || files?.catalog)
  if (!hasFiles) {
    // JSON body keeps `concerns` as a real array for any length (including 1).
    return apiRequest<ApiProduct>('/products', {
      method: 'POST',
      auth: true,
      body: toJsonWriteBody(fields),
    })
  }

  const body = new FormData()
  appendWriteFields(body, fields)
  appendWriteFiles(body, files)
  const response = await apiRequest<ApiProduct>('/products', {
    method: 'POST',
    auth: true,
    body,
  })
  return normalizeSingleConcern(response, fields.concerns)
}

/** PUT /api/v1/products/:id — update formula (multipart or field URLs). */
export async function updateProduct(
  id: string,
  fields: AdminProductWriteFields,
  files?: AdminProductWriteFiles,
) {
  const hasNewFiles = Boolean(files?.images?.length || files?.catalog)
  if (hasNewFiles) {
    const body = new FormData()
    appendWriteFields(body, {
      ...fields,
      // File uploads replace `images`; omit URL list so multer paths win.
      images: undefined,
    })
    appendWriteFiles(body, files)
    const response = await apiRequest<ApiProduct>(`/products/${id}`, {
      method: 'PUT',
      auth: true,
      body,
    })
    return normalizeSingleConcern(response, fields.concerns)
  }

  return apiRequest<ApiProduct>(`/products/${id}`, {
    method: 'PUT',
    auth: true,
    body: toJsonWriteBody(fields),
  })
}

/**
 * PUT /api/v1/products/:id with image files only.
 * Backend replaces the product `images` array with uploaded paths.
 * Prefer merging via `updateProduct` with all File parts when existing URLs
 * must be preserved — this helper replaces the gallery entirely.
 */
export function uploadImages(id: string, images: File[]) {
  const body = new FormData()
  for (const file of images) {
    body.append('images', file)
  }
  return apiRequest<ApiProduct>(`/products/${id}`, {
    method: 'PUT',
    auth: true,
    body,
  })
}

/** Soft-archive via `isActive: false` (list API only returns active products). */
export function archiveProduct(id: string) {
  return apiRequest<ApiProduct>(`/products/${id}`, {
    method: 'PUT',
    auth: true,
    body: { isActive: false },
  })
}

/** Hard-delete product record (admin). */
export function deleteProduct(id: string) {
  return apiRequest<null>(`/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
  })
}

/** PATCH /api/v1/products/:id/best-seller — flips `isBestSeller` on the server. */
export function toggleAdminProductBestSeller(id: string) {
  return apiRequest<{ isBestSeller: boolean }>(
    `/products/${encodeURIComponent(id)}/best-seller`,
    {
      method: 'PATCH',
      auth: true,
    },
  )
}
