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
  /** Customers KPIs use blur 12 in Figma; Dashboard KPIs use blur 6. */
  strong?: boolean
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
  strong = false,
}: StatCardProps) {
  return (
    <GlassCard
      padding="none"
      strong={strong}
      className={cn(
        'flex min-h-[var(--admin-kpi-min-height)] flex-col gap-2 overflow-hidden p-[var(--admin-card-pad-md)]',
        className,
      )}
    >
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
