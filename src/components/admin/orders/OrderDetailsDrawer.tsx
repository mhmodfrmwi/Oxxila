// src/components/admin/orders/OrderDetailsDrawer.tsx
import {
  ChevronDown,
  FileText,
  RotateCcw,
  Truck,
  User,
  XCircle,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOrderAssign } from '../../../hooks/useOrderAssign'
import { useOrderDetailsDrawer } from '../../../hooks/useOrderDetailsDrawer'
import { cn } from '../../../lib/cn'
import type { ApiAdminOrderTrackingStep } from '../../../types/adminOrders'
import {
  canAdminCancelOrder,
  formatAdminOrderDateTime,
  formatAdminOrderMoney,
  formatOrderCustomerSubtitle,
} from '../../../utils/adminOrdersFormat'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { CancelOrderDialog } from './CancelOrderDialog'
import { OrderAssignPanel } from './OrderAssignPanel'

interface OrderDetailsDrawerProps {
  open: boolean
  orderId: string | null
  onClose: () => void
  /** Notifies the Orders list to reload after an assign or status update. */
  onOrderChanged?: () => void
}

function TimelineDot({ status }: { status: ApiAdminOrderTrackingStep['status'] }) {
  if (status === 'completed') {
    return (
      <span
        className="absolute start-0 top-1.5 size-2.5 -translate-x-1/2 rounded-full bg-[#00d492] shadow-[0_0_8px_rgba(52,211,153,0.8)] rtl:translate-x-1/2"
        aria-hidden
      />
    )
  }
  if (status === 'active') {
    return (
      <span
        className="absolute start-0 top-1.5 size-2.5 -translate-x-1/2 rounded-full bg-[#a394ff] shadow-[0_0_8px_rgba(163,148,255,0.8)] rtl:translate-x-1/2"
        aria-hidden
      />
    )
  }
  return (
    <span
      className="absolute start-0 top-1.5 size-2.5 -translate-x-1/2 rounded-full bg-white/10 rtl:translate-x-1/2"
      aria-hidden
    />
  )
}

function OrderDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <GlassCard className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-[20px]" padding="none">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </GlassCard>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-4 w-36" />
        <div className="space-y-8 ps-8">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
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

  const handleAssignSuccess = useCallback(() => {
    onOrderChanged?.()
  }, [onOrderChanged])

  const handleCancelled = useCallback(() => {
    setCancelOpen(false)
    reload()
    onOrderChanged?.()
  }, [onOrderChanged, reload])

  const canCancel = order ? canAdminCancelOrder(order.orderStatus) : false

  const title = order
    ? t('admin.orders.details.title', { id: order.orderNumber })
    : t('admin.orders.details.titleFallback')

  const footer =
    order && !loading && !error ? (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-white/40">{t('admin.orders.details.totalAmount')}</span>
          <span className="text-lg font-bold leading-7 text-[#a394ff]">
            {formatAdminOrderMoney(order.totalPrice, locale)}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            title={t('admin.orders.details.invoiceSoon')}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white',
              'cursor-not-allowed opacity-50',
              focusRingClasses,
            )}
          >
            <FileText size={13} aria-hidden />
            {t('admin.orders.details.invoice')}
          </button>
          <button
            type="button"
            disabled
            title={t('admin.orders.details.refundSoon')}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[rgba(255,100,103,0.2)] bg-[rgba(255,100,103,0.1)] px-4 py-3 text-sm font-medium text-[#ff6467]',
              'cursor-not-allowed opacity-50',
              focusRingClasses,
            )}
          >
            <RotateCcw size={13} aria-hidden />
            {t('admin.orders.details.refund')}
          </button>
          <button
            type="button"
            disabled={!canCancel}
            title={
              canCancel
                ? undefined
                : t('admin.orders.cancel.unavailable')
            }
            onClick={() => setCancelOpen(true)}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white',
              'transition-colors hover:bg-white/10',
              'disabled:cursor-not-allowed disabled:opacity-50',
              focusRingClasses,
            )}
          >
            <XCircle size={13} aria-hidden />
            {t('admin.orders.cancel.action')}
          </button>
        </div>
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
            className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-[20px]"
            padding="none"
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(163,148,255,0.2)] text-[#a394ff]">
                <User size={19} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-bold leading-6 text-white">
                  {order.customerName}
                </p>
                <p className="truncate text-xs leading-4 text-white/40">
                  {formatOrderCustomerSubtitle(order)}
                  {typeof order.userOrdersCount === 'number'
                    ? ` • ${t('admin.orders.details.ordersCount', {
                        count: order.userOrdersCount,
                      })}`
                    : ''}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[8px] uppercase leading-[12px] tracking-[-0.4px] text-white/30">
                  {t('admin.orders.details.payment')}
                </p>
                <p className="truncate text-sm font-medium leading-5 text-white">
                  {order.paymentSummary}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] uppercase leading-[12px] tracking-[-0.4px] text-white/30">
                  {t('admin.orders.details.contact')}
                </p>
                <p
                  className="truncate text-sm font-medium leading-5 text-white"
                  title={order.customerEmail ?? undefined}
                >
                  {order.customerEmail ?? '—'}
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="flex w-full flex-col gap-2">
            <label className="text-xs font-medium leading-4 text-white/60" htmlFor="order-shipping-method">
              {t('admin.orders.details.shipping')}
            </label>
            <div className="relative">
              <select
                id="order-shipping-method"
                disabled
                value={order.shippingMethodName}
                aria-label={t('admin.orders.details.shipping')}
                className={cn(
                  'w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-[13.6px] py-[10.4px] pe-10',
                  'text-sm text-white',
                  'cursor-not-allowed opacity-80',
                  focusRingClasses,
                )}
              >
                <option value={order.shippingMethodName}>{order.shippingMethodName}</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute end-[13.6px] top-1/2 -translate-y-1/2 text-white/50"
                aria-hidden
              />
            </div>
          </div>

          <section className="flex w-full flex-col gap-6" aria-labelledby="order-timeline-heading">
            <div className="flex items-center gap-2">
              <Truck size={13} className="text-[#a394ff]" aria-hidden />
              <h3 id="order-timeline-heading" className="text-sm font-bold leading-5 text-white">
                {t('admin.orders.details.timeline')}
              </h3>
            </div>

            {order.trackingSteps.length === 0 ? (
              <EmptyState
                bare
                className="py-6"
                title={t('admin.orders.details.timelineEmpty')}
              />
            ) : (
              <ol className="relative flex flex-col">
                <span
                  className="absolute bottom-2 start-0 top-2 w-0.5 -translate-x-1/2 bg-white/10 rtl:translate-x-1/2"
                  aria-hidden
                />
                {order.trackingSteps.map((step, index) => {
                  const isLast = index === order.trackingSteps.length - 1
                  const isPlaced = step.key === 'placed'
                  const showDate =
                    isPlaced &&
                    (step.status === 'completed' || step.status === 'active') &&
                    order.createdAt
                  const labelClass =
                    step.status === 'upcoming'
                      ? 'text-white/30'
                      : 'text-white'
                  const metaClass =
                    step.status === 'upcoming'
                      ? 'text-white/20'
                      : 'text-white/40'

                  return (
                    <li
                      key={step.key}
                      className={cn(
                        'relative flex flex-col ps-8',
                        !isLast && 'pb-8',
                      )}
                    >
                      <TimelineDot status={step.status} />
                      <p className={cn('text-sm font-semibold leading-5', labelClass)}>
                        {step.label}
                      </p>
                      {showDate ? (
                        <p className={cn('text-xs leading-4', metaClass)}>
                          {formatAdminOrderDateTime(order.createdAt, locale)}
                        </p>
                      ) : null}
                    </li>
                  )
                })}
              </ol>
            )}
          </section>

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
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-[13.6px]"
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

          <GlassCard
            className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-[20px]"
            padding="none"
          >
            <OrderAssignPanel
              assign={assign}
              hasAssignedCarrier={order.hasAssignedCarrier}
              carrierType={order.carrierType}
              onSuccess={handleAssignSuccess}
            />
          </GlassCard>
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
