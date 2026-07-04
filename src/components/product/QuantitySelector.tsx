// src/components/product/QuantitySelector.tsx
import { Minus, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: QuantitySelectorProps) {
  const { t } = useTranslation()

  function decrement() {
    onChange(Math.max(min, value - 1))
  }

  function increment() {
    onChange(Math.min(max, value + 1))
  }

  const controlClass = cn(
    'product-detail-qty-btn flex items-center justify-center text-primary-text transition-colors',
    'hover:bg-input disabled:pointer-events-none disabled:opacity-40',
    focusRingClasses,
  )

  return (
    <div
      className={cn(
        'product-detail-qty inline-flex items-center overflow-hidden border border-border-subtle bg-card',
        className,
      )}
    >
      <button
        type="button"
        aria-label={t('productDetail.decreaseQuantity')}
        disabled={value <= min}
        onClick={decrement}
        className={controlClass}
      >
        <Minus size={16} strokeWidth={1.5} aria-hidden />
      </button>
      <span
        className="product-detail-qty-value"
        aria-live="polite"
        aria-label={t('productDetail.quantityValue', { value })}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={t('productDetail.increaseQuantity')}
        disabled={value >= max}
        onClick={increment}
        className={controlClass}
      >
        <Plus size={16} strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  )
}
