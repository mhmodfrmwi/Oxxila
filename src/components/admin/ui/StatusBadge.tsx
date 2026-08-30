// src/components/admin/ui/StatusBadge.tsx
import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../../lib/cn'

export type StatusBadgeTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'accent'

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  tone?: StatusBadgeTone
}

const toneClasses: Record<StatusBadgeTone, string> = {
  success: 'bg-support-success/10 text-support-success',
  warning: 'bg-support-warning/15 text-support-warning',
  danger: 'bg-support-error/10 text-support-error',
  info: 'bg-support-info/15 text-support-info',
  neutral: 'bg-white/5 text-secondary-text',
  accent: 'bg-[rgba(163,148,255,0.1)] text-[#a394ff]',
}

/**
 * Compact Figma overlay badge — ~10px bold, tight pad, soft rectangle (not a full pill).
 * Call sites may still override tone/size via className.
 */
export function StatusBadge({
  children,
  tone = 'neutral',
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-md',
        'px-2.5 py-1 text-[10px] leading-none font-bold tracking-[0.04em] uppercase',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
