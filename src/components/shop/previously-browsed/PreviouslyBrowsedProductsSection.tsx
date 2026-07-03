import { useBrowsingHistory } from '../../../hooks/useBrowsingHistory'
import { ContentSection } from '../../layout/ContentSection'
import { SectionHeader } from '../../landing/SectionHeader'
import { ProductCarousel } from '../recommended/ProductCarousel'

export const previouslyBrowsedProductsTitle = 'Previously browsed products'

export function PreviouslyBrowsedProductsSection() {
  const { products: previouslyBrowsedProducts, loading } = useBrowsingHistory(6)

  if (!loading && previouslyBrowsedProducts.length === 0) {
    return null
  }

  return (
    <ContentSection aria-labelledby="previously-browsed-products-heading">
      <SectionHeader
        id="previously-browsed-products-heading"
        title={previouslyBrowsedProductsTitle}
        size="compact"
      />
      {loading ? (
        <div className="h-[280px] animate-pulse rounded-[20px] bg-surface-muted" aria-hidden />
      ) : (
        <ProductCarousel
          products={previouslyBrowsedProducts}
          ariaLabel="Previously browsed products"
        />
      )}
    </ContentSection>
  )
}
