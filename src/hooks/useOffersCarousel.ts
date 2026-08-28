// src/hooks/useOffersCarousel.ts
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getUpcomingOffer, type ApiOffer } from '../api/offers'
import type { CountdownPromoSlide } from '../components/promo-carousel/CountdownPromoCarousel'
import { ApiError } from '../lib/api'

export interface OffersCarouselState {
  loading: boolean
  error: string | null
  /** Nearest scheduled offer banner, if any. */
  slide: CountdownPromoSlide | null
}

export function useOffersCarousel(): OffersCarouselState {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offer, setOffer] = useState<ApiOffer | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const response = await getUpcomingOffer()
        if (cancelled) return
        setOffer(response.data ?? null)
      } catch (err) {
        if (cancelled) return
        setOffer(null)
        setError(err instanceof ApiError ? err.message : t('shop.offers.loadError'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [t])

  const slide = useMemo((): CountdownPromoSlide | null => {
    if (!offer?.startDate) return null

    return {
      id: offer._id,
      title: t('shop.offers.bigSale'),
      targetDate: offer.startDate,
      countdownLabel: t('shop.offers.openIn'),
    }
  }, [offer, t])

  return { loading, error, slide }
}
