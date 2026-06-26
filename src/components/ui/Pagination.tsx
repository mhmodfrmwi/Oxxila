import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  const navButtonClass = cn(
    'inline-flex items-center gap-1 rounded-button px-3 py-2 text-sm text-secondary-text',
    'transition-colors hover:text-primary-text',
    'disabled:pointer-events-none disabled:opacity-40',
    focusRingClasses,
  )

  const pageButtonClass = (isActive: boolean) =>
    cn(
      'flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm transition-colors',
      focusRingClasses,
      isActive
        ? 'bg-button-primary font-medium text-on-emphasis'
        : 'text-secondary-text hover:bg-input hover:text-primary-text',
    )

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1 sm:gap-2', className)}>
      <button
        type="button"
        className={navButtonClass}
        disabled={!canGoPrev}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} aria-hidden />
        <span className="hidden sm:inline">Prev</span>
      </button>

      <div className="flex items-center gap-0.5 sm:gap-1">
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-secondary-text"
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
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        className={navButtonClass}
        disabled={!canGoNext}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} aria-hidden />
      </button>
    </nav>
  )
}
