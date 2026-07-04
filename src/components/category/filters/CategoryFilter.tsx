// src/components/category/filters/CategoryFilter.tsx
import { useNavigate } from 'react-router-dom'
import { CATEGORIES_PATH } from '../../../config/routes'
import { cn } from '../../../lib/cn'
import type { ApiCategory } from '../../../types/catalog'
import { categoryBrowsePath } from '../../../utils/categoryBrowseParams'
import { focusRingClasses } from '../../ui/interactionStyles'
import { FilterSection } from './FilterSection'

interface CategoryFilterProps {
  categories: ApiCategory[]
  activeSlug?: string
}

export function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
  const navigate = useNavigate()
  const activeCategories = categories.filter((category) => category.isActive !== false)

  if (activeCategories.length === 0) return null

  return (
    <FilterSection title="Categories">
      <div className="flex flex-wrap gap-2">
        {activeCategories.map((category) => {
          const isSelected = category.slug === activeSlug

          return (
            <button
              key={category._id}
              type="button"
              onClick={() =>
                navigate(isSelected ? CATEGORIES_PATH : categoryBrowsePath(category.slug))
              }
              data-selected={isSelected}
              className={cn('filter-chip px-2.5 py-1.5', focusRingClasses)}
              aria-pressed={isSelected}
            >
              {category.name}
            </button>
          )
        })}
      </div>
    </FilterSection>
  )
}
