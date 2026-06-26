import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ContentSectionPadding = 'default' | 'compact' | 'spacious'

const paddingClasses: Record<ContentSectionPadding, string> = {
  default: 'py-8 sm:py-10 lg:py-12',
  compact: 'py-6 sm:py-8 lg:py-10',
  spacious: 'py-10 sm:py-14 lg:py-20',
}

interface ContentSectionProps {
  children: ReactNode
  className?: string
  padding?: ContentSectionPadding
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

export function ContentSection({
  children,
  className,
  padding = 'default',
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: ContentSectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn('bg-background', paddingClasses[padding], className)}
    >
      <div className="container-content">{children}</div>
    </section>
  )
}
