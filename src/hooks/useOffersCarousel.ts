// src/hooks/useOffersCarousel.ts
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getOffers, type ApiOffer } from '../api/offers'
import type { CountdownPromoSlide } from '../components/promo-carousel/CountdownPromoCarousel'
import { ApiError } from '../lib/api'

export interface OffersCarouselState {
  loading: boolean
  error: string | null
  slides: CountdownPromoSlide[]
}

export function useOffersCarousel(limit = 8): OffersCarouselState {
  const { t } = useTranslation()
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
        setError(err instanceof ApiError ? err.message : t('shop.offers.loadError'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [limit, t])

  const slides = useMemo(
    () =>
      offers
        .map((offer, index): CountdownPromoSlide | null => {
          const product =
            typeof offer.product === 'object' && offer.product != null ? offer.product : null

          let title = t('shop.offers.specialOffer')
          if (offer.discountPercent > 0) {
            title = product?.name
              ? t('shop.offers.percentOffWithName', {
                  percent: Math.round(offer.discountPercent),
                  name: product.name,
                })
              : t('shop.offers.percentOff', { percent: Math.round(offer.discountPercent) })
          } else if (product?.name) {
            title = product.name
          }

          if (!offer.endDate) return null

          return {
            id: offer._id,
            title,
            targetDate: offer.endDate,
            backgroundVariant: index % 2 === 0 ? 'light' : 'dark',
          }
        })
        .filter((slide): slide is CountdownPromoSlide => slide != null),
    [offers, t],
  )

  return { loading, error, slides }
}
