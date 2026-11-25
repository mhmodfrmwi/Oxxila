// src/components/category/filters/ConcernsFilter.tsx
import { useTranslation } from 'react-i18next'
import { FilterCheckboxList } from './FilterCheckboxList'
import { concernOptions, concernsCollapsedCount } from './filterOptionsData'
import { FilterSection } from './FilterSection'

interface ConcernsFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function ConcernsFilter({ selectedIds, onChange }: ConcernsFilterProps) {
  const { t } = useTranslation()
  return (
    <FilterSection title={t('categoryFilters.sections.concerns')}>
      <FilterCheckboxList
        options={concernOptions}
        selectedIds={selectedIds}
        onChange={onChange}
        initialVisibleCount={concernsCollapsedCount}
      />
    </FilterSection>
  )
}
