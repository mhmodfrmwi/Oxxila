// src/components/account/SavedAddressCard.tsx
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'
import type { UserAddress } from '../../api/users'

interface SavedAddressCardProps {
  address: UserAddress
  name: string
  phone: string
  selected?: boolean
  deleting?: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

export function SavedAddressCard({
  address,
  name,
  phone,
  selected,
  deleting,
  onSelect,
  onEdit,
  onDelete,
}: SavedAddressCardProps) {
  return (
    <article
      className={cn(
        'saved-address-card',
        selected && 'saved-address-card--selected',
      )}
    >
      <button
        type="button"
        className={cn('w-full text-left', focusRingClasses, 'rounded-xl')}
        onClick={onSelect}
        aria-pressed={selected}
      >
        <p className="saved-address-card-name">{name}</p>
        <div className="saved-address-card-lines">
          <p>{address.address}</p>
          <p>{address.city}</p>
          {phone && <p className="mt-2">Phone number: {phone}</p>}
        </div>
      </button>

      <div className="saved-address-card-divider saved-address-card-actions">
        <button
          type="button"
          className={cn('saved-address-card-edit', focusRingClasses, 'rounded-sm')}
          onClick={onEdit}
        >
          edit
        </button>
        <button
          type="button"
          className={cn('saved-address-card-delete', focusRingClasses, 'rounded-sm')}
          onClick={onDelete}
          disabled={deleting}
        >
          {deleting ? 'deleting...' : 'delete'}
        </button>
      </div>
    </article>
  )
}
