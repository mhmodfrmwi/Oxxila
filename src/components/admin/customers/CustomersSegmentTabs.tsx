// src/components/admin/customers/CustomersSegmentTabs.tsx
import { useTranslation } from 'react-i18next'
import type { AdminCustomersSegmentTab } from '../../../types/adminCustomers'
import { formatCount } from '../../../utils/adminCustomersFormat'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

const TABS: readonly AdminCustomersSegmentTab[] = ['all', 'inactive']

interface CustomersSegmentTabsProps {
  active: AdminCustomersSegmentTab
  activeCount: number
  onChange: (tab: AdminCustomersSegmentTab) => void
  disabled?: boolean
}

export function CustomersSegmentTabs({
  active,
  activeCount,
  onChange,
  disabled = false,
}: CustomersSegmentTabsProps) {
  const { t, i18n } = useTranslation()

  return (
    <div
      className="flex gap-4 overflow-x-auto border-b border-white/10"
      role="tablist"
      aria-label={t('admin.customers.segmentFilterAria')}
    >
      {TABS.map((tab) => {
        const isActive = tab === active
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(tab)}
            className={cn(
              'relative shrink-0 px-2 pb-[14px] text-sm transition-colors',
              focusRingClasses,
              isActive
                ? 'border-b-2 border-accent pb-[13.2px] font-semibold text-accent'
                : 'font-medium text-white/40 hover:text-white/60',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <span className="inline-flex items-end gap-2">
              <span>{t(`admin.customers.tabs.${tab}`)}</span>
              {isActive ? (
                <span className="rounded-full bg-accent/20 px-1.5 py-px text-[8px] font-semibold leading-[11.2px] text-accent">
                  {formatCount(activeCount, i18n.language)}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}
