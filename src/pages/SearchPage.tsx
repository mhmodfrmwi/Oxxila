// src/pages/SearchPage.tsx
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
import { useLandingCatalogContext } from '../hooks/useLandingCatalogContext'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const { brands } = useLandingCatalogContext()
  const keyword = searchParams.get('keyword') ?? searchParams.get('q') ?? ''
  const concerns = searchParams.get('concerns') ?? searchParams.get('concern') ?? ''
  const brandId = searchParams.get('brand') ?? ''
  const [sort, setSort] = useState<SortOption>('featured')
  const searchQueryKey = useMemo(
    () => `${keyword}\0${concerns}\0${brandId}\0${sort}`,
    [keyword, concerns, brandId, sort],
  )
  const [paginationState, setPaginationState] = useState({ searchQueryKey, page: 1 })

  if (paginationState.searchQueryKey !== searchQueryKey) {
    setPaginationState({ searchQueryKey, page: 1 })
  }

  const page = paginationState.page
  const setPage = (nextPage: number) => {
    setPaginationState({ searchQueryKey, page: nextPage })
  }

  const [filterProducts, setFilterProducts] = useState<RecommendedProduct[]>([])
  const [filterLoading, setFilterLoading] = useState(false)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [filterPagination, setFilterPagination] = useState<{
    totalDocuments: number
    numberOfPages: number
  } | null>(null)

  const { products, loading, error, pagination } = useSearchProducts(
    keyword,
    sort,
    page,
    PRODUCTS_PER_PAGE,
  )

  const isFilterBrowse = !keyword.trim() && (Boolean(concerns.trim()) || Boolean(brandId.trim()))

  useEffect(() => {
    if (!isFilterBrowse) return

    let cancelled = false

    async function loadByFilter() {
      await Promise.resolve()
      if (cancelled) return

      setFilterLoading(true)
      setFilterError(null)
      try {
        const response = await getProducts({
          ...(concerns.trim() ? { concerns } : {}),
          ...(brandId.trim() ? { brand: brandId.trim() } : {}),
          page,
          limit: PRODUCTS_PER_PAGE,
          sort: sortOptionToApiSort(sort),
        })
        if (cancelled) return
        setFilterProducts((response.data ?? []).map(mapApiProductToRecommendedProduct))
        setFilterPagination({
          totalDocuments: response.pagination?.totalDocuments ?? 0,
          numberOfPages: response.pagination?.numberOfPages ?? 1,
        })
      } catch (loadError) {
        if (cancelled) return
        setFilterProducts([])
        setFilterError(
          loadError instanceof ApiError ? loadError.message : 'Unable to load products.',
        )
      } finally {
        if (!cancelled) setFilterLoading(false)
      }
    }

    void loadByFilter()

    return () => {
      cancelled = true
    }
  }, [isFilterBrowse, concerns, brandId, page, sort])

  const displayProducts = isFilterBrowse ? filterProducts : products
  const displayLoading = isFilterBrowse ? filterLoading : loading
  const displayError = isFilterBrowse ? filterError : error
  const displayPagination = isFilterBrowse ? filterPagination : pagination
  const totalPages = displayPagination?.numberOfPages ?? 1
  const totalResults = displayPagination?.totalDocuments ?? displayProducts.length
  const hasQuery = Boolean(keyword.trim() || concerns.trim() || brandId.trim())

  const brandName = useMemo(() => {
    if (!brandId.trim()) return ''
    return brands.find((brand) => brand._id === brandId.trim())?.name ?? 'Brand'
  }, [brandId, brands])

  const title = useMemo(() => {
    if (keyword.trim()) return `Search results for "${keyword.trim()}"`
    if (brandId.trim()) return brandName
    if (concerns.trim()) return `Products for ${concerns.replace(/-/g, ' ')}`
    return 'Search products'
  }, [keyword, concerns, brandId, brandName])

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

        {!hasQuery && (
          <p className="py-12 text-center text-sm text-secondary-text">
            Enter a search term in the header or browse by skin concern from the shop page.
          </p>
        )}

        {displayError && (
          <p className="mb-4 text-sm text-support-error" role="alert">
            {displayError}
          </p>
        )}

        {displayLoading ? (
          <div className="grid grid-cols-2 gap-4 min-[769px]:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-[20px] bg-surface-muted"
                aria-hidden
              />
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <ProductGrid products={displayProducts} />
        ) : hasQuery ? (
          <p className="py-12 text-center text-sm text-secondary-text">No products found.</p>
        ) : null}

        {hasQuery && (
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
