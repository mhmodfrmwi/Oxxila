// src/components/product/PreviouslyBrowsedRelated.tsx
import { useTranslation } from 'react-i18next'
import { ContentSection } from '../layout/ContentSection'
import { SectionHeader } from '../landing/SectionHeader'
import { ProductCarousel } from '../shop/recommended/ProductCarousel'
import type { Product } from './MoreFromMACCosmetics'

export interface PreviouslyBrowsedRelatedProps {
  products: readonly Product[]
}

export function PreviouslyBrowsedRelated({ products }: PreviouslyBrowsedRelatedProps) {
  const { t } = useTranslation()

  if (products.length === 0) return null

  return (
    <ContentSection padding="compact" aria-labelledby="previously-browsed-related-heading">
      <SectionHeader
        id="previously-browsed-related-heading"
        title={t('productDetail.previouslyBrowsedRelated')}
        size="compact"
      />
      <ProductCarousel
        products={products}
        ariaLabel={t('productDetail.previouslyBrowsedRelatedAria')}
      />
    </ContentSection>
  )
}
