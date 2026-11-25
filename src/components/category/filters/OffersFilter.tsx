// src/components/category/filters/OffersFilter.tsx
import { useTranslation } from 'react-i18next'
import { FilterCheckboxList } from './FilterCheckboxList'
import { offerOptions } from './filterOptionsData'
import { FilterSection } from './FilterSection'

interface OffersFilterProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function OffersFilter({ selectedIds, onChange }: OffersFilterProps) {
  const { t } = useTranslation()
  return (
    <FilterSection title={t('categoryFilters.sections.offers')}>
      <FilterCheckboxList options={offerOptions} selectedIds={selectedIds} onChange={onChange} />
    </FilterSection>
  )
}
