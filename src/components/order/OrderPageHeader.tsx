// src/components/order/OrderPageHeader.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import type { ApiOrder } from '../../types/order'
import { formatOrderDate, formatOrderReferenceId } from '../../utils/orderFormat'

interface OrderPageHeaderProps {
  order: ApiOrder
  className?: string
}

export function OrderPageHeader({ order, className }: OrderPageHeaderProps) {
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
    </header>
  )
}
