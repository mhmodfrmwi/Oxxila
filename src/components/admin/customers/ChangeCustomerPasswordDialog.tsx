// src/components/admin/customers/ChangeCustomerPasswordDialog.tsx
import { Loader2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { changeAdminCustomerPassword } from '../../../api/admin/customers'
import { useToast } from '../../../context/ToastContext'
import { ApiError } from '../../../lib/api'
import { cn } from '../../../lib/cn'
import type { AdminCustomerRow } from '../../../types/adminCustomers'
import {
  ADMIN_CUSTOMER_PASSWORD_MAX,
  validateCustomerPassword,
} from '../../../utils/adminCustomersFormat'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Dialog } from '../ui/Dialog'

interface ChangeCustomerPasswordDialogProps {
  open: boolean
  customer: AdminCustomerRow | null
  onClose: () => void
  onUpdated?: () => void
}

function resolvePasswordError(
  error: unknown,
  t: (key: string) => string,
): string {
  const statusCode = error instanceof ApiError ? error.statusCode : undefined
  switch (statusCode) {
    case 400:
      return t('admin.customers.password.errors.badRequest')
    case 401:
      return t('admin.customers.password.errors.unauthorized')
    case 403:
      return t('admin.customers.password.errors.forbidden')
    case 404:
      return t('admin.customers.password.errors.notFound')
    case 409:
      return t('admin.customers.password.errors.conflict')
    case 500:
      return t('admin.customers.password.errors.server')
    default:
      return statusCode && statusCode >= 500
        ? t('admin.customers.password.errors.server')
        : t('admin.customers.password.errors.unknown')
  }
}

export function ChangeCustomerPasswordDialog({
  open,
  customer,
  onClose,
  onUpdated,
}: ChangeCustomerPasswordDialogProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const fieldId = useId()
  const [password, setPassword] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setPassword('')
      setFieldError(null)
      setError(null)
      setSubmitting(false)
    }
  }, [open])

  const handleClose = () => {
    if (submitting) return
    onClose()
  }

  const handleConfirm = async () => {
    if (!customer || submitting) return
    const validation = validateCustomerPassword(password, t)
    if (validation) {
      setFieldError(validation)
      return
    }

    setSubmitting(true)
    setFieldError(null)
    setError(null)
    try {
      await changeAdminCustomerPassword(customer.id, password)
      toast.success(t('admin.customers.password.success'))
      onUpdated?.()
      onClose()
    } catch (caught) {
      setError(resolvePasswordError(caught, t))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      title={t('admin.customers.password.title')}
      description={
        customer
          ? t('admin.customers.password.description', { name: customer.name })
          : t('admin.customers.password.descriptionFallback')
      }
      onClose={handleClose}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={handleClose}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting || !customer}
            onClick={() => void handleConfirm()}
            className="border-accent/40 text-accent hover:bg-accent/10"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : null}
            {submitting
              ? t('admin.customers.password.confirming')
              : t('admin.customers.password.confirm')}
          </Button>
        </div>
      }
    >
      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium text-secondary-text">
          {t('admin.customers.password.newPassword')}
        </span>
        <input
          id={fieldId}
          type="password"
          value={password}
          disabled={submitting}
          onChange={(event) => {
            setPassword(event.target.value)
            setFieldError(null)
            setError(null)
          }}
          maxLength={ADMIN_CUSTOMER_PASSWORD_MAX}
          autoComplete="new-password"
          className={cn(
            'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5',
            'text-sm text-primary-text',
            'disabled:cursor-not-allowed disabled:opacity-60',
            focusRingClasses,
          )}
        />
        <span className="text-[8px] text-white/40">
          {t('admin.customers.password.hint')}
        </span>
        {fieldError ? (
          <span className="text-xs text-support-error" role="alert">
            {fieldError}
          </span>
        ) : null}
      </label>

      {error ? (
        <p className="mt-3 text-sm text-support-error" role="alert">
          {error}
        </p>
      ) : null}
    </Dialog>
  )
}
