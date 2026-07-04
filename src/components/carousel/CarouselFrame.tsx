// src/components/carousel/CarouselFrame.tsx
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type CarouselFrameProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  as?: 'div' | 'section'
}

/**
 * Isolates transform/drag carousels from document RTL.
 *
 * Framer Motion uses physical X (left/right). Under `html[dir=rtl]`, flex
 * and percentage transforms break scroll, drag, and infinite loops.
 * Force LTR layout on the motion track only — do not use row-reverse.
 *
 * Marquee is separate: it keeps LTR layout and reverses animation via CSS.
 */
export function CarouselFrame({
  children,
  className,
  as: Component = 'div',
  ...props
}: CarouselFrameProps) {
  return (
    <Component dir="ltr" className={cn('relative', className)} {...props}>
      {children}
    </Component>
  )
}
