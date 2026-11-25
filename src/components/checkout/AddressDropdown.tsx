// src/components/checkout/AddressDropdown.tsx
import { Check, ChevronDown, MapPin, Plus } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { UserAddress } from '../../api/users'
import { cn } from '../../lib/cn'
import { formatAddressOneLine, getAddressLabel } from '../../utils/userAddress'

interface AddressDropdownProps {
  addresses: UserAddress[]
  /** Selected saved address id, or null while the "add new" form is open. */
  selectedAddressId: string | null
  addingNew: boolean
  onSelect: (addressId: string) => void
  onAddNew: () => void
  className?: string
}

/**
 * Saved-address picker (Figma 602:29499): a dropdown of the shopper's addresses that always
 * ends with "+ Add new address". With no saved addresses the checkout shows the form directly
 * and does not render this at all.
 */
export function AddressDropdown({
  addresses,
  selectedAddressId,
  addingNew,
  onSelect,
  onAddNew,
  className,
}: AddressDropdownProps) {
  const { t } = useTranslation()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const selected = addresses.find((a) => a._id === selectedAddressId) ?? null
  const optionCount = addresses.length + 1 // + "Add new address"

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function choose(index: number) {
    setOpen(false)
    if (index === addresses.length) onAddNew()
    else onSelect(addresses[index]._id)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        setActive(Math.max(0, addresses.findIndex((a) => a._id === selectedAddressId)))
        return
      }
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((current) => (current + step + optionCount) % optionCount)
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault()
      choose(active)
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const summary = addingNew
    ? t('checkout.payment.addNewAddress')
    : selected
      ? formatAddressOneLine(selected)
      : t('checkout.payment.selectAddress')

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('checkout.payment.savedAddresses')}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-card px-4 py-3.5 text-start',
          'text-primary-text transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-button-primary/50',
          open && 'ring-2 ring-button-primary/40',
        )}
      >
        <MapPin size={18} aria-hidden className="shrink-0 text-icon-secondary" />
        <span className="min-w-0 flex-1">
          {selected && !addingNew && getAddressLabel(selected) ? (
            <span className="block text-xs text-secondary-text">{getAddressLabel(selected)}</span>
          ) : null}
          <span className="block truncate text-base">{summary}</span>
          {selected && !addingNew && selected.phone ? (
            <span className="block text-xs text-secondary-text" dir="ltr">
              {selected.phone}
            </span>
          ) : null}
        </span>
        <ChevronDown
          size={18}
          aria-hidden
          className={cn('shrink-0 text-secondary-text transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('checkout.payment.savedAddresses')}
          className="absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-72 overflow-y-auto rounded-2xl border border-border-subtle bg-card p-1.5 shadow-xl dark:shadow-black/40"
        >
          {addresses.map((address, index) => {
            const isSelected = !addingNew && address._id === selectedAddressId
            return (
              <li
                key={address._id}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(index)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5',
                  active === index ? 'bg-button-primary/10' : 'hover:bg-surface-muted',
                )}
              >
                <span className="min-w-0 flex-1">
                  {getAddressLabel(address) ? (
                    <span className="block text-xs text-secondary-text">{getAddressLabel(address)}</span>
                  ) : null}
                  <span className="block truncate text-sm text-primary-text">
                    {formatAddressOneLine(address)}
                  </span>
                  {address.phone ? (
                    <span className="block text-xs text-secondary-text" dir="ltr">
                      {address.phone}
                    </span>
                  ) : null}
                </span>
                {isSelected && <Check size={16} aria-hidden className="shrink-0 text-button-primary" />}
              </li>
            )
          })}
          <li
            role="option"
            aria-selected={addingNew}
            onMouseEnter={() => setActive(addresses.length)}
            onClick={() => choose(addresses.length)}
            className={cn(
              'mt-1 flex cursor-pointer items-center gap-3 rounded-xl border-t border-border-subtle px-3 py-3 text-button-primary',
              active === addresses.length ? 'bg-button-primary/10' : 'hover:bg-surface-muted',
            )}
          >
            <Plus size={18} aria-hidden className="shrink-0" />
            <span className="text-sm font-medium">{t('checkout.payment.addNewAddress')}</span>
          </li>
        </ul>
      )}
    </div>
  )
}
