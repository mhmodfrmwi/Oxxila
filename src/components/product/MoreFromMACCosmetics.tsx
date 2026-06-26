import { ContentSection } from '../layout/ContentSection'
import { SectionHeader } from '../landing/SectionHeader'
import { ProductCarousel } from '../shop/recommended/ProductCarousel'
import type { RecommendedProduct } from '../shop/recommended/recommendedProductsData'

export type Product = RecommendedProduct

export interface MoreFromMACCosmeticsProps {
  brandName: string
  products: readonly Product[]
}

export function MoreFromMACCosmetics({ brandName, products }: MoreFromMACCosmeticsProps) {
  if (products.length === 0) return null

  const sectionTitle = brandName ? `More from ${brandName}` : 'More from this brand'

  return (
    <ContentSection padding="compact" aria-labelledby="more-from-brand-heading">
      <SectionHeader
        id="more-from-brand-heading"
        title={sectionTitle}
        size="compact"
      />
      <ProductCarousel products={products} ariaLabel={sectionTitle} />
    </ContentSection>
  )
}
