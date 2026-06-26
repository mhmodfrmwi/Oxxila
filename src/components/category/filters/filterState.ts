export type PriceSort = 'all' | 'low-to-high' | 'high-to-low'

export interface FilterState {
  sensitivityIds: string[]
  categoryIds: string[]
  typeOfCategoryIds: string[]
  concernIds: string[]
  priceSort: PriceSort
  brandIds: string[]
  rating: number | null
  offerIds: string[]
  inStockOnly: boolean
}

export const defaultFilterState: FilterState = {
  sensitivityIds: [],
  categoryIds: [],
  typeOfCategoryIds: [],
  concernIds: [],
  priceSort: 'all',
  brandIds: [],
  rating: null,
  offerIds: [],
  inStockOnly: false,
}

export function countActiveFilters(filters: FilterState): number {
  return (
    filters.sensitivityIds.length +
    filters.categoryIds.length +
    filters.typeOfCategoryIds.length +
    filters.concernIds.length +
    filters.brandIds.length +
    filters.offerIds.length +
    (filters.priceSort !== 'all' ? 1 : 0) +
    (filters.rating != null ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0)
  )
}
