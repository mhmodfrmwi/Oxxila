// src/components/admin/orders/RefundOrderDialog.tsx
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { refundAdminOrder } from '../../../api/admin/orders'
import { useToast } from '../../../context/ToastContext'
import { ApiError } from '../../../lib/api'
import type { AdminOrderDetail } from '../../../types/adminOrders'
import {
  formatAdminOrderMoney,
  orderStatusBadgeTone,
  paymentStatusBadgeTone,
} from '../../../utils/adminOrdersFormat'
import { Button } from '../../ui/Button'
import { Dialog } from '../ui/Dialog'
import { StatusBadge } from '../ui/StatusBadge'

interface RefundOrderDialogProps {
  open: boolean
  order: AdminOrderDetail | null
  onClose: () => void
  onRefunded: () => void
}

function resolveRefundErrorMessage(
  error: unknown,
  t: (key: string) => string,
): string {
  if (error instanceof ApiError) {
    const backendMessage = error.message?.trim()
    if (backendMessage) return backendMessage

    switch (error.statusCode) {
      case 400:
        return t('admin.orders.refund.errors.badRequest')
      case 401:
        return t('admin.orders.refund.errors.unauthorized')
      case 403:
        return t('admin.orders.refund.errors.forbidden')
      case 404:
        return t('admin.orders.refund.errors.notFound')
      case 409:
        return t('admin.orders.refund.errors.conflict')
      case 500:
        return t('admin.orders.refund.errors.server')
      default:
        return t('admin.orders.refund.error')
    }
  }

  return t('admin.orders.refund.error')
}

export function RefundOrderDialog({
  open,
  order,
  onClose,
  onRefunded,
}: RefundOrderDialogProps) {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (submitting) return
    setError(null)
    onClose()
  }

  const handleConfirm = async () => {
    if (!order || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await refundAdminOrder(order.id)
      toast.success(t('admin.orders.refund.success'))
      setError(null)
      onRefunded()
      onClose()
    } catch (err) {
      setError(resolveRefundErrorMessage(err, t))
    } finally {
      setSubmitting(false)
    }
  }

  const totalLabel = order
    ? formatAdminOrderMoney(order.totalPrice, i18n.language)
    : '—'

  return (
    <Dialog
      open={open}
      title={t('admin.orders.refund.title')}
      description={
        order
          ? t('admin.orders.refund.description', { id: order.orderNumber })
          : t('admin.orders.refund.descriptionFallback')
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
            {t('actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting || !order}
            onClick={() => void handleConfirm()}
            className="border-support-error/40 text-support-error hover:bg-support-error/10"
          >
            {submitting ? (
              <Loader2 size={13} className="animate-spin" aria-hidden />
            ) : null}
            {submitting
              ? t('admin.orders.refund.confirming')
              : t('admin.orders.refund.confirm')}
          </Button>
        </div>
      }
    >
      {order ? (
        <div className="flex flex-col gap-4">
          <dl className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/40">
                {t('admin.orders.refund.orderNumber')}
              </dt>
              <dd className="mt-1 truncate text-sm font-medium text-white">
                {order.orderNumber}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/40">
                {t('admin.orders.refund.orderTotal')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#a394ff]">
                {totalLabel}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/40">
                {t('admin.orders.refund.paymentMethod')}
              </dt>
              <dd className="mt-1 truncate text-sm text-white/80">
                {order.paymentSummary}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/40">
                {t('admin.orders.refund.paymentStatus')}
              </dt>
              <dd className="mt-1">
                <StatusBadge tone={paymentStatusBadgeTone(order.paymentStatus)}>
                  {order.paymentStatusLabel || order.paymentStatus}
                </StatusBadge>
              </dd>
            </div>
            <div className="min-w-0 sm:col-span-2">
              <dt className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/40">
                {t('admin.orders.refund.currentStatus')}
              </dt>
              <dd className="mt-1">
                <StatusBadge tone={orderStatusBadgeTone(order.orderStatus)}>
                  {order.orderStatusLabel || order.orderStatus}
                </StatusBadge>
              </dd>
            </div>
          </dl>

          <p
            className="rounded-xl border border-support-error/25 bg-support-error/10 p-3 text-sm leading-5 text-support-error"
            role="note"
          >
            {t('admin.orders.refund.warning', { amount: totalLabel })}
          </p>

          <p className="text-sm leading-5 text-white/70">
            {t('admin.orders.refund.confirmMessage')}
          </p>

          {error ? (
            <div className="space-y-2" role="alert">
              <p className="text-sm text-support-error">{error}</p>
              <p className="text-xs text-white/40">
                {t('admin.orders.refund.retryHint')}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </Dialog>
  )
}
