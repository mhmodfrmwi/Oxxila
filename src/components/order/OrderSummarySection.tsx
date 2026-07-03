// src/components/order/OrderSummarySection.tsx
import { Info } from 'lucide-react'
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
  totalLabel = 'Total',
  footerNote,
  className,
}: OrderSummarySectionProps) {
  const summary = getOrderSummaryProps(order)

  return (
    <section className={className} aria-label="Order summary">
      <OrderSummaryCard
        cart={summary.cart}
        mode="confirmation"
        title="Order Summary"
        shippingAmount={summary.shippingAmount}
        shippingCompareAt={summary.shippingCompareAt}
        totalCompareAt={summary.totalCompareAt}
        totalLabel={totalLabel}
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
