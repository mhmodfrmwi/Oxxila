// src/components/admin/orders/OrderProgressStepper.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import type { AdminOrderStatus, ApiAdminOrderTrackingStep } from '../../../types/adminOrders'

const FIGMA_STEPS = [
  { key: 'placed', labelKey: 'orderPlaced' as const },
  { key: 'picked_up', labelKey: 'pickedUp' as const },
  { key: 'on_the_way', labelKey: 'onTheWay' as const },
  { key: 'delivered', labelKey: 'delivered' as const },
] as const

type StepVisual = 'completed' | 'active' | 'upcoming'

function statusToActiveIndex(status: AdminOrderStatus): number {
  switch (status) {
    case 'delivered':
      return 3
    case 'out_for_delivery':
    case 'failed_attempt':
      return 2
    case 'shipped':
    case 'processing':
      return 1
    case 'returned':
    case 'partially_returned':
    case 'cancelled':
      return 3
    case 'confirmed':
    case 'pending':
    default:
      return 0
  }
}

function resolveStepVisuals(
  trackingSteps: ApiAdminOrderTrackingStep[],
  orderStatus: AdminOrderStatus,
): StepVisual[] {
  if (trackingSteps.length >= 4) {
    return FIGMA_STEPS.map((_, index) => {
      const step = trackingSteps[index]
      if (!step) return 'upcoming'
      if (step.status === 'completed') return 'completed'
      if (step.status === 'active') return 'active'
      return 'upcoming'
    })
  }

  const activeIndex = statusToActiveIndex(orderStatus)
  return FIGMA_STEPS.map((_, index) => {
    if (index < activeIndex) return 'completed'
    if (index === activeIndex) return 'active'
    return 'upcoming'
  })
}

interface OrderProgressStepperProps {
  trackingSteps: ApiAdminOrderTrackingStep[]
  orderStatus: AdminOrderStatus
  className?: string
}

export function OrderProgressStepper({
  trackingSteps,
  orderStatus,
  className,
}: OrderProgressStepperProps) {
  const { t } = useTranslation()
  const visuals = resolveStepVisuals(trackingSteps, orderStatus)

  return (
    <ol
      className={cn('relative flex w-full items-start justify-between', className)}
      aria-label={t('admin.orders.details.progressAria')}
    >
      <span
        className="absolute start-4 end-4 top-4 h-0.5 bg-white/10"
        aria-hidden
      />
      {FIGMA_STEPS.map((step, index) => {
        const visual = visuals[index] ?? 'upcoming'
        const number = String(index + 1).padStart(2, '0')
        return (
          <li
            key={step.key}
            className="relative z-[1] flex w-[4.5rem] flex-col items-center gap-2 first:items-start last:items-end"
          >
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-xs font-semibold leading-4',
                visual === 'completed' &&
                  'bg-[#a394ff] text-white shadow-[0_0_12px_rgba(163,148,255,0.55)]',
                visual === 'active' &&
                  'border border-[#a394ff] bg-[rgba(163,148,255,0.2)] text-[#a394ff]',
                visual === 'upcoming' &&
                  'border border-white/15 bg-[#1a1c29] text-white/40',
              )}
            >
              {number}
            </span>
            <span
              className={cn(
                'text-center text-[8px] font-semibold uppercase leading-[15px] tracking-[0.04em]',
                visual === 'upcoming' ? 'text-white/30' : 'text-white/70',
                index === 0 && 'text-start',
                index === FIGMA_STEPS.length - 1 && 'text-end',
              )}
            >
              {t(`admin.orders.details.progress.${step.labelKey}`)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
