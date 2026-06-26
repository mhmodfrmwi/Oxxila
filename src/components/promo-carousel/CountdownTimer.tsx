import { formatCountdown, useCountdown } from './useCountdown'

interface CountdownTimerProps {
  targetDate: Date | string
  label?: string
}

export function CountdownTimer({ targetDate, label = 'open in' }: CountdownTimerProps) {
  const countdown = useCountdown(targetDate)
  const display = countdown.isExpired ? '00:00:00' : formatCountdown(countdown)

  return (
    <div className="promo-countdown-card__timer-block">
      <span className="promo-countdown-card__label">{label}</span>
      <time dateTime={display} className="promo-countdown-card__timer">
        {display}
      </time>
    </div>
  )
}
