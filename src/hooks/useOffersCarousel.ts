// src/hooks/useOffersCarousel.ts
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getOffers,
  getUpcomingOffer,
  type ApiOffer,
} from '../api/offers'
import type { CountdownPromoSlide } from '../components/promo-carousel/CountdownPromoCarousel'
import { ApiError } from '../lib/api'

export interface OffersCarouselState {
  loading: boolean
  error: string | null
  slides: CountdownPromoSlide[]
  /** True when slides are from the nearest upcoming offer (not live yet). */
  isUpcoming: boolean
}

export function useOffersCarousel(limit = 8): OffersCarouselState {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offers, setOffers] = useState<ApiOffer[]>([])
  const [isUpcoming, setIsUpcoming] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setIsUpcoming(false)

      try {
        const response = await getOffers({ limit })
        if (cancelled) return

        const live = response.data ?? []
        if (live.length > 0) {
          setOffers(live)
          setIsUpcoming(false)
          return
        }

        const upcomingResponse = await getUpcomingOffer()
        if (cancelled) return

        const upcoming = upcomingResponse.data
        if (upcoming) {
          setOffers([upcoming])
          setIsUpcoming(true)
        } else {
          setOffers([])
          setIsUpcoming(false)
        }
      } catch (err) {
        if (cancelled) return
        setOffers([])
        setIsUpcoming(false)
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
        .map((offer): CountdownPromoSlide | null => {
          const targetDate = isUpcoming ? offer.startDate : offer.endDate
          if (!targetDate) return null

          // Keep product/discount hidden until the countdown ends (Figma locked sale).
          return {
            id: offer._id,
            title: t('shop.offers.bigSale'),
            targetDate,
            countdownLabel: isUpcoming
              ? t('shop.offers.openIn')
              : t('shop.offers.endsIn'),
          }
        })
        .filter((slide): slide is CountdownPromoSlide => slide != null),
    [offers, isUpcoming, t],
  )

  return { loading, error, slides, isUpcoming }
}
