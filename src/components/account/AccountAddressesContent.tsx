// src/components/account/AccountAddressesContent.tsx
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAccountAddresses } from '../../hooks/useAccountAddresses'
import { cn } from '../../lib/cn'
import { FormMessage } from '../auth/FormMessage'
import { Heading } from '../ui/Heading'
import { focusRingClasses } from '../ui/interactionStyles'
import { SavedAddressCard } from './SavedAddressCard'

function AddressesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-hidden>
      <div className="h-44 animate-pulse rounded-2xl bg-surface-muted" />
      <div className="h-44 animate-pulse rounded-2xl bg-surface-muted" />
    </div>
  )
}

export function AccountAddressesContent() {
  const { t } = useTranslation()
  const {
    addresses,
    phone,
    name,
    loading,
    loadError,
    deletingId,
    handleAdd,
    handleEdit,
    handleDelete,
  } = useAccountAddresses()

  return (
    <div>
      <header className="mb-8">
        <Heading variant="page">{t('profile.addresses.title')}</Heading>
        <p className="mt-2 text-sm text-secondary-text sm:text-base">
          {t('profile.addresses.description')}
        </p>
      </header>

      {loadError && (
        <div className="mb-6">
          <FormMessage message={loadError} />
        </div>
      )}

      {loading ? (
        <AddressesSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <SavedAddressCard
              key={address._id}
              address={address}
              name={name}
              phone={phone}
              deleting={deletingId === address._id}
              onSelect={() => handleEdit(address._id)}
              onEdit={() => handleEdit(address._id)}
              onDelete={() => void handleDelete(address._id)}
            />
          ))}

          <button
            type="button"
            onClick={handleAdd}
            className={cn(
              'flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border-subtle',
              'bg-transparent text-button-primary transition-colors hover:border-button-primary hover:bg-accent/5',
              focusRingClasses,
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-button-primary/10">
              <Plus size={24} aria-hidden />
            </span>
            <span className="text-sm font-medium">{t('profile.addresses.addNew')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
