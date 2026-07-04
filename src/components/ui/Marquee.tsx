// src/components/ui/Marquee.tsx
import { type ReactNode } from 'react'
import { CarouselFrame } from '../carousel/CarouselFrame'

export interface MarqueeProps {
  children: ReactNode
  /** Duration in seconds for one full loop */
  duration?: number
  pauseOnHover?: boolean
  className?: string
  trackClassName?: string
}

/**
 * Infinite logo/content marquee.
 * Layout stays LTR (via CarouselFrame) so the duplicated track is seamless.
 * Animation direction follows `html[dir]` — reverse only the keyframes in RTL.
 */
export function Marquee({
  children,
  duration = 40,
  pauseOnHover = true,
  className = '',
  trackClassName = '',
}: MarqueeProps) {
  return (
    <CarouselFrame className={['group/marquee w-full overflow-hidden', className].join(' ')}>
      <div
        className={[
          'marquee-track flex w-max motion-reduce:animate-none',
          pauseOnHover ? 'group-hover/marquee:[animation-play-state:paused]' : '',
          'animate-marquee',
          trackClassName,
        ].join(' ')}
        style={{ animationDuration: `${duration}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </CarouselFrame>
  )
}
