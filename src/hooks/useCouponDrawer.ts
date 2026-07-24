// src/hooks/useCouponDrawer.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createAdminCoupon,
  getAdminCoupon,
  updateAdminCoupon,
} from '../api/admin/coupons'
import { ApiError } from '../lib/api'
import type {
  AdminCouponFormErrors,
  AdminCouponFormValues,
  AdminCouponRow,
} from '../types/adminCoupons'
import {
  couponToFormValues,
  emptyCouponFormValues,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  mapApiCouponToAdminRow,
  validateCouponForm,
} from '../utils/adminCouponsFormat'

export type CouponDrawerMode = 'create' | 'edit'

interface UseCouponDrawerOptions {
  open: boolean
  mode: CouponDrawerMode
  couponId: string | null
  locale?: string
  onSaved: (coupon: AdminCouponRow) => void
}

export function useCouponDrawer({
  open,
  mode,
  couponId,
  locale = 'en',
  onSaved,
}: UseCouponDrawerOptions) {
  const [values, setValues] = useState<AdminCouponFormValues>(
    emptyCouponFormValues(),
  )
  const [errors, setErrors] = useState<AdminCouponFormErrors>({})
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const baselineRef = useRef<string>('')
  const requestIdRef = useRef(0)

  const resetForm = useCallback((next: AdminCouponFormValues) => {
    setValues(next)
    setErrors({})
    setSubmitError(null)
    setDirty(false)
    baselineRef.current = JSON.stringify(next)
  }, [])

  useEffect(() => {
    if (!open) {
      resetForm(emptyCouponFormValues())
      setLoading(false)
      setLoadError(null)
      return
    }

    if (mode === 'create') {
      resetForm(emptyCouponFormValues())
      setLoading(false)
      setLoadError(null)
      return
    }

    if (!couponId) {
      setLoadError('Coupon not found')
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    setLoading(true)
    setLoadError(null)

    void (async () => {
      try {
        const response = await getAdminCoupon(couponId, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return
        const data = response.data
        if (!data) {
          setLoading(false)
          setLoadError(response.message || 'Coupon not found')
          return
        }
        resetForm(couponToFormValues(data))
        setLoading(false)
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        setLoading(false)
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load coupon.',
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, mode, couponId, resetForm])

  const setField = useCallback(
    <K extends keyof AdminCouponFormValues>(
      key: K,
      value: AdminCouponFormValues[K],
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
    const nextErrors = validateCouponForm(values, mode)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    setSubmitting(true)
    setSubmitError(null)
    try {
      if (mode === 'create') {
        const response = await createAdminCoupon(
          formValuesToCreatePayload(values),
        )
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to create coupon.')
        }
        onSaved(mapApiCouponToAdminRow(data, locale))
      } else {
        if (!couponId) throw new ApiError('Coupon not found')
        const response = await updateAdminCoupon(
          couponId,
          formValuesToUpdatePayload(values),
        )
        const data = response.data
        if (!data) {
          throw new ApiError(response.message || 'Unable to update coupon.')
        }
        onSaved(mapApiCouponToAdminRow(data, locale))
      }
      setDirty(false)
      return true
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'Unable to save coupon.',
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }, [couponId, locale, mode, onSaved, values])

  return {
    values,
    errors,
    loading,
    loadError,
    submitting,
    submitError,
    dirty,
    setField,
    submit,
  }
}
