import { Star } from 'lucide-react'
import { cn } from '../../../lib/cn'

interface StarDisplayProps {
  rating: number
  size?: number
  className?: string
}

export function StarDisplay({ rating, size = 16, className }: StarDisplayProps) {
  return (
    <div className={cn('flex items-center gap-[3px]', className)} aria-hidden>
      {Array.from({ length: 5 }, (_, index) => {
        const fillAmount = Math.min(1, Math.max(0, rating - index))
        const isFilled = fillAmount >= 1

        return (
          <Star
            key={index}
            size={size}
            className={cn(
              isFilled
                ? 'fill-support-warning text-support-warning'
                : 'fill-transparent text-support-warning/35',
            )}
            strokeWidth={1.5}
          />
        )
      })}
    </div>
  )
}
