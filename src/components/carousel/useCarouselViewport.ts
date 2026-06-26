import { useMediaQuery } from '../../hooks/useMediaQuery'

export type CarouselViewport = 'mobile' | 'tablet' | 'desktop'

/** mobile < 640px · tablet 640–768px · desktop ≥ 769px */
export function useCarouselViewport(): CarouselViewport {
  const isMobile = useMediaQuery('(max-width: 639px)')
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 768px)')

  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  return 'desktop'
}
