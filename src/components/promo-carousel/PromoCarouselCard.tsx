import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { CountdownTimer } from './CountdownTimer'

export type PromoCarouselBackgroundVariant = 'light' | 'dark'

export interface PromoCarouselCardProps {
  title: string
  targetDate: Date | string
  icon?: ReactNode
  backgroundVariant: PromoCarouselBackgroundVariant
  className?: string
}

export function PromoCarouselCard({
  title,
  targetDate,
  icon,
  backgroundVariant,
  className,
}: PromoCarouselCardProps) {
  return (
    <article
      className={cn(
        'promo-countdown-card w-full',
        'transition-transform duration-500 ease-out',
        'lg:[@media(hover:hover)]:hover:scale-[1.01]',
        className,
      )}
      data-promo-countdown-variant={backgroundVariant}
    >
      <div className="promo-countdown-card__bg" aria-hidden>
        <div className="promo-countdown-card__bg-stripe" aria-hidden />
      </div>

      <div className="promo-countdown-card__content">
        <h3 className="promo-countdown-card__title">{title}</h3>

        <div className="promo-countdown-card__badge mx-auto" aria-hidden>
          <span className="promo-countdown-card__badge-icon">
            {icon ?? <Lock strokeWidth={2.25} aria-hidden />}
          </span>
        </div>

        <div className="promo-countdown-card__timer-wrap">
          <CountdownTimer targetDate={targetDate} />
        </div>
      </div>
    </article>
  )
}
