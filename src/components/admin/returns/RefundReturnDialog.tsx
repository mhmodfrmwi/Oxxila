// src/components/admin/returns/RefundReturnDialog.tsx
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatAdminReturnMoney } from '../../../utils/adminReturnsFormat'
import { Button } from '../../ui/Button'
import { Dialog } from '../ui/Dialog'

interface RefundReturnDialogProps {
  open: boolean
  returnShortId?: string | null
  refundAmount: number
  /** Order's payment method — drives which refund copy (store credit vs gateway) is shown. */
  paymentMethod: 'cod' | 'card' | null
  submitting: boolean
  error: string | null
  onClose: () => void
  onSubmit: () => Promise<boolean>
}

export function RefundReturnDialog({
  open,
  returnShortId,
  refundAmount,
  paymentMethod,
  submitting,
  error,
  onClose,
  onSubmit,
}: RefundReturnDialogProps) {
  const { t, i18n } = useTranslation()
  const amount = formatAdminReturnMoney(refundAmount, i18n.language)

  const handleClose = () => {
    if (submitting) return
    onClose()
  }

  const handleSubmit = async () => {
    const ok = await onSubmit()
    if (ok) onClose()
  }

  const copyKey = paymentMethod === 'card' ? 'card' : 'cod'

  return (
    <Dialog
      open={open}
      title={t('admin.returns.actions.refund.title')}
      description={
        returnShortId
          ? t('admin.returns.actions.refund.description', { id: returnShortId })
          : undefined
      }
      onClose={handleClose}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={submitting} onClick={handleClose}>
            {t('actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="gradient"
            disabled={submitting}
            onClick={() => void handleSubmit()}
          >
            {submitting ? <Loader2 size={13} className="animate-spin" aria-hidden /> : null}
            {t('admin.returns.actions.refund.confirm')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-5 text-white/80">
          {t(`admin.returns.actions.refund.copy.${copyKey}`, { amount })}
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
