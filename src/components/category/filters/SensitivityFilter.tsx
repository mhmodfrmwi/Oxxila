// src/components/category/filters/SensitivityFilter.tsx
import { useTranslation } from 'react-i18next'
import { FilterCheckboxList } from './FilterCheckboxList'
import { sensitivityOptions } from './filterOptionsData'
import { FilterSection } from './FilterSection'

interface SensitivityFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function SensitivityFilter({ selectedIds, onChange }: SensitivityFilterProps) {
  const { t } = useTranslation()
  return (
    <FilterSection title={t('categoryFilters.sections.sensitivity')}>
      <FilterCheckboxList
        options={sensitivityOptions}
        selectedIds={selectedIds}
        onChange={onChange}
      />
    </FilterSection>
  )
}
