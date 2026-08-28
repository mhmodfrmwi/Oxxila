// src/components/promo-carousel/PromoCarouselSection.tsx
import { Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { SHOP_PATH } from '../../config/routes'
import { useOffersCarousel } from '../../hooks/useOffersCarousel'
import { ContentSection } from '../layout/ContentSection'
import { ProductSectionEmptyState } from '../product/ProductSectionEmptyState'
import { PromoCarouselCard } from './PromoCarouselCard'

function OffersSkeleton() {
  return (
    <div
      className="aspect-[1440/240] max-h-[14rem] min-h-[6.5rem] w-full animate-pulse bg-surface-muted"
      aria-hidden
    />
  )
}

export function PromoCarouselSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { slide, loading, error } = useOffersCarousel()

  return (
    <ContentSection aria-label={t('shop.offers.ariaLabel')} padding="compact">
      {loading ? (
        <OffersSkeleton />
      ) : error ? (
        <p className="py-6 text-center text-sm text-support-error" role="alert">
          {t('shop.offers.loadError')}
        </p>
      ) : !slide ? (
        <ProductSectionEmptyState
          variant="banner"
          icon={Tag}
          title={t('shop.offers.emptyTitle')}
          description={t('shop.offers.emptyDescription')}
          actionLabel={t('actions.continueShopping')}
          onAction={() => navigate(SHOP_PATH)}
        />
      ) : (
        <PromoCarouselCard
          title={slide.title}
          targetDate={slide.targetDate}
          countdownLabel={slide.countdownLabel}
        />
      )}
    </ContentSection>
  )
}
