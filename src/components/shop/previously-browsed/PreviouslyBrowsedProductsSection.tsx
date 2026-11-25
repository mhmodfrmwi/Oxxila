// src/components/shop/previously-browsed/PreviouslyBrowsedProductsSection.tsx
import { useTranslation } from 'react-i18next'
import { useBrowsingHistory } from '../../../hooks/useBrowsingHistory'
import { ContentSection } from '../../layout/ContentSection'
import { SectionHeader } from '../../landing/SectionHeader'
import { ProductCarousel } from '../recommended/ProductCarousel'

export function PreviouslyBrowsedProductsSection() {
  const { t } = useTranslation()
  const { products: previouslyBrowsedProducts, loading } = useBrowsingHistory(6)
  const title = t('shop.previouslyBrowsed.title')

  if (!loading && previouslyBrowsedProducts.length === 0) return null

  return (
    <ContentSection tone="tinted" aria-labelledby="previously-browsed-products-heading">
      <SectionHeader
        id="previously-browsed-products-heading"
        title={title}
        subtitle={t('shop.previouslyBrowsed.subtitle')}
        size="compact"
      />
      {loading ? (
        <div className="h-[340px] animate-pulse rounded-medium bg-surface-muted" aria-hidden />
      ) : (
        <ProductCarousel
          products={previouslyBrowsedProducts}
          ariaLabel={t('shop.previouslyBrowsed.ariaLabel')}
        />
      )}
    </ContentSection>
  )
}
