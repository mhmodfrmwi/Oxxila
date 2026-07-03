import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Footer } from '../components/landing/footer/Footer'
import { CategoryToolbar } from '../components/category/CategoryToolbar'
import { ProductGrid } from '../components/category/ProductGrid'
import { PRODUCTS_PER_PAGE, type SortOption } from '../components/category/categoryData'
import { useSearchProducts } from '../hooks/useSearchProducts'
import { Pagination } from '../components/ui/Pagination'
import { getProducts } from '../api/catalog'
import type { RecommendedProduct } from '../components/shop/recommended/recommendedProductsData'
import { mapApiProductToRecommendedProduct } from '../utils/productDetailMappers'
import { sortOptionToApiSort } from '../utils/productQueryParams'
import { ApiError } from '../lib/api'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') ?? searchParams.get('q') ?? ''
  const concerns = searchParams.get('concerns') ?? searchParams.get('concern') ?? ''
  const [sort, setSort] = useState<SortOption>('featured')
  const searchQueryKey = useMemo(
    () => `${keyword}\0${concerns}\0${sort}`,
    [keyword, concerns, sort],
  )
  const [paginationState, setPaginationState] = useState({ searchQueryKey, page: 1 })

  if (paginationState.searchQueryKey !== searchQueryKey) {
    setPaginationState({ searchQueryKey, page: 1 })
  }

  const page = paginationState.page
  const setPage = (nextPage: number) => {
    setPaginationState({ searchQueryKey, page: nextPage })
  }

  const [concernProducts, setConcernProducts] = useState<RecommendedProduct[]>([])
  const [concernLoading, setConcernLoading] = useState(false)
  const [concernPagination, setConcernPagination] = useState<{
    totalDocuments: number
    numberOfPages: number
  } | null>(null)

  const { products, loading, error, pagination } = useSearchProducts(keyword, sort, page, PRODUCTS_PER_PAGE)

  const isConcernBrowse = !keyword.trim() && Boolean(concerns.trim())

  useEffect(() => {
    if (!isConcernBrowse) return

    let cancelled = false

    async function loadByConcern() {
      await Promise.resolve()
      if (cancelled) return

      setConcernLoading(true)
      try {
        const response = await getProducts({
          concerns,
          page,
          limit: PRODUCTS_PER_PAGE,
          sort: sortOptionToApiSort(sort),
        })
        if (cancelled) return
        setConcernProducts((response.data ?? []).map(mapApiProductToRecommendedProduct))
        setConcernPagination({
          totalDocuments: response.pagination?.totalDocuments ?? 0,
          numberOfPages: response.pagination?.numberOfPages ?? 1,
        })
      } catch (loadError) {
        if (cancelled) return
        if (!(loadError instanceof ApiError)) {
          setConcernProducts([])
        }
      } finally {
        if (!cancelled) setConcernLoading(false)
      }
    }

    void loadByConcern()

    return () => {
      cancelled = true
    }
  }, [isConcernBrowse, concerns, page, sort])

  const displayProducts = isConcernBrowse ? concernProducts : products
  const displayLoading = isConcernBrowse ? concernLoading : loading
  const displayPagination = isConcernBrowse ? concernPagination : pagination
  const totalPages = displayPagination?.numberOfPages ?? 1
  const totalResults = displayPagination?.totalDocuments ?? displayProducts.length

  const title = useMemo(() => {
    if (keyword.trim()) return `Search results for "${keyword.trim()}"`
    if (concerns.trim()) return `Products for ${concerns.replace(/-/g, ' ')}`
    return 'Search products'
  }, [keyword, concerns])

  return (
    <Layout>
      <div className="container-content pb-10 sm:pb-12">
        <CategoryToolbar
          categoryName={title}
          productCount={displayProducts.length}
          totalResults={totalResults}
          sort={sort}
          onSortChange={setSort}
          className="pt-6"
        />

        {!keyword.trim() && !concerns.trim() && (
          <p className="py-12 text-center text-sm text-secondary-text">
            Enter a search term in the header or browse by skin concern from the shop page.
          </p>
        )}

        {error && (
          <p className="mb-4 text-sm text-support-error" role="alert">
            {error}
          </p>
        )}

        {displayLoading ? (
          <div className="grid grid-cols-2 gap-4 min-[769px]:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-[20px] bg-surface-muted" aria-hidden />
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <ProductGrid products={displayProducts} />
        ) : (keyword.trim() || concerns.trim()) ? (
          <p className="py-12 text-center text-sm text-secondary-text">No products found.</p>
        ) : null}

        {(keyword.trim() || concerns.trim()) && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="pt-6"
          />
        )}
      </div>
      <Footer />
    </Layout>
  )
}
