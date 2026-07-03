import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { CATEGORIES_PATH, HOME_PATH } from '../../config/routes'
import { useBrowsingHistory } from '../../hooks/useBrowsingHistory'
import { useCategoryProducts } from '../../hooks/useCategoryProducts'
import { useLandingCatalogContext } from '../../hooks/useLandingCatalogContext'
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
  relatedBrowsingTitle,
  resolveDefaultCategorySlug,
  toCategoryMeta,
  type SortOption,
} from './categoryData'
import { createDefaultFilterState, type FilterState } from './filters/filterState'
import { FilterSidebar } from './filters/FilterSidebar'

export function CategoryPageContent() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { categories, brands, loading: catalogLoading } = useLandingCatalogContext()
  const defaultSlug = useMemo(() => resolveDefaultCategorySlug(categories), [categories])
  const category = useMemo(() => findCategoryBySlug(categories, slug), [categories, slug])
  const meta = category ? toCategoryMeta(category) : null
  const subcategories = category?.subcategories ?? []
  const categoryBrands = useMemo(
    () =>
      brands.filter((brand) => {
        if (!brand.category) return true
        const categoryId =
          typeof brand.category === 'string' ? brand.category : brand.category._id
        return categoryId === category?._id
      }),
    [brands, category?._id],
  )

  const [filtersBySlug, setFiltersBySlug] = useState<Partial<Record<string, FilterState>>>({})
  const [sortBySlug, setSortBySlug] = useState<Partial<Record<string, SortOption>>>({})
  const [pageByCategory, setPageByCategory] = useState<Partial<Record<string, number>>>({})

  const filters = useMemo(
    () => filtersBySlug[slug] ?? createDefaultFilterState(),
    [filtersBySlug, slug],
  )
  const sort = sortBySlug[slug] ?? 'featured'

  const currentPage = meta ? (pageByCategory[meta.slug] ?? 1) : 1
  const { products, loading, error, pagination } = useCategoryProducts(
    category?._id,
    filters,
    sort,
    currentPage,
    meta?.productsPerPage ?? 12,
  )

  const { products: browsingProducts, loading: browsingLoading } = useBrowsingHistory(6)

  const totalPages = pagination?.numberOfPages ?? 1

  if (meta && pagination && currentPage > totalPages) {
    const clampedPage = Math.max(1, totalPages)
    if (currentPage !== clampedPage) {
      setPageByCategory((previous) => ({
        ...previous,
        [meta.slug]: clampedPage,
      }))
    }
  }

  const safePage = Math.min(currentPage, Math.max(1, totalPages))
  const totalResults = pagination?.totalDocuments ?? products.length

  const handlePageChange = (page: number) => {
    if (!meta) return
    setPageByCategory((previous) => ({ ...previous, [meta.slug]: page }))
  }

  const handleFiltersChange = (patch: Partial<FilterState>) => {
    setFiltersBySlug((previous) => ({
      ...previous,
      [slug]: { ...(previous[slug] ?? createDefaultFilterState()), ...patch },
    }))
    if (meta) {
      setPageByCategory((previous) => ({ ...previous, [meta.slug]: 1 }))
    }
  }

  const handleFiltersReset = () => {
    setFiltersBySlug((previous) => ({ ...previous, [slug]: createDefaultFilterState() }))
    setSortBySlug((previous) => ({ ...previous, [slug]: 'featured' }))
    if (meta) {
      setPageByCategory((previous) => ({ ...previous, [meta.slug]: 1 }))
    }
  }

  const handleSortChange = (nextSort: SortOption) => {
    setSortBySlug((previous) => ({ ...previous, [slug]: nextSort }))
    if (meta) {
      setPageByCategory((previous) => ({ ...previous, [meta.slug]: 1 }))
    }
  }

  if (!catalogLoading && categories.length > 0 && !category && defaultSlug) {
    return <Navigate to={`${CATEGORIES_PATH}/${defaultSlug}`} replace />
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

  if (!meta) {
    return (
      <div className="container-content py-12">
        <div className="grid grid-cols-2 gap-4 min-[769px]:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-[20px] bg-surface-muted" aria-hidden />
          ))}
        </div>
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
            { label: 'Categories', href: `${CATEGORIES_PATH}/${defaultSlug ?? meta.slug}` },
            { label: meta.name },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)] lg:gap-8 xl:gap-10">
          <FilterSidebar
            className="lg:col-start-1 lg:row-span-2"
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onFiltersReset={handleFiltersReset}
            subcategories={subcategories}
            brands={categoryBrands}
          />

          <div className="min-w-0 space-y-6 lg:col-start-2">
            <CategoryToolbar
              categoryName={meta.name}
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
            {loading || catalogLoading ? (
              <div className="grid grid-cols-2 gap-4 min-[769px]:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: meta.productsPerPage }).map((_, index) => (
                  <div key={index} className="aspect-square animate-pulse rounded-[20px] bg-surface-muted" aria-hidden />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="py-12 text-center text-sm text-secondary-text" role="status">
                No products found in this category.
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
