// src/components/product/ProductFormDialog.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { focusRingClasses } from '../ui/interactionStyles'

interface ProductFormDialogProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  className?: string
}

export function ProductFormDialog({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: ProductFormDialogProps) {
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
              'relative z-10 w-full max-w-lg rounded-3xl border border-border-subtle bg-card p-5 shadow-2xl sm:p-6',
              className,
            )}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id={titleId} className="font-serif text-xl font-medium text-primary-text sm:text-2xl">
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="mt-1 text-sm text-secondary-text">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  'text-primary-text hover:bg-accent/10',
                  focusRingClasses,
                )}
                aria-label={t('actions.cancel')}
                onClick={onClose}
              >
                <X size={18} strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
