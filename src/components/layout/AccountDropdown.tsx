// src/components/layout/AccountDropdown.tsx
import {
  Heart,
  Settings,
  ShoppingCart,
  Truck,
  CircleDollarSign,
  MapPin,
  KeyRound,
} from 'lucide-react'
import { useEffect, useId, useRef, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  ACCOUNT_CHANGE_PASSWORD_PATH,
  ACCOUNT_ORDERS_PATH,
  ADDRESSES_PATH,
  MY_ACCOUNT_PATH,
  RETURNS_HISTORY_PATH,
  WISHLIST_PATH,
} from '../../config/routes'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'

interface AccountDropdownProps {
  open: boolean
  onClose: () => void
  /** Root that contains the trigger + menu — clicks inside do not close. */
  rootRef: RefObject<HTMLElement | null>
  storeCreditBalance?: number
  className?: string
  /** Optional stable id for aria-controls on the trigger. */
  id?: string
}

export function AccountDropdown({
  open,
  onClose,
  rootRef,
  storeCreditBalance = 0,
  className,
  id,
}: AccountDropdownProps) {
  const { t } = useTranslation()
  const generatedId = useId()
  const menuId = id ?? generatedId
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const panel = panelRef.current
    const firstItem = panel?.querySelector<HTMLElement>('[role="menuitem"]')
    firstItem?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        const trigger = rootRef.current?.querySelector<HTMLElement>('button[aria-haspopup="menu"]')
        trigger?.focus()
        return
      }

      if (
        !panel ||
        (event.key !== 'ArrowDown' &&
          event.key !== 'ArrowUp' &&
          event.key !== 'Home' &&
          event.key !== 'End')
      ) {
        return
      }

      const items = Array.from(panel.querySelectorAll<HTMLElement>('[role="menuitem"]'))
      if (items.length === 0) return

      const currentIndex = items.indexOf(document.activeElement as HTMLElement)
      event.preventDefault()

      if (event.key === 'Home') {
        items[0]?.focus()
        return
      }
      if (event.key === 'End') {
        items[items.length - 1]?.focus()
        return
      }

      const delta = event.key === 'ArrowDown' ? 1 : -1
      const nextIndex =
        currentIndex < 0 ? 0 : (currentIndex + delta + items.length) % items.length
      items[nextIndex]?.focus()
    }

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open, onClose, rootRef])

  const creditLabel = Number.isInteger(storeCreditBalance)
    ? String(storeCreditBalance)
    : storeCreditBalance.toFixed(0)

  const items = [
    {
      id: 'account',
      to: MY_ACCOUNT_PATH,
      label: t('nav.dropdown.account'),
      icon: Settings,
    },
    {
      id: 'orders',
      to: ACCOUNT_ORDERS_PATH,
      label: t('nav.dropdown.myOrders'),
      icon: ShoppingCart,
    },
    {
      id: 'wishlist',
      to: WISHLIST_PATH,
      label: t('nav.dropdown.wishlist'),
      icon: Heart,
    },
    {
      id: 'returns',
      to: RETURNS_HISTORY_PATH,
      label: t('nav.dropdown.returns'),
      icon: Truck,
    },
    {
      id: 'addresses',
      to: ADDRESSES_PATH,
      label: t('profile.nav.myAddresses'),
      icon: MapPin,
    },
    {
      id: 'password',
      to: ACCOUNT_CHANGE_PASSWORD_PATH,
      label: t('profile.nav.changePassword'),
      icon: KeyRound,
    },
  ] as const

  return (
    <div
      ref={panelRef}
      id={menuId}
      role="menu"
      aria-label={t('nav.accountMenu')}
      hidden={!open}
      className={cn(
        'absolute end-0 top-[calc(100%+0.5rem)] z-50 min-w-[13.5rem]',
        'rounded-2xl border border-border-subtle bg-card py-3 shadow-lg',
        className,
      )}
    >
      <ul className="flex flex-col gap-0.5 px-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id} role="none">
              <Link
                role="menuitem"
                to={item.to}
                tabIndex={open ? 0 : -1}
                onClick={onClose}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5',
                  'font-serif text-sm text-primary-text transition-colors',
                  'hover:bg-accent/10 hover:text-accent',
                  focusRingClasses,
                )}
              >
                <Icon size={18} strokeWidth={1.5} aria-hidden className="shrink-0" />
                <span className="min-w-0 flex-1 truncate text-start">{item.label}</span>
              </Link>
            </li>
          )
        })}
        <li role="none">
          <div
            role="menuitem"
            aria-disabled="true"
            tabIndex={open ? 0 : -1}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5',
              'font-serif text-sm text-primary-text',
            )}
          >
            <CircleDollarSign size={18} strokeWidth={1.5} aria-hidden className="shrink-0" />
            <span className="min-w-0 flex-1 truncate text-start">
              {t('nav.dropdown.giftCards')}
            </span>
            <span className="shrink-0 tabular-nums text-secondary-text" aria-label={t('nav.dropdown.storeCredit', { balance: creditLabel })}>
              {creditLabel}
            </span>
          </div>
        </li>
      </ul>
    </div>
  )
}
