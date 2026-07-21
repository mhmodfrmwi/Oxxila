// src/components/admin/shipping/ShipmentDetailsDrawer.tsx
import { ChevronDown, Package, Truck, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShipmentDetailsDrawer } from '../../../hooks/useShipmentDetailsDrawer'
import { cn } from '../../../lib/cn'
import type { ApiAdminOrderTrackingStep } from '../../../types/adminOrders'
import {
  formatAdminOrderDateTime,
} from '../../../utils/adminOrdersFormat'
import {
  formatShipmentCustomerSubtitle,
  shippingOrderStatusBadgeTone,
} from '../../../utils/adminShippingFormat'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'

interface ShipmentDetailsDrawerProps {
  open: boolean
  orderId: string | null
  onClose: () => void
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

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase leading-[15px] tracking-[-0.5px] text-white/30">
        {label}
      </p>
      <p className="truncate text-sm font-medium leading-5 text-white" title={value}>
        {value}
      </p>
    </div>
  )
}

function ShipmentDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <GlassCard
        className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-[25px]"
        padding="none"
      >
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
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
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
    </div>
  )
}

/**
 * Shipping Details drawer — read-only (Phase 6B).
 * No dedicated Figma details frame; follows Order Details drawer patterns.
 * Data: GET /api/v1/admin/shipping/orders/:id
 */
export function ShipmentDetailsDrawer({
  open,
  orderId,
  onClose,
}: ShipmentDetailsDrawerProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const { shipment, loading, error, reload } = useShipmentDetailsDrawer({
    open,
    orderId,
  })
  const unavailable = '—'

  const title = shipment
    ? t('admin.shipping.details.title', { id: shipment.orderNumber })
    : t('admin.shipping.details.titleFallback')

  const methodDisplay =
    shipment?.methodKind === 'in_house'
      ? t('admin.shipping.orders.methodInHouse')
      : shipment?.methodKind === 'courier' && shipment.carrierName
        ? t('admin.shipping.orders.methodCourier', {
            name: shipment.carrierName,
          })
        : shipment?.shippingMethodName || unavailable

  const footer =
    shipment && !loading && !error ? (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled
          title={t('admin.shipping.details.assignSoon')}
          className={cn(
            'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3',
            'text-sm font-medium text-white',
            'cursor-not-allowed opacity-50',
            focusRingClasses,
          )}
        >
          {t('admin.shipping.details.assign')}
        </button>
        <button
          type="button"
          disabled
          title={t('admin.shipping.details.updateStatusSoon')}
          className={cn(
            'w-full rounded-2xl bg-gradient-to-r from-[#a394ff] to-[#8274d6] px-4 pb-4 pt-5',
            'text-sm font-bold text-white',
            'cursor-not-allowed opacity-50',
            focusRingClasses,
          )}
        >
          {t('admin.shipping.details.updateStatus')}
        </button>
      </div>
    ) : undefined

  return (
    <Drawer
      open={open}
      title={title}
      description={t('admin.shipping.details.subtitle')}
      onClose={onClose}
      width="formula"
      footer={footer}
    >
      {loading && !shipment ? <ShipmentDetailsSkeleton /> : null}

      {!loading && error ? (
        <EmptyState
          bare
          title={t('admin.shipping.details.loadErrorTitle')}
          description={error}
          action={
            <Button type="button" variant="outline" onClick={reload}>
              {t('admin.shipping.retry')}
            </Button>
          }
        />
      ) : null}

      {!loading && !error && !shipment ? (
        <EmptyState
          bare
          title={t('admin.shipping.details.emptyTitle')}
          description={t('admin.shipping.details.emptyDescription')}
        />
      ) : null}

      {shipment && !error ? (
        <div className={cn('flex flex-col gap-8', loading && 'opacity-60')}>
          <GlassCard
            className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-[25px]"
            padding="none"
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(163,148,255,0.2)] text-[#a394ff]">
                <User size={24} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-bold leading-6 text-white">
                  {shipment.customerName}
                </p>
                <p className="truncate text-xs leading-4 text-white/40">
                  {formatShipmentCustomerSubtitle(shipment)}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <DetailField
                label={t('admin.shipping.details.order')}
                value={shipment.orderNumber}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase leading-[15px] tracking-[-0.5px] text-white/30">
                  {t('admin.shipping.details.orderStatus')}
                </p>
                <StatusBadge
                  tone={shippingOrderStatusBadgeTone(shipment.orderStatus)}
                  className="mt-1 border border-current/20 text-[9px] font-bold"
                >
                  {t(`admin.orders.orderStatus.${shipment.orderStatus}`, {
                    defaultValue: shipment.orderStatusLabel,
                  })}
                </StatusBadge>
              </div>
            </div>
          </GlassCard>

          <section
            className="flex w-full flex-col gap-4"
            aria-labelledby="shipment-info-heading"
          >
            <div className="flex items-center gap-2">
              <Package size={16} className="text-[#a394ff]" aria-hidden />
              <h3
                id="shipment-info-heading"
                className="text-sm font-bold leading-5 text-white"
              >
                {t('admin.shipping.details.shipmentInfo')}
              </h3>
            </div>
            <GlassCard
              className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-[17px]"
              padding="none"
            >
              <DetailField
                label={t('admin.shipping.details.courier')}
                value={shipment.carrierName ?? unavailable}
              />
              <div className="min-w-0">
                <p className="text-[10px] uppercase leading-[15px] tracking-[-0.5px] text-white/30">
                  {t('admin.shipping.details.shippingStatus')}
                </p>
                <p className="truncate text-sm font-medium leading-5 text-white">
                  {shipment.shipmentStatusLabel ?? unavailable}
                </p>
              </div>
              <DetailField
                label={t('admin.shipping.details.trackingNumber')}
                value={shipment.trackingNumber ?? unavailable}
              />
              {shipment.driverName ? (
                <DetailField
                  label={t('admin.shipping.details.driver')}
                  value={shipment.driverName}
                />
              ) : (
                <DetailField
                  label={t('admin.shipping.details.driver')}
                  value={unavailable}
                />
              )}
            </GlassCard>
          </section>

          <div className="flex w-full flex-col gap-2">
            <label
              className="text-xs font-medium leading-4 text-white/60"
              htmlFor="shipment-shipping-method"
            >
              {t('admin.shipping.details.shippingMethod')}
            </label>
            <div className="relative">
              <select
                id="shipment-shipping-method"
                disabled
                value={methodDisplay}
                aria-label={t('admin.shipping.details.shippingMethod')}
                className={cn(
                  'w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-[17px] py-[13px] pe-10',
                  'text-sm text-white',
                  'cursor-not-allowed opacity-80',
                  focusRingClasses,
                )}
              >
                <option value={methodDisplay}>{methodDisplay}</option>
              </select>
              <ChevronDown
                size={20}
                className="pointer-events-none absolute end-[17px] top-1/2 -translate-y-1/2 text-white/50"
                aria-hidden
              />
            </div>
          </div>

          <section
            className="flex w-full flex-col gap-6"
            aria-labelledby="shipment-timeline-heading"
          >
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-[#a394ff]" aria-hidden />
              <h3
                id="shipment-timeline-heading"
                className="text-sm font-bold leading-5 text-white"
              >
                {t('admin.shipping.details.timeline')}
              </h3>
            </div>

            {shipment.trackingSteps.length === 0 ? (
              <EmptyState
                bare
                className="py-6"
                title={t('admin.shipping.details.timelineEmpty')}
              />
            ) : (
              <ol className="relative flex flex-col">
                <span
                  className="absolute bottom-2 start-0 top-2 w-0.5 -translate-x-1/2 bg-white/10 rtl:translate-x-1/2"
                  aria-hidden
                />
                {shipment.trackingSteps.map((step, index) => {
                  const isLast = index === shipment.trackingSteps.length - 1
                  const isPlaced = step.key === 'placed'
                  const showDate =
                    isPlaced &&
                    (step.status === 'completed' || step.status === 'active') &&
                    shipment.createdAt
                  const labelClass =
                    step.status === 'upcoming' ? 'text-white/30' : 'text-white'
                  const metaClass =
                    step.status === 'upcoming' ? 'text-white/20' : 'text-white/40'

                  return (
                    <li
                      key={step.key}
                      className={cn('relative flex flex-col ps-8', !isLast && 'pb-8')}
                    >
                      <TimelineDot status={step.status} />
                      <p className={cn('text-sm font-semibold leading-5', labelClass)}>
                        {step.label}
                      </p>
                      {showDate ? (
                        <p className={cn('text-xs leading-4', metaClass)}>
                          {formatAdminOrderDateTime(shipment.createdAt, locale)}
                        </p>
                      ) : null}
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        </div>
      ) : null}
    </Drawer>
  )
}
