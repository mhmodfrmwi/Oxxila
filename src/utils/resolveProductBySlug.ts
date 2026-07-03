import { getProductById, getProducts } from '../api/catalog'
import { ApiError } from '../lib/api'
import type { ApiProduct, ApiProductDetail } from '../types/catalog'

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i

const slugToIdCache = new Map<string, string>()

export interface ResolveProductBySlugOptions {
  /** Already-loaded catalog products — checked before any network pagination. */
  seedProducts?: readonly ApiProduct[]
  /** Pass true when logged in so browsing history is recorded server-side. */
  auth?: boolean
}

function idFromSeed(slug: string, seedProducts?: readonly ApiProduct[]): string | undefined {
  const match = seedProducts?.find((product) => product.slug === slug)
  if (!match) return undefined
  slugToIdCache.set(slug, match._id)
  return match._id
}

async function fetchProductDetailById(id: string, auth = false): Promise<ApiProductDetail> {
  const response = await getProductById(id, auth)
  if (!response.data) {
    throw new ApiError('Product not found.', 404)
  }
  return response.data
}

async function findProductIdBySlug(
  slug: string,
  seedProducts?: readonly ApiProduct[],
): Promise<string> {
  const cachedId = slugToIdCache.get(slug)
  if (cachedId) return cachedId

  const seededId = idFromSeed(slug, seedProducts)
  if (seededId) return seededId

  let page = 1

  while (true) {
    const response = await getProducts({ limit: 100, page })
    const products = response.data ?? []
    const match = products.find((product) => product.slug === slug)

    if (match) {
      slugToIdCache.set(slug, match._id)
      return match._id
    }

    const nextPage = response.pagination?.nextPage
    if (nextPage == null || nextPage === page) break
    page = nextPage
  }

  throw new ApiError('Product not found.', 404)
}

/**
 * Resolves a product route param to full detail data.
 * Accepts either API slug or MongoDB _id.
 */
export async function resolveProductBySlug(
  slug: string,
  options?: ResolveProductBySlugOptions,
): Promise<ApiProductDetail> {
  const normalizedSlug = slug.trim()
  const auth = options?.auth ?? false
  if (!normalizedSlug) {
    throw new ApiError('Product not found.', 404)
  }

  if (OBJECT_ID_PATTERN.test(normalizedSlug)) {
    try {
      return await fetchProductDetailById(normalizedSlug, auth)
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Product not found.', 404)
    }
  }

  const productId = await findProductIdBySlug(normalizedSlug, options?.seedProducts)
  return fetchProductDetailById(productId, auth)
}
