// src/components/admin/subcategories/DeleteSubcategoryDialog.tsx
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../../lib/api'
import type { AdminSubcategoryRow } from '../../../types/adminSubcategories'
import { Button } from '../../ui/Button'
import { Dialog } from '../ui/Dialog'

interface DeleteSubcategoryDialogProps {
  open: boolean
  subcategory: AdminSubcategoryRow | null
  submitting: boolean
  onClose: () => void
  onConfirm: (subcategoryId: string) => Promise<void>
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

export function DeleteSubcategoryDialog({
  open,
  subcategory,
  submitting,
  onClose,
  onConfirm,
}: DeleteSubcategoryDialogProps) {
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
    if (!subcategory || submitting) return
    setError(null)

    try {
      await onConfirm(subcategory.id)
      onClose()
    } catch (caught) {
      setError(
        t(
          `admin.subcategories.delete.errors.${resolveDeleteErrorKey(caught)}`,
        ),
      )
    }
  }

  const rows = subcategory
    ? [
        {
          label: t('admin.subcategories.delete.name'),
          value: subcategory.name,
        },
        {
          label: t('admin.subcategories.delete.slug'),
          value: subcategory.slug || '—',
        },
        {
          label: t('admin.subcategories.delete.parentCategory'),
          value:
            subcategory.categoryName || t('admin.subcategories.noCategory'),
        },
        {
          label: t('admin.subcategories.delete.status'),
          value: subcategory.isActive
            ? t('admin.subcategories.active')
            : t('admin.subcategories.inactive'),
        },
      ]
    : []

  return (
    <Dialog
      open={open}
      title={t('admin.subcategories.delete.title')}
      description={t('admin.subcategories.delete.description')}
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
            disabled={submitting || !subcategory}
            onClick={() => void handleConfirm()}
            className="border-support-error/40 text-support-error hover:bg-support-error/10"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : null}
            {submitting
              ? t('admin.subcategories.delete.deleting')
              : t('admin.subcategories.delete.confirm')}
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
          {t('admin.subcategories.delete.warning')}
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
