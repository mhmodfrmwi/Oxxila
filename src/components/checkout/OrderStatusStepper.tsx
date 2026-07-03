// src/components/checkout/OrderStatusStepper.tsx
import { Check, Home, Package, Truck, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { ApiOrder } from '../../types/order'
import {
  getOrderStatusDisplaySteps,
  getTrackOrderStatusSteps,
  type StepperIconKey,
} from '../../utils/orderTracking'

const STEP_ICONS: Record<StepperIconKey, LucideIcon> = {
  approved: Check,
  confirmed: Check,
  processing: Truck,
  shipping: Package,
  delivery: Home,
}

interface OrderStatusStepperProps {
  order: ApiOrder
  className?: string
  title?: string
  variant?: 'confirmation' | 'track'
  showTitle?: boolean
}

export function OrderStatusStepper({
  order,
  className,
  title = 'Order Status',
  variant = 'confirmation',
  showTitle = true,
}: OrderStatusStepperProps) {
  const steps =
    variant === 'track' ? getTrackOrderStatusSteps(order) : getOrderStatusDisplaySteps(order)

  return (
    <section
      id="order-status"
      className={cn(
        'order-confirmation-status',
        variant === 'track' && 'track-order-status',
        className,
      )}
      aria-label={title}
    >
      {showTitle && <h2 className="order-confirmation-status-title">{title}</h2>}
      <ol className="order-confirmation-status-track">
        {steps.map((step) => {
          const Icon = STEP_ICONS[step.iconKey]
          const isComplete = step.status === 'completed'
          const isActive = step.status === 'active'
          const showCheck = isComplete && (step.iconKey === 'approved' || step.iconKey === 'confirmed')

          return (
            <li
              key={step.key}
              className={cn(
                'order-confirmation-status-step',
                isComplete && 'order-confirmation-status-step--complete',
                isActive && 'order-confirmation-status-step--active',
                !isComplete && !isActive && 'order-confirmation-status-step--upcoming',
              )}
            >
              <span className="order-confirmation-status-node" aria-hidden>
                {showCheck ? <Check size={14} strokeWidth={2.5} /> : <Icon size={16} strokeWidth={1.75} />}
              </span>
              <span className="order-confirmation-status-label">{step.label}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
