// src/components/admin/ui/ImageLightbox.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/cn'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Skeleton } from './Skeleton'

export interface ImageLightboxItem {
  src: string
  alt?: string
}

interface ImageLightboxProps {
  open: boolean
  images: readonly ImageLightboxItem[]
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
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

export function ImageLightbox({
  open,
  images,
  index,
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const isRtl = i18n.dir() === 'rtl'
  const safeIndex = images.length === 0 ? 0 : Math.min(Math.max(index, 0), images.length - 1)
  const active = images[safeIndex]
  const showNav = images.length > 1
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  useEffect(() => {
    setLoadState('loading')
  }, [active?.src])

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
      ;(focusables[0] ?? panel).focus()
    }

    const frame = window.requestAnimationFrame(focusInitial)

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
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
      const current = document.activeElement

      if (event.shiftKey) {
        if (current === first || !panel.contains(current)) {
          event.preventDefault()
          last.focus()
        }
      } else if (current === last || !panel.contains(current)) {
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
  }, [open, onClose])

  const goPrev = () => {
    if (images.length < 2) return
    onIndexChange(safeIndex <= 0 ? images.length - 1 : safeIndex - 1)
  }

  const goNext = () => {
    if (images.length < 2) return
    onIndexChange(safeIndex >= images.length - 1 ? 0 : safeIndex + 1)
  }

  return (
    <AnimatePresence>
      {open && active ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            tabIndex={-1}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-label={t('admin.returns.details.proofPreviewClose')}
            onClick={onClose}
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            className="relative z-10 flex w-full max-w-5xl flex-col gap-3 outline-none"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p id={titleId} className="text-sm font-medium text-white/80">
                {t('admin.returns.details.proofPreviewTitle', {
                  current: safeIndex + 1,
                  total: images.length,
                })}
              </p>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'shrink-0 rounded-[var(--admin-radius-sm)] p-2 text-white/70 hover:bg-white/10 hover:text-white',
                  focusRingClasses,
                )}
                aria-label={t('admin.returns.details.proofPreviewClose')}
              >
                <X size={16} aria-hidden />
              </button>
            </div>

            <div className="relative flex min-h-[min(70vh,36rem)] items-center justify-center overflow-hidden rounded-[var(--admin-radius-xl)] bg-black/40">
              {loadState === 'loading' ? (
                <Skeleton className="absolute inset-4 rounded-[var(--admin-radius-lg)]" />
              ) : null}

              {loadState === 'error' ? (
                <div
                  className="flex flex-col items-center gap-2 text-white/40"
                  role="img"
                  aria-label={t('admin.returns.details.proofPreviewError')}
                >
                  <ImageOff size={28} strokeWidth={1.5} aria-hidden />
                  <span className="text-xs">{t('admin.returns.details.proofPreviewError')}</span>
                </div>
              ) : (
                <img
                  key={active.src}
                  src={active.src}
                  alt={active.alt ?? ''}
                  className={cn(
                    'max-h-[min(70vh,36rem)] max-w-full object-contain',
                    loadState === 'loading' && 'opacity-0',
                  )}
                  onLoad={() => setLoadState('loaded')}
                  onError={() => setLoadState('error')}
                />
              )}

              {showNav ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className={cn(
                      'absolute start-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 text-white/80',
                      'hover:bg-black/70 hover:text-white',
                      focusRingClasses,
                    )}
                    aria-label={t('admin.returns.details.proofPreviewPrevious')}
                  >
                    <PrevIcon size={18} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className={cn(
                      'absolute end-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 text-white/80',
                      'hover:bg-black/70 hover:text-white',
                      focusRingClasses,
                    )}
                    aria-label={t('admin.returns.details.proofPreviewNext')}
                  >
                    <NextIcon size={18} aria-hidden />
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
