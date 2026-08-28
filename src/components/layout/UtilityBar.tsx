// src/components/layout/UtilityBar.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Moon, Package, Search } from 'lucide-react'
import { SEARCH_PATH } from '../../config/routes'
import { useTheme } from '../../context/ThemeContext'
import { useUtilityBarPromos } from '../../hooks/useUtilityBarPromos'
import { useCarouselAutoplay } from '../../hooks/useCarouselAutoplay'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { typeSmallClasses } from '../ui/typography'

export interface UtilityPromo {
  title: string
  subtitle: string
}

export function UtilityBar() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const { promos, rotateIntervalMs } = useUtilityBarPromos()
  const [activeIndex, setActiveIndex] = useState(0)

  const advance = useCallback(() => {
    setActiveIndex((current) => (current + 1) % promos.length)
  }, [promos.length])

  useEffect(() => {
    setActiveIndex(0)
  }, [promos.length])

  const { onMouseEnter, onMouseLeave } = useCarouselAutoplay({
    enabled: promos.length > 1,
    intervalMs: rotateIntervalMs,
    onAdvance: advance,
  })

  const activePromo = promos[activeIndex] ?? promos[0]

  function submitSearch() {
    const keyword = searchValue.trim()
    if (!keyword) return
    navigate(`${SEARCH_PATH}?keyword=${encodeURIComponent(keyword)}`)
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      submitSearch()
    }
  }

  return (
    <section className="border-b border-border-subtle bg-background">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-3 py-2.5 sm:px-4 sm:py-3 min-[769px]:flex-row min-[769px]:items-center min-[769px]:justify-between min-[769px]:gap-4 lg:px-6">
        <div
          className="flex min-w-0 items-center gap-3"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input text-icon-secondary">
            <Package size={18} aria-hidden />
          </div>
          <div
            className="relative min-h-[2.75rem] min-w-0 overflow-hidden"
            aria-live="polite"
            aria-atomic="true"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${activeIndex}-${activePromo.title}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="min-w-0"
              >
                <p
                  className={['truncate text-primary-text', typeSmallClasses, 'text-start'].join(
                    ' ',
                  )}
                >
                  {activePromo.title}
                </p>
                <p className="truncate text-[length:var(--font-size-small)] leading-[var(--line-height-small)] text-secondary-text">
                  {activePromo.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="relative w-full min-[769px]:max-w-sm min-[769px]:flex-1">
          <label htmlFor="site-search" className="sr-only">
            {t('search.label')}
          </label>
          <Search
            size={18}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-secondary-text"
            aria-hidden
          />
          <input
            id="site-search"
            type="search"
            placeholder={t('search.placeholder')}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="h-11 w-full rounded-full bg-input py-2.5 ps-10 pe-4 text-[length:var(--font-size-small)] leading-[var(--line-height-small)] text-primary-text placeholder:text-placeholder-text focus:outline-none focus:ring-2 focus:ring-button-primary/50"
          />
        </div>

        <div className="flex w-full items-center justify-between gap-3 min-[769px]:w-auto min-[769px]:min-w-[280px] min-[769px]:justify-end min-[1025px]:min-w-[300px]">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggleTheme}
            className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 text-start min-[769px]:flex-initial"
          >
            <Moon size={30} strokeWidth={1.75} className="text-secondary-text" aria-hidden />
            <span className="flex flex-col items-start">
              <span className={typeSmallClasses}>{t('theme.changeTheme')}</span>
              <strong className="capitalize text-[length:var(--font-size-small)] leading-[var(--line-height-small)] font-normal text-secondary-text">
                {theme}
              </strong>
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
