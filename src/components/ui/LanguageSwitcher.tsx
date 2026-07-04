// src/components/ui/LanguageSwitcher.tsx
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import langIcon from '../../assets/Lang-image.png'
import {
  LANGUAGE_META,
  SUPPORTED_LANGUAGES,
  type AppLanguage,
  isAppLanguage,
} from '../../i18n'
import { cn } from '../../lib/cn'
import { focusRingClasses } from './interactionStyles'
import { typeSmallClasses } from './typography'

interface LanguageSwitcherProps {
  className?: string
  compact?: boolean
}

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const currentLanguage: AppLanguage = isAppLanguage(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : isAppLanguage(i18n.language)
      ? i18n.language
      : 'en'

  const currentLabel = LANGUAGE_META[currentLanguage].nativeLabel

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  async function selectLanguage(language: AppLanguage) {
    if (language !== currentLanguage) {
      await i18n.changeLanguage(language)
    }
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        className={cn(
          'flex min-h-11 min-w-0 items-center gap-2.5 text-start',
          compact ? 'w-full' : 'flex-1 min-[769px]:flex-initial',
          focusRingClasses,
          'rounded-lg',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={t('language.switcher')}
        onClick={() => setOpen((value) => !value)}
      >
        <img
          src={langIcon}
          alt=""
          className="h-7 w-9 shrink-0 rounded-full object-cover"
          aria-hidden
        />
        <span className="flex flex-col items-start">
          <span className={typeSmallClasses}>{t('language.label')}</span>
          <strong className="text-[length:var(--font-size-small)] leading-[var(--line-height-small)] font-normal text-secondary-text">
            {currentLabel}
          </strong>
        </span>
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t('language.switcher')}
          className={cn(
            'absolute end-0 top-full z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-border-subtle bg-card py-1 shadow-lg',
          )}
        >
          {SUPPORTED_LANGUAGES.map((language) => {
            const selected = language === currentLanguage
            return (
              <li key={language} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center px-4 py-2.5 text-start text-sm transition-colors',
                    selected
                      ? 'bg-accent/10 font-medium text-accent'
                      : 'text-primary-text hover:bg-input',
                    focusRingClasses,
                  )}
                  onClick={() => void selectLanguage(language)}
                >
                  {LANGUAGE_META[language].nativeLabel}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
