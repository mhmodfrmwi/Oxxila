// src/components/ui/LanguageSwitcher.tsx
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import egyptFlag from '../../assets/header/flag-eg.svg'
import ukFlag from '../../assets/header/flag-gb.png'
import {
  LANGUAGE_META,
  SUPPORTED_LANGUAGES,
  type AppLanguage,
  isAppLanguage,
} from '../../i18n'
import { cn } from '../../lib/cn'
import { focusRingClasses } from './interactionStyles'

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
  const currentFlag = currentLanguage === 'ar' ? egyptFlag : ukFlag

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
          'flex min-h-11 min-w-0 items-center gap-1.5 text-start',
          compact && 'w-full',
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
          src={currentFlag}
          alt=""
          className="size-8 shrink-0 rounded-full object-cover"
          aria-hidden
        />
        <span className="flex flex-col items-start">
          <span className="site-header__text-base text-primary-text">{t('language.label')}</span>
          <strong className="site-header__text-xs text-secondary-text">{currentLabel}</strong>
        </span>
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t('language.switcher')}
          className={cn(
            // Align to start so the menu opens toward the center (switcher sits on the
            // start side of the utility row). end-0 pushed it off the viewport edge.
            'absolute start-0 top-full z-50 mt-2 min-w-[10rem] max-w-[calc(100vw-2rem)] overflow-hidden',
            'rounded-2xl border border-border-subtle bg-card p-1.5 shadow-lg',
          )}
        >
          {SUPPORTED_LANGUAGES.map((language) => {
            const selected = language === currentLanguage
            return (
              <li key={language} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={cn(
                    'mx-1.5 flex w-[calc(100%-0.75rem)] items-center rounded-xl px-3.5 py-3 text-start text-sm font-medium transition-colors',
                    selected
                      ? 'bg-accent/10 text-accent'
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
