// src/utils/productQueryParams.ts
import type { GetProductsParams } from '../api/catalog'
import type { SortOption } from '../components/category/categoryData'
import type { FilterState } from '../components/category/filters/filterState'
import { mapConcernIdsToApi, mapOfferIdsToApi, mapSensitivityIdsToApi } from './filterMappings'

export function sortOptionToApiSort(sort: SortOption): string {
  switch (sort) {
    case 'price-asc':
      return 'price'
    case 'price-desc':
      return '-price'
    case 'rating':
      return '-ratingsAverage'
    case 'newest':
      return '-createdAt'
    case 'featured':
    default:
      return '-soldCount,-createdAt'
  }
}

export function buildProductQueryParams(
  filters: FilterState,
  sort: SortOption,
  options?: {
    categoryId?: string
    keyword?: string
    page?: number
    limit?: number
  },
): GetProductsParams {
  const resolvedSort =
    filters.priceSort === 'low-to-high'
      ? 'price'
      : filters.priceSort === 'high-to-low'
        ? '-price'
        : sortOptionToApiSort(sort)

  const params: GetProductsParams = {
    page: options?.page ?? 1,
    limit: options?.limit ?? 12,
    sort: resolvedSort,
  }

  if (options?.categoryId) {
    params.category = options.categoryId
  }

  if (options?.keyword?.trim()) {
    params.keyword = options.keyword.trim()
  }

  const subCategoryIds = [...filters.categoryIds, ...filters.typeOfCategoryIds]
  if (subCategoryIds.length > 0) {
    params.subCategory = subCategoryIds.join(',')
  }

  if (filters.brandIds.length === 1) {
    params.brand = filters.brandIds[0]
  }

  const concerns = mapConcernIdsToApi(filters.concernIds)
  if (concerns.length > 0) {
    params.concerns = concerns.join(',')
  }

  const sensitivity = mapSensitivityIdsToApi(filters.sensitivityIds)
  if (sensitivity.isSensitiveSkin) {
    params.isSensitiveSkin = true
  }

  const offers = mapOfferIdsToApi(filters.offerIds)
  if (offers.allOffers) params.allOffers = true
  if (offers.todayOffers) params.todayOffers = true
  if (offers.isBestSeller) params.isBestSeller = true

  return params
}

export function applyClientOnlyFilters<T extends { brand?: { _id: string }; ratingsAverage?: number; stock?: number }>(
  products: T[],
  filters: FilterState,
): T[] {
  let result = products

  if (filters.brandIds.length > 1) {
    const brandSet = new Set(filters.brandIds)
    result = result.filter((product) => product.brand?._id && brandSet.has(product.brand._id))
  }

  if (filters.rating != null) {
    result = result.filter((product) => (product.ratingsAverage ?? 0) >= filters.rating!)
  }

  if (filters.inStockOnly) {
    result = result.filter((product) => (product.stock ?? 0) > 0)
  }

  return result
}
