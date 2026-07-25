// src/components/cart/ClearCartDialog.tsx
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../lib/api'
import { formatCartPrice } from '../../utils/formatProductPrice'
import { Button } from '../ui/Button'
import { Dialog } from '../admin/ui/Dialog'

interface ClearCartDialogProps {
  open: boolean
  itemCount: number
  subtotal: number
  submitting: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => Promise<void>
  onError: (message: string | null) => void
}

export function ClearCartDialog({
  open,
  itemCount,
  subtotal,
  submitting,
  error,
  onClose,
  onConfirm,
  onError,
}: ClearCartDialogProps) {
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

      onError(t(`cart.clear.errors.${key}`))
    }
  }

  return (
    <Dialog
      open={open}
      title={t('cart.clear.title')}
      description={t('cart.clear.description')}
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
            {submitting ? t('cart.clear.clearing') : t('cart.clear.confirm')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border-subtle bg-surface-muted p-4">
          <div>
            <dt className="text-xs text-secondary-text">{t('cart.clear.items')}</dt>
            <dd className="mt-1 text-sm font-semibold text-primary-text">
              {t('cart.itemCount', { count: itemCount })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-secondary-text">{t('cart.summary.subtotal')}</dt>
            <dd className="mt-1 text-sm font-semibold text-primary-text">
              {formatCartPrice(subtotal)}
            </dd>
          </div>
        </dl>

        <p
          className="rounded-xl border border-support-error/25 bg-support-error/10 p-3 text-sm leading-5 text-support-error"
          role="note"
        >
          {t('cart.clear.warning')}
        </p>

        {error ? (
          <div className="space-y-1" role="alert">
            <p className="text-sm text-support-error">{error}</p>
            <p className="text-xs text-secondary-text">{t('cart.clear.retry')}</p>
          </div>
        ) : null}
      </div>
    </Dialog>
  )
}
