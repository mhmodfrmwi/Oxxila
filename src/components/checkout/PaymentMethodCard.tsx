// src/components/checkout/PaymentMethodCard.tsx
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'

interface PaymentMethodCardProps {
  selected: boolean
  onSelect: () => void
  label: string
  icon?: ReactNode
  className?: string
}

export function PaymentMethodCard({
  selected,
  onSelect,
  label,
  icon,
  className,
}: PaymentMethodCardProps) {
  return (
    <button
      type="button"
      className={cn(
        'payment-method-card',
        selected && 'payment-method-card--selected',
        focusRingClasses,
        className,
      )}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="payment-method-card-radio" aria-hidden />
      {icon ? (
        <span className="payment-method-card-icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className="payment-method-card-label">{label}</span>
    </button>
  )
}
