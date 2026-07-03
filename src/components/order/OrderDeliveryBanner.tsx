// src/components/order/OrderDeliveryBanner.tsx
import { CalendarDays } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { ApiOrder } from '../../types/order'
import { formatEstimatedDeliveryArrival } from '../../utils/orderDelivery'
import { getOrderTrackingNumber } from '../../utils/orderFormat'

interface OrderDeliveryBannerProps {
  order: ApiOrder
  className?: string
}

export function OrderDeliveryBanner({ order, className }: OrderDeliveryBannerProps) {
  const trackingNumber = getOrderTrackingNumber(order)

  return (
    <div className={cn('track-order-delivery-banner', className)}>
      <div className="track-order-delivery-banner-accent" aria-hidden />
      <div className="track-order-delivery-banner-content">
        <div className="track-order-delivery-banner-left">
          <CalendarDays size={20} strokeWidth={1.75} aria-hidden />
          <div>
            <p className="track-order-delivery-banner-title">Your order is on its way!</p>
            <p className="track-order-delivery-banner-subtitle">
              Estimated delivery: {formatEstimatedDeliveryArrival(order)}
            </p>
          </div>
        </div>
        {trackingNumber && (
          <div className="track-order-delivery-banner-right">
            <p className="track-order-delivery-banner-tracking-label">Tracking Number</p>
            <p className="track-order-delivery-banner-tracking-value">{trackingNumber}</p>
          </div>
        )}
      </div>
    </div>
  )
}
