import { ChevronDown } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { filterSectionChevronClasses, filterSectionTitleClasses } from './filterStyles'

interface FilterSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export function FilterSection({
  title,
  children,
  defaultOpen = true,
  className,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <div className={cn('filter-section-card', className)}>
      <button
        type="button"
        className={cn('filter-section-header', focusRingClasses)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={filterSectionTitleClasses}>{title}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className={cn(filterSectionChevronClasses, isOpen && 'rotate-180')}
          aria-hidden
        />
      </button>

      {isOpen && (
        <div id={panelId} className="filter-section-panel">
          {children}
        </div>
      )}
    </div>
  )
}
