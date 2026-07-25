// src/hooks/useBrandDrawer.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createAdminBrand, updateAdminBrand } from '../api/admin/brands'
import { getCategories } from '../api/catalog'
import { ApiError } from '../lib/api'
import type {
  AdminBrandFormErrors,
  AdminBrandFormValues,
  AdminBrandRow,
} from '../types/adminBrands'
import type { ApiCategory } from '../types/catalog'
import {
  brandToFormValues,
  emptyBrandFormValues,
  formValuesToWriteFields,
  mapApiBrandToAdminRow,
  validateBrandForm,
} from '../utils/adminBrandsFormat'

export type BrandDrawerMode = 'create' | 'edit'

interface UseBrandDrawerOptions {
  open: boolean
  mode: BrandDrawerMode
  /** List row for the brand being edited. */
  brand: AdminBrandRow | null
  onSaved: (brand: AdminBrandRow) => void
}

export function useBrandDrawer({
  open,
  mode,
  brand,
  onSaved,
}: UseBrandDrawerOptions) {
  const [values, setValues] = useState<AdminBrandFormValues>(
    emptyBrandFormValues(),
  )
  const [errors, setErrors] = useState<AdminBrandFormErrors>({})
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const resetForm = useCallback((next: AdminBrandFormValues) => {
    setValues(next)
    setErrors({})
    setSubmitError(null)
    setLogoFile(null)
  }, [])

  useEffect(() => {
    if (!open) {
      resetForm(emptyBrandFormValues())
      setLogoPreview(null)
      setCategories([])
      setLoading(false)
      setLoadError(null)
      return
    }

    if (mode === 'edit' && brand) {
      resetForm(brandToFormValues(brand))
      setLogoPreview(brand.logo)
    } else {
      resetForm(emptyBrandFormValues())
      setLogoPreview(null)
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    setLoading(true)
    setLoadError(null)

    void (async () => {
      try {
        const response = await getCategories({ limit: 100 })
        if (requestId !== requestIdRef.current) return
        setCategories(response.data ?? [])
        setLoading(false)
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        setLoading(false)
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load brand options.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, mode, brand, resetForm])

  const setField = useCallback(
    <K extends keyof AdminBrandFormValues>(
      key: K,
      value: AdminBrandFormValues[K],
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

  const setLogo = useCallback(
    (file: File | null) => {
      setLogoFile(file)
      setLogoPreview((previous) => {
        if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous)
        if (file) return URL.createObjectURL(file)
        return mode === 'edit' && brand?.logo ? brand.logo : null
      })
      setErrors((previous) => {
        if (!previous.logo) return previous
        const next = { ...previous }
        delete next.logo
        return next
      })
      setSubmitError(null)
    },
    [brand, mode],
  )

  const clearLogo = useCallback(() => {
    setLogo(null)
  }, [setLogo])

  const submit = useCallback(async () => {
    const nextErrors = validateBrandForm(values, logoFile)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    setSubmitting(true)
    setSubmitError(null)
    try {
      const fields = formValuesToWriteFields(values)

      if (mode === 'create') {
        const response = await createAdminBrand(fields, logoFile ?? undefined)
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to create brand.')
        }
        onSaved(mapApiBrandToAdminRow(data))
      } else {
        if (!brand) throw new ApiError('Brand not found')
        const response = await updateAdminBrand(
          brand.id,
          fields,
          logoFile ?? undefined,
        )
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to update brand.')
        }
        onSaved(mapApiBrandToAdminRow(data))
      }
      return true
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : 'Unable to save brand.',
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }, [brand, logoFile, mode, onSaved, values])

  return {
    values,
    errors,
    logoFile,
    logoPreview,
    categories,
    loading,
    loadError,
    submitting,
    submitError,
    setField,
    setLogo,
    clearLogo,
    submit,
  }
}
