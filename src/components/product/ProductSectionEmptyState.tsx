// src/components/product/ProductSectionEmptyState.tsx
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'
import '../../styles/product-section-empty.css'

export interface ProductSectionEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'banner'
}

export function ProductSectionEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  variant = 'default',
}: ProductSectionEmptyStateProps) {
  return (
    <div
      className={cn('product-section-empty', className)}
      data-variant={variant}
      role="status"
    >
      <div className="product-section-empty-icon" aria-hidden>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <div className="product-section-empty-copy">
        <h3 className="product-section-empty-title">{title}</h3>
        <p className="product-section-empty-description">{description}</p>
        {actionLabel && onAction && (
          <Button
            type="button"
            variant="primary"
            pill
            className="product-section-empty-action"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
