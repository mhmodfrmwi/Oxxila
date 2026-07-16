// src/components/order/OrderSummarySection.tsx
import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ApiOrder } from '../../types/order'
import { getOrderSummaryProps } from '../../utils/orderFormat'
import { OrderSummaryCard } from '../cart/OrderSummaryCard'

const noopCoupon = async () => {}

interface OrderSummarySectionProps {
  order: ApiOrder
  totalLabel?: string
  footerNote?: string
  className?: string
}

export function OrderSummarySection({
  order,
  totalLabel,
  footerNote,
  className,
}: OrderSummarySectionProps) {
  const { t } = useTranslation()
  const summary = getOrderSummaryProps(order)
  const resolvedTotalLabel = totalLabel ?? t('cart.summary.total')

  return (
    <section className={className} aria-label={t('cart.summary.title')}>
      <OrderSummaryCard
        cart={summary.cart}
        mode="confirmation"
        title={t('cart.summary.title')}
        totalLabel={resolvedTotalLabel}
        shippingPrice={order.shippingPrice}
        onApplyCoupon={noopCoupon}
        onRemoveCoupon={noopCoupon}
        showPromo={false}
        showTrustBadges={false}
        showCta={false}
        className="!static"
      />
      {footerNote && (
        <p className="track-order-temperature-note">
          <Info size={14} strokeWidth={1.75} aria-hidden />
          <span>{footerNote}</span>
        </p>
      )}
    </section>
  )
}
