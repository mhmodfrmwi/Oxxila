// src/components/category/filters/TypeOfCategoryFilter.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import type { ApiSubCategory } from '../../../types/catalog'
import { catalogDisplayName } from '../../../utils/catalogDisplayName'
import { FilterCheckboxList } from './FilterCheckboxList'
import { FilterSection } from './FilterSection'

interface TypeOfCategoryFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  subcategories: ApiSubCategory[]
  loading?: boolean
  /** When false, types are hidden and a choose-category placeholder is shown. */
  categorySelected?: boolean
}

export function TypeOfCategoryFilter({
  selectedIds,
  onChange,
  subcategories,
  loading = false,
  categorySelected = false,
}: TypeOfCategoryFilterProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? i18n.language
  const options = subcategories.map((subcategory) => ({
    id: subcategory._id,
    label: catalogDisplayName(subcategory, locale, 'subcategory'),
  }))

  const waitingForCategory = !categorySelected

  return (
    <FilterSection title={t('categoryFilters.typeOfCategory')}>
      <div
        className={cn(
          waitingForCategory && 'pointer-events-none select-none opacity-60',
        )}
        aria-disabled={waitingForCategory || undefined}
      >
        {waitingForCategory ? (
          <p
            className="py-5 text-center text-sm text-secondary-text"
            role="status"
          >
            {t('categoryFilters.chooseCategoryFirst')}
          </p>
        ) : loading ? (
          <p className="text-sm text-secondary-text" role="status">
            {t('categoryFilters.loadingTypes')}
          </p>
        ) : options.length === 0 ? (
          <p className="py-4 text-center text-sm text-secondary-text" role="status">
            {t('categoryFilters.noTypes')}
          </p>
        ) : (
          <FilterCheckboxList
            options={options}
            selectedIds={selectedIds}
            onChange={onChange}
          />
        )}
      </div>
    </FilterSection>
  )
}
