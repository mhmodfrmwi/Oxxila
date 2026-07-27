// src/components/admin/orders/ChangeOrderStatusDialog.tsx
import { Loader2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { updateAdminOrderStatus } from '../../../api/admin/orders'
import { useToast } from '../../../context/ToastContext'
import { ApiError } from '../../../lib/api'
import {
  ADMIN_ORDER_STATUSES,
  type AdminOrderStatus,
} from '../../../types/adminOrders'
import { orderStatusBadgeTone } from '../../../utils/adminOrdersFormat'
import { Button } from '../../ui/Button'
import { Dialog } from '../ui/Dialog'
import { Select } from '../ui/Select'
import { StatusBadge } from '../ui/StatusBadge'

interface ChangeOrderStatusDialogProps {
  open: boolean
  orderId: string | null
  orderNumber?: string | null
  currentStatus: AdminOrderStatus | null
  onClose: () => void
  onUpdated: () => void
}

function resolveStatusError(
  error: unknown,
  t: (key: string) => string,
): string {
  if (error instanceof ApiError) {
    const backendMessage = error.message?.trim()
    if (backendMessage) return backendMessage

    switch (error.statusCode) {
      case 400:
        return t('admin.orders.changeStatus.errors.badRequest')
      case 401:
        return t('admin.orders.changeStatus.errors.unauthorized')
      case 403:
        return t('admin.orders.changeStatus.errors.forbidden')
      case 404:
        return t('admin.orders.changeStatus.errors.notFound')
      case 409:
        return t('admin.orders.changeStatus.errors.conflict')
      case 500:
        return t('admin.orders.changeStatus.errors.server')
      default:
        return t('admin.orders.changeStatus.error')
    }
  }

  return t('admin.orders.changeStatus.error')
}

export function ChangeOrderStatusDialog({
  open,
  orderId,
  orderNumber,
  currentStatus,
  onClose,
  onUpdated,
}: ChangeOrderStatusDialogProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const selectId = useId()
  const [nextStatus, setNextStatus] = useState<AdminOrderStatus | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setNextStatus('')
      setError(null)
      setSubmitting(false)
      return
    }
    setNextStatus('')
    setError(null)
  }, [open, orderId, currentStatus])

  const handleClose = () => {
    if (submitting) return
    setNextStatus('')
    setError(null)
    onClose()
  }

  const canSubmit =
    Boolean(orderId) &&
    Boolean(nextStatus) &&
    nextStatus !== currentStatus &&
    !submitting

  const handleConfirm = async () => {
    if (!orderId || !nextStatus || nextStatus === currentStatus) return
    setSubmitting(true)
    setError(null)
    try {
      await updateAdminOrderStatus(orderId, nextStatus)
      toast.success(t('admin.orders.changeStatus.success'))
      setNextStatus('')
      setError(null)
      onUpdated()
      onClose()
    } catch (err) {
      setError(resolveStatusError(err, t))
    } finally {
      setSubmitting(false)
    }
  }

  const currentLabel = currentStatus
    ? t(`admin.orders.orderStatus.${currentStatus}`)
    : '—'

  return (
    <Dialog
      open={open}
      title={t('admin.orders.changeStatus.title')}
      description={
        orderNumber
          ? t('admin.orders.changeStatus.description', { id: orderNumber })
          : t('admin.orders.changeStatus.descriptionFallback')
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
            disabled={!canSubmit}
            onClick={() => void handleConfirm()}
            className="border-accent/40 text-accent hover:bg-accent/10"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : null}
            {submitting
              ? t('admin.orders.changeStatus.confirming')
              : t('admin.orders.changeStatus.confirm')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border-subtle bg-surface-muted p-4">
          <p className="text-xs text-secondary-text">
            {t('admin.orders.changeStatus.currentStatus')}
          </p>
          <div className="mt-2">
            {currentStatus ? (
              <StatusBadge tone={orderStatusBadgeTone(currentStatus)}>
                {currentLabel}
              </StatusBadge>
            ) : (
              <span className="text-sm text-secondary-text">—</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-secondary-text" htmlFor={selectId}>
            {t('admin.orders.changeStatus.newStatus')}
          </label>
          <Select
            id={selectId}
            value={nextStatus}
            disabled={submitting}
            onValueChange={(next) => {
              setNextStatus(next as AdminOrderStatus | '')
              setError(null)
            }}
            triggerClassName="mt-2"
            placeholder={t('admin.orders.changeStatus.selectStatus')}
            options={[
              { value: '', label: t('admin.orders.changeStatus.selectStatus') },
              ...ADMIN_ORDER_STATUSES.map((status) => ({
                value: status,
                disabled: status === currentStatus,
                label:
                  status === currentStatus
                    ? `${t(`admin.orders.orderStatus.${status}`)} (${t('admin.orders.changeStatus.currentOption')})`
                    : t(`admin.orders.orderStatus.${status}`),
              })),
            ]}
          />
          <p className="mt-1 text-[8px] text-white/40">
            {t('admin.orders.changeStatus.hint')}
          </p>
        </div>

        {nextStatus && nextStatus !== currentStatus ? (
          <p
            className="rounded-xl border border-accent/25 bg-accent/10 p-3 text-sm leading-5 text-primary-text"
            role="note"
          >
            {t('admin.orders.changeStatus.confirmMessage', {
              from: currentLabel,
              to: t(`admin.orders.orderStatus.${nextStatus}`),
            })}
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-support-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Dialog>
  )
}
