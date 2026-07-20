// src/components/admin/ui/Skeleton.tsx
import { cn } from '../../../lib/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--admin-radius-sm)] bg-white/10',
        className,
      )}
      aria-hidden
    />
  )
}

interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3 w-full', index === lines - 1 && lines > 1 && 'w-2/3')}
        />
      ))}
    </div>
  )
}
