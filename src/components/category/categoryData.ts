import type { ApiCategory } from '../../types/catalog'

export interface CategoryMeta {
  slug: string
  name: string
  productsPerPage: number
}

export const PRODUCTS_PER_PAGE = 12

export const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
] as const

export type SortOption = (typeof sortOptions)[number]['value']

export const browsingHistoryTitle =
  'For customers who viewed the goods in your browsing history also saw'

export const relatedBrowsingTitle = 'previously browsed related'

export function findCategoryBySlug(
  categories: readonly ApiCategory[],
  slug: string,
): ApiCategory | undefined {
  return categories.find((category) => category.slug === slug)
}

export function toCategoryMeta(category: ApiCategory): CategoryMeta {
  return {
    slug: category.slug,
    name: category.name,
    productsPerPage: PRODUCTS_PER_PAGE,
  }
}

export function resolveDefaultCategorySlug(categories: readonly ApiCategory[]): string | null {
  const active = categories.filter((category) => category.isActive !== false)
  return active[0]?.slug ?? categories[0]?.slug ?? null
}
