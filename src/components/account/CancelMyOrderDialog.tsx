// src/components/account/CancelMyOrderDialog.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FormMessage } from '../auth/FormMessage'
import { ProductFormDialog } from '../product/ProductFormDialog'
import { Button } from '../ui/Button'
import { TextAreaField } from '../ui/TextAreaField'

interface CancelMyOrderDialogProps {
  open: boolean
  orderLabel: string | null
  submitting: boolean
  onClose: () => void
  onConfirm: (reason?: string) => Promise<void>
}

export function CancelMyOrderDialog({
  open,
  orderLabel,
  submitting,
  onClose,
  onConfirm,
}: CancelMyOrderDialogProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setReason('')
      setError(null)
    }
  }, [open])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    setError(null)
    try {
      await onConfirm(reason.trim() || undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.orders.cancelError'))
    }
  }

  return (
    <ProductFormDialog
      open={open}
      title={t('profile.orders.cancelTitle')}
      description={
        orderLabel
          ? t('profile.orders.cancelDescription', { id: orderLabel })
          : t('profile.orders.cancelDescriptionFallback')
      }
      onClose={submitting ? () => undefined : onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
        <TextAreaField
          label={t('profile.orders.cancelReason')}
          name="cancelReason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t('profile.orders.cancelReasonPlaceholder')}
          disabled={submitting}
        />

        {error && <FormMessage message={error} />}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={onClose}
          >
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting
              ? t('profile.orders.cancelling')
              : t('profile.orders.confirmCancel')}
          </Button>
        </div>
      </form>
    </ProductFormDialog>
  )
}
