// src/components/checkout/PaymentMethodCard.tsx
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'

interface PaymentMethodCardProps {
  selected: boolean
  onSelect: () => void
  label: string
  /** Short helper line under the label (e.g. "Visa & Mastercard"). */
  hint?: string
  /** Drives the accent colour of the icon chip. */
  method?: 'stripe' | 'paymob' | 'cod'
  icon?: ReactNode
  className?: string
}

export function PaymentMethodCard({
  selected,
  onSelect,
  label,
  hint,
  method,
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
      data-method={method}
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
    >
      {icon ? (
        <span className="payment-method-card-icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className="payment-method-card-text">
        <span className="payment-method-card-label">{label}</span>
        {hint ? <span className="payment-method-card-hint">{hint}</span> : null}
      </span>
      <span className="payment-method-card-radio" aria-hidden />
    </button>
  )
}
