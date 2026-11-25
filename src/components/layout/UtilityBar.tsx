// src/components/layout/UtilityBar.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { Sun } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import deliveryReturnIcon from '../../assets/header/delivery-return-01.svg'
import moneyReceiveIcon from '../../assets/header/money-receive-circle.svg'
import moonIcon from '../../assets/header/moon.svg'
import packageDeliveredIcon from '../../assets/header/package-delivered.svg'
import truckIcon from '../../assets/header/truck.svg'
import { useTheme } from '../../context/ThemeContext'
import { useUtilityBarPromos } from '../../hooks/useUtilityBarPromos'
import { useCarouselAutoplay } from '../../hooks/useCarouselAutoplay'
import { cn } from '../../lib/cn'
import { SearchAutocomplete } from './SearchAutocomplete'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { MaskIcon } from '../ui/MaskIcon'

export interface UtilityPromo {
  title: string
  subtitle: string
}

/** Figma "ads" slides, in order; promos cycle through them by index. */
const PROMO_ICONS = [
  { src: truckIcon, width: 28.1667, height: 22.8333 },
  { src: moneyReceiveIcon, width: 28.1667, height: 28.1667 },
  { src: deliveryReturnIcon, width: 28.1671, height: 28.1667 },
  { src: packageDeliveredIcon, width: 26.8335, height: 28.1667, flipped: true },
] as const

export function UtilityBar() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
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
  const promoIcon = PROMO_ICONS[activeIndex % PROMO_ICONS.length]

  return (
    <section className="site-header bg-background">
      <div className="grid grid-cols-1 items-center gap-3 px-[var(--page-gutter)] py-2.5 sm:py-3 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-large md:gap-y-small lg:pt-small lg:pb-medium xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)_minmax(0,1fr)]">
        <div
          className="site-header__promo relative flex min-w-0 items-center overflow-hidden"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
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
              className="flex min-w-0 items-center gap-small"
            >
              <MaskIcon
                src={promoIcon.src}
                width={promoIcon.width}
                height={promoIcon.height}
                frame={32}
                className={cn('text-icon-secondary', 'flipped' in promoIcon && '-scale-y-100')}
              />
              <div className="min-w-0 text-start">
                <p className="site-header__text-base truncate text-primary-text">
                  {activePromo.title}
                </p>
                <p className="site-header__text-xs truncate text-secondary-text">
                  {activePromo.subtitle}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <SearchAutocomplete className="w-full md:col-span-2 md:row-start-2 xl:col-span-1 xl:col-start-2 xl:row-start-1" />

        <div className="flex min-w-0 items-center justify-between gap-3 md:col-start-2 md:row-start-1 md:justify-end md:gap-extra-large xl:col-start-3">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggleTheme}
            className="flex min-h-11 min-w-0 items-center gap-1.5 text-start"
          >
            {theme === 'dark' ? (
              <span className="inline-flex size-8 shrink-0 items-center justify-center text-icon-secondary" aria-hidden>
                <Sun size={32} strokeWidth={1.5} />
              </span>
            ) : (
              <MaskIcon
                src={moonIcon}
                width={26.8334}
                height={26.8334}
                frame={32}
                className="text-icon-secondary"
              />
            )}
            <span className="flex flex-col items-start">
              <span className="site-header__text-base text-primary-text">
                {t('theme.changeTheme')}
              </span>
              <strong className="site-header__text-xs text-secondary-text">
                {theme === 'dark' ? t('theme.dark') : t('theme.light')}
              </strong>
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
