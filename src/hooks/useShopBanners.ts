// src/hooks/useShopBanners.ts
import { useEffect, useMemo, useState } from 'react'
import { getBanners, type ApiBanner } from '../api/banners'
import type { ShopHeroSlide } from '../components/shop/shopData'
import { ApiError } from '../lib/api'
import { mapBannersToShopHeroSlides } from '../utils/bannerMappers'
import { useLandingCatalogContext } from './useLandingCatalogContext'

export interface ShopBannersState {
  loading: boolean
  error: string | null
  slides: ShopHeroSlide[]
}

export function useShopBanners(): ShopBannersState {
  const { categories } = useLandingCatalogContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [banners, setBanners] = useState<ApiBanner[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const response = await getBanners()
        if (cancelled) return
        setBanners(response.data ?? [])
      } catch (err) {
        if (cancelled) return
        setBanners([])
        setError(err instanceof ApiError ? err.message : 'Unable to load banners.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const slides = useMemo(
    () => mapBannersToShopHeroSlides(banners, categories),
    [banners, categories],
  )

  return { loading, error, slides }
}
