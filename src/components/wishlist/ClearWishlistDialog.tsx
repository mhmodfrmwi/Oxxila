// src/components/wishlist/ClearWishlistDialog.tsx
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../lib/api'
import { Button } from '../ui/Button'
import { Dialog } from '../admin/ui/Dialog'

interface ClearWishlistDialogProps {
  open: boolean
  itemCount: number
  submitting: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => Promise<void>
  onError: (message: string | null) => void
}

export function ClearWishlistDialog({
  open,
  itemCount,
  submitting,
  error,
  onClose,
  onConfirm,
  onError,
}: ClearWishlistDialogProps) {
  const { t } = useTranslation()

  const handleClose = () => {
    if (submitting) return
    onError(null)
    onClose()
  }

  const handleConfirm = async () => {
    if (submitting) return
    onError(null)

    try {
      await onConfirm()
    } catch (caught) {
      const statusCode = caught instanceof ApiError ? caught.statusCode : undefined
      const key =
        statusCode === 400
          ? 'badRequest'
          : statusCode === 401
            ? 'unauthorized'
            : statusCode === 403
              ? 'forbidden'
              : statusCode === 404
                ? 'notFound'
                : statusCode === 409
                  ? 'conflict'
                  : statusCode && statusCode >= 500
                    ? 'server'
                    : 'unknown'

      onError(t(`wishlist.clear.errors.${key}`))
    }
  }

  return (
    <Dialog
      open={open}
      title={t('wishlist.clear.title')}
      description={t('wishlist.clear.description')}
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
            disabled={submitting}
            onClick={() => void handleConfirm()}
            className="border-support-error/40 text-support-error hover:bg-support-error/10"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : null}
            {submitting
              ? t('wishlist.clear.clearing')
              : t('wishlist.clear.confirm')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <dl className="rounded-xl border border-border-subtle bg-surface-muted p-4">
          <div>
            <dt className="text-xs text-secondary-text">
              {t('wishlist.clear.items')}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-primary-text">
              {t('wishlist.itemCount', { count: itemCount })}
            </dd>
          </div>
        </dl>

        <p
          className="rounded-xl border border-support-error/25 bg-support-error/10 p-3 text-sm leading-5 text-support-error"
          role="note"
        >
          {t('wishlist.clear.warning')}
        </p>

        {error ? (
          <div className="space-y-1" role="alert">
            <p className="text-sm text-support-error">{error}</p>
            <p className="text-xs text-secondary-text">
              {t('wishlist.clear.retry')}
            </p>
          </div>
        ) : null}
      </div>
    </Dialog>
  )
}
