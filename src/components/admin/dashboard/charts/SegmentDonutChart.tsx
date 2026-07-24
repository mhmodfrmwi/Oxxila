// src/components/admin/dashboard/charts/SegmentDonutChart.tsx
import { cn } from '../../../../lib/cn'

interface SegmentDonutChartProps {
  returningPercent: number
  centerLabel: string
  className?: string
}

const SIZE = 153.6 // 192 × 0.8
const STROKE = 14.4 // 18 × 0.8
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function SegmentDonutChart({
  returningPercent,
  centerLabel,
  className,
}: SegmentDonutChartProps) {
  const clamped = Math.min(Math.max(returningPercent, 0), 100)
  const dash = (clamped / 100) * CIRCUMFERENCE

  return (
    <div
      className={cn('relative mx-auto size-48', className)}
      role="img"
      aria-label={`${Math.round(clamped)}% ${centerLabel}`}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
          className="drop-shadow-[0_0_12px_var(--admin-glow)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-3xl font-bold text-primary-text">{Math.round(clamped)}%</p>
        <p className="text-[8px] tracking-[0.1em] text-secondary-text uppercase">
          {centerLabel}
        </p>
      </div>
    </div>
  )
}
