// src/components/checkout/PaymentMethodCard.tsx
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'

interface PaymentMethodCardProps {
  selected: boolean
  onSelect: () => void
  label: string
  className?: string
}

export function PaymentMethodCard({
  selected,
  onSelect,
  label,
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
      <span className="payment-method-card-label">{label}</span>
    </button>
  )
}
