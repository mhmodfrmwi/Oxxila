// src/components/order/OrderShippingInfoCard.tsx
import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import type { ApiOrder } from '../../types/order'
import {
  formatEstimatedDeliveryArrival,
  formatEstimatedDeliveryRange,
  getOrderShippingMethodLabel,
  hasOrderDeliveryEstimate,
} from '../../utils/orderDelivery'
import { formatOrderShippingAddressLines } from '../../utils/orderFormat'

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
  const { t } = useTranslation()
  const addressLines = formatOrderShippingAddressLines(order)
  const hasDeliveryEstimate = hasOrderDeliveryEstimate(order)
  const estimatedArrival = formatEstimatedDeliveryArrival(order)
  const deliveryWindow = formatEstimatedDeliveryRange(order)
  const shippingMethod = getOrderShippingMethodLabel(order, t('checkout.track.standardShipping'))

  return (
    <section
      className={cn('track-order-shipping-card', className)}
      aria-label={t('checkout.track.shippingInfo')}
    >
      <div className="track-order-shipping-card-header">
        <MapPin size={18} strokeWidth={1.75} aria-hidden />
        <h2>{t('checkout.track.shippingInfo')}</h2>
      </div>

      <p className="order-confirmation-section-label">{t('checkout.track.shippingTo')}</p>
      <p className="order-confirmation-recipient">{recipientName}</p>
      <div className="order-confirmation-address">
        {addressLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {phone && <p className="mt-2">{phone}</p>}
      </div>

      {hasDeliveryEstimate && (
        <>
          <div className="order-confirmation-divider" />

          <dl className="order-confirmation-details-list">
            {estimatedArrival && (
              <div className="order-confirmation-details-row">
                <dt>{t('checkout.delivery.estimatedDelivery')}</dt>
                <dd>{estimatedArrival}</dd>
              </div>
            )}
            <div className="order-confirmation-details-row">
              <dt>{t('checkout.track.shippingMethod')}</dt>
              <dd>{shippingMethod}</dd>
            </div>
            {deliveryWindow && (
              <div className="order-confirmation-details-row">
                <dt>{t('checkout.track.deliveryWindow')}</dt>
                <dd>{deliveryWindow}</dd>
              </div>
            )}
          </dl>
        </>
      )}
    </section>
  )
}
