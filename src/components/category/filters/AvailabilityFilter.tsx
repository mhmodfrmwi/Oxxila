// src/components/category/filters/AvailabilityFilter.tsx
import { useTranslation } from 'react-i18next'
import { FilterSection } from './FilterSection'

interface AvailabilityFilterProps {
  inStockOnly: boolean
  onChange: (inStockOnly: boolean) => void
}

export function AvailabilityFilter({ inStockOnly, onChange }: AvailabilityFilterProps) {
  const { t } = useTranslation()
  return (
    <FilterSection title={t('categoryFilters.sections.availability')}>
      <label className="filter-option-row">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(event) => onChange(event.target.checked)}
          className="filter-checkbox"
        />
        <span>{t('categoryFilters.availableOnly')}</span>
      </label>
    </FilterSection>
  )
}
