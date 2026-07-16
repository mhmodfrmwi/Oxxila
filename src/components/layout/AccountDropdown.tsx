// src/components/layout/AccountDropdown.tsx
import {
  Heart,
  Settings,
  ShoppingCart,
  Truck,
  CircleDollarSign,
} from 'lucide-react'
import { useEffect, useId, useRef, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  ACCOUNT_ORDERS_PATH,
  MY_ACCOUNT_PATH,
  RETURNS_HISTORY_PATH,
  SHOP_PATH,
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
}

export function AccountDropdown({
  open,
  onClose,
  rootRef,
  storeCreditBalance = 0,
  className,
}: AccountDropdownProps) {
  const { t } = useTranslation()
  const menuId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
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

  if (!open) return null

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
      id: 'returns',
      to: RETURNS_HISTORY_PATH,
      label: t('nav.dropdown.returns'),
      icon: Truck,
    },
    {
      id: 'wishlist',
      to: SHOP_PATH,
      label: t('nav.dropdown.wishlist'),
      icon: Heart,
    },
    {
      id: 'giftCards',
      to: MY_ACCOUNT_PATH,
      label: t('nav.dropdown.giftCards'),
      icon: CircleDollarSign,
      trailing: creditLabel,
    },
  ] as const

  return (
    <div
      ref={panelRef}
      id={menuId}
      role="menu"
      aria-label={t('nav.accountMenu')}
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
                {'trailing' in item && item.trailing != null && (
                  <span className="shrink-0 tabular-nums text-secondary-text">
                    {item.trailing}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
