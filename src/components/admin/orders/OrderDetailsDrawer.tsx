// src/components/admin/orders/OrderDetailsDrawer.tsx
import { FileText, Loader2, User, XCircle } from 'lucide-react'
import { useCallback, useId, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../context/ToastContext'
import { useOrderAssign } from '../../../hooks/useOrderAssign'
import { useOrderDetailsDrawer } from '../../../hooks/useOrderDetailsDrawer'
import { cn } from '../../../lib/cn'
import {
  canAdminCancelOrder,
  formatAdminOrderAddress,
  formatAdminOrderCarrierLabel,
  formatAdminOrderDate,
  formatAdminOrderMoney,
  resolveOrderDetailsPhase,
  orderStatusBadgeTone,
} from '../../../utils/adminOrdersFormat'
import { printAdminOrderInvoice, type OrderInvoiceLabels } from '../../../utils/printAdminOrderInvoice'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Select } from '../ui/Select'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'
import { AuditMeta } from '../ui/AuditMeta'
import { CancelOrderDialog } from './CancelOrderDialog'
import { OrderAssignPanel } from './OrderAssignPanel'
import { OrderProgressStepper } from './OrderProgressStepper'

interface OrderDetailsDrawerProps {
  open: boolean
  orderId: string | null
  onClose: () => void
  /** Notifies the Orders list to reload after an assign or status update. */
  onOrderChanged?: () => void
}

const MANUAL_STATUSES = [
  'processing',
  'shipped',
  'out_for_delivery',
  'failed_attempt',
  'delivered',
  'returned',
  'cancelled',
] as const

function buildOrderInvoiceLabels(t: (key: string) => string): OrderInvoiceLabels {
  return {
    documentTitle: t('admin.orders.details.invoicePrint.documentTitle'),
    brand: t('admin.orders.details.invoicePrint.brand'),
    invoice: t('admin.orders.details.invoicePrint.invoice'),
    order: t('admin.orders.details.invoicePrint.order'),
    date: t('admin.orders.details.invoicePrint.date'),
    billTo: t('admin.orders.details.invoicePrint.billTo'),
    shipTo: t('admin.orders.details.invoicePrint.shipTo'),
    phone: t('admin.orders.details.invoicePrint.phone'),
    email: t('admin.orders.details.invoicePrint.email'),
    items: t('admin.orders.details.invoicePrint.items'),
    product: t('admin.orders.details.invoicePrint.product'),
    qty: t('admin.orders.details.invoicePrint.qty'),
    unitPrice: t('admin.orders.details.invoicePrint.unitPrice'),
    lineTotal: t('admin.orders.details.invoicePrint.lineTotal'),
    subtotal: t('admin.orders.details.invoicePrint.subtotal'),
    shipping: t('admin.orders.details.invoicePrint.shipping'),
    discount: t('admin.orders.details.invoicePrint.discount'),
    storeCredit: t('admin.orders.details.invoicePrint.storeCredit'),
    coupon: t('admin.orders.details.invoicePrint.coupon'),
    total: t('admin.orders.details.invoicePrint.total'),
    payment: t('admin.orders.details.invoicePrint.payment'),
    paymentStatus: t('admin.orders.details.invoicePrint.paymentStatus'),
    carrier: t('admin.orders.details.invoicePrint.carrier'),
    carrierNotSelected: t('admin.orders.details.invoicePrint.carrierNotSelected'),
    tracking: t('admin.orders.details.invoicePrint.tracking'),
    orderDetails: t('admin.orders.details.invoicePrint.orderDetails'),
    thankYou: t('admin.orders.details.invoicePrint.thankYou'),
    thankYouSub: t('admin.orders.details.invoicePrint.thankYouSub'),
    print: t('admin.orders.details.invoicePrint.print'),
    download: t('admin.orders.details.invoicePrint.download'),
    printFailed: t('admin.orders.details.invoicePrint.printFailed'),
    languageEnglish: t('admin.orders.details.invoicePrint.languageEnglish'),
    languageArabic: t('admin.orders.details.invoicePrint.languageArabic'),
  }
}

const fieldClass = cn(
  'w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-[17px] py-[13px]',
  'text-sm text-white placeholder:text-white/40',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

const labelClass = 'block text-xs font-medium leading-4 text-white/60'

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="text-sm leading-5 text-white">
      <span className="text-white/50">{label}: </span>
      {children}
    </p>
  )
}

function OrderDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <GlassCard className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-[25px]" padding="none">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
      </GlassCard>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-11 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  )
}

export function OrderDetailsDrawer({
  open,
  orderId,
  onClose,
  onOrderChanged,
}: OrderDetailsDrawerProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const toast = useToast()
  const trackingFormId = useId()
  const { order, loading, error, reload } = useOrderDetailsDrawer({ open, orderId })
  const [cancelOpen, setCancelOpen] = useState(false)

  const handleOrderUpdated = useCallback(() => {
    reload()
  }, [reload])

  const assign = useOrderAssign({
    open,
    orderId,
    onOrderUpdated: handleOrderUpdated,
  })

  const handleAssign = async () => {
    const ok = await assign.submitAssign()
    if (ok) {
      toast.success(t('admin.orders.details.assign.success'))
      onOrderChanged?.()
    }
  }

  const handleManualStatus = async () => {
    const ok = await assign.submitManualStatus()
    if (ok) {
      toast.success(t('admin.orders.details.manualStatus.success'))
      onOrderChanged?.()
    }
  }

  const handleCancelled = useCallback(() => {
    setCancelOpen(false)
    reload()
    onOrderChanged?.()
  }, [onOrderChanged, reload])

  const handlePrintInvoice = useCallback(() => {
    if (!order) return
    const opened = printAdminOrderInvoice(
      order,
      {
        en: buildOrderInvoiceLabels(i18n.getFixedT('en')),
        ar: buildOrderInvoiceLabels(i18n.getFixedT('ar')),
      },
      locale,
    )
    if (!opened) {
      toast.error(t('admin.orders.details.invoicePrint.printFailed'))
    }
  }, [i18n, locale, order, t, toast])

  const phase = order ? resolveOrderDetailsPhase(order) : null
  const canCancel = order ? canAdminCancelOrder(order.orderStatus) : false
  const statusLabel = order
    ? t(`admin.orders.orderStatus.${order.orderStatus}`, {
        defaultValue: order.orderStatusLabel,
      })
    : ''

  const title = order
    ? t('admin.orders.details.title', { id: order.orderNumber })
    : t('admin.orders.details.titleFallback')

  const primaryBusy =
    phase === 'assign' ? assign.submitting : assign.manualSubmitting

  const footer =
    order && !loading && !error ? (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-white/40">
            {t('admin.orders.details.totalAmount')}
          </span>
          <span className="text-lg font-bold leading-7 text-[#a394ff]">
            {formatAdminOrderMoney(order.totalPrice, locale)}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrintInvoice}
            title={t('admin.orders.details.invoicePrint.hint')}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white',
              'transition-colors hover:bg-white/10',
              focusRingClasses,
            )}
          >
            <FileText size={13} aria-hidden />
            {t('admin.orders.details.invoice')}
          </button>
          <button
            type="button"
            disabled={!canCancel || primaryBusy}
            title={canCancel ? undefined : t('admin.orders.cancel.unavailable')}
            onClick={() => setCancelOpen(true)}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[rgba(255,100,103,0.25)] bg-[rgba(255,100,103,0.1)] px-4 py-3 text-sm font-medium text-[#ff6467]',
              'transition-colors hover:bg-[rgba(255,100,103,0.18)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              focusRingClasses,
            )}
          >
            <XCircle size={13} aria-hidden />
            {t('admin.orders.cancel.action')}
          </button>
        </div>
        {phase === 'assign' ? (
          <button
            type="button"
            disabled={assign.submitting || assign.loading || Boolean(assign.loadError)}
            onClick={() => void handleAssign()}
            className={cn(
              'inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4',
              'bg-gradient-to-r from-[#a394ff] to-[#8274d6] text-sm font-bold text-white',
              'shadow-[0_8px_24px_rgba(163,148,255,0.28)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              focusRingClasses,
            )}
          >
            {assign.submitting ? (
              <>
                <Loader2 size={13} className="animate-spin" aria-hidden />
                {t('admin.orders.details.assign.submitting')}
              </>
            ) : (
              t('admin.orders.details.assign.submit')
            )}
          </button>
        ) : null}
        {phase === 'tracking' ? (
          <button
            type="button"
            disabled={assign.manualSubmitting}
            onClick={() => void handleManualStatus()}
            className={cn(
              'inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4',
              'bg-gradient-to-r from-[#a394ff] to-[#8274d6] text-sm font-bold text-white',
              'shadow-[0_8px_24px_rgba(163,148,255,0.28)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              focusRingClasses,
            )}
          >
            {assign.manualSubmitting ? (
              <>
                <Loader2 size={13} className="animate-spin" aria-hidden />
                {t('admin.orders.details.manualStatus.submitting')}
              </>
            ) : (
              t('admin.orders.details.manualStatus.submit')
            )}
          </button>
        ) : null}
      </div>
    ) : undefined

  return (
    <>
      <Drawer
        open={open}
        title={title}
        description={t('admin.orders.details.subtitle')}
        onClose={onClose}
        width="order"
        footer={footer}
      >
        {loading && !order ? <OrderDetailsSkeleton /> : null}

        {!loading && error ? (
          <EmptyState
            bare
            title={t('admin.orders.details.loadErrorTitle')}
            description={error}
            action={
              <Button type="button" variant="outline" onClick={reload}>
                {t('admin.orders.retry')}
              </Button>
            }
          />
        ) : null}

        {!loading && !error && !order ? (
          <EmptyState
            bare
            title={t('admin.orders.details.emptyTitle')}
            description={t('admin.orders.details.emptyDescription')}
          />
        ) : null}

        {order && !error ? (
          <div className={cn('flex flex-col gap-8', loading && 'opacity-60')}>
            <GlassCard
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-[25px]"
              padding="none"
            >
              <div className="flex items-center gap-4">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(163,148,255,0.2)] text-[#a394ff]">
                  <User size={19} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold leading-6 text-white">
                    {order.customerName}
                  </p>
                  <p className="truncate text-xs leading-4 text-white/40">
                    {typeof order.userOrdersCount === 'number'
                      ? t('admin.orders.details.ordersCount', {
                          count: order.userOrdersCount,
                        })
                      : t('admin.orders.details.customer')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm leading-6 text-white">
                    <span className="text-[8px] font-semibold uppercase tracking-[0.08em] text-white/40">
                      {t('admin.orders.details.orderLabel')}
                    </span>{' '}
                    <span className="font-semibold">{order.orderNumber}</span>
                  </p>
                  <StatusBadge tone={orderStatusBadgeTone(order.orderStatus)}>
                    {statusLabel}
                  </StatusBadge>
                </div>
                <DetailRow label={t('admin.orders.details.date')}>
                  <time dateTime={order.createdAt}>
                    {formatAdminOrderDate(order.createdAt, locale)}
                  </time>
                </DetailRow>
                <DetailRow label={t('admin.orders.details.customer')}>
                  {order.customerName}
                  {order.customerPhone ? (
                    <span className="text-white/50"> · {order.customerPhone}</span>
                  ) : null}
                  {!order.customerPhone && order.customerEmail ? (
                    <span className="text-white/50"> · {order.customerEmail}</span>
                  ) : null}
                </DetailRow>
                {order.customerEmail && order.customerPhone ? (
                  <DetailRow label={t('admin.orders.details.email')}>
                    {order.customerEmail}
                  </DetailRow>
                ) : null}
                <DetailRow label={t('admin.orders.details.address')}>
                  {formatAdminOrderAddress(order)}
                </DetailRow>
                <DetailRow label={t('admin.orders.details.carrier')}>
                  <span
                    className={
                      order.hasAssignedCarrier && order.carrierName
                        ? undefined
                        : 'text-white/45 italic'
                    }
                  >
                    {formatAdminOrderCarrierLabel(
                      order,
                      t('admin.orders.details.carrierNotSelected'),
                    )}
                  </span>
                </DetailRow>
                {order.trackingNumber ? (
                  <DetailRow label={t('admin.orders.details.tracking')}>
                    {order.trackingNumber}
                  </DetailRow>
                ) : null}
                <DetailRow label={t('admin.orders.details.payment')}>
                  {order.paymentSummary}
                  <span className="text-white/50"> · {order.paymentStatusLabel}</span>
                </DetailRow>
                <DetailRow label={t('admin.orders.details.total')}>
                  {formatAdminOrderMoney(order.totalPrice, locale)}
                  <span className="text-white/50">
                    {' '}
                    ·{' '}
                    {t('admin.orders.details.itemsCount', {
                      count: order.items.length,
                    })}
                  </span>
                </DetailRow>
              </div>
            </GlassCard>

            <AuditMeta audit={order.audit} />

            <OrderProgressStepper
              trackingSteps={order.trackingSteps}
              orderStatus={order.orderStatus}
            />

            {phase === 'assign' ? (
              <OrderAssignPanel assign={assign} orderStatusLabel={statusLabel} />
            ) : null}

            {phase === 'apiAssigned' ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelClass} htmlFor={`${trackingFormId}-carrier-ro`}>
                    {t('admin.orders.details.assign.carrier')}
                  </label>
                  <input
                    id={`${trackingFormId}-carrier-ro`}
                    type="text"
                    disabled
                    value={order.carrierName ?? order.shippingMethodName}
                    className={cn(fieldClass, 'mt-2')}
                  />
                </div>
                <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/50">
                  {t('admin.orders.details.manualStatus.bostaNote')}
                </p>
              </div>
            ) : null}

            {phase === 'tracking' ? (
              <div className="flex flex-col gap-4">
                {assign.manualError ? (
                  <p
                    className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
                    role="alert"
                  >
                    {assign.manualError}
                  </p>
                ) : null}
                <div>
                  <label className={labelClass} htmlFor={`${trackingFormId}-status`}>
                    {t('admin.orders.details.orderStatus')}
                  </label>
                  <Select
                    id={`${trackingFormId}-status`}
                    value={assign.manualStatus}
                    disabled={assign.manualSubmitting}
                    onValueChange={(next) =>
                      assign.setManualStatus(
                        next as (typeof MANUAL_STATUSES)[number],
                      )
                    }
                    triggerClassName="mt-2"
                    options={MANUAL_STATUSES.map((status) => ({
                      value: status,
                      label: t(`admin.orders.orderStatus.${status}`),
                    }))}
                  />
                </div>
              </div>
            ) : null}

            <section className="flex w-full flex-col gap-4" aria-labelledby="order-items-heading">
              <h3 id="order-items-heading" className="text-sm font-bold leading-5 text-white">
                {t('admin.orders.details.items')}
              </h3>

              {order.items.length === 0 ? (
                <EmptyState
                  bare
                  className="py-6"
                  title={t('admin.orders.details.itemsEmpty')}
                />
              ) : (
                <ul className="flex flex-col gap-3">
                  {order.items.map((item, index) => (
                    <li
                      key={`${item.product}-${index}`}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-[17px]"
                    >
                      <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-white/10 p-1">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="size-full rounded-lg object-cover"
                          />
                        ) : (
                          <div className="size-full rounded-lg bg-white/5" aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold leading-4 text-white">
                          {item.name}
                        </p>
                        <p className="text-[8px] leading-[12px] text-white/40">
                          {t('admin.orders.details.itemMeta', {
                            qty: item.quantity,
                            price: formatAdminOrderMoney(item.price, locale),
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </Drawer>

      <CancelOrderDialog
        key={order?.id ?? 'cancel-order'}
        open={cancelOpen}
        orderId={order?.id ?? null}
        orderNumber={order?.orderNumber ?? null}
        onClose={() => setCancelOpen(false)}
        onCancelled={handleCancelled}
      />
    </>
  )
}
