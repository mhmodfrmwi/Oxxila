// src/hooks/useSubcategoryDrawer.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getAdminCategories } from '../api/admin/categories'
import {
  createAdminSubcategory,
  updateAdminSubcategory,
} from '../api/admin/subcategories'
import { ApiError } from '../lib/api'
import type { AdminCategoryRow } from '../types/adminCategories'
import type {
  AdminSubcategoryFormErrors,
  AdminSubcategoryFormValues,
  AdminSubcategoryRow,
} from '../types/adminSubcategories'
import { mapApiCategoryToAdminRow } from '../utils/adminCategoriesFormat'
import {
  emptySubcategoryFormValues,
  formValuesToWriteFields,
  mapApiSubcategoryToAdminRow,
  subcategoryToFormValues,
  validateSubcategoryForm,
} from '../utils/adminSubcategoriesFormat'

export type SubcategoryDrawerMode = 'create' | 'edit'

interface UseSubcategoryDrawerOptions {
  open: boolean
  mode: SubcategoryDrawerMode
  subcategory: AdminSubcategoryRow | null
  onSaved: (subcategory: AdminSubcategoryRow) => void
}

export function useSubcategoryDrawer({
  open,
  mode,
  subcategory,
  onSaved,
}: UseSubcategoryDrawerOptions) {
  const [values, setValues] = useState<AdminSubcategoryFormValues>(
    emptySubcategoryFormValues(),
  )
  const [errors, setErrors] = useState<AdminSubcategoryFormErrors>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [categories, setCategories] = useState<AdminCategoryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const resetForm = useCallback((next: AdminSubcategoryFormValues) => {
    setValues(next)
    setErrors({})
    setSubmitError(null)
    setImageFile(null)
  }, [])

  useEffect(() => {
    if (!open) {
      resetForm(emptySubcategoryFormValues())
      setImagePreview(null)
      setCategories([])
      setLoading(false)
      setLoadError(null)
      return
    }

    if (mode === 'edit' && subcategory) {
      resetForm(subcategoryToFormValues(subcategory))
      setImagePreview(subcategory.image)
    } else {
      resetForm(emptySubcategoryFormValues())
      setImagePreview(null)
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    setLoading(true)
    setLoadError(null)

    void (async () => {
      try {
        const response = await getAdminCategories(
          { limit: 100, sort: 'name' },
          { signal: controller.signal },
        )
        if (requestId !== requestIdRef.current) return
        setCategories((response.data ?? []).map(mapApiCategoryToAdminRow))
        setLoading(false)
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        setLoading(false)
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load subcategory options.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, mode, subcategory, resetForm])

  const setField = useCallback(
    <K extends keyof AdminSubcategoryFormValues>(
      key: K,
      value: AdminSubcategoryFormValues[K],
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

  const setImage = useCallback(
    (file: File | null) => {
      setImageFile(file)
      setImagePreview((previous) => {
        if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous)
        if (file) return URL.createObjectURL(file)
        return mode === 'edit' && subcategory?.image ? subcategory.image : null
      })
      setErrors((previous) => {
        if (!previous.image) return previous
        const next = { ...previous }
        delete next.image
        return next
      })
      setSubmitError(null)
    },
    [mode, subcategory],
  )

  const clearImage = useCallback(() => {
    setImage(null)
  }, [setImage])

  const submit = useCallback(async () => {
    const nextErrors = validateSubcategoryForm(values, imageFile)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    const categoryId = values.category.trim()
    if (!categoryId) return false

    setSubmitting(true)
    setSubmitError(null)
    try {
      const fields = formValuesToWriteFields(values)

      if (mode === 'create') {
        const response = await createAdminSubcategory(
          categoryId,
          fields,
          imageFile ?? undefined,
        )
        const data = response.data
        if (!data) {
          throw new ApiError(
            response.message || 'Unable to create subcategory.',
          )
        }
        onSaved(mapApiSubcategoryToAdminRow(data))
      } else {
        if (!subcategory?.categoryId) {
          throw new ApiError('Subcategory not found')
        }
        // Nested route requires the current parent category id.
        const response = await updateAdminSubcategory(
          subcategory.categoryId,
          subcategory.id,
          fields,
          imageFile ?? undefined,
        )
        const data = response.data
        if (!data) {
          throw new ApiError(
            response.message || 'Unable to update subcategory.',
          )
        }
        onSaved(mapApiSubcategoryToAdminRow(data))
      }
      return true
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'Unable to save subcategory.',
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }, [imageFile, mode, onSaved, subcategory, values])

  return {
    values,
    errors,
    imageFile,
    imagePreview,
    categories,
    loading,
    loadError,
    submitting,
    submitError,
    setField,
    setImage,
    clearImage,
    submit,
  }
}
