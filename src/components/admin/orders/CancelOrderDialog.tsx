// src/components/admin/orders/CancelOrderDialog.tsx
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cancelAdminOrder } from '../../../api/admin/orders'
import { useToast } from '../../../context/ToastContext'
import { ApiError } from '../../../lib/api'
import { cn } from '../../../lib/cn'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Dialog } from '../ui/Dialog'

interface CancelOrderDialogProps {
  open: boolean
  orderId: string | null
  orderNumber?: string | null
  onClose: () => void
  onCancelled: () => void
}

export function CancelOrderDialog({
  open,
  orderId,
  orderNumber,
  onClose,
  onCancelled,
}: CancelOrderDialogProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (submitting) return
    setReason('')
    setError(null)
    onClose()
  }

  const handleConfirm = async () => {
    if (!orderId) return
    setSubmitting(true)
    setError(null)
    try {
      await cancelAdminOrder(orderId, reason)
      toast.success(t('admin.orders.cancel.success'))
      setReason('')
      setError(null)
      onCancelled()
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : t('admin.orders.cancel.error'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      title={t('admin.orders.cancel.title')}
      description={
        orderNumber
          ? t('admin.orders.cancel.description', { id: orderNumber })
          : t('admin.orders.cancel.descriptionFallback')
      }
      onClose={handleClose}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={handleClose}
          >
            {t('admin.orders.cancel.keep')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting || !orderId}
            onClick={() => void handleConfirm()}
            className="border-support-error/40 text-support-error hover:bg-support-error/10"
          >
            {submitting ? (
              <Loader2 size={13} className="animate-spin" aria-hidden />
            ) : null}
            {t('admin.orders.cancel.confirm')}
          </Button>
        </div>
      }
    >
      <label className="flex flex-col gap-2">
        <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/40">
          {t('admin.orders.cancel.reasonLabel')}
        </span>
        <textarea
          value={reason}
          disabled={submitting}
          onChange={(event) => setReason(event.target.value.slice(0, 300))}
          rows={3}
          maxLength={300}
          placeholder={t('admin.orders.cancel.reasonPlaceholder')}
          className={cn(
            'w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2',
            'text-sm text-white placeholder:text-white/30',
            focusRingClasses,
            submitting && 'cursor-not-allowed opacity-60',
          )}
        />
      </label>
      {error ? (
        <p className="mt-3 text-sm text-support-error" role="alert">
          {error}
        </p>
      ) : null}
    </Dialog>
  )
}
