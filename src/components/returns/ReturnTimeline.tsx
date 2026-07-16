// src/components/returns/ReturnTimeline.tsx
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ReturnRefundStatus } from '../../api/returns'
import { cn } from '../../lib/cn'
import { getReturnTimelineStates } from '../../utils/returnTracking'

interface ReturnTimelineProps {
  refundStatus: ReturnRefundStatus
  className?: string
}

export function ReturnTimeline({ refundStatus, className }: ReturnTimelineProps) {
  const { t } = useTranslation()
  const steps = getReturnTimelineStates(refundStatus)

  return (
    <ol
      className={cn('returns-history-timeline', className)}
      aria-label={t('returnsHistory.timelineAria')}
    >
      {steps.map((step) => (
        <li
          key={step.id}
          className={cn(
            'returns-history-timeline-step',
            step.visual === 'completed' && 'returns-history-timeline-step--completed',
            step.visual === 'active' && 'returns-history-timeline-step--active',
          )}
          aria-current={step.visual === 'active' ? 'step' : undefined}
        >
          <span className="returns-history-timeline-node" aria-hidden>
            {step.visual === 'completed' ? (
              <Check size={14} strokeWidth={2.75} />
            ) : (
              step.indexLabel
            )}
          </span>
          <span className="returns-history-timeline-label">
            {t(`returnsHistory.timeline.${step.id}`)}
          </span>
        </li>
      ))}
    </ol>
  )
}
