import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { CATEGORIES_PATH, HOME_PATH } from '../../config/routes'
import { useLandingCatalogContext } from '../../hooks/useLandingCatalogContext'
import { Breadcrumb } from '../ui/Breadcrumb'
import { Pagination } from '../ui/Pagination'
import { ContentSection } from '../layout/ContentSection'
import { Footer } from '../landing/footer/Footer'
import { SectionHeader } from '../landing/SectionHeader'
import { ProductCarousel } from '../shop/recommended/ProductCarousel'
import { buildCatalogProductsForCategory } from '../../utils/productDetailMappers'
import { CategoryToolbar } from './CategoryToolbar'
import { ProductGrid } from './ProductGrid'
import {
  browsingHistoryTitle,
  categoryMetaBySlug,
  DEFAULT_CATEGORY_SLUG,
  isKnownCategorySlug,
  relatedBrowsingTitle,
  type SortOption,
} from './categoryData'
import { FilterSidebar } from './filters/FilterSidebar'

export function CategoryPageContent() {
  const { slug = DEFAULT_CATEGORY_SLUG } = useParams<{ slug: string }>()
  const { products: catalogProducts, loading: catalogLoading } = useLandingCatalogContext()
  const knownSlug = isKnownCategorySlug(slug) ? slug : DEFAULT_CATEGORY_SLUG
  const meta = categoryMetaBySlug[knownSlug]
  const products = useMemo(
    () => buildCatalogProductsForCategory(catalogProducts, knownSlug),
    [catalogProducts, knownSlug],
  )
  const [sort, setSort] = useState<SortOption>('featured')
  const [pageByCategory, setPageByCategory] = useState<Partial<Record<string, number>>>({})

  const totalPages = Math.max(1, Math.ceil(products.length / meta.productsPerPage))
  const currentPage = pageByCategory[knownSlug] ?? 1
  const safePage = Math.min(currentPage, totalPages)

  const pagedProducts = useMemo(() => {
    const start = (safePage - 1) * meta.productsPerPage
    return products.slice(start, start + meta.productsPerPage)
  }, [products, safePage, meta.productsPerPage])

  const handlePageChange = (page: number) => {
    setPageByCategory((previous) => ({ ...previous, [knownSlug]: page }))
  }

  if (!isKnownCategorySlug(slug)) {
    return <Navigate to={`${CATEGORIES_PATH}/${DEFAULT_CATEGORY_SLUG}`} replace />
  }

  return (
    <>
      <div className="container-content pb-6 sm:pb-8">
        <Breadcrumb
          className="mb-5 sm:mb-6"
          items={[
            { label: 'Home', href: HOME_PATH },
            { label: 'Categories', href: `${CATEGORIES_PATH}/${DEFAULT_CATEGORY_SLUG}` },
            { label: meta.name },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)] lg:gap-8 xl:gap-10">
          <FilterSidebar className="lg:col-start-1 lg:row-span-2" />

          <div className="min-w-0 space-y-6 lg:col-start-2">
            <CategoryToolbar
              categoryName={meta.name}
              productCount={pagedProducts.length}
              totalResults={products.length}
              sort={sort}
              onSortChange={setSort}
            />
            {catalogLoading ? (
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
              <ProductGrid products={pagedProducts} />
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
        <ProductCarousel products={products} ariaLabel="Browsing history products" />
      </ContentSection>

      <ContentSection padding="compact" aria-labelledby="related-browsing-heading">
        <SectionHeader id="related-browsing-heading" title={relatedBrowsingTitle} size="compact" />
        <ProductCarousel products={products} ariaLabel="Related browsing products" />
      </ContentSection>

      <Footer />
    </>
  )
}
