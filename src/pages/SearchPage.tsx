// src/pages/SearchPage.tsx
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Footer } from '../components/landing/footer/Footer'
import { CategoryToolbar } from '../components/category/CategoryToolbar'
import { ProductGrid } from '../components/category/ProductGrid'
import {
  DEFAULT_SORT,
  PRODUCTS_PER_PAGE,
  type SortOption,
} from '../components/category/categoryData'
import { useSearchProducts } from '../hooks/useSearchProducts'
import { Pagination } from '../components/ui/Pagination'
import { useLandingCatalogContext } from '../hooks/useLandingCatalogContext'

const SORT_OPTIONS = new Set<SortOption>([
  'newest',
  'price-asc',
  'price-desc',
  'rating',
])

function parseSort(value: string | null): SortOption {
  if (value === 'featured') return DEFAULT_SORT
  return value != null && SORT_OPTIONS.has(value as SortOption)
    ? (value as SortOption)
    : DEFAULT_SORT
}

function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { brands } = useLandingCatalogContext()

  const keyword = searchParams.get('keyword') ?? searchParams.get('q') ?? ''
  const concerns = searchParams.get('concerns') ?? searchParams.get('concern') ?? ''
  const brandId = searchParams.get('brand') ?? ''
  const sort = parseSort(searchParams.get('sort'))
  const page = parsePage(searchParams.get('page'))

  const { products, loading, error, pagination } = useSearchProducts({
    keyword,
    brandId,
    concerns,
    sort,
    page,
    limit: PRODUCTS_PER_PAGE,
  })

  const totalPages = pagination?.numberOfPages ?? 1
  const totalResults = pagination?.totalDocuments ?? products.length
  const safePage = Math.min(page, Math.max(1, totalPages))
  const hasQuery = Boolean(keyword.trim() || concerns.trim() || brandId.trim())

  const brandName = useMemo(() => {
    if (!brandId.trim()) return ''
    return brands.find((brand) => brand._id === brandId.trim())?.name ?? 'Brand'
  }, [brandId, brands])

  const title = useMemo(() => {
    const parts: string[] = []
    if (keyword.trim()) parts.push(`“${keyword.trim()}”`)
    if (brandId.trim()) parts.push(brandName)
    if (concerns.trim()) parts.push(concerns.replace(/-/g, ' '))
    if (parts.length === 0) return 'Search products'
    if (keyword.trim() && parts.length === 1) return `Search results for ${parts[0]}`
    return `Results for ${parts.join(' · ')}`
  }, [keyword, concerns, brandId, brandName])

  function updateParams(patch: { sort?: SortOption; page?: number }) {
    const next = new URLSearchParams(searchParams)
    if (patch.sort != null) {
      if (patch.sort === DEFAULT_SORT) next.delete('sort')
      else next.set('sort', patch.sort)
    }
    if (patch.page != null) {
      if (patch.page <= 1) next.delete('page')
      else next.set('page', String(patch.page))
    }
    setSearchParams(next, { replace: false })
  }

  return (
    <Layout>
      <div className="container-content pb-10 sm:pb-12">
        <CategoryToolbar
          categoryName={title}
          productCount={products.length}
          totalResults={totalResults}
          sort={sort}
          onSortChange={(nextSort) => updateParams({ sort: nextSort, page: 1 })}
          className="pt-6"
        />

        {!hasQuery && (
          <p className="py-12 text-center text-sm text-secondary-text">
            Enter a search term in the header or browse by skin concern from the shop page.
          </p>
        )}

        {error && (
          <p className="mb-4 text-sm text-support-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 min-[769px]:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-[20px] bg-surface-muted"
                aria-hidden
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : hasQuery ? (
          <p className="py-12 text-center text-sm text-secondary-text">No products found.</p>
        ) : null}

        {hasQuery && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={(nextPage) => updateParams({ page: nextPage })}
            className="pt-6"
          />
        )}
      </div>
      <Footer />
    </Layout>
  )
}
