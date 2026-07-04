// src/hooks/useOffersCarousel.ts
import { useEffect, useMemo, useState } from 'react'
import { getOffers, type ApiOffer } from '../api/offers'
import type { CountdownPromoSlide } from '../components/promo-carousel/CountdownPromoCarousel'
import { ApiError } from '../lib/api'

export interface OffersCarouselState {
  loading: boolean
  error: string | null
  slides: CountdownPromoSlide[]
}

function mapOfferToSlide(offer: ApiOffer, index: number): CountdownPromoSlide | null {
  const product =
    typeof offer.product === 'object' && offer.product != null ? offer.product : null
  const title =
    offer.discountPercent > 0
      ? `${Math.round(offer.discountPercent)}% Off${product?.name ? ` — ${product.name}` : ''}`
      : product?.name ?? 'Special Offer'

  if (!offer.endDate) return null

  return {
    id: offer._id,
    title,
    targetDate: offer.endDate,
    backgroundVariant: index % 2 === 0 ? 'light' : 'dark',
  }
}

export function useOffersCarousel(limit = 8): OffersCarouselState {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offers, setOffers] = useState<ApiOffer[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const response = await getOffers({ limit })
        if (cancelled) return
        setOffers(response.data ?? [])
      } catch (err) {
        if (cancelled) return
        setOffers([])
        setError(err instanceof ApiError ? err.message : 'Unable to load offers.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [limit])

  const slides = useMemo(
    () =>
      offers
        .map((offer, index) => mapOfferToSlide(offer, index))
        .filter((slide): slide is CountdownPromoSlide => slide != null),
    [offers],
  )

  return { loading, error, slides }
}
