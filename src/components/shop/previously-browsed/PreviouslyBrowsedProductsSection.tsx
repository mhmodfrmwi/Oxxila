// src/components/shop/previously-browsed/PreviouslyBrowsedProductsSection.tsx
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../context/AuthContext'
import { useBrowsingHistory } from '../../../hooks/useBrowsingHistory'
import { ContentSection } from '../../layout/ContentSection'
import { SectionHeader } from '../../landing/SectionHeader'
import { ProductCarousel } from '../recommended/ProductCarousel'

export function PreviouslyBrowsedProductsSection() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const { products: previouslyBrowsedProducts, loading } = useBrowsingHistory(6)
  const title = t('shop.previouslyBrowsed.title')

  if (!isAuthenticated) return null
  if (!loading && previouslyBrowsedProducts.length === 0) return null

  return (
    <ContentSection aria-labelledby="previously-browsed-products-heading">
      <SectionHeader
        id="previously-browsed-products-heading"
        title={title}
        size="compact"
      />
      {loading ? (
        <div className="h-[280px] animate-pulse rounded-[20px] bg-surface-muted" aria-hidden />
      ) : (
        <ProductCarousel
          products={previouslyBrowsedProducts}
          ariaLabel={t('shop.previouslyBrowsed.ariaLabel')}
        />
      )}
    </ContentSection>
  )
}
