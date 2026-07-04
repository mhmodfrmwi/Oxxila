// src/components/order/OrderShippingInfoCard.tsx
import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const addressLines = formatOrderShippingAddressLines(order)

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

      <div className="order-confirmation-divider" />

      <dl className="order-confirmation-details-list">
        <div className="order-confirmation-details-row">
          <dt>{t('checkout.confirmation.estimatedDelivery')}</dt>
          <dd>{formatEstimatedDeliveryArrival(order)}</dd>
        </div>
        <div className="order-confirmation-details-row">
          <dt>{t('checkout.track.shippingMethod')}</dt>
          <dd>{order.shipping.methodName || t('checkout.track.standardShipping')}</dd>
        </div>
        <div className="order-confirmation-details-row">
          <dt>{t('checkout.track.deliveryWindow')}</dt>
          <dd>{formatEstimatedDeliveryRange(order)}</dd>
        </div>
      </dl>
    </section>
  )
}
