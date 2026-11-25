// src/components/ui/Pagination.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { focusRingClasses } from './interactionStyles'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('ellipsis')

  pages.push(total)
  return pages
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const { t } = useTranslation()
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  // Figma Pagination (V3) 413:19396 — Back / pages / Next
  const controlClass = cn(
    'inline-flex min-h-11 items-center justify-center rounded-extra-small bg-card px-2.5 py-2.5',
    'font-display text-extra-small leading-[1.2]',
    'transition-colors',
    'disabled:pointer-events-none disabled:opacity-40',
    focusRingClasses,
  )

  const pageButtonClass = (isActive: boolean) =>
    cn(
      'flex size-8 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-extra-small sm:size-8 sm:min-h-8 sm:min-w-8',
      'font-display text-extra-small leading-[1.2]',
      'transition-colors',
      focusRingClasses,
      isActive
        ? 'bg-button-primary text-card'
        : 'border border-background bg-card text-icon-primary hover:bg-surface-muted',
    )

  return (
    <nav
      aria-label={t('catalogBrowse.paginationAria')}
      className={cn(
        'flex flex-wrap items-center justify-center gap-2 pb-8 sm:gap-[15px]',
        className,
      )}
    >
      <button
        type="button"
        className={cn(controlClass, 'text-helper-text hover:text-primary-text')}
        disabled={!canGoPrev}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label={t('catalogBrowse.back')}
      >
        {t('catalogBrowse.back')}
      </button>

      <div className="flex max-w-full flex-wrap items-center justify-center gap-[5px]">
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex size-8 min-h-11 min-w-11 items-center justify-center rounded-extra-small bg-card font-display text-extra-small text-icon-primary sm:min-h-8 sm:min-w-8"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={pageButtonClass(page === currentPage)}
              onClick={() => onPageChange(page)}
              aria-label={t('catalogBrowse.page', { number: page })}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        className={cn(controlClass, 'text-button-primary hover:text-button-primary/80')}
        disabled={!canGoNext}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label={t('catalogBrowse.next')}
      >
        {t('catalogBrowse.next')}
      </button>
    </nav>
  )
}
