// src/components/order/OrderShippingInfoCard.tsx
import { MapPin } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { ApiOrder } from '../../types/order'
import { formatEstimatedDeliveryArrival } from '../../utils/orderDelivery'
import {
  formatEstimatedDeliveryRange,
  formatOrderShippingAddressLines,
} from '../../utils/orderFormat'

interface OrderShippingInfoCardProps {
  order: ApiOrder
  recipientName: string
  phone?: string
  className?: string
}

export function OrderShippingInfoCard({
  order,
  recipientName,
  phone,
  className,
}: OrderShippingInfoCardProps) {
  const addressLines = formatOrderShippingAddressLines(order)

  return (
    <section className={cn('track-order-shipping-card', className)} aria-label="Shipping information">
      <div className="track-order-shipping-card-header">
        <MapPin size={18} strokeWidth={1.75} aria-hidden />
        <h2>Shipping Information</h2>
      </div>

      <p className="order-confirmation-section-label">Shipping To</p>
      <p className="order-confirmation-recipient">{recipientName}</p>
      <div className="order-confirmation-address">
        {addressLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {phone && <p className="mt-2">{phone}</p>}
      </div>

      <div className="order-confirmation-divider" />

      <dl className="order-confirmation-details-list">
        <div className="order-confirmation-details-row">
          <dt>Estimated Delivery</dt>
          <dd>{formatEstimatedDeliveryArrival(order)}</dd>
        </div>
        <div className="order-confirmation-details-row">
          <dt>Shipping Method</dt>
          <dd>{order.shipping.methodName || 'Standard Shipping'}</dd>
        </div>
        <div className="order-confirmation-details-row">
          <dt>Delivery Window</dt>
          <dd>{formatEstimatedDeliveryRange(order)}</dd>
        </div>
      </dl>
    </section>
  )
}
