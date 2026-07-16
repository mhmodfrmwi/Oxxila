// src/components/returns/ReturnHistoryCard.tsx
import { Truck } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ReturnRequest } from '../../api/returns'
import { cn } from '../../lib/cn'
import {
  formatReturnDate,
  formatReturnRefund,
  formatReturnRequestId,
  getReturnLogisticsLabel,
  getReturnOrderId,
  getReturnTrackingNumber,
  getReturnTrackingStatusLabel,
} from '../../utils/returnTracking'
import { ReturnTimeline } from './ReturnTimeline'

interface ReturnHistoryCardProps {
  returnRequest: ReturnRequest
}

function shortOrderCode(orderId: string) {
  return `OX-${orderId.slice(-5).toUpperCase()}`
}

function ReturnHistoryCardComponent({ returnRequest }: ReturnHistoryCardProps) {
  const { t, i18n } = useTranslation()
  const logistics = getReturnLogisticsLabel(returnRequest)
  const trackingNumber = getReturnTrackingNumber(returnRequest)
  const trackingStatus =
    getReturnTrackingStatusLabel(returnRequest) ||
    (trackingNumber ? t('returnsHistory.pickupRequested') : null)

  const logisticsDisplay =
    logistics ??
    (returnRequest.refundStatus === 'pending'
      ? t('returnsHistory.status.pending')
      : t('returnsHistory.logisticsPending'))

  return (
    <article className="returns-history-card">
      <div className="returns-history-card-body">
        <header className="returns-history-card-header">
          <div>
            <p className="returns-history-req-id">
              {formatReturnRequestId(returnRequest._id)}
            </p>
            <p className="returns-history-req-date">
              {formatReturnDate(returnRequest.createdAt, i18n.language)}
            </p>
            <p className="sr-only">
              {t('returnsHistory.orderRef', {
                order: shortOrderCode(getReturnOrderId(returnRequest)),
              })}
            </p>
          </div>
          <span
            className={cn(
              'returns-history-badge',
              `returns-history-badge--${returnRequest.refundStatus}`,
            )}
          >
            {t(`returnsHistory.status.${returnRequest.refundStatus}`)}
          </span>
        </header>

        <ReturnTimeline refundStatus={returnRequest.refundStatus} />

        <ul className="returns-history-tags">
          {returnRequest.items.map((item) => (
            <li key={item.orderItemId} className="returns-history-tag">
              {item.name}
              {item.variant ? ` · ${item.variant}` : ''} ×{item.quantity}
            </li>
          ))}
        </ul>

        <dl className="returns-history-meta">
          <div className="returns-history-meta-item">
            <dt className="returns-history-meta-label">{t('returnsHistory.reason')}</dt>
            <dd className="returns-history-meta-value">
              {t(`returns.reasons.${returnRequest.reason}`)}
            </dd>
          </div>
          <div className="returns-history-meta-item">
            <dt className="returns-history-meta-label">{t('returnsHistory.logistics')}</dt>
            <dd className="returns-history-meta-value">{logisticsDisplay}</dd>
          </div>
          <div className="returns-history-meta-item">
            <dt className="returns-history-meta-label">{t('returnsHistory.refund')}</dt>
            <dd className="returns-history-meta-value returns-history-meta-value--refund">
              {formatReturnRefund(returnRequest.refundAmount)}
            </dd>
          </div>
        </dl>
      </div>

      {trackingNumber && (
        <div className="returns-history-tracking">
          <span className="returns-history-tracking-left">
            <Truck size={16} strokeWidth={1.75} aria-hidden />
            <span>
              {t('returnsHistory.trackingLabel', {
                carrier: logistics ?? 'Bosta',
                number: trackingNumber,
              })}
            </span>
          </span>
          {trackingStatus && (
            <span className="returns-history-tracking-status">{trackingStatus}</span>
          )}
        </div>
      )}
    </article>
  )
}

export const ReturnHistoryCard = memo(ReturnHistoryCardComponent)
