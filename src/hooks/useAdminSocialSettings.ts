// src/hooks/useAdminSocialSettings.ts
import { useCallback, useEffect, useState } from 'react'
import {
  getSocialSettings,
  updateSocialSettings,
  type ApiSocialSettings,
} from '../api/settings'

const EMPTY_SOCIAL: ApiSocialSettings = {
  facebook: '',
  twitter: '',
  instagram: '',
  linkedin: '',
  youtube: '',
}

export function useAdminSocialSettings() {
  const [values, setValues] = useState<ApiSocialSettings>(EMPTY_SOCIAL)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getSocialSettings()
      if (response.data) setValues({ ...EMPTY_SOCIAL, ...response.data })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load social settings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const setField = useCallback((field: keyof ApiSocialSettings, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  const save = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await updateSocialSettings({
        facebook: values.facebook.trim(),
        twitter: values.twitter.trim(),
        instagram: values.instagram.trim(),
        linkedin: values.linkedin.trim(),
        youtube: values.youtube.trim(),
      })
      if (response.data) setValues({ ...EMPTY_SOCIAL, ...response.data })
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save social settings.'
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
    setField,
    save,
    reload: load,
  }
}
