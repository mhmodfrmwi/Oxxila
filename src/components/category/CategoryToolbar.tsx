import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'
import { typeSmallClasses } from '../ui/typography'
import { sortOptions, type SortOption } from './categoryData'

interface CategoryToolbarProps {
  categoryName: string
  productCount: number
  totalResults: number
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  className?: string
}

export function CategoryToolbar({
  categoryName,
  productCount,
  totalResults,
  sort,
  onSortChange,
  className,
}: CategoryToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-border-subtle pb-5 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="font-serif text-2xl font-medium text-primary-text sm:text-[1.75rem]">
          {categoryName}
        </h1>
        <p className="text-sm text-secondary-text">
          <span className="font-medium text-primary-text">{productCount} Products</span>
          {' '}
          more than {totalResults.toLocaleString()} result for &ldquo;{categoryName}&rdquo;
        </p>
      </div>

      <div className="relative shrink-0">
        <label htmlFor="category-sort" className="sr-only">
          Sort products
        </label>
        <select
          id="category-sort"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
          className={cn(
            'appearance-none rounded-input border border-border-subtle bg-card py-2.5 pr-10 pl-4',
            typeSmallClasses,
            'text-left text-primary-text',
            'focus:border-button-primary focus:outline-none focus:ring-2 focus:ring-button-primary/30',
            focusRingClasses,
            'min-w-[11rem]',
          )}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-secondary-text"
          aria-hidden
        />
      </div>
    </div>
  )
}
