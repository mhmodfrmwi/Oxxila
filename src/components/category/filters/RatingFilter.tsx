// src/components/category/filters/RatingFilter.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { FilterSection } from './FilterSection'

interface RatingFilterProps {
  selectedRating: number | null
  onChange: (rating: number | null) => void
}

const ratings = [1, 2, 3, 4, 5] as const

export function RatingFilter({ selectedRating, onChange }: RatingFilterProps) {
  const { t } = useTranslation()
  return (
    <FilterSection title={t('categoryFilters.sections.productRating')}>
      <div className="flex flex-wrap gap-2">
        {ratings.map((rating) => {
          const isSelected = selectedRating === rating

          return (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(isSelected ? null : rating)}
              data-selected={isSelected}
              className={cn('filter-rating-box', focusRingClasses)}
              aria-pressed={isSelected}
              aria-label={t('categoryFilters.ratingAria', { rating })}
            >
              {rating}
            </button>
          )
        })}
      </div>
    </FilterSection>
  )
}
