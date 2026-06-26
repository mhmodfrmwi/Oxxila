import { type ReactNode } from 'react'
import { cn } from '../../../lib/cn'

interface FilterStandaloneSectionProps {
  title: string
  children: ReactNode
  className?: string
}

/** Standalone filter group (Sensitivity / Availability style in Figma) */
export function FilterStandaloneSection({ title, children, className }: FilterStandaloneSectionProps) {
  return (
    <section className={cn('space-y-3', className)}>
      <h3 className="filter-standalone-label">{title}</h3>
      {children}
    </section>
  )
}
