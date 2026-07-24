// src/components/admin/ui/GlassCard.tsx
import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../../lib/cn'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  strong?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  /* Figma 25px × 0.8 */
  md: 'p-[var(--admin-card-pad-md)]',
  /* Figma 33px × 0.8 */
  lg: 'p-[var(--admin-card-pad-lg)]',
} as const

export function GlassCard({
  children,
  strong = false,
  padding = 'md',
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        strong ? 'admin-glass-strong' : 'admin-glass',
        'rounded-[var(--admin-radius-lg)]',
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
