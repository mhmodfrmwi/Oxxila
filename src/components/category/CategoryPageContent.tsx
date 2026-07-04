// src/components/category/CategoryPageContent.tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CATEGORIES_PATH, HOME_PATH } from '../../config/routes'
import { useBrowsingHistory } from '../../hooks/useBrowsingHistory'
import { useCategoryProducts } from '../../hooks/useCategoryProducts'
import { useLandingCatalogContext } from '../../hooks/useLandingCatalogContext'
import { useSubCategories } from '../../hooks/useSubCategories'
import {
  getCollectionTitle,
  parseCategoryBrowseParams,
} from '../../utils/categoryBrowseParams'
import { collectSubcategoriesFromCategories } from '../../utils/catalogSubcategories'
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
  PRODUCTS_PER_PAGE,
  relatedBrowsingTitle,
  type SortOption,
} from './categoryData'
import type { FilterState } from './filters/filterState'
import { FilterSidebar } from './filters/FilterSidebar'

export function CategoryPageContent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const browseKey = searchParams.toString()
  const { categories, brands, loading: catalogLoading } = useLandingCatalogContext()

  const [filters, setFilters] = useState<FilterState>(() =>
    parseCategoryBrowseParams(searchParams).filters,
  )
  const [sort, setSort] = useState<SortOption>(
    () => parseCategoryBrowseParams(searchParams).sort,
  )
  const [categorySlug, setCategorySlug] = useState<string | null>(
    () => parseCategoryBrowseParams(searchParams).categorySlug,
  )
  const [certifiedOnly, setCertifiedOnly] = useState(
    () => parseCategoryBrowseParams(searchParams).certifiedOnly,
  )
  const [collection, setCollection] = useState(
    () => parseCategoryBrowseParams(searchParams).collection,
  )
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false

    async function applyBrowseParams() {
      await Promise.resolve()
      if (cancelled) return

      const parsed = parseCategoryBrowseParams(searchParams)
      setFilters(parsed.filters)
      setSort(parsed.sort)
      setCategorySlug(parsed.categorySlug)
      setCertifiedOnly(parsed.certifiedOnly)
      setCollection(parsed.collection)
      setPage(1)
    }

    void applyBrowseParams()
    return () => {
      cancelled = true
    }
  }, [browseKey, searchParams])

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

  const catalogSubcategories = useMemo(
    () => collectSubcategoriesFromCategories(categories),
    [categories],
  )

  const { subcategories: fetchedSubcategories, loading: subcategoriesLoading } = useSubCategories(
    selectedCategory?._id,
    !catalogLoading,
  )

  const subcategories = useMemo(() => {
    if (fetchedSubcategories.length > 0) return fetchedSubcategories
    if (selectedCategory?.subcategories?.length) return selectedCategory.subcategories
    if (!selectedCategory) return catalogSubcategories
    return []
  }, [fetchedSubcategories, selectedCategory, catalogSubcategories])

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
    setFilters((previous) => ({ ...previous, ...patch }))
    setCollection(null)
    setPage(1)
  }

  const handleFiltersReset = () => {
    navigate(CATEGORIES_PATH)
  }

  const handleSortChange = (nextSort: SortOption) => {
    setSort(nextSort)
    setCollection(null)
    setPage(1)
  }

  if (!catalogLoading && categories.length === 0) {
    return (
      <div className="container-content py-12">
        <p className="text-center text-sm text-secondary-text" role="status">
          No categories available.
        </p>
      </div>
    )
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
            subcategoriesLoading={subcategoriesLoading}
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
              onPageChange={setPage}
              className="pt-2"
            />
          </div>
        </div>
      </div>

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

      <Footer />
    </>
  )
}
