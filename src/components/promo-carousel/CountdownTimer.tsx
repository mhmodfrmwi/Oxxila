// src/components/promo-carousel/CountdownTimer.tsx
import { useTranslation } from 'react-i18next'
import { formatCountdown, useCountdown } from './useCountdown'

interface CountdownTimerProps {
  targetDate: Date | string
  label?: string
}

export function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const { t } = useTranslation()
  const countdown = useCountdown(targetDate)
  const resolvedLabel = label ?? t('shop.offers.openIn')
  const time = countdown.isExpired ? '00:00:00' : formatCountdown(countdown)

  return (
    <div className="promo-countdown-card__timer-block">
      <span className="promo-countdown-card__label">{resolvedLabel}</span>
      <time
        className="promo-countdown-card__time"
        dateTime={String(targetDate)}
        role="timer"
        aria-live="polite"
      >
        {time}
      </time>
    </div>
  )
}
