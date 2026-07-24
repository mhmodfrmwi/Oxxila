// src/hooks/useBannerDrawer.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { createAdminBanner, updateAdminBanner } from '../api/admin/banners'
import { getAdminProducts } from '../api/admin/products'
import { getCategories } from '../api/catalog'
import { ApiError } from '../lib/api'
import type {
  AdminBannerFormErrors,
  AdminBannerFormValues,
  AdminBannerRow,
} from '../types/adminBanners'
import type { ApiCategory, ApiProduct } from '../types/catalog'
import {
  bannerToFormValues,
  emptyBannerFormValues,
  formValuesToWriteFields,
  mapApiBannerToRow,
  validateBannerForm,
} from '../utils/adminBannersFormat'

export type BannerDrawerMode = 'create' | 'edit'

interface UseBannerDrawerOptions {
  open: boolean
  mode: BannerDrawerMode
  /** Full row for the banner being edited — list already returns all admin fields. */
  banner: AdminBannerRow | null
  onSaved: (banner: AdminBannerRow) => void
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

export function useBannerDrawer({
  open,
  mode,
  banner,
  onSaved,
}: UseBannerDrawerOptions) {
  const [values, setValues] = useState<AdminBannerFormValues>(
    emptyBannerFormValues(),
  )
  const [errors, setErrors] = useState<AdminBannerFormErrors>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const resetForm = useCallback((next: AdminBannerFormValues) => {
    setValues(next)
    setErrors({})
    setSubmitError(null)
    setImageFile(null)
  }, [])

  useEffect(() => {
    if (!open) {
      resetForm(emptyBannerFormValues())
      setImagePreview(null)
      setProducts([])
      setCategories([])
      setLoading(false)
      setLoadError(null)
      return
    }

    resetForm(mode === 'edit' && banner ? bannerToFormValues(banner) : emptyBannerFormValues())
    setImagePreview(mode === 'edit' && banner ? banner.image : null)

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    setLoading(true)
    setLoadError(null)

    void (async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          getAdminProducts({ page: 1, limit: 50 }, { signal: controller.signal }),
          getCategories({ limit: 100 }),
        ])
        if (requestId !== requestIdRef.current) return
        setProducts(productsResponse.data ?? [])
        setCategories(categoriesResponse.data ?? [])
        setLoading(false)
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        setLoading(false)
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load banner options.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, mode, banner, resetForm])

  const setField = useCallback(
    <K extends keyof AdminBannerFormValues>(
      key: K,
      value: AdminBannerFormValues[K],
    ) => {
      setValues((previous) => ({ ...previous, [key]: value }))
      setErrors((previous) => {
        if (!previous[key]) return previous
        const next = { ...previous }
        delete next[key]
        return next
      })
      setSubmitError(null)
    },
    [],
  )

  const setImage = useCallback((file: File | null) => {
    setImageFile(file)
    setImagePreview(file ? URL.createObjectURL(file) : null)
    setErrors((previous) => {
      if (!previous.image) return previous
      const next = { ...previous }
      delete next.image
      return next
    })
    setSubmitError(null)
  }, [])

  const submit = useCallback(async () => {
    const nextErrors = validateBannerForm(values, mode, Boolean(imageFile))
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    setSubmitting(true)
    setSubmitError(null)
    try {
      const fields = formValuesToWriteFields(values)

      if (mode === 'create') {
        if (!imageFile) throw new ApiError('Image is required')
        const response = await createAdminBanner(fields, imageFile)
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to create banner.')
        }
        onSaved(mapApiBannerToRow(data))
      } else {
        if (!banner) throw new ApiError('Banner not found')
        const response = await updateAdminBanner(
          banner.id,
          fields,
          imageFile ?? undefined,
        )
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to update banner.')
        }
        onSaved(mapApiBannerToRow(data))
      }
      return true
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : 'Unable to save banner.',
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }, [banner, imageFile, mode, onSaved, values])

  return {
    values,
    errors,
    imageFile,
    imagePreview,
    products,
    categories,
    loading,
    loadError,
    submitting,
    submitError,
    setField,
    setImage,
    submit,
  }
}
