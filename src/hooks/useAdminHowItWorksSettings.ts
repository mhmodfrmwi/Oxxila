// src/hooks/useAdminHowItWorksSettings.ts
import { useCallback, useEffect, useState } from 'react'
import {
  getHowItWorksSettings,
  updateHowItWorksSettings,
  type ApiHowItWorksSettings,
} from '../api/settings'

export interface HowItWorksStepForm {
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
}

export interface HowItWorksSettingsForm {
  titleEn: string
  titleAr: string
  videoUrl: string
  thumbnailImage: string
  steps: HowItWorksStepForm[]
}

const STEP_COUNT = 3

const emptySteps = (): HowItWorksStepForm[] =>
  Array.from({ length: STEP_COUNT }, () => ({
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
  }))

const EMPTY_FORM: HowItWorksSettingsForm = {
  titleEn: '',
  titleAr: '',
  videoUrl: '',
  thumbnailImage: '',
  steps: emptySteps(),
}

function toForm(data: ApiHowItWorksSettings): HowItWorksSettingsForm {
  const steps = emptySteps()
  data.steps?.slice(0, STEP_COUNT).forEach((step, index) => {
    steps[index] = {
      titleEn: step.titleEn || step.title || '',
      titleAr: step.titleAr || '',
      descriptionEn: step.descriptionEn || step.description || '',
      descriptionAr: step.descriptionAr || '',
    }
  })

  return {
    titleEn: data.titleEn || data.title || '',
    titleAr: data.titleAr || '',
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
    (field: 'titleEn' | 'titleAr' | 'videoUrl' | 'thumbnailImage', value: string) => {
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
          titleEn: values.titleEn.trim(),
          titleAr: values.titleAr.trim(),
          videoUrl: values.videoUrl.trim(),
          thumbnailImage: values.thumbnailImage.trim(),
          steps: values.steps.map((step) => ({
            titleEn: step.titleEn.trim(),
            titleAr: step.titleAr.trim(),
            descriptionEn: step.descriptionEn.trim(),
            descriptionAr: step.descriptionAr.trim(),
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
