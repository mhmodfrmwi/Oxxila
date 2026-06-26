import { useMemo } from 'react'
import { useLandingCatalogContext } from '../../../hooks/useLandingCatalogContext'
import { mapApiProductToRecommendedProduct } from '../../../utils/productDetailMappers'
import { ProductCarousel } from './ProductCarousel'
import { ContentSection } from '../../layout/ContentSection'
import { SectionHeader } from '../../landing/SectionHeader'

export function RecommendedProductsSection() {
  const { products, loading } = useLandingCatalogContext()

  const recommendedProducts = useMemo(
    () => products.map(mapApiProductToRecommendedProduct),
    [products],
  )

  return (
    <ContentSection aria-labelledby="recommended-products-heading">
      <SectionHeader id="recommended-products-heading" title="Recommended for you" size="compact" />
      {loading ? (
        <div className="h-[280px] animate-pulse rounded-[20px] bg-surface-muted" aria-hidden />
      ) : (
        <ProductCarousel products={recommendedProducts} />
      )}
    </ContentSection>
  )
}
