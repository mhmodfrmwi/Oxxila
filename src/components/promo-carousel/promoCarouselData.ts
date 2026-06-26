import type { CountdownPromoSlide } from './CountdownPromoCarousel'

const HOUR_MS = 60 * 60 * 1000
const MINUTE_MS = 60 * 1000

function hoursFromNow(hours: number, minutes = 0, seconds = 0) {
  return new Date(Date.now() + hours * HOUR_MS + minutes * MINUTE_MS + seconds * 1000)
}

export const promoCarouselSlides: CountdownPromoSlide[] = [
  {
    id: 'big-sale-light',
    title: 'Big Sale !!',
    targetDate: hoursFromNow(0, 45, 13),
    backgroundVariant: 'light',
  },
  {
    id: 'big-sale-dark',
    title: 'Big Sale !!',
    targetDate: hoursFromNow(2, 12, 48),
    backgroundVariant: 'dark',
  },
  {
    id: 'flash-deal-light',
    title: 'Flash Deal !!',
    targetDate: hoursFromNow(1, 5, 30),
    backgroundVariant: 'light',
  },
]
