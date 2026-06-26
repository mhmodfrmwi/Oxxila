import { useCallback, useEffect, useState } from 'react'

interface UseCarouselAutoplayOptions {
  enabled: boolean
  intervalMs: number
  onAdvance: () => void
}

export function useCarouselAutoplay({
  enabled,
  intervalMs,
  onAdvance,
}: UseCarouselAutoplayOptions) {
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused || !enabled) return
    const timer = window.setInterval(onAdvance, intervalMs)
    return () => window.clearInterval(timer)
  }, [isPaused, enabled, intervalMs, onAdvance])

  const onMouseEnter = useCallback(() => setIsPaused(true), [])
  const onMouseLeave = useCallback(() => setIsPaused(false), [])

  return { isPaused, onMouseEnter, onMouseLeave }
}
