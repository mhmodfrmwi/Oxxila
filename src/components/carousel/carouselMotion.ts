import type { CarouselViewport } from './useCarouselViewport'

export const CAROUSEL_TRANSITION_MS = 500

export const carouselTransition = {
  duration: CAROUSEL_TRANSITION_MS / 1000,
  ease: [0.25, 0.1, 0.25, 1] as const,
}

interface CardMotion {
  x: number
  scale: number
  opacity: number
  zIndex: number
}

/** Layered cover-flow motion — adapts per viewport. */
export function getLayeredCardMotion(offset: number, viewport: CarouselViewport): CardMotion {
  if (viewport === 'mobile') {
    if (offset === 0) {
      return { x: 0, scale: 1, opacity: 1, zIndex: 30 }
    }
    return { x: offset * 28, scale: 0.94, opacity: 0, zIndex: 0 }
  }

  if (viewport === 'tablet') {
    const distance = Math.abs(offset)
    if (distance === 0) {
      return { x: 0, scale: 1, opacity: 1, zIndex: 30 }
    }
    if (distance === 1) {
      return { x: offset * 220, scale: 0.93, opacity: 0.55, zIndex: 20 }
    }
    return { x: offset * 280, scale: 0.9, opacity: 0, zIndex: 0 }
  }

  // Offsets scaled for ~828px banner cards (laptop/small desktop).
  // Large monitors use 900px cards; overlap stays proportional.
  const distance = Math.abs(offset)

  if (distance > 2) {
    return { x: offset * 276, scale: 0.86, opacity: 0, zIndex: 0 }
  }

  if (distance === 0) {
    return { x: 0, scale: 1, opacity: 1, zIndex: 30 }
  }

  if (distance === 1) {
    return { x: offset * 256, scale: 0.92, opacity: 0.58, zIndex: 20 }
  }

  return { x: offset * 313, scale: 0.88, opacity: 0.28, zIndex: 10 }
}
