// src/hooks/useAdminHowItWorksSettings.ts
import { useCallback, useEffect, useState } from 'react'
import {
  getHowItWorksSettings,
  updateHowItWorksSettings,
  type ApiHowItWorksSettings,
} from '../api/settings'

export interface HowItWorksStepForm {
  title: string
  description: string
}

export interface HowItWorksSettingsForm {
  title: string
  videoUrl: string
  thumbnailImage: string
  steps: HowItWorksStepForm[]
}

const STEP_COUNT = 3

const emptySteps = (): HowItWorksStepForm[] =>
  Array.from({ length: STEP_COUNT }, () => ({ title: '', description: '' }))

const EMPTY_FORM: HowItWorksSettingsForm = {
  title: '',
  videoUrl: '',
  thumbnailImage: '',
  steps: emptySteps(),
}

function toForm(data: ApiHowItWorksSettings): HowItWorksSettingsForm {
  const steps = emptySteps()
  data.steps?.slice(0, STEP_COUNT).forEach((step, index) => {
    steps[index] = {
      title: step.title ?? '',
      description: step.description ?? '',
    }
  })

  return {
    title: data.title ?? '',
    videoUrl: data.videoUrl ?? '',
    thumbnailImage: data.thumbnailImage ?? '',
    steps,
  }
}

export function useAdminHowItWorksSettings() {
  const [values, setValues] = useState<HowItWorksSettingsForm>(EMPTY_FORM)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getHowItWorksSettings()
      if (response.data) {
        const form = toForm(response.data)
        setValues(form)
        setThumbnailPreview(form.thumbnailImage.trim() || null)
        setThumbnailFile(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load How it works settings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const setField = useCallback(
    (field: 'title' | 'videoUrl' | 'thumbnailImage', value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }))
      if (field === 'thumbnailImage') {
        setThumbnailPreview(value.trim() || null)
        setThumbnailFile(null)
      }
    },
    [],
  )

  const setStepField = useCallback(
    (index: number, field: keyof HowItWorksStepForm, value: string) => {
      setValues((prev) => ({
        ...prev,
        steps: prev.steps.map((step, stepIndex) =>
          stepIndex === index ? { ...step, [field]: value } : step,
        ),
      }))
    },
    [],
  )

  const setThumbnailImageFile = useCallback((file: File | null) => {
    setThumbnailFile(file)
    setThumbnailPreview(file ? URL.createObjectURL(file) : null)
  }, [])

  const save = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await updateHowItWorksSettings(
        {
          title: values.title.trim(),
          videoUrl: values.videoUrl.trim(),
          thumbnailImage: values.thumbnailImage.trim(),
          steps: values.steps.map(({ title, description }) => ({
            title: title.trim(),
            description: description.trim(),
          })),
        },
        thumbnailFile,
      )
      if (response.data) {
        const form = toForm(response.data)
        setValues(form)
        setThumbnailPreview(form.thumbnailImage.trim() || null)
        setThumbnailFile(null)
      }
      return response.data
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to save How it works settings.'
      setError(message)
      throw err
    } finally {
      setSaving(false)
    }
  }, [thumbnailFile, values])

  return {
    values,
    thumbnailPreview,
    loading,
    saving,
    error,
    setField,
    setStepField,
    setThumbnailImageFile,
    save,
    reload: load,
  }
}
