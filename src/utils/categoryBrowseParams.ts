// src/utils/categoryBrowseParams.ts
import type { SortOption } from '../components/category/categoryData'
import {
  createDefaultFilterState,
  type FilterState,
} from '../components/category/filters/filterState'
import { CATEGORIES_PATH } from '../config/routes'

const SORT_OPTIONS = new Set<SortOption>([
  'featured',
  'price-asc',
  'price-desc',
  'rating',
  'newest',
])

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

function isCollectionSlug(value: string | null): value is CollectionBrowseSlug {
  return (
    value === 'new-arrivals' ||
    value === 'best-sellers' ||
    value === 'trending' ||
    value === 'offers' ||
    value === 'featured'
  )
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
        sort: 'newest',
        categorySlug: null,
        certifiedOnly: false,
        collection: slug,
      }
    case 'best-sellers':
      return {
        filters: { ...createDefaultFilterState(), offerIds: ['best-seller'] },
        sort: 'featured',
        categorySlug: null,
        certifiedOnly: false,
        collection: slug,
      }
    case 'trending':
      return {
        filters: createDefaultFilterState(),
        sort: 'featured',
        categorySlug: null,
        certifiedOnly: false,
        collection: slug,
      }
    case 'offers':
      return {
        filters: { ...createDefaultFilterState(), offerIds: ['on-sale'] },
        sort: 'featured',
        categorySlug: null,
        certifiedOnly: false,
        collection: slug,
      }
    case 'featured':
      return {
        filters: createDefaultFilterState(),
        sort: 'featured',
        categorySlug: null,
        certifiedOnly: true,
        collection: slug,
      }
  }
}

export function parseCategoryBrowseParams(searchParams: URLSearchParams): CategoryBrowseState {
  const collectionParam = searchParams.get('collection')
  if (isCollectionSlug(collectionParam)) {
    return applyCollectionPreset(collectionParam)
  }

  const offersParam = searchParams.get('offers')
  const offerIds = offersParam
    ? offersParam.split(',').map((id) => id.trim()).filter(Boolean)
    : []
  const sortParam = searchParams.get('sort')
  const categorySlug = searchParams.get('category')?.trim() || null

  return {
    filters: {
      ...createDefaultFilterState(),
      offerIds,
    },
    sort: isSortOption(sortParam) ? sortParam : 'featured',
    categorySlug,
    certifiedOnly: searchParams.get('certified') === '1',
    collection: null,
  }
}

/** Categories listing with a single category filter applied. */
export function categoryBrowsePath(categorySlug: string): string {
  const params = new URLSearchParams({ category: categorySlug })
  return `${CATEGORIES_PATH}?${params.toString()}`
}

/** Categories listing with a collection preset applied. */
export function collectionBrowsePath(slug: CollectionBrowseSlug | string): string {
  if (!isCollectionSlug(slug)) return CATEGORIES_PATH
  const params = new URLSearchParams({ collection: slug })
  return `${CATEGORIES_PATH}?${params.toString()}`
}
