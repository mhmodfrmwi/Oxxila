// src/components/admin/ui/Drawer.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
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
  width?: 'md' | 'lg' | 'xl' | 'formula'
  /** When true, Escape / backdrop still call onClose (parent may confirm first). */
}

const widthClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  /** Figma Formula Specs drawer is 500px. */
  formula: 'max-w-[31.25rem]',
} as const

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
  const isRtl = i18n.dir() === 'rtl'
  const enterX = isRtl ? '-100%' : '100%'

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

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
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            aria-label={t('actions.cancel')}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            className={cn(
              'admin-glass-strong absolute inset-y-0 end-0 flex h-full w-full flex-col border-s border-border-subtle shadow-2xl',
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
                    className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/35"
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
                <X size={18} aria-hidden />
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
