// src/components/account/SavedAddressCard.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'
import type { UserAddress } from '../../api/users'
import {
  getAddressCityName,
  getAddressLabel,
} from '../../utils/userAddress'

interface SavedAddressCardProps {
  address: UserAddress
  name?: string
  phone?: string
  selected?: boolean
  deleting?: boolean
  showActions?: boolean
  /** Tighter layout for checkout address picker. */
  density?: 'default' | 'compact'
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function SavedAddressCard({
  address,
  name,
  phone,
  selected,
  deleting,
  showActions = true,
  density = 'default',
  onSelect,
  onEdit,
  onDelete,
}: SavedAddressCardProps) {
  const { t } = useTranslation()
  const label = getAddressLabel(address, t('checkout.address.unnamedLabel'))
  const city = getAddressCityName(address)
  const governorate = address.governorate?.name ?? ''

  return (
    <article
      className={cn(
        'saved-address-card',
        density === 'compact' && 'saved-address-card--compact',
        selected && 'saved-address-card--selected',
      )}
    >
      <button
        type="button"
        className={cn('w-full text-start', focusRingClasses, 'rounded-xl')}
        onClick={onSelect}
        aria-pressed={selected}
      >
        <div className="saved-address-card-header">
          <p className="saved-address-card-name">{label}</p>
          {address.isDefault && (
            <span className="saved-address-card-default-badge">
              {t('checkout.address.defaultBadge')}
            </span>
          )}
        </div>
        <div className="saved-address-card-lines">
          {governorate && <p>{governorate}</p>}
          {city && <p>{city}</p>}
          <p>{address.addressLine}</p>
          {name && <p className="mt-2">{name}</p>}
          {phone && (
            <p className={name ? undefined : 'mt-2'}>
              {t('checkout.address.phoneNumber', { phone })}
            </p>
          )}
        </div>
      </button>

      {showActions && onEdit && onDelete && (
        <div className="saved-address-card-divider saved-address-card-actions">
          <button
            type="button"
            className={cn('saved-address-card-edit', focusRingClasses, 'rounded-sm')}
            onClick={onEdit}
          >
            {t('checkout.address.edit')}
          </button>
          <button
            type="button"
            className={cn('saved-address-card-delete', focusRingClasses, 'rounded-sm')}
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? t('checkout.address.deleting') : t('checkout.address.delete')}
          </button>
        </div>
      )}
    </article>
  )
}
