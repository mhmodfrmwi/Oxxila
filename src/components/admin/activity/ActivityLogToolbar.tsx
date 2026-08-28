// src/components/admin/activity/ActivityLogToolbar.tsx
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAdminUsers } from '../../../api/admin/admins'
import { ADMIN_ACTIVITY_ACTIONS } from '../../../types/adminAudit'
import { ADMIN_TAB_KEYS } from '../../../types/adminPermissions'
import { HIDDEN_ACTIVITY_TAB_FILTERS } from '../../../utils/adminActivityNavigation'
import { getAdminInitials } from '../../../utils/adminUsersFormat'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Select, type SelectOption } from '../ui/Select'

interface ActivityLogToolbarProps {
  keyword: string
  actor: string
  tab: string
  action: string
  resourceType: string
  dateFrom: string
  dateTo: string
  onKeywordChange: (value: string) => void
  onActorChange: (value: string) => void
  onTabChange: (value: string) => void
  onActionChange: (value: string) => void
  onResourceTypeChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  disabled?: boolean
}

export function ActivityLogToolbar({
  keyword,
  actor,
  tab,
  action,
  resourceType,
  dateFrom,
  dateTo,
  onKeywordChange,
  onActorChange,
  onTabChange,
  onActionChange,
  onResourceTypeChange,
  onDateFromChange,
  onDateToChange,
  disabled = false,
}: ActivityLogToolbarProps) {
  const { t } = useTranslation()
  const [adminOptions, setAdminOptions] = useState<SelectOption[]>([])

  useEffect(() => {
    const controller = new AbortController()
    void getAdminUsers({ limit: 100, sort: 'name' }, { signal: controller.signal })
      .then((response) => {
        const options = (response.data ?? []).map((admin) => {
          const label = admin.name?.trim() || admin.email
          return {
            value: admin._id,
            label,
            initials: getAdminInitials(label),
          }
        })
        setAdminOptions(options)
      })
      .catch(() => {
        /* actor filter optional */
      })
    return () => controller.abort()
  }, [])

  const allOption = useMemo(
    (): SelectOption => ({ value: '', label: t('admin.audit.filters.all') }),
    [t],
  )

  const actorSelectOptions = useMemo(
    () => [allOption, ...adminOptions],
    [adminOptions, allOption],
  )

  const tabSelectOptions = useMemo(
    () => [
      allOption,
      ...ADMIN_TAB_KEYS.filter((key) => !HIDDEN_ACTIVITY_TAB_FILTERS.has(key)).map((key) => ({
        value: key,
        label: t(`admin.audit.tabs.${key}`, { defaultValue: key }),
      })),
    ],
    [allOption, t],
  )

  const actionSelectOptions = useMemo(
    () => [
      allOption,
      ...ADMIN_ACTIVITY_ACTIONS.map((value) => ({
        value,
        label: t(`admin.audit.actions.${value}`, { defaultValue: value }),
      })),
    ],
    [allOption, t],
  )

  const resourceTypeSelectOptions = useMemo(
    () => [
      allOption,
      { value: 'product', label: t('admin.audit.resourceTypes.product') },
      { value: 'category', label: t('admin.audit.resourceTypes.category') },
      { value: 'brand', label: t('admin.audit.resourceTypes.brand') },
      { value: 'order', label: t('admin.audit.resourceTypes.order') },
      { value: 'carrier', label: t('admin.audit.resourceTypes.carrier') },
      { value: 'return', label: t('admin.audit.resourceTypes.return') },
      { value: 'review', label: t('admin.audit.resourceTypes.review') },
      { value: 'customer', label: t('admin.audit.resourceTypes.customer') },
      { value: 'banner', label: t('admin.audit.resourceTypes.banner') },
      { value: 'coupon', label: t('admin.audit.resourceTypes.coupon') },
      { value: 'offer', label: t('admin.audit.resourceTypes.offer') },
      { value: 'settings', label: t('admin.audit.resourceTypes.settings') },
      { value: 'adminRole', label: t('admin.audit.resourceTypes.adminRole') },
      { value: 'adminUser', label: t('admin.audit.resourceTypes.adminUser') },
    ],
    [allOption, t],
  )

  const fieldClass = cn(
    'rounded-full border border-white/10 bg-white/5 text-sm text-primary-text',
    'placeholder:text-white/50 shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.05)]',
    'transition-colors hover:bg-white/[0.07]',
    focusRingClasses,
    disabled && 'cursor-not-allowed opacity-60',
  )

  return (
    <div className="flex w-full flex-col gap-3">
      <label className="relative block w-full">
        <span className="sr-only">{t('admin.audit.searchLabel')}</span>
        <Search
          size={19}
          className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-white/45"
          aria-hidden
        />
        <input
          type="search"
          value={keyword}
          disabled={disabled}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder={t('admin.audit.searchPlaceholder')}
          className={cn(fieldClass, 'h-[43.2px] w-full ps-11 pe-5')}
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Select
          value={actor}
          onValueChange={onActorChange}
          options={actorSelectOptions}
          disabled={disabled}
          size="toolbar"
          aria-label={t('admin.audit.filters.actor')}
        />
        <Select
          value={tab}
          onValueChange={onTabChange}
          options={tabSelectOptions}
          disabled={disabled}
          size="toolbar"
          aria-label={t('admin.audit.filters.tab')}
        />
        <Select
          value={action}
          onValueChange={onActionChange}
          options={actionSelectOptions}
          disabled={disabled}
          size="toolbar"
          aria-label={t('admin.audit.filters.action')}
        />
        <Select
          value={resourceType}
          onValueChange={onResourceTypeChange}
          options={resourceTypeSelectOptions}
          disabled={disabled}
          size="toolbar"
          aria-label={t('admin.audit.filters.resourceType')}
        />
        <input
          type="date"
          value={dateFrom}
          disabled={disabled}
          onChange={(event) => onDateFromChange(event.target.value)}
          aria-label={t('admin.audit.filters.dateFrom')}
          className={cn(fieldClass, 'h-[43.2px] px-5 [color-scheme:dark]')}
        />
        <input
          type="date"
          value={dateTo}
          disabled={disabled}
          onChange={(event) => onDateToChange(event.target.value)}
          aria-label={t('admin.audit.filters.dateTo')}
          className={cn(fieldClass, 'h-[43.2px] px-5 [color-scheme:dark]')}
        />
      </div>
    </div>
  )
}
