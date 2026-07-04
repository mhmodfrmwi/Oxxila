// src/pages/CollectionPage.tsx
import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { CategoryToolbar } from '../components/category/CategoryToolbar'
import { ProductGrid } from '../components/category/ProductGrid'
import { PRODUCTS_PER_PAGE, type SortOption } from '../components/category/categoryData'
import { Footer } from '../components/landing/footer/Footer'
import { Layout } from '../components/layout/Layout'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { Pagination } from '../components/ui/Pagination'
import { getCollectionConfig } from '../config/collections'
import { HOME_PATH, SHOP_PATH } from '../config/routes'
import { useCollectionProducts } from '../hooks/useCollectionProducts'

export function CollectionPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const config = useMemo(() => getCollectionConfig(slug), [slug])
  const [sort, setSort] = useState<SortOption>('featured')
  const [page, setPage] = useState(1)

  const { products, loading, error, pagination } = useCollectionProducts(
    config,
    sort,
    page,
    PRODUCTS_PER_PAGE,
  )

  if (!config) {
    return <Navigate to={SHOP_PATH} replace />
  }

  const totalPages = pagination?.numberOfPages ?? 1
  const totalResults = pagination?.totalDocuments ?? products.length

  return (
    <Layout>
      <div className="container-content pb-10 sm:pb-12">
        <Breadcrumb
          className="mb-5 sm:mb-6 pt-4"
          items={[
            { label: 'Home', href: HOME_PATH },
            { label: 'Shop', href: SHOP_PATH },
            { label: config.title },
          ]}
        />

        <CategoryToolbar
          categoryName={config.title}
          productCount={products.length}
          totalResults={totalResults}
          sort={sort}
          onSortChange={(nextSort) => {
            setSort(nextSort)
            setPage(1)
          }}
        />

        {config.description && (
          <p className="mb-6 text-sm text-secondary-text">{config.description}</p>
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
        ) : products.length === 0 ? (
          <p className="py-12 text-center text-sm text-secondary-text" role="status">
            No products found in this collection.
          </p>
        ) : (
          <ProductGrid products={products} />
        )}

        <Pagination
          currentPage={Math.min(page, Math.max(1, totalPages))}
          totalPages={totalPages}
          onPageChange={setPage}
          className="pt-6"
        />
      </div>
      <Footer />
    </Layout>
  )
}
