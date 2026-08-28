// src/hooks/useUtilityBarPromos.ts
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getUtilityBarSettings, type ApiUtilityBarSettings } from '../api/settings'
import type { UtilityPromo } from '../components/layout/UtilityBar'
import {
  getUtilityBarCache,
  setUtilityBarCache,
} from '../utils/utilityBarCache'

export { invalidateUtilityBarCache } from '../utils/utilityBarCache'

const DEFAULT_ROTATE_SECONDS = 6

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

function resolvePromos(
  settings: ApiUtilityBarSettings | null,
  fallbacks: UtilityPromo[],
): UtilityPromo[] {
  const fromApi = (settings?.promos ?? [])
    .map((promo) => ({
      title: promo.title?.trim() ?? '',
      subtitle: promo.subtitle?.trim() ?? '',
    }))
    .filter((promo) => promo.title)

  return fromApi.length > 0 ? fromApi : fallbacks
}

export function useUtilityBarPromos() {
  const { t } = useTranslation()
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
    () => [
      {
        title: t('utilityBar.fallbacks.shipping.title'),
        subtitle: t('utilityBar.fallbacks.shipping.subtitle'),
      },
      {
        title: t('utilityBar.fallbacks.returns.title'),
        subtitle: t('utilityBar.fallbacks.returns.subtitle'),
      },
    ],
    [t],
  )

  const promos = useMemo(
    () => resolvePromos(settings, fallbacks),
    [settings, fallbacks],
  )

  const rotateIntervalMs =
    (settings?.rotateIntervalSeconds ?? DEFAULT_ROTATE_SECONDS) * 1000

  return { promos, rotateIntervalMs }
}
