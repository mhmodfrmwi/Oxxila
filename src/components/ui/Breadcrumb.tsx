import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { focusRingClasses } from './interactionStyles'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-secondary-text', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight size={14} className="shrink-0 text-secondary-text/70" aria-hidden />
              )}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className={cn(
                    'transition-colors hover:text-primary-text',
                    focusRingClasses,
                    'rounded-sm',
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast ? 'font-medium text-primary-text' : undefined)}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
