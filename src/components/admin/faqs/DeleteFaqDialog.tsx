// src/components/admin/faqs/DeleteFaqDialog.tsx
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../../lib/api'
import type { AdminFaqRow } from '../../../types/adminFaqs'
import { truncateFaqAnswer } from '../../../utils/adminFaqsFormat'
import { Button } from '../../ui/Button'
import { Dialog } from '../ui/Dialog'

interface DeleteFaqDialogProps {
  open: boolean
  faq: AdminFaqRow | null
  submitting: boolean
  onClose: () => void
  onConfirm: (faqId: string) => Promise<void>
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

export function DeleteFaqDialog({
  open,
  faq,
  submitting,
  onClose,
  onConfirm,
}: DeleteFaqDialogProps) {
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
    if (!faq || submitting) return
    setError(null)

    try {
      await onConfirm(faq.id)
      onClose()
    } catch (caught) {
      setError(t(`admin.faqs.delete.errors.${resolveDeleteErrorKey(caught)}`))
    }
  }

  const rows = faq
    ? [
        {
          label: t('admin.faqs.delete.question'),
          value: faq.question,
        },
        {
          label: t('admin.faqs.delete.answer'),
          value: truncateFaqAnswer(faq.answer, 80) || '—',
        },
        {
          label: t('admin.faqs.delete.product'),
          value: faq.productName || t('admin.faqs.noProduct'),
        },
        {
          label: t('admin.faqs.delete.status'),
          value: faq.isActive
            ? t('admin.faqs.active')
            : t('admin.faqs.inactive'),
        },
      ]
    : []

  return (
    <Dialog
      open={open}
      title={t('admin.faqs.delete.title')}
      description={t('admin.faqs.delete.description')}
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
            disabled={submitting || !faq}
            onClick={() => void handleConfirm()}
            className="border-support-error/40 text-support-error hover:bg-support-error/10"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : null}
            {submitting
              ? t('admin.faqs.delete.deleting')
              : t('admin.faqs.delete.confirm')}
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
          {t('admin.faqs.delete.warning')}
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
