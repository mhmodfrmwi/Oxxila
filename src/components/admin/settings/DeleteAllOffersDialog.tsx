// src/components/admin/settings/DeleteAllOffersDialog.tsx
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../../lib/api'
import { Button } from '../../ui/Button'
import { Dialog } from '../ui/Dialog'

interface DeleteAllOffersDialogProps {
  open: boolean
  submitting: boolean
  offerCount: number
  onClose: () => void
  onConfirm: () => Promise<void>
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
    case 409:
      return 'conflict'
    default:
      return statusCode && statusCode >= 500 ? 'server' : 'unknown'
  }
}

export function DeleteAllOffersDialog({
  open,
  submitting,
  offerCount,
  onClose,
  onConfirm,
}: DeleteAllOffersDialogProps) {
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
    if (submitting) return
    setError(null)

    try {
      await onConfirm()
      onClose()
    } catch (caught) {
      setError(
        t(
          `admin.settings.offers.deleteAll.errors.${resolveDeleteErrorKey(caught)}`,
        ),
      )
    }
  }

  return (
    <Dialog
      open={open}
      title={t('admin.settings.offers.deleteAll.title')}
      description={t('admin.settings.offers.deleteAll.description')}
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
            disabled={submitting || offerCount <= 0}
            onClick={() => void handleConfirm()}
            className="border-support-error/40 text-support-error hover:bg-support-error/10"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : null}
            {submitting
              ? t('admin.settings.offers.deleteAll.deleting')
              : t('admin.settings.offers.deleteAll.confirm')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-secondary-text">
          {t('admin.settings.offers.deleteAll.countLabel', {
            count: offerCount,
          })}
        </p>

        <p
          className="rounded-xl border border-support-error/25 bg-support-error/10 p-3 text-sm leading-5 text-support-error"
          role="note"
        >
          {t('admin.settings.offers.deleteAll.warning')}
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
