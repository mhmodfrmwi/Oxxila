// src/utils/categoryBrowseParams.ts
import { DEFAULT_SORT, type SortOption } from '../components/category/categoryData'
import {
  createDefaultFilterState,
  type FilterState,
  type PriceSort,
} from '../components/category/filters/filterState'
import { CATEGORIES_PATH } from '../config/routes'

const SORT_OPTIONS = new Set<SortOption>([
  'newest',
  'price-asc',
  'price-desc',
  'rating',
])

const PRICE_SORT_OPTIONS = new Set<PriceSort>(['all', 'low-to-high', 'high-to-low'])

export type CollectionBrowseSlug =
  | 'new-arrivals'
  | 'best-sellers'
  | 'trending'
  | 'offers'
  | 'featured'

export interface CategoryBrowseState {
  filters: FilterState
  sort: SortOption
  categorySlug: string | null
  certifiedOnly: boolean
  collection: CollectionBrowseSlug | null
  page: number
}

const COLLECTION_TITLES: Record<CollectionBrowseSlug, string> = {
  'new-arrivals': 'New Arrivals',
  'best-sellers': 'Best Sellers',
  trending: 'Trending',
  offers: 'Offers',
  featured: 'Featured',
}

function isSortOption(value: string | null): value is SortOption {
  return value != null && SORT_OPTIONS.has(value as SortOption)
}

function isPriceSort(value: string | null): value is PriceSort {
  return value != null && PRICE_SORT_OPTIONS.has(value as PriceSort)
}

function isCollectionSlug(value: string | null): value is CollectionBrowseSlug {
  return (
    value === 'new-arrivals' ||
    value === 'best-sellers' ||
    value === 'trending' ||
    value === 'offers' ||
    value === 'featured'
  )
}

function splitCsv(value: string | null): string[] {
  if (!value?.trim()) return []
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1
}

export function getCollectionTitle(slug: CollectionBrowseSlug | null): string | null {
  if (!slug) return null
  return COLLECTION_TITLES[slug]
}

export function applyCollectionPreset(slug: CollectionBrowseSlug): CategoryBrowseState {
  switch (slug) {
    case 'new-arrivals':
      return {
        filters: createDefaultFilterState(),
        sort: DEFAULT_SORT,
        categorySlug: null,
        certifiedOnly: false,
        collection: slug,
        page: 1,
      }
    case 'best-sellers':
      return {
        filters: { ...createDefaultFilterState(), offerIds: ['best-seller'] },
        sort: DEFAULT_SORT,
        categorySlug: null,
        certifiedOnly: false,
        collection: slug,
        page: 1,
      }
    case 'trending':
      return {
        filters: createDefaultFilterState(),
        sort: DEFAULT_SORT,
        categorySlug: null,
        certifiedOnly: false,
        collection: slug,
        page: 1,
      }
    case 'offers':
      return {
        filters: { ...createDefaultFilterState(), offerIds: ['on-sale'] },
        sort: DEFAULT_SORT,
        categorySlug: null,
        certifiedOnly: false,
        collection: slug,
        page: 1,
      }
    case 'featured':
      return {
        filters: createDefaultFilterState(),
        sort: DEFAULT_SORT,
        categorySlug: null,
        certifiedOnly: true,
        collection: slug,
        page: 1,
      }
  }
}

export function parseCategoryBrowseParams(searchParams: URLSearchParams): CategoryBrowseState {
  const page = parsePage(searchParams.get('page'))
  const collectionParam = searchParams.get('collection')

  // Pure collection deep link (no customized filter overrides in the URL).
  if (isCollectionSlug(collectionParam) && !hasCustomFilterParams(searchParams)) {
    return { ...applyCollectionPreset(collectionParam), page }
  }

  const sortParam = searchParams.get('sort')
  const priceSortParam = searchParams.get('priceSort')
  const ratingParam = searchParams.get('rating')
  const rating = ratingParam != null && ratingParam !== '' ? Number(ratingParam) : null

  return {
    filters: {
      ...createDefaultFilterState(),
      sensitivityIds: splitCsv(searchParams.get('sensitivity')),
      categoryIds: splitCsv(searchParams.get('subCategory')),
      typeOfCategoryIds: splitCsv(searchParams.get('type')),
      concernIds: splitCsv(searchParams.get('concerns')),
      priceSort: isPriceSort(priceSortParam) ? priceSortParam : 'all',
      brandIds: splitCsv(searchParams.get('brand')),
      rating: rating != null && Number.isFinite(rating) ? rating : null,
      offerIds: splitCsv(searchParams.get('offers')),
      inStockOnly: searchParams.get('inStock') === '1',
    },
    sort: normalizeSortParam(sortParam),
    categorySlug: searchParams.get('category')?.trim() || null,
    certifiedOnly: searchParams.get('certified') === '1',
    collection: null,
    page,
  }
}

/** Maps legacy `featured` URLs to the current default (`newest`). */
function normalizeSortParam(value: string | null): SortOption {
  if (value === 'featured') return DEFAULT_SORT
  return isSortOption(value) ? value : DEFAULT_SORT
}

function hasCustomFilterParams(searchParams: URLSearchParams): boolean {
  return (
    searchParams.has('brand') ||
    searchParams.has('concerns') ||
    searchParams.has('offers') ||
    searchParams.has('sensitivity') ||
    searchParams.has('subCategory') ||
    searchParams.has('type') ||
    searchParams.has('priceSort') ||
    searchParams.has('rating') ||
    searchParams.has('inStock') ||
    searchParams.has('category') ||
    searchParams.has('certified') ||
    (searchParams.has('sort') && searchParams.get('sort') !== DEFAULT_SORT)
  )
}

/** Serialize browse state into URL search params (single source of truth). */
export function buildCategoryBrowseSearchParams(state: CategoryBrowseState): URLSearchParams {
  const params = new URLSearchParams()

  if (state.collection) {
    params.set('collection', state.collection)
    if (state.page > 1) params.set('page', String(state.page))
    return params
  }

  if (state.categorySlug) params.set('category', state.categorySlug)
  if (state.sort !== DEFAULT_SORT) params.set('sort', state.sort)
  if (state.page > 1) params.set('page', String(state.page))
  if (state.certifiedOnly) params.set('certified', '1')

  const { filters } = state
  if (filters.sensitivityIds.length) params.set('sensitivity', filters.sensitivityIds.join(','))
  if (filters.categoryIds.length) params.set('subCategory', filters.categoryIds.join(','))
  if (filters.typeOfCategoryIds.length) params.set('type', filters.typeOfCategoryIds.join(','))
  if (filters.concernIds.length) params.set('concerns', filters.concernIds.join(','))
  if (filters.priceSort !== 'all') params.set('priceSort', filters.priceSort)
  if (filters.brandIds.length) params.set('brand', filters.brandIds.join(','))
  if (filters.rating != null) params.set('rating', String(filters.rating))
  if (filters.offerIds.length) params.set('offers', filters.offerIds.join(','))
  if (filters.inStockOnly) params.set('inStock', '1')

  return params
}

export function categoryBrowseHref(state: CategoryBrowseState): string {
  const query = buildCategoryBrowseSearchParams(state).toString()
  return query ? `${CATEGORIES_PATH}?${query}` : CATEGORIES_PATH
}

/** Categories listing with a single category filter applied. */
export function categoryBrowsePath(categorySlug: string): string {
  return categoryBrowseHref({
    filters: createDefaultFilterState(),
    sort: DEFAULT_SORT,
    categorySlug,
    certifiedOnly: false,
    collection: null,
    page: 1,
  })
}

/** Categories listing with a collection preset applied. */
export function collectionBrowsePath(slug: CollectionBrowseSlug | string): string {
  if (!isCollectionSlug(slug)) return CATEGORIES_PATH
  return categoryBrowseHref(applyCollectionPreset(slug))
}

/** True when multi-brand / rating / in-stock require post-fetch filtering. */
export function requiresClientProductFilter(filters: FilterState): boolean {
  return filters.brandIds.length > 1 || filters.rating != null || filters.inStockOnly
}
