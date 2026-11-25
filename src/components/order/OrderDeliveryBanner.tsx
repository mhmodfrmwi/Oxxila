// src/components/order/OrderDeliveryBanner.tsx
import { Ban, CalendarDays, CheckCircle2, PackageCheck, TriangleAlert, Undo2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDeliveryNote } from '../../hooks/useDeliveryNote'
import { cn } from '../../lib/cn'
import type { ApiOrder } from '../../types/order'
import {
  formatEstimatedDeliveryArrival,
  hasOrderDeliveryEstimate,
} from '../../utils/orderDelivery'
import { formatOrderDate, getOrderTrackingNumber } from '../../utils/orderFormat'
import { getTrackBanner, type TrackBannerTone } from '../../utils/orderTracking'

interface OrderDeliveryBannerProps {
  order: ApiOrder
  className?: string
}

const TONE_ICON: Record<TrackBannerTone, typeof CalendarDays> = {
  info: CalendarDays,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: Ban,
  muted: Undo2,
}

/**
 * Status banner under the stepper (Figma "Your order is on its way!"). Its content changes with
 * the order status: general delivery window while we prepare it, carrier ETA + tracking number
 * once shipped, delivery date + return window after delivery, and so on.
 */
export function OrderDeliveryBanner({ order, className }: OrderDeliveryBannerProps) {
  const { t, i18n } = useTranslation()
  const deliveryNote = useDeliveryNote()
  const banner = getTrackBanner(order)
  const trackingNumber = banner.showTracking ? getOrderTrackingNumber(order) : null
  const hasEstimate = hasOrderDeliveryEstimate(order)
  const estimatedArrival = hasEstimate ? formatEstimatedDeliveryArrival(order) : null

  const date = (value?: string | null) => (value ? formatOrderDate(value, i18n.language) : '')

  let subtitle = ''
  switch (banner.key) {
    case 'received':
    case 'preparing':
      subtitle = deliveryNote || t('checkout.confirmation.deliveryDefault')
      break
    case 'onItsWay':
      subtitle = estimatedArrival
        ? t('checkout.track.estimatedDelivery', { date: estimatedArrival })
        : deliveryNote || t('checkout.track.banner.onItsWay.subtitle')
      break
    case 'failedAttempt':
      subtitle = t('checkout.track.banner.failedAttempt.subtitle')
      break
    case 'delivered':
      subtitle = order.deliveredAt
        ? t('checkout.track.banner.delivered.subtitle', { date: date(order.deliveredAt) })
        : t('checkout.track.banner.delivered.subtitleNoDate')
      if (order.canReturn && order.returnWindowEndsAt) {
        subtitle += ` ${t('checkout.track.banner.delivered.returnUntil', { date: date(order.returnWindowEndsAt) })}`
      }
      break
    case 'returned':
      subtitle = t('checkout.track.banner.returned.subtitle')
      break
    case 'cancelled':
      subtitle = order.cancelledAt
        ? t('checkout.track.banner.cancelled.subtitle', { date: date(order.cancelledAt) })
        : t('checkout.track.banner.cancelled.subtitleNoDate')
      break
  }

  const Icon = banner.key === 'received' || banner.key === 'preparing' ? PackageCheck : TONE_ICON[banner.tone]

  return (
    <div className={cn('track-order-delivery-banner', className)} data-tone={banner.tone}>
      <div className="track-order-delivery-banner-accent" aria-hidden />
      <div className="track-order-delivery-banner-content">
        <div className="track-order-delivery-banner-left">
          <Icon size={20} strokeWidth={1.75} aria-hidden />
          <div>
            <p className="track-order-delivery-banner-title">
              {t(`checkout.track.banner.${banner.key}.title`)}
            </p>
            {subtitle && <p className="track-order-delivery-banner-subtitle">{subtitle}</p>}
          </div>
        </div>
        {trackingNumber && (
          <div className="track-order-delivery-banner-right">
            <p className="track-order-delivery-banner-tracking-label">
              {t('checkout.track.trackingNumber')}
            </p>
            <p className="track-order-delivery-banner-tracking-value" dir="ltr">
              {trackingNumber}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
