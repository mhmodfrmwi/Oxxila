// src/components/admin/ui/Dialog.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'

interface DialogProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const

export function Dialog({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  className,
  size = 'md',
}: DialogProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const descriptionId = useId()

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
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label={t('actions.cancel')}
            onClick={onClose}
          />

          <motion.div
            className={cn(
              'admin-glass-strong relative z-10 flex w-full flex-col overflow-hidden rounded-[var(--admin-radius-xl)] shadow-2xl',
              sizeClasses[size],
              className,
            )}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4 sm:px-6">
              <div className="min-w-0 space-y-1">
                <h2 id={titleId} className="text-lg font-semibold text-primary-text">
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="text-sm text-secondary-text">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'shrink-0 rounded-[var(--admin-radius-sm)] p-2 text-secondary-text hover:bg-white/5 hover:text-primary-text',
                  focusRingClasses,
                )}
                aria-label={t('actions.cancel')}
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>

            {footer && (
              <div className="border-t border-border-subtle px-5 py-4 sm:px-6">{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
