import { type ReactNode } from 'react'

export interface MarqueeProps {
  children: ReactNode
  /** Duration in seconds for one full loop */
  duration?: number
  pauseOnHover?: boolean
  className?: string
  trackClassName?: string
}

export function Marquee({
  children,
  duration = 40,
  pauseOnHover = true,
  className = '',
  trackClassName = '',
}: MarqueeProps) {
  return (
    <div
      className={[
        'group/marquee relative w-full overflow-hidden',
        className,
      ].join(' ')}
    >
      <div
        className={[
          'flex w-max motion-reduce:animate-none',
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
    </div>
  )
}
