// src/hooks/useCategoryDrawer.ts
import { useCallback, useEffect, useState } from 'react'
import {
  createAdminCategory,
  updateAdminCategory,
} from '../api/admin/categories'
import { ApiError } from '../lib/api'
import type {
  AdminCategoryFormErrors,
  AdminCategoryFormValues,
  AdminCategoryRow,
} from '../types/adminCategories'
import {
  categoryToFormValues,
  emptyCategoryFormValues,
  formValuesToWriteFields,
  mapApiCategoryToAdminRow,
  validateCategoryForm,
} from '../utils/adminCategoriesFormat'

export type CategoryDrawerMode = 'create' | 'edit'

interface UseCategoryDrawerOptions {
  open: boolean
  mode: CategoryDrawerMode
  /** List row for the category being edited. */
  category: AdminCategoryRow | null
  onSaved: (category: AdminCategoryRow) => void
}

export function useCategoryDrawer({
  open,
  mode,
  category,
  onSaved,
}: UseCategoryDrawerOptions) {
  const [values, setValues] = useState<AdminCategoryFormValues>(
    emptyCategoryFormValues(),
  )
  const [errors, setErrors] = useState<AdminCategoryFormErrors>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const resetForm = useCallback((next: AdminCategoryFormValues) => {
    setValues(next)
    setErrors({})
    setSubmitError(null)
    setImageFile(null)
  }, [])

  useEffect(() => {
    if (!open) {
      resetForm(emptyCategoryFormValues())
      setImagePreview(null)
      return
    }

    if (mode === 'edit' && category) {
      resetForm(categoryToFormValues(category))
      setImagePreview(category.image)
      return
    }

    resetForm(emptyCategoryFormValues())
    setImagePreview(null)
  }, [open, mode, category, resetForm])

  const setField = useCallback(
    <K extends keyof AdminCategoryFormValues>(
      key: K,
      value: AdminCategoryFormValues[K],
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
        return mode === 'edit' && category?.image ? category.image : null
      })
      setErrors((previous) => {
        if (!previous.image) return previous
        const next = { ...previous }
        delete next.image
        return next
      })
      setSubmitError(null)
    },
    [category, mode],
  )

  const clearImage = useCallback(() => {
    setImage(null)
  }, [setImage])

  const submit = useCallback(async () => {
    const nextErrors = validateCategoryForm(values, imageFile)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    setSubmitting(true)
    setSubmitError(null)
    try {
      const fields = formValuesToWriteFields(values)

      if (mode === 'create') {
        const response = await createAdminCategory(
          fields,
          imageFile ?? undefined,
        )
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to create category.')
        }
        onSaved(mapApiCategoryToAdminRow(data))
      } else {
        if (!category) throw new ApiError('Category not found')
        const response = await updateAdminCategory(
          category.id,
          fields,
          imageFile ?? undefined,
        )
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to update category.')
        }
        onSaved(mapApiCategoryToAdminRow(data))
      }
      return true
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'Unable to save category.',
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }, [category, imageFile, mode, onSaved, values])

  return {
    values,
    errors,
    imageFile,
    imagePreview,
    submitting,
    submitError,
    setField,
    setImage,
    clearImage,
    submit,
  }
}
