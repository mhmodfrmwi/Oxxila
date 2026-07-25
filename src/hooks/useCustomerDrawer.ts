// src/hooks/useCustomerDrawer.ts
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  createAdminCustomer,
  updateAdminCustomer,
} from '../api/admin/customers'
import { ApiError } from '../lib/api'
import type {
  AdminCustomerFormErrors,
  AdminCustomerFormValues,
  AdminCustomerRow,
} from '../types/adminCustomers'
import {
  customerToFormValues,
  emptyCustomerFormValues,
  formValuesToCreateFields,
  formValuesToUpdateFields,
  mapApiCustomerToAdminRow,
  validateCustomerForm,
} from '../utils/adminCustomersFormat'

export type CustomerDrawerMode = 'create' | 'edit'

interface UseCustomerDrawerOptions {
  open: boolean
  mode: CustomerDrawerMode
  customer: AdminCustomerRow | null
  onSaved: (customer: AdminCustomerRow) => void
}

function resolveSubmitError(
  error: unknown,
  t: (key: string) => string,
): string {
  const statusCode = error instanceof ApiError ? error.statusCode : undefined
  switch (statusCode) {
    case 400:
      return t('admin.customers.drawer.errors.badRequest')
    case 401:
      return t('admin.customers.drawer.errors.unauthorized')
    case 403:
      return t('admin.customers.drawer.errors.forbidden')
    case 404:
      return t('admin.customers.drawer.errors.notFound')
    case 409:
      return t('admin.customers.drawer.errors.conflict')
    case 500:
      return t('admin.customers.drawer.errors.server')
    default:
      return statusCode && statusCode >= 500
        ? t('admin.customers.drawer.errors.server')
        : t('admin.customers.drawer.errors.unknown')
  }
}

export function useCustomerDrawer({
  open,
  mode,
  customer,
  onSaved,
}: UseCustomerDrawerOptions) {
  const { t } = useTranslation()
  const [values, setValues] = useState<AdminCustomerFormValues>(
    emptyCustomerFormValues(),
  )
  const [errors, setErrors] = useState<AdminCustomerFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const resetForm = useCallback((next: AdminCustomerFormValues) => {
    setValues(next)
    setErrors({})
    setSubmitError(null)
  }, [])

  useEffect(() => {
    if (!open) {
      resetForm(emptyCustomerFormValues())
      return
    }
    if (mode === 'edit' && customer) {
      resetForm(customerToFormValues(customer))
      return
    }
    resetForm(emptyCustomerFormValues())
  }, [open, mode, customer, resetForm])

  const setField = useCallback(
    <K extends keyof AdminCustomerFormValues>(
      key: K,
      value: AdminCustomerFormValues[K],
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
    const nextErrors = validateCustomerForm(values, mode, t)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    setSubmitting(true)
    setSubmitError(null)
    try {
      if (mode === 'create') {
        const response = await createAdminCustomer(
          formValuesToCreateFields(values),
        )
        const data = response.data
        if (!data) {
          throw new ApiError(
            response.message || t('admin.customers.drawer.errors.unknown'),
          )
        }
        onSaved(mapApiCustomerToAdminRow(data))
      } else {
        if (!customer) {
          throw new ApiError(t('admin.customers.drawer.errors.notFound'))
        }
        const response = await updateAdminCustomer(
          customer.id,
          formValuesToUpdateFields(values),
        )
        const data = response.data
        if (!data) {
          throw new ApiError(
            response.message || t('admin.customers.drawer.errors.unknown'),
          )
        }
        onSaved(
          mapApiCustomerToAdminRow({
            ...data,
            orders: customer.ordersCount ?? data.orders,
            totalPaid: customer.totalSpend ?? data.totalPaid,
            totalSpend: customer.totalSpend ?? data.totalSpend,
            lastOrder: customer.lastOrderAt ?? data.lastOrder,
          }),
        )
      }
      return true
    } catch (error) {
      setSubmitError(resolveSubmitError(error, t))
      return false
    } finally {
      setSubmitting(false)
    }
  }, [customer, mode, onSaved, t, values])

  return {
    values,
    errors,
    submitting,
    submitError,
    setField,
    submit,
  }
}
