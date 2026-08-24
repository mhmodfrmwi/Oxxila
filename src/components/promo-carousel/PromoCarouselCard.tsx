// src/components/promo-carousel/PromoCarouselCard.tsx
import { useTheme } from '../../context/ThemeContext'
import { cn } from '../../lib/cn'
import lockDark from '../../assets/promo/lock-dark.png'
import lockLight from '../../assets/promo/lock-light.png'
import { CountdownTimer } from './CountdownTimer'

export type PromoCarouselBackgroundVariant = 'light' | 'dark'

export interface PromoCarouselCardProps {
  title: string
  targetDate: Date | string
  backgroundVariant?: PromoCarouselBackgroundVariant
  countdownLabel?: string
  className?: string
}

export function PromoCarouselCard({
  title,
  targetDate,
  backgroundVariant,
  countdownLabel,
  className,
}: PromoCarouselCardProps) {
  const { theme } = useTheme()
  const isDark = (backgroundVariant ?? theme) === 'dark'
  const lockSrc = isDark ? lockDark : lockLight

  return (
    <article
      className={cn('promo-countdown-card w-full', className)}
      data-promo-countdown-variant={isDark ? 'dark' : 'light'}
    >
      <div className="promo-countdown-card__stripe" aria-hidden />

      <div className="promo-countdown-card__content">
        <h3 className="promo-countdown-card__title">{title}</h3>

        <img
          className="promo-countdown-card__lock"
          src={lockSrc}
          alt=""
          width={333}
          height={333}
          decoding="async"
          aria-hidden
        />

        <div className="promo-countdown-card__timer-wrap">
          <CountdownTimer targetDate={targetDate} label={countdownLabel} />
        </div>
      </div>
    </article>
  )
}
