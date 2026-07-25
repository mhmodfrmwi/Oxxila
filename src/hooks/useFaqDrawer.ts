// src/hooks/useFaqDrawer.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createAdminFaq, updateAdminFaq } from '../api/admin/faqs'
import { getAdminProducts } from '../api/admin/products'
import { ApiError } from '../lib/api'
import type {
  AdminFaqFormErrors,
  AdminFaqFormValues,
  AdminFaqProductOption,
  AdminFaqRow,
} from '../types/adminFaqs'
import {
  emptyFaqFormValues,
  faqToFormValues,
  formValuesToWriteFields,
  mapApiFaqToAdminRow,
  validateFaqForm,
} from '../utils/adminFaqsFormat'

export type FaqDrawerMode = 'create' | 'edit'

interface UseFaqDrawerOptions {
  open: boolean
  mode: FaqDrawerMode
  faq: AdminFaqRow | null
  /** Prefill product from the list filter when creating. */
  defaultProductId?: string
  onSaved: (faq: AdminFaqRow) => void
}

export function useFaqDrawer({
  open,
  mode,
  faq,
  defaultProductId = '',
  onSaved,
}: UseFaqDrawerOptions) {
  const [values, setValues] = useState<AdminFaqFormValues>(
    emptyFaqFormValues(),
  )
  const [errors, setErrors] = useState<AdminFaqFormErrors>({})
  const [products, setProducts] = useState<AdminFaqProductOption[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const resetForm = useCallback((next: AdminFaqFormValues) => {
    setValues(next)
    setErrors({})
    setSubmitError(null)
  }, [])

  useEffect(() => {
    if (!open) {
      resetForm(emptyFaqFormValues())
      setProducts([])
      setLoading(false)
      setLoadError(null)
      return
    }

    if (mode === 'edit' && faq) {
      resetForm(faqToFormValues(faq))
    } else {
      resetForm(emptyFaqFormValues(defaultProductId))
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    setLoading(true)
    setLoadError(null)

    void (async () => {
      try {
        const response = await getAdminProducts(
          { limit: 100, sort: 'name' },
          { signal: controller.signal },
        )
        if (requestId !== requestIdRef.current) return
        setProducts(
          (response.data ?? []).map((product) => ({
            id: String(product._id),
            name: product.name ?? '',
          })),
        )
        setLoading(false)
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        setLoading(false)
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load FAQ options.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, mode, faq, defaultProductId, resetForm])

  const setField = useCallback(
    <K extends keyof AdminFaqFormValues>(
      key: K,
      value: AdminFaqFormValues[K],
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

  const submit = useCallback(async () => {
    const nextErrors = validateFaqForm(values, {
      requireProduct: mode === 'create',
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    setSubmitting(true)
    setSubmitError(null)
    try {
      const fields = formValuesToWriteFields(values)

      if (mode === 'create') {
        const productId = values.product.trim()
        const response = await createAdminFaq(productId, fields)
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to create FAQ.')
        }
        const productName =
          products.find((product) => product.id === productId)?.name ?? null
        onSaved(mapApiFaqToAdminRow(data, { id: productId, name: productName }))
      } else {
        if (!faq) throw new ApiError('FAQ not found')
        const response = await updateAdminFaq(faq.id, fields)
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to update FAQ.')
        }
        onSaved(
          mapApiFaqToAdminRow(data, {
            id: faq.productId,
            name: faq.productName,
          }),
        )
      }
      return true
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : 'Unable to save FAQ.',
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }, [faq, mode, onSaved, products, values])

  return {
    values,
    errors,
    products,
    loading,
    loadError,
    submitting,
    submitError,
    setField,
    submit,
  }
}
