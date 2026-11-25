// src/pages/SearchPage.tsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SHOP_PATH } from '../config/routes'
import { Button } from '../components/ui/Button'
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
  const { t } = useTranslation()
  const navigate = useNavigate()
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
    return brands.find((brand) => brand._id === brandId.trim())?.name ?? t('search.brand')
  }, [brandId, brands, t])

  const title = useMemo(() => {
    const parts: string[] = []
    if (keyword.trim()) parts.push(`“${keyword.trim()}”`)
    if (brandId.trim()) parts.push(brandName)
    if (concerns.trim()) parts.push(concerns.replace(/-/g, ' '))
    if (parts.length === 0) return t('search.page.title')
    if (keyword.trim() && parts.length === 1) return t('search.page.resultsFor', { terms: parts[0] })
    return t('search.page.resultsFor', { terms: parts.join(' · ') })
  }, [keyword, concerns, brandId, brandName, t])

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
            {t('search.page.empty')}
          </p>
        )}

        {error && (
          <p className="mb-4 text-sm text-support-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 min-[769px]:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]">
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
          <div className="flex flex-col items-center gap-4 py-16 text-center" role="status">
            <p className="text-base text-primary-text">{t('search.page.noResults')}</p>
            <p className="max-w-md text-sm text-secondary-text">{t('search.page.noResultsHint')}</p>
            <Button type="button" variant="primary" pill onClick={() => navigate(SHOP_PATH)}>
              {t('search.browseAll')}
            </Button>
          </div>
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
