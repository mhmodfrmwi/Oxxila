// src/components/category/filters/CategoryFilter.tsx
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES_PATH } from '../../../config/routes'
import { cn } from '../../../lib/cn'
import type { ApiCategory } from '../../../types/catalog'
import { catalogDisplayName } from '../../../utils/catalogDisplayName'
import { categoryBrowsePath } from '../../../utils/categoryBrowseParams'
import { focusRingClasses } from '../../ui/interactionStyles'
import { FilterSection } from './FilterSection'

interface CategoryFilterProps {
  categories: ApiCategory[]
  activeSlug?: string
}

export function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.resolvedLanguage ?? i18n.language
  const activeCategories = categories.filter((category) => category.isActive !== false)

  if (activeCategories.length === 0) return null

  return (
    <FilterSection title={t('categoryFilters.sections.categories')}>
      <div className="flex flex-wrap gap-2">
        {activeCategories.map((category) => {
          const isSelected = category.slug === activeSlug
          const label = catalogDisplayName(category, locale, 'category')

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
              {label}
            </button>
          )
        })}
      </div>
    </FilterSection>
  )
}
