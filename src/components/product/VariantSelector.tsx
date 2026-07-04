// src/components/product/VariantSelector.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'

interface VariantSelectorProps {
  label: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function VariantSelector({
  label,
  options,
  value,
  onChange,
  className,
}: VariantSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('product-detail-selector-section', className)}>
      <p className="product-detail-selector-label">{label}</p>
      <div
        className="product-detail-variant-options flex flex-wrap"
        role="group"
        aria-label={t('productDetail.optionsAria', { label })}
      >
        {options.map((option) => {
          const isSelected = option === value

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={isSelected}
              className={cn(
                'product-detail-variant-btn border transition-colors',
                focusRingClasses,
                isSelected
                  ? 'border-button-primary bg-button-primary text-on-emphasis'
                  : 'border-border-subtle bg-card text-primary-text hover:border-accent-muted',
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
