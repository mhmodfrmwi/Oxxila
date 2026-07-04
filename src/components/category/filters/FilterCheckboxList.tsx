import { useState } from 'react'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import type { FilterOption } from './filterOptionsData'

interface FilterCheckboxListProps {
  options: readonly FilterOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  initialVisibleCount?: number
  className?: string
}

export function FilterCheckboxList({
  options,
  selectedIds,
  onChange,
  initialVisibleCount,
  className,
}: FilterCheckboxListProps) {
  const [expanded, setExpanded] = useState(false)
  const hasCollapse = initialVisibleCount != null && options.length > initialVisibleCount
  const visibleOptions =
    hasCollapse && !expanded ? options.slice(0, initialVisibleCount) : options

  function toggleOption(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <div className={cn('filter-checkbox-list', className)}>
      <ul className="filter-checkbox-list-items">
        {visibleOptions.map((option) => (
          <li key={option.id}>
            <label className="filter-option-row">
              <input
                type="checkbox"
                checked={selectedIds.includes(option.id)}
                onChange={() => toggleOption(option.id)}
                className="filter-checkbox"
              />
              <span>{option.label}</span>
            </label>
          </li>
        ))}
      </ul>

      {hasCollapse && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={cn('filter-more-link', focusRingClasses, 'rounded-sm')}
        >
          more
        </button>
      )}
    </div>
  )
}
