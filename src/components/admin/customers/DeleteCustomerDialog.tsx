// src/components/admin/customers/DeleteCustomerDialog.tsx
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../../lib/api'
import type { AdminCustomerRow } from '../../../types/adminCustomers'
import { Button } from '../../ui/Button'
import { Dialog } from '../ui/Dialog'

interface DeleteCustomerDialogProps {
  open: boolean
  customer: AdminCustomerRow | null
  submitting: boolean
  onClose: () => void
  onConfirm: (customerId: string) => Promise<void>
}

function resolveDeleteErrorKey(error: unknown): string {
  const statusCode = error instanceof ApiError ? error.statusCode : undefined
  switch (statusCode) {
    case 400:
      return 'badRequest'
    case 401:
      return 'unauthorized'
    case 403:
      return 'forbidden'
    case 404:
      return 'notFound'
    case 409:
      return 'conflict'
    default:
      return statusCode && statusCode >= 500 ? 'server' : 'unknown'
  }
}

export function DeleteCustomerDialog({
  open,
  customer,
  submitting,
  onClose,
  onConfirm,
}: DeleteCustomerDialogProps) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) setError(null)
  }, [open])

  const handleClose = () => {
    if (submitting) return
    setError(null)
    onClose()
  }

  const handleConfirm = async () => {
    if (!customer || submitting) return
    setError(null)
    try {
      await onConfirm(customer.id)
      onClose()
    } catch (caught) {
      setError(
        t(`admin.customers.delete.errors.${resolveDeleteErrorKey(caught)}`),
      )
    }
  }

  const rows = customer
    ? [
        {
          label: t('admin.customers.delete.name'),
          value: customer.name,
        },
        {
          label: t('admin.customers.delete.email'),
          value: customer.email,
        },
        {
          label: t('admin.customers.delete.status'),
          value: customer.active
            ? t('admin.customers.details.statusActive')
            : t('admin.customers.details.statusInactive'),
        },
      ]
    : []

  return (
    <Dialog
      open={open}
      title={t('admin.customers.delete.title')}
      description={t('admin.customers.delete.description')}
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
            className="border-support-error/40 text-support-error hover:bg-support-error/10"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : null}
            {submitting
              ? t('admin.customers.delete.deleting')
              : t('admin.customers.delete.confirm')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <dl className="grid gap-3 rounded-xl border border-border-subtle bg-surface-muted p-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-xs text-secondary-text">{row.label}</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-primary-text">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <p
          className="rounded-xl border border-support-error/25 bg-support-error/10 p-3 text-sm leading-5 text-support-error"
          role="note"
        >
          {t('admin.customers.delete.warning')}
        </p>

        {error ? (
          <p className="text-sm text-support-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Dialog>
  )
}
