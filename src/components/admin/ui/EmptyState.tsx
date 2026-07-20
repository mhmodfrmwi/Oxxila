// src/components/admin/ui/EmptyState.tsx
import { type ReactNode } from 'react'
import { cn } from '../../../lib/cn'
import { GlassCard } from './GlassCard'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
  /** Skip GlassCard wrapper when nested inside another glass surface. */
  bare?: boolean
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
  bare = false,
}: EmptyStateProps) {
  const content = (
    <>
      {icon && (
        <div className="mb-1 text-secondary-text" aria-hidden>
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-primary-text">{title}</h3>
      {description && (
        <p className="max-w-md text-sm text-secondary-text">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </>
  )

  if (bare) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
          className,
        )}
        role="status"
      >
        {content}
      </div>
    )
  }

  return (
    <GlassCard
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className,
      )}
      role="status"
    >
      {content}
    </GlassCard>
  )
}
