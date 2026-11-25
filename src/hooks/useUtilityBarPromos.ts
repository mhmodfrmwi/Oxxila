// src/hooks/useUtilityBarPromos.ts
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getUtilityBarSettings,
  type ApiUtilityBarPromo,
  type ApiUtilityBarSettings,
} from '../api/settings'
import type { UtilityPromo } from '../components/layout/UtilityBar'
import { cmsLocaleText } from '../utils/cmsLocaleText'
import {
  getUtilityBarCache,
  setUtilityBarCache,
} from '../utils/utilityBarCache'

export { invalidateUtilityBarCache } from '../utils/utilityBarCache'

const DEFAULT_ROTATE_SECONDS = 6

const FALLBACK_KEYS = [
  'shipping',
  'returns',
  'trusted',
  'delivery',
] as const

async function loadUtilityBarSettings(): Promise<ApiUtilityBarSettings | null> {
  const { cachedSettings, loadPromise } = getUtilityBarCache()
  if (cachedSettings) return cachedSettings
  if (!loadPromise) {
    const promise = getUtilityBarSettings()
      .then((response) => {
        const data = response.data ?? null
        setUtilityBarCache(data, null)
        return data
      })
      .catch(() => {
        setUtilityBarCache(null, null)
        return null
      })
    setUtilityBarCache(null, promise)
    return promise
  }
  return loadPromise
}

function promoForLocale(
  promo: ApiUtilityBarPromo,
  locale: string,
  fallback: UtilityPromo,
): UtilityPromo {
  return {
    title:
      cmsLocaleText(
        { en: promo.titleEn, ar: promo.titleAr, legacy: promo.title },
        locale,
        { crossFallback: false },
      ) || fallback.title,
    subtitle:
      cmsLocaleText(
        {
          en: promo.subtitleEn,
          ar: promo.subtitleAr,
          legacy: promo.subtitle,
        },
        locale,
        { crossFallback: false },
      ) || fallback.subtitle,
  }
}

function resolvePromos(
  settings: ApiUtilityBarSettings | null,
  fallbacks: UtilityPromo[],
  locale: string,
): UtilityPromo[] {
  const apiPromos = settings?.promos ?? []
  if (apiPromos.length === 0) return fallbacks

  return apiPromos
    .map((promo, index) => {
      const fallback = fallbacks[index] ?? fallbacks[index % fallbacks.length] ?? {
        title: '',
        subtitle: '',
      }
      return promoForLocale(promo, locale, fallback)
    })
    .filter((promo) => promo.title)
}

export function useUtilityBarPromos() {
  const { t, i18n } = useTranslation()
  const { cachedSettings } = getUtilityBarCache()
  const [settings, setSettings] = useState<ApiUtilityBarSettings | null>(cachedSettings)

  useEffect(() => {
    let cancelled = false
    void loadUtilityBarSettings().then((data) => {
      if (!cancelled && data) setSettings(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const fallbacks = useMemo<UtilityPromo[]>(
    () =>
      FALLBACK_KEYS.map((key) => ({
        title: t(`utilityBar.fallbacks.${key}.title`),
        subtitle: t(`utilityBar.fallbacks.${key}.subtitle`),
      })),
    [t],
  )

  const promos = useMemo(
    () => resolvePromos(settings, fallbacks, i18n.language),
    [settings, fallbacks, i18n.language],
  )

  const rotateIntervalMs =
    (settings?.rotateIntervalSeconds ?? DEFAULT_ROTATE_SECONDS) * 1000

  return { promos, rotateIntervalMs }
}
