// src/components/promo-carousel/PromoCarouselSection.tsx
import { Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { SHOP_PATH } from '../../config/routes'
import { useOffersCarousel } from '../../hooks/useOffersCarousel'
import { ContentSection } from '../layout/ContentSection'
import { ProductSectionEmptyState } from '../product/ProductSectionEmptyState'
import { CountdownPromoCarousel } from './CountdownPromoCarousel'

function OffersSkeleton() {
  return (
    <div
      className="h-[min(220px,48vw)] w-full animate-pulse rounded-card bg-surface-muted sm:h-[240px]"
      aria-hidden
    />
  )
}

export function PromoCarouselSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { slides, loading, error } = useOffersCarousel()

  return (
    <ContentSection aria-label={t('shop.offers.ariaLabel')} padding="compact">
      {loading ? (
        <OffersSkeleton />
      ) : error ? (
        <p className="py-6 text-center text-sm text-support-error" role="alert">
          {t('shop.offers.loadError')}
        </p>
      ) : slides.length === 0 ? (
        <ProductSectionEmptyState
          variant="banner"
          icon={Tag}
          title={t('shop.offers.emptyTitle')}
          description={t('shop.offers.emptyDescription')}
          actionLabel={t('actions.continueShopping')}
          onAction={() => navigate(SHOP_PATH)}
        />
      ) : (
        <CountdownPromoCarousel
          slides={slides}
          ariaLabel={t('shop.offers.carouselAria')}
        />
      )}
    </ContentSection>
  )
}
