// src/components/product/PreviouslyBrowsedRelated.tsx
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { ContentSection } from '../layout/ContentSection'
import { SectionHeader } from '../landing/SectionHeader'
import { ProductCarousel } from '../shop/recommended/ProductCarousel'
import type { Product } from './MoreFromMACCosmetics'

export interface PreviouslyBrowsedRelatedProps {
  products: readonly Product[]
  loading?: boolean
}

export function PreviouslyBrowsedRelated({
  products,
  loading = false,
}: PreviouslyBrowsedRelatedProps) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return null
  if (!loading && products.length === 0) return null

  return (
    <ContentSection padding="compact" aria-labelledby="previously-browsed-related-heading">
      <SectionHeader
        id="previously-browsed-related-heading"
        title={t('productDetail.previouslyBrowsedRelated')}
        size="compact"
      />
      {loading && products.length === 0 ? (
        <div
          className="grid animate-pulse grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          aria-hidden
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] rounded-3xl bg-surface-muted" />
          ))}
        </div>
      ) : (
        <ProductCarousel
          products={products}
          ariaLabel={t('productDetail.previouslyBrowsedRelatedAria')}
        />
      )}
    </ContentSection>
  )
}
