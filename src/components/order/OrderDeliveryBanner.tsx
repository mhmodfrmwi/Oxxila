// src/components/order/OrderDeliveryBanner.tsx
import { CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import type { ApiOrder } from '../../types/order'
import {
  formatEstimatedDeliveryArrival,
  hasOrderDeliveryEstimate,
} from '../../utils/orderDelivery'
import { getOrderTrackingNumber } from '../../utils/orderFormat'

interface OrderDeliveryBannerProps {
  order: ApiOrder
  className?: string
}

export function OrderDeliveryBanner({ order, className }: OrderDeliveryBannerProps) {
  const { t } = useTranslation()
  const trackingNumber = getOrderTrackingNumber(order)
  const estimatedArrival = formatEstimatedDeliveryArrival(order)

  if (!hasOrderDeliveryEstimate(order) || !estimatedArrival) {
    return null
  }

  return (
    <div className={cn('track-order-delivery-banner', className)}>
      <div className="track-order-delivery-banner-accent" aria-hidden />
      <div className="track-order-delivery-banner-content">
        <div className="track-order-delivery-banner-left">
          <CalendarDays size={20} strokeWidth={1.75} aria-hidden />
          <div>
            <p className="track-order-delivery-banner-title">{t('checkout.track.onItsWay')}</p>
            <p className="track-order-delivery-banner-subtitle">
              {t('checkout.track.estimatedDelivery', {
                date: estimatedArrival,
              })}
            </p>
          </div>
        </div>
        {trackingNumber && (
          <div className="track-order-delivery-banner-right">
            <p className="track-order-delivery-banner-tracking-label">
              {t('checkout.track.trackingNumber')}
            </p>
            <p className="track-order-delivery-banner-tracking-value">{trackingNumber}</p>
          </div>
        )}
      </div>
    </div>
  )
}
