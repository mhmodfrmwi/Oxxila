// src/hooks/useDeliveryNote.ts
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getDeliverySettings, type ApiDeliverySettings } from '../api/settings'

let cached: ApiDeliverySettings | null = null

/**
 * General delivery-time message for the active language (set in the dashboard).
 * Returns '' until loaded or when none is configured, so callers can fall back to i18n copy.
 */
export function useDeliveryNote(): string {
  const { i18n } = useTranslation()
  const [settings, setSettings] = useState<ApiDeliverySettings | null>(cached)

  useEffect(() => {
    if (cached) return
    let cancelled = false
    getDeliverySettings()
      .then((response) => {
        cached = response.data ?? null
        if (!cancelled) setSettings(cached)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  if (!settings) return ''
  const isAr = i18n.language.startsWith('ar')
  return (isAr ? settings.messageAr || settings.messageEn : settings.messageEn || settings.messageAr).trim()
}
