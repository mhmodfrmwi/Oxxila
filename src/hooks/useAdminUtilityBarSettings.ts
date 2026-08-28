// src/hooks/useAdminUtilityBarSettings.ts
import { useCallback, useEffect, useState } from 'react'
import {
  getUtilityBarSettings,
  updateUtilityBarSettings,
  UTILITY_BAR_MAX_PROMOS,
  type ApiUtilityBarPromo,
} from '../api/settings'
import { invalidateUtilityBarCache } from '../utils/utilityBarCache'

export interface UtilityBarPromoForm {
  title: string
  subtitle: string
}

export interface UtilityBarSettingsForm {
  promos: UtilityBarPromoForm[]
  rotateIntervalSeconds: number
}

const emptyPromo = (): UtilityBarPromoForm => ({ title: '', subtitle: '' })

const EMPTY_FORM: UtilityBarSettingsForm = {
  promos: [emptyPromo(), emptyPromo()],
  rotateIntervalSeconds: 6,
}

function toForm(data: { promos: ApiUtilityBarPromo[]; rotateIntervalSeconds: number }): UtilityBarSettingsForm {
  const promos = (data.promos ?? []).map((promo) => ({
    title: promo.title ?? '',
    subtitle: promo.subtitle ?? '',
  }))
  return {
    promos: promos.length > 0 ? promos : [emptyPromo()],
    rotateIntervalSeconds: data.rotateIntervalSeconds ?? 6,
  }
}

export function useAdminUtilityBarSettings() {
  const [values, setValues] = useState<UtilityBarSettingsForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getUtilityBarSettings()
      if (response.data) setValues(toForm(response.data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load utility bar settings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const setPromoField = useCallback(
    (index: number, field: keyof UtilityBarPromoForm, value: string) => {
      setValues((prev) => ({
        ...prev,
        promos: prev.promos.map((promo, promoIndex) =>
          promoIndex === index ? { ...promo, [field]: value } : promo,
        ),
      }))
    },
    [],
  )

  const addPromo = useCallback(() => {
    setValues((prev) => {
      if (prev.promos.length >= UTILITY_BAR_MAX_PROMOS) return prev
      return { ...prev, promos: [...prev.promos, emptyPromo()] }
    })
  }, [])

  const removePromo = useCallback((index: number) => {
    setValues((prev) => {
      if (prev.promos.length <= 1) return prev
      return { ...prev, promos: prev.promos.filter((_, promoIndex) => promoIndex !== index) }
    })
  }, [])

  const setRotateIntervalSeconds = useCallback((value: number) => {
    setValues((prev) => ({ ...prev, rotateIntervalSeconds: value }))
  }, [])

  const save = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await updateUtilityBarSettings({
        promos: values.promos.map(({ title, subtitle }) => ({
          title: title.trim(),
          subtitle: subtitle.trim(),
        })),
        rotateIntervalSeconds: values.rotateIntervalSeconds,
      })
      if (response.data) {
        invalidateUtilityBarCache()
        setValues(toForm(response.data))
      }
      return response.data
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to save utility bar settings.'
      setError(message)
      throw err
    } finally {
      setSaving(false)
    }
  }, [values])

  return {
    values,
    loading,
    saving,
    error,
    setPromoField,
    addPromo,
    removePromo,
    setRotateIntervalSeconds,
    save,
    reload: load,
    maxPromos: UTILITY_BAR_MAX_PROMOS,
  }
}

export type { ApiUtilityBarPromo }
