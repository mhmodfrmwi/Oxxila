import { ProductCarousel } from './ProductCarousel'
import { recommendedProducts } from './recommendedProductsData'
import { ContentSection } from '../../layout/ContentSection'
import { SectionHeader } from '../../landing/SectionHeader'

export function RecommendedProductsSection() {
  return (
    <ContentSection aria-labelledby="recommended-products-heading">
      <SectionHeader id="recommended-products-heading" title="Recommended for you" size="compact" />
      <ProductCarousel products={recommendedProducts} />
    </ContentSection>
  )
}
