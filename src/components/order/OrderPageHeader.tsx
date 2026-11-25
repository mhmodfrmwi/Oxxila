// src/components/order/OrderPageHeader.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import type { ApiOrder } from '../../types/order'
import { formatOrderDate, formatOrderReferenceId } from '../../utils/orderFormat'

interface OrderPageHeaderProps {
  order: ApiOrder
  trackingNumber?: string | null
  className?: string
}

export function OrderPageHeader({ order, trackingNumber, className }: OrderPageHeaderProps) {
  const { t, i18n } = useTranslation()

  return (
    <header className={cn('track-order-header', className)}>
      <div className="track-order-header-main">
        <h1 className="track-order-title">
          {t('checkout.track.orderHash', { id: formatOrderReferenceId(order) })}
        </h1>
        <p className="track-order-date">
          {t('checkout.track.placedOn', { date: formatOrderDate(order.createdAt, i18n.language) })}
        </p>
      </div>

      <div className="track-order-header-meta">
        {trackingNumber && (
          <div className="track-order-header-meta-item">
            <span className="track-order-header-meta-label">
              {t('checkout.track.trackingNumber')}
            </span>
            <span className="track-order-header-meta-value">{trackingNumber}</span>
          </div>
        )}
        <div className="track-order-header-meta-item">
          <span className="track-order-header-meta-label">
            {t('checkout.track.currentStatus')}
          </span>
          <span className="track-order-status-badge">{t(`checkout.track.status.${order.orderStatus}`, { defaultValue: order.orderStatusLabel })}</span>
        </div>
      </div>
    </header>
  )
}
