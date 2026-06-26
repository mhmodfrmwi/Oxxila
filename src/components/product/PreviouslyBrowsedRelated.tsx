import { ContentSection } from '../layout/ContentSection'
import { SectionHeader } from '../landing/SectionHeader'
import { ProductCarousel } from '../shop/recommended/ProductCarousel'
import type { Product } from './MoreFromMACCosmetics'

export interface PreviouslyBrowsedRelatedProps {
  products: readonly Product[]
}

export function PreviouslyBrowsedRelated({ products }: PreviouslyBrowsedRelatedProps) {
  if (products.length === 0) return null

  return (
    <ContentSection padding="compact" aria-labelledby="previously-browsed-related-heading">
      <SectionHeader
        id="previously-browsed-related-heading"
        title="Previously browsed related"
        size="compact"
      />
      <ProductCarousel products={products} ariaLabel="Previously browsed related products" />
    </ContentSection>
  )
}
