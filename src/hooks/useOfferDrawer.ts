// src/hooks/useOfferDrawer.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createAdminOffer,
  getAdminOffer,
  updateAdminOffer,
} from '../api/admin/offers'
import { getAdminProducts } from '../api/admin/products'
import { ApiError } from '../lib/api'
import type {
  AdminOfferFormErrors,
  AdminOfferFormValues,
  AdminOfferRow,
} from '../types/adminOffers'
import type { ApiProduct } from '../types/catalog'
import {
  emptyOfferFormValues,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  mapApiOfferToAdminRow,
  offerToFormValues,
  validateOfferForm,
} from '../utils/adminOffersFormat'

export type OfferDrawerMode = 'create' | 'edit'

interface UseOfferDrawerOptions {
  open: boolean
  mode: OfferDrawerMode
  offerId: string | null
  locale?: string
  onSaved: (offer: AdminOfferRow) => void
}

export function useOfferDrawer({
  open,
  mode,
  offerId,
  locale = 'en',
  onSaved,
}: UseOfferDrawerOptions) {
  const [values, setValues] = useState<AdminOfferFormValues>(
    emptyOfferFormValues(),
  )
  const [errors, setErrors] = useState<AdminOfferFormErrors>({})
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const baselineRef = useRef<string>('')
  const requestIdRef = useRef(0)

  const resetForm = useCallback((next: AdminOfferFormValues) => {
    setValues(next)
    setErrors({})
    setSubmitError(null)
    setDirty(false)
    baselineRef.current = JSON.stringify(next)
  }, [])

  useEffect(() => {
    if (!open) {
      resetForm(emptyOfferFormValues())
      setProducts([])
      setLoading(false)
      setLoadError(null)
      return
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    setLoading(true)
    setLoadError(null)

    void (async () => {
      try {
        const productsResponse = await getAdminProducts(
          { page: 1, limit: 100, sort: 'name' },
          { signal: controller.signal },
        )
        if (requestId !== requestIdRef.current) return
        setProducts(productsResponse.data ?? [])

        if (mode === 'create') {
          resetForm(emptyOfferFormValues())
          setLoading(false)
          return
        }

        if (!offerId) {
          setLoading(false)
          setLoadError('Offer not found')
          return
        }

        const response = await getAdminOffer(offerId, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return
        const data = response.data
        if (!data) {
          setLoading(false)
          setLoadError(response.message || 'Offer not found')
          return
        }

        // Ensure the offer's product appears in the select even if outside page 1.
        if (data.product && typeof data.product === 'object') {
          const current = data.product
          setProducts((previous) => {
            if (previous.some((item) => item._id === current._id)) return previous
            return [
              {
                _id: current._id,
                name: current.name,
                slug: current.slug ?? '',
                price: current.price ?? 0,
                images: current.images ?? [],
                isBundle: current.isBundle,
              } as ApiProduct,
              ...previous,
            ]
          })
        }

        resetForm(offerToFormValues(data))
        setLoading(false)
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        setLoading(false)
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load offer.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, mode, offerId, resetForm])

  const setField = useCallback(
    <K extends keyof AdminOfferFormValues>(
      key: K,
      value: AdminOfferFormValues[K],
    ) => {
      setValues((previous) => {
        const next = { ...previous, [key]: value }
        setDirty(JSON.stringify(next) !== baselineRef.current)
        return next
      })
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
    const selectedProduct = products.find((item) => item._id === values.product)
    const nextErrors = validateOfferForm(values, mode, {
      productPrice: selectedProduct?.price,
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    setSubmitting(true)
    setSubmitError(null)
    try {
      if (mode === 'create') {
        const response = await createAdminOffer(
          formValuesToCreatePayload(values),
        )
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to create offer.')
        }
        onSaved(mapApiOfferToAdminRow(data, locale))
      } else {
        if (!offerId) throw new ApiError('Offer not found')
        const response = await updateAdminOffer(
          offerId,
          formValuesToUpdatePayload(values),
        )
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to update offer.')
        }
        onSaved(mapApiOfferToAdminRow(data, locale))
      }
      setDirty(false)
      return true
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'Unable to save offer.',
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }, [locale, mode, offerId, onSaved, products, values])

  const selectedProductPrice =
    products.find((item) => item._id === values.product)?.price ?? null

  return {
    values,
    errors,
    products,
    selectedProductPrice,
    loading,
    loadError,
    submitting,
    submitError,
    dirty,
    setField,
    submit,
  }
}
