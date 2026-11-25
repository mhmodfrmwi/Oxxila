import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ContentSectionPadding = 'default' | 'compact' | 'spacious'

/**
 * Section surface. Figma alternates some bands (e.g. PDP "Questions & Safety",
 * cart shipping strip) between the page background and the card surface.
 * - default: page background
 * - card:    card surface (white / #2f2d40 in dark)
 * - tinted:  soft brand tint over the page background
 */
export type ContentSectionTone = 'default' | 'card' | 'tinted'

const toneClasses: Record<ContentSectionTone, string> = {
  default: 'bg-background',
  card: 'bg-card',
  tinted: 'bg-[color-mix(in_srgb,var(--primary-button)_6%,var(--background))]',
}

const paddingClasses: Record<ContentSectionPadding, string> = {
  default: 'py-8 sm:py-10 lg:py-12',
  compact: 'py-6 sm:py-8 lg:py-10',
  spacious: 'py-10 sm:py-14 lg:py-20',
}

interface ContentSectionProps {
  children: ReactNode
  className?: string
  padding?: ContentSectionPadding
  tone?: ContentSectionTone
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

export function ContentSection({
  children,
  className,
  padding = 'default',
  tone = 'default',
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: ContentSectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(toneClasses[tone], paddingClasses[padding], className)}
    >
      <div className="container-content">{children}</div>
    </section>
  )
}
