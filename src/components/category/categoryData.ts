export interface CategoryMeta {
  slug: string
  name: string
  productsPerPage: number
}

export const categoryMetaBySlug: Record<string, CategoryMeta> = {
  fragrance: {
    slug: 'fragrance',
    name: 'Fragrance',
    productsPerPage: 12,
  },
  makeup: {
    slug: 'makeup',
    name: 'Makeup',
    productsPerPage: 12,
  },
  'personal-care': {
    slug: 'personal-care',
    name: 'Personal Care',
    productsPerPage: 12,
  },
  'baby-care': {
    slug: 'baby-care',
    name: 'Baby Care',
    productsPerPage: 12,
  },
}

export const DEFAULT_CATEGORY_SLUG = 'makeup'

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

export function isKnownCategorySlug(slug: string): slug is keyof typeof categoryMetaBySlug {
  return slug in categoryMetaBySlug
}
