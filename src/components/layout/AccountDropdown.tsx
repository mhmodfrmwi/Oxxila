// src/components/layout/AccountDropdown.tsx
import { CircleDollarSign } from 'lucide-react'
import { useEffect, useId, useRef, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ACCOUNT_NAV_ICONS, ACCOUNT_SIDEBAR_NAV } from '../../config/accountNav'
import { ACCOUNT_GIFT_CARDS_PATH } from '../../config/routes'
import { cn } from '../../lib/cn'
import { formatCartPrice } from '../../utils/formatProductPrice'
import { focusRingClasses } from '../ui/interactionStyles'

interface AccountDropdownProps {
  open: boolean
  onClose: () => void
  /** Root that contains the trigger + menu — clicks inside do not close. */
  rootRef: RefObject<HTMLElement | null>
  storeCreditBalance?: number
  giftCardsLoading?: boolean
  onRefreshGiftCards?: () => void
  className?: string
  /** Optional stable id for aria-controls on the trigger. */
  id?: string
}

export function AccountDropdown({
  open,
  onClose,
  rootRef,
  storeCreditBalance = 0,
  giftCardsLoading = false,
  onRefreshGiftCards,
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

  useEffect(() => {
    if (open) onRefreshGiftCards?.()
  }, [open, onRefreshGiftCards])

  const creditLabel = formatCartPrice(storeCreditBalance)
  const creditBadge =
    storeCreditBalance % 1 === 0
      ? String(storeCreditBalance)
      : storeCreditBalance.toFixed(0)

  return (
    <div
      ref={panelRef}
      id={menuId}
      role="menu"
      aria-label={t('nav.accountMenu')}
      hidden={!open}
      className={cn(
        'absolute end-0 top-[calc(100%+0.5rem)] z-50 min-w-[15rem]',
        'overflow-hidden rounded-2xl border border-border-subtle bg-card p-1.5 shadow-lg',
        className,
      )}
    >
      <ul className="flex flex-col">
        {ACCOUNT_SIDEBAR_NAV.map((item) => {
          const Icon = ACCOUNT_NAV_ICONS[item.id]
          return (
            <li key={item.id} role="none">
              <Link
                role="menuitem"
                to={item.to}
                tabIndex={open ? 0 : -1}
                onClick={onClose}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3.5 py-3',
                  'font-serif text-sm font-medium text-primary-text transition-colors',
                  'hover:bg-accent/10 hover:text-accent',
                  focusRingClasses,
                )}
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-input text-current">
                  <Icon size={16} strokeWidth={1.5} aria-hidden />
                </span>
                <span className="min-w-0 flex-1 truncate text-start">{t(item.labelKey)}</span>
              </Link>
            </li>
          )
        })}
        <li role="none">
          <Link
            role="menuitem"
            to={ACCOUNT_GIFT_CARDS_PATH}
            tabIndex={open ? 0 : -1}
            onClick={onClose}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3.5 py-3',
              'font-serif text-sm font-medium text-primary-text transition-colors',
              'hover:bg-accent/10 hover:text-accent',
              focusRingClasses,
            )}
          >
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-input text-current">
              <CircleDollarSign size={16} strokeWidth={1.5} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 truncate text-start">
              {t('nav.dropdown.giftCards')}
            </span>
            <span
              className="shrink-0 tabular-nums text-secondary-text"
              aria-label={t('nav.dropdown.storeCredit', { balance: creditLabel })}
            >
              {giftCardsLoading ? '…' : creditBadge}
            </span>
          </Link>
        </li>
      </ul>
    </div>
  )
}
