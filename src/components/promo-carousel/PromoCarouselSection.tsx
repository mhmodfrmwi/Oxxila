// src/components/promo-carousel/PromoCarouselSection.tsx
import { useOffersCarousel } from '../../hooks/useOffersCarousel'
import { ContentSection } from '../layout/ContentSection'
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
  const { slides, loading, error } = useOffersCarousel()

  return (
    <ContentSection aria-label="Sale promotions" padding="compact">
      {loading ? (
        <OffersSkeleton />
      ) : error ? (
        <p className="py-6 text-center text-sm text-support-error" role="alert">
          {error}
        </p>
      ) : slides.length === 0 ? (
        <p className="py-6 text-center text-sm text-secondary-text" role="status">
          No active offers right now.
        </p>
      ) : (
        <CountdownPromoCarousel slides={slides} />
      )}
    </ContentSection>
  )
}
