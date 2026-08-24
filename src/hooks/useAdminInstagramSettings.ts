// src/hooks/useAdminInstagramSettings.ts
import { useCallback, useEffect, useState } from 'react'
import {
  getInstagramSettings,
  INSTAGRAM_SLOT_COUNT,
  updateInstagramSettings,
  type ApiInstagramPost,
} from '../api/settings'

export interface InstagramSlotForm {
  image: string
  postUrl: string
  alt: string
  imageFile: File | null
  previewUrl: string | null
}

const emptySlot = (): InstagramSlotForm => ({
  image: '',
  postUrl: '',
  alt: '',
  imageFile: null,
  previewUrl: null,
})

function toSlots(posts: ApiInstagramPost[]): InstagramSlotForm[] {
  return Array.from({ length: INSTAGRAM_SLOT_COUNT }, (_, index) => {
    const post = posts[index]
    return {
      image: post?.image ?? '',
      postUrl: post?.postUrl ?? '',
      alt: post?.alt ?? '',
      imageFile: null,
      previewUrl: post?.image?.trim() || null,
    }
  })
}

export function useAdminInstagramSettings() {
  const [slots, setSlots] = useState<InstagramSlotForm[]>(() =>
    Array.from({ length: INSTAGRAM_SLOT_COUNT }, emptySlot),
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getInstagramSettings()
      if (response.data) setSlots(toSlots(response.data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Instagram settings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const setSlotField = useCallback(
    (index: number, field: 'postUrl' | 'alt', value: string) => {
      setSlots((prev) =>
        prev.map((slot, slotIndex) =>
          slotIndex === index ? { ...slot, [field]: value } : slot,
        ),
      )
    },
    [],
  )

  const setSlotImageFile = useCallback((index: number, file: File | null) => {
    setSlots((prev) =>
      prev.map((slot, slotIndex) => {
        if (slotIndex !== index) return slot
        const previewUrl = file ? URL.createObjectURL(file) : slot.image.trim() || null
        return { ...slot, imageFile: file, previewUrl }
      }),
    )
  }, [])

  const save = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await updateInstagramSettings(
        slots.map(({ image, postUrl, alt }) => ({ image, postUrl, alt })),
        slots.map((slot) => slot.imageFile),
      )
      if (response.data) setSlots(toSlots(response.data))
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save Instagram settings.'
      setError(message)
      throw err
    } finally {
      setSaving(false)
    }
  }, [slots])

  return {
    slots,
    loading,
    saving,
    error,
    setSlotField,
    setSlotImageFile,
    save,
    reload: load,
  }
}
