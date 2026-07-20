// src/components/category/CategoryPageContent.tsx
import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CATEGORIES_PATH, HOME_PATH } from '../../config/routes'
import { useAuth } from '../../context/AuthContext'
import { useBrowsingHistory } from '../../hooks/useBrowsingHistory'
import { useCategoryProducts } from '../../hooks/useCategoryProducts'
import { useLandingCatalogContext } from '../../hooks/useLandingCatalogContext'
import { useSubCategories } from '../../hooks/useSubCategories'
import {
  buildCategoryBrowseSearchParams,
  getCollectionTitle,
  parseCategoryBrowseParams,
  type CategoryBrowseState,
} from '../../utils/categoryBrowseParams'
import { Breadcrumb } from '../ui/Breadcrumb'
import { Pagination } from '../ui/Pagination'
import { ContentSection } from '../layout/ContentSection'
import { Footer } from '../landing/footer/Footer'
import { SectionHeader } from '../landing/SectionHeader'
import { ProductCarousel } from '../shop/recommended/ProductCarousel'
import { CategoryToolbar } from './CategoryToolbar'
import { ProductGrid } from './ProductGrid'
import {
  browsingHistoryTitle,
  findCategoryBySlug,
  DEFAULT_SORT,
  PRODUCTS_PER_PAGE,
  relatedBrowsingTitle,
  type SortOption,
} from './categoryData'
import type { FilterState } from './filters/filterState'
import { FilterSidebar } from './filters/FilterSidebar'

function sameIdList(a: readonly string[], b: readonly string[]) {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((id) => set.has(id))
}

export function CategoryPageContent() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { categories, brands, loading: catalogLoading } = useLandingCatalogContext()

  const browse = useMemo(
    () => parseCategoryBrowseParams(searchParams),
    [searchParams],
  )

  const {
    filters,
    sort,
    categorySlug,
    certifiedOnly,
    collection,
    page,
  } = browse

  function commitBrowse(next: CategoryBrowseState) {
    setSearchParams(buildCategoryBrowseSearchParams(next), { replace: false })
  }

  const selectedCategory = useMemo(
    () => (categorySlug ? findCategoryBySlug(categories, categorySlug) : undefined),
    [categories, categorySlug],
  )

  const waitingForCategory =
    Boolean(categorySlug) && !catalogLoading && categories.length > 0 && !selectedCategory

  const categoryBrands = useMemo(() => {
    const activeBrands = brands.filter((brand) => brand.isActive !== false)
    if (!selectedCategory) return activeBrands

    const filtered = activeBrands.filter((brand) => {
      if (!brand.category) return true
      const categoryId =
        typeof brand.category === 'string' ? brand.category : brand.category._id
      return categoryId === selectedCategory._id
    })
    return filtered.length > 0 ? filtered : activeBrands
  }, [brands, selectedCategory])

  const { subcategories: fetchedSubcategories, loading: subcategoriesLoading } = useSubCategories(
    selectedCategory?._id,
    !catalogLoading && Boolean(selectedCategory?._id),
  )

  const subcategories = useMemo(() => {
    if (!selectedCategory) return []
    if (fetchedSubcategories.length > 0) return fetchedSubcategories
    if (selectedCategory.subcategories?.length) return selectedCategory.subcategories
    return []
  }, [fetchedSubcategories, selectedCategory])

  const typeIdsKey = filters.typeOfCategoryIds.join(',')
  const typePruneKeyRef = useRef('')

  // Keep Type-of-Category selections valid for the active category (URL sync).
  useEffect(() => {
    const selectedTypes = filters.typeOfCategoryIds

    if (!selectedCategory) {
      if (selectedTypes.length === 0) {
        typePruneKeyRef.current = 'none:[]'
        return
      }
      const key = 'none:clear'
      if (typePruneKeyRef.current === key) return
      typePruneKeyRef.current = key
      setSearchParams(
        buildCategoryBrowseSearchParams({
          filters: { ...filters, typeOfCategoryIds: [] },
          sort,
          categorySlug: null,
          certifiedOnly,
          collection,
          page: 1,
        }),
        { replace: true },
      )
      return
    }

    const hasEmbedded = Boolean(selectedCategory.subcategories?.length)
    if (subcategoriesLoading && !hasEmbedded && fetchedSubcategories.length === 0) {
      return
    }

    const validIds = new Set(subcategories.map((item) => item._id))
    const nextTypes = selectedTypes.filter((id) => validIds.has(id))
    const key = `${selectedCategory._id}:${nextTypes.slice().sort().join(',')}`

    if (sameIdList(nextTypes, selectedTypes)) {
      typePruneKeyRef.current = key
      return
    }

    if (typePruneKeyRef.current === key) return
    typePruneKeyRef.current = key

    setSearchParams(
      buildCategoryBrowseSearchParams({
        filters: { ...filters, typeOfCategoryIds: nextTypes },
        sort,
        categorySlug,
        certifiedOnly,
        collection: null,
        page: 1,
      }),
      { replace: true },
    )
  }, [
    selectedCategory,
    categorySlug,
    subcategories,
    subcategoriesLoading,
    fetchedSubcategories.length,
    typeIdsKey,
    filters,
    sort,
    certifiedOnly,
    collection,
    setSearchParams,
  ])

  const pageTitle =
    selectedCategory?.name ??
    getCollectionTitle(collection) ??
    'Categories'

  const { products, loading, error, pagination } = useCategoryProducts(
    selectedCategory?._id,
    filters,
    sort,
    page,
    PRODUCTS_PER_PAGE,
    {
      enabled: !waitingForCategory && !(categorySlug && catalogLoading),
      isCertified: certifiedOnly,
    },
  )

  const { products: browsingProducts, loading: browsingLoading } = useBrowsingHistory(6)

  const totalPages = pagination?.numberOfPages ?? 1
  const safePage = Math.min(page, Math.max(1, totalPages))
  const totalResults = pagination?.totalDocuments ?? products.length

  const handleFiltersChange = (patch: Partial<FilterState>) => {
    const nextFilters = { ...filters, ...patch }
    let nextSort = sort

    // Keep toolbar sort aligned when the price filter drives API sort.
    if (patch.priceSort === 'low-to-high') nextSort = 'price-asc'
    if (patch.priceSort === 'high-to-low') nextSort = 'price-desc'
    if (patch.priceSort === 'all' && (sort === 'price-asc' || sort === 'price-desc')) {
      nextSort = DEFAULT_SORT
    }

    commitBrowse({
      filters: nextFilters,
      sort: nextSort,
      categorySlug,
      certifiedOnly,
      collection: null,
      page: 1,
    })
  }

  const handleFiltersReset = () => {
    navigate(CATEGORIES_PATH)
  }

  const handleSortChange = (nextSort: SortOption) => {
    commitBrowse({
      filters: {
        ...filters,
        // Clear price-filter sort so toolbar sort is authoritative.
        priceSort: 'all',
      },
      sort: nextSort,
      categorySlug,
      certifiedOnly,
      collection: null,
      page: 1,
    })
  }

  const handlePageChange = (nextPage: number) => {
    commitBrowse({
      ...browse,
      page: nextPage,
    })
  }

  if (waitingForCategory) {
    return (
      <div className="container-content py-12">
        <p className="text-center text-sm text-secondary-text" role="status">
          Category not found.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="container-content pb-6 sm:pb-8">
        <Breadcrumb
          className="mb-5 sm:mb-6"
          items={[
            { label: 'Home', href: HOME_PATH },
            {
              label: 'Categories',
              href: selectedCategory || collection ? CATEGORIES_PATH : undefined,
            },
            ...(selectedCategory || collection
              ? [{ label: pageTitle }]
              : []),
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)] lg:gap-8 xl:gap-10">
          <FilterSidebar
            className="lg:col-start-1 lg:row-span-2"
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onFiltersReset={handleFiltersReset}
            categories={categories}
            activeCategorySlug={selectedCategory?.slug}
            subcategories={subcategories}
            subcategoriesLoading={Boolean(selectedCategory) && subcategoriesLoading}
            brands={categoryBrands}
          />

          <div className="min-w-0 space-y-6 lg:col-start-2">
            <CategoryToolbar
              categoryName={pageTitle}
              productCount={products.length}
              totalResults={totalResults}
              sort={sort}
              onSortChange={handleSortChange}
            />
            {error && (
              <p className="text-sm text-support-error" role="alert">
                {error}
              </p>
            )}
            {loading || (categorySlug && catalogLoading) ? (
              <div className="grid grid-cols-2 gap-4 min-[769px]:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square animate-pulse rounded-[20px] bg-surface-muted"
                    aria-hidden
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="py-12 text-center text-sm text-secondary-text" role="status">
                No products found.
              </p>
            ) : (
              <ProductGrid products={products} />
            )}
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="pt-2"
            />
          </div>
        </div>
      </div>

      {isAuthenticated && (browsingLoading || browsingProducts.length > 0) && (
        <>
          <ContentSection padding="compact" aria-labelledby="browsing-history-heading">
            <SectionHeader id="browsing-history-heading" title={browsingHistoryTitle} size="compact" />
            {browsingLoading ? (
              <div className="h-[280px] animate-pulse rounded-[20px] bg-surface-muted" aria-hidden />
            ) : (
              <ProductCarousel products={browsingProducts} ariaLabel="Browsing history products" />
            )}
          </ContentSection>

          <ContentSection padding="compact" aria-labelledby="related-browsing-heading">
            <SectionHeader id="related-browsing-heading" title={relatedBrowsingTitle} size="compact" />
            <ProductCarousel products={products} ariaLabel="Related browsing products" />
          </ContentSection>
        </>
      )}

      <Footer />
    </>
  )
}
