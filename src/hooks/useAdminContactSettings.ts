// src/hooks/useAdminContactSettings.ts
import { useCallback, useEffect, useState } from 'react'
import { getContactSettings, updateContactSettings } from '../api/settings'
import type { ApiContactSettings } from '../api/settings'

export interface ContactSettingsForm {
  phone: string
  email: string
  location: string
  whatsapp: string
  whatsappDialCode: string
}

const EMPTY_FORM: ContactSettingsForm = {
  phone: '',
  email: '',
  location: '',
  whatsapp: '',
  whatsappDialCode: '20',
}

function toForm(data: ApiContactSettings): ContactSettingsForm {
  return {
    phone: data.phone ?? '',
    email: data.email ?? '',
    location: data.location ?? '',
    whatsapp: data.whatsapp ?? '',
    whatsappDialCode: data.whatsappDialCode ?? '20',
  }
}

export function useAdminContactSettings() {
  const [values, setValues] = useState<ContactSettingsForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getContactSettings()
      if (response.data) setValues(toForm(response.data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load contact settings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const setField = useCallback((field: keyof ContactSettingsForm, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  const save = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await updateContactSettings({
        phone: values.phone.trim(),
        email: values.email.trim(),
        location: values.location.trim(),
        whatsapp: values.whatsapp.trim(),
        whatsappDialCode: values.whatsappDialCode.trim(),
      })
      if (response.data) setValues(toForm(response.data))
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save contact settings.'
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
