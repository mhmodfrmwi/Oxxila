// src/components/ui/Breadcrumb.tsx
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  return (
    <nav aria-label={t('breadcrumb.aria')} className={cn('text-sm text-secondary-text', className)}>
      {/* One line on every screen: earlier crumbs keep their width, the current page truncates
          (a long product name used to wrap under the chevron on phones). */}
      <ol className="flex flex-nowrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li
              key={`${item.label}-${index}`}
              className={cn('flex items-center gap-2', isLast ? 'min-w-0 flex-1' : 'shrink-0')}
            >
              {index > 0 && (
                <ChevronRight
                  size={14}
                  className="shrink-0 text-secondary-text/70 rtl:rotate-180"
                  aria-hidden
                />
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
                  className={cn(isLast ? 'block min-w-0 truncate font-medium text-primary-text' : undefined)}
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
