// src/components/admin/ui/StatCard.tsx
import { type ReactNode } from 'react'
import { cn } from '../../../lib/cn'
import { GlassCard } from './GlassCard'

export type StatTrendTone = 'positive' | 'negative' | 'neutral'

interface StatCardProps {
  label: string
  value: ReactNode
  trend?: ReactNode
  trendTone?: StatTrendTone
  className?: string
}

const trendToneClasses: Record<StatTrendTone, string> = {
  positive: 'bg-support-success/10 text-support-success',
  negative: 'bg-support-error/10 text-support-error',
  neutral: 'bg-white/5 text-secondary-text',
}

export function StatCard({
  label,
  value,
  trend,
  trendTone = 'neutral',
  className,
}: StatCardProps) {
  return (
    <GlassCard className={cn('flex min-h-[9.5rem] flex-col gap-2 overflow-hidden', className)}>
      <p className="admin-label">{label}</p>
      <p className="text-2xl font-bold tabular-nums text-primary-text">{value}</p>
      {trend != null && (
        <div>
          <span
            className={cn(
              'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
              trendToneClasses[trendTone],
            )}
          >
            {trend}
          </span>
        </div>
      )}
    </GlassCard>
  )
}
