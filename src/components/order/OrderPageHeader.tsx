// src/components/order/OrderPageHeader.tsx
import { cn } from '../../lib/cn'
import type { ApiOrder } from '../../types/order'
import { formatOrderDate, formatOrderReferenceId } from '../../utils/orderFormat'

interface OrderPageHeaderProps {
  order: ApiOrder
  trackingNumber?: string | null
  className?: string
}

export function OrderPageHeader({ order, trackingNumber, className }: OrderPageHeaderProps) {
  return (
    <header className={cn('track-order-header', className)}>
      <div className="track-order-header-main">
        <h1 className="track-order-title">Order #{formatOrderReferenceId(order)}</h1>
        <p className="track-order-date">Placed on {formatOrderDate(order.createdAt)}</p>
      </div>

      <div className="track-order-header-meta">
        {trackingNumber && (
          <div className="track-order-header-meta-item">
            <span className="track-order-header-meta-label">Tracking Number</span>
            <span className="track-order-header-meta-value">{trackingNumber}</span>
          </div>
        )}
        <div className="track-order-header-meta-item">
          <span className="track-order-header-meta-label">Current Status</span>
          <span className="track-order-status-badge">{order.orderStatusLabel}</span>
        </div>
      </div>
    </header>
  )
}
