// src/components/admin/ui/Drawer.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

interface DrawerProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  className?: string
  width?: 'md' | 'lg' | 'xl' | 'formula' | 'settings' | 'order' | 'customer'
  /** When true, Escape / backdrop still call onClose (parent may confirm first). */
}

const widthClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  /** Figma Formula Specs drawer is 500px (scaled ×0.8 by scale-admin-ui). */
  formula: 'max-w-[25rem]',
  /** Figma Coupon / Offer drawers are 512px. */
  settings: 'max-w-[25.6rem]',
  /** Figma Order Details drawer is 420px. */
  order: 'max-w-[21rem]',
  /** Customer details drawer is 480px. */
  customer: 'max-w-[24rem]',
} as const

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => {
    if (element.closest('[aria-hidden="true"]')) return false
    return element.getClientRects().length > 0
  })
}

export function Drawer({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  className,
  width = 'lg',
}: DrawerProps) {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const isRtl = i18n.dir() === 'rtl'
  const enterX = isRtl ? '-100%' : '100%'

  useEffect(() => {
    if (!open) return

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusInitial = () => {
      const panel = panelRef.current
      if (!panel) return
      const focusables = getFocusableElements(panel)
      const target = focusables[0] ?? panel
      target.focus()
    }

    // Wait a frame so AnimatePresence mounts the panel before focusing.
    const frame = window.requestAnimationFrame(focusInitial)

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusables = getFocusableElements(panel)
      if (focusables.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last || !panel.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocusedRef.current?.focus()
      previouslyFocusedRef.current = null
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
        >
          <motion.button
            type="button"
            tabIndex={-1}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            aria-label={t('actions.cancel')}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            className={cn(
              'admin-glass-strong absolute inset-y-0 end-0 flex h-full w-full flex-col border-s border-border-subtle shadow-2xl outline-none',
              widthClasses[width],
              className,
            )}
            initial={{ x: enterX }}
            animate={{ x: 0 }}
            exit={{ x: enterX }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-8 py-6">
              <div className="min-w-0 space-y-1">
                <h2
                  id={titleId}
                  className="font-[family-name:var(--admin-font-display)] text-2xl font-normal text-primary-text"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id={descriptionId}
                    className="text-[8px] font-medium uppercase tracking-[0.14em] text-helper-text"
                  >
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'shrink-0 rounded-full border border-border-subtle bg-white/5 p-2 text-secondary-text',
                  'hover:bg-white/10 hover:text-primary-text',
                  focusRingClasses,
                )}
                aria-label={t('actions.cancel')}
              >
                <X size={14} aria-hidden />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">{children}</div>

            {footer && (
              <div className="border-t border-border-subtle px-8 py-5">{footer}</div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
