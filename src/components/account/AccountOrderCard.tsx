// src/components/account/AccountOrderCard.tsx
import { Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  RETURNS_HISTORY_PATH,
  RETURNS_PATH,
  trackOrderPath,
} from '../../config/routes'
import { cn } from '../../lib/cn'
import type { ApiOrder } from '../../types/order'
import { formatCartPrice } from '../../utils/formatProductPrice'
import {
  canCancelOrder,
  formatOrderDate,
  formatOrderReferenceId,
  formatOrderShippingAddressSummary,
  getOrderItemCount,
  orderStatusBadgeTone,
  paymentStatusBadgeTone,
  type OrderStatusBadgeTone,
} from '../../utils/orderFormat'
import type { AccountOrderAnnotations } from '../../hooks/useAccountOrders'
import { Button } from '../ui/Button'
import { focusRingClasses } from '../ui/interactionStyles'

const badgeToneClasses: Record<OrderStatusBadgeTone, string> = {
  success: 'bg-support-success/10 text-support-success',
  warning: 'bg-support-warning/15 text-support-warning',
  danger: 'bg-support-error/10 text-support-error',
  info: 'bg-support-info/15 text-support-info',
  neutral: 'bg-surface-muted text-secondary-text',
}

interface AccountOrderCardProps {
  order: ApiOrder
  annotations: AccountOrderAnnotations
  cancelling: boolean
  onCancel: (order: ApiOrder) => void
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-secondary-text">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-primary-text">{value}</dd>
    </div>
  )
}

function StatusChip({
  label,
  tone,
}: {
  label: string
  tone: OrderStatusBadgeTone
}) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full px-2.5 py-1',
        'text-[11px] font-semibold uppercase tracking-wide',
        badgeToneClasses[tone],
      )}
    >
      {label}
    </span>
  )
}

export function AccountOrderCard({
  order,
  annotations,
  cancelling,
  onCancel,
}: AccountOrderCardProps) {
  const { t, i18n } = useTranslation()
  const orderNumber = formatOrderReferenceId(order)
  const trackPath = trackOrderPath(order._id)
  const itemCount = getOrderItemCount(order)
  const canCancel = canCancelOrder(order)
  const { returnRequest, isReturnEligible } = annotations

  const paymentMethodLabel =
    order.paymentMethod === 'cod'
      ? t('checkout.payment.cod')
      : order.paymentProvider === 'paymob'
        ? t('checkout.payment.paymob')
        : order.paymentProvider === 'stripe'
          ? t('checkout.payment.stripe')
          : t('checkout.payment.card')

  return (
    <article className="rounded-2xl border border-border-subtle bg-card p-4 shadow-sm sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Package
              size={18}
              strokeWidth={1.5}
              className="shrink-0 text-secondary-text"
              aria-hidden
            />
            <h2 className="font-serif text-lg font-medium text-primary-text sm:text-xl">
              {t('profile.orders.orderNumber', { id: orderNumber })}
            </h2>
          </div>
          <p className="mt-1 text-sm text-secondary-text">
            {t('profile.orders.placedOn', {
              date: formatOrderDate(order.createdAt, i18n.language),
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusChip
            label={order.orderStatusLabel || order.orderStatus}
            tone={orderStatusBadgeTone(order.orderStatus)}
          />
          <StatusChip
            label={order.paymentStatusLabel || order.paymentStatus}
            tone={paymentStatusBadgeTone(order.paymentStatus)}
          />
          {returnRequest && (
            <StatusChip
              label={t('profile.orders.returnBadge')}
              tone="info"
            />
          )}
        </div>
      </header>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetaRow
          label={t('profile.orders.paymentMethod')}
          value={paymentMethodLabel}
        />
        <MetaRow
          label={t('profile.orders.total')}
          value={formatCartPrice(order.totalPrice)}
        />
        <MetaRow
          label={t('profile.orders.items')}
          value={t('profile.orders.itemCount', { count: itemCount })}
        />
        <MetaRow
          label={t('profile.orders.shippingAddress')}
          value={formatOrderShippingAddressSummary(order)}
        />
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to={trackPath}
          className={cn(
            'inline-flex min-h-11 items-center justify-center rounded-xl',
            'border-2 border-button-primary bg-card px-4 text-sm font-medium text-button-primary',
            'hover:bg-button-primary-hover/40',
            focusRingClasses,
          )}
        >
          {t('profile.orders.viewDetails')}
        </Link>

        <Link
          to={trackPath}
          className={cn(
            'inline-flex min-h-11 items-center justify-center rounded-xl',
            'bg-button-primary px-4 text-sm font-medium text-on-emphasis',
            'hover:bg-button-primary-hover',
            focusRingClasses,
          )}
        >
          {t('checkout.confirmation.trackOrder')}
        </Link>

        {canCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={cancelling}
            onClick={() => onCancel(order)}
          >
            {cancelling
              ? t('profile.orders.cancelling')
              : t('checkout.track.cancelOrder')}
          </Button>
        )}

        {returnRequest ? (
          <Link
            to={RETURNS_HISTORY_PATH}
            className={cn(
              'inline-flex min-h-11 items-center justify-center rounded-xl',
              'border border-border-subtle bg-surface-muted px-4 text-sm font-medium text-primary-text',
              'hover:bg-accent/10',
              focusRingClasses,
            )}
          >
            {t('profile.orders.viewReturn')}
          </Link>
        ) : isReturnEligible ? (
          <Link
            to={RETURNS_PATH}
            className={cn(
              'inline-flex min-h-11 items-center justify-center rounded-xl',
              'border border-border-subtle bg-surface-muted px-4 text-sm font-medium text-primary-text',
              'hover:bg-accent/10',
              focusRingClasses,
            )}
          >
            {t('profile.nav.requestReturn')}
          </Link>
        ) : null}
      </div>
    </article>
  )
}
