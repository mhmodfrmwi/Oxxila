// src/components/promo-carousel/PromoCarouselSection.tsx
import { useTranslation } from 'react-i18next'
import { useOffersCarousel } from '../../hooks/useOffersCarousel'
import { ContentSection } from '../layout/ContentSection'
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
  const { slide, loading, error } = useOffersCarousel()

  if (loading) {
    return (
      <ContentSection aria-label={t('shop.offers.ariaLabel')} padding="compact">
        <OffersSkeleton />
      </ContentSection>
    )
  }

  // Hide the whole block when there are no active offers.
  if (error || !slide) return null

  return (
    <ContentSection aria-label={t('shop.offers.ariaLabel')} padding="compact">
      <PromoCarouselCard
        title={slide.title}
        targetDate={slide.targetDate}
        countdownLabel={slide.countdownLabel}
      />
    </ContentSection>
  )
}
