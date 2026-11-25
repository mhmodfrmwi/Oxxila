import { cn } from '../../lib/cn'

export type ProductBadgeKind = 'bestSeller' | 'certified' | 'bundle'

interface ProductBadgeProps {
  children: string
  /** Kept for callers; every kind uses the same brand pill. */
  kind?: ProductBadgeKind | string
  /** sm = product cards, md = product page / large cards. */
  size?: 'xs' | 'sm' | 'md' | 'card'
  className?: string
}

/** The original brand pill, just a touch bolder and more readable on product photos. */
export function ProductBadge({ children, size = 'md', className }: ProductBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full whitespace-nowrap',
        size === 'card'
          ? 'px-2 py-[3px] text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px] lg:px-3 lg:py-1 lg:text-xs'
          : size === 'xs'
            ? 'px-2 py-[3px] text-[10px]'
          : size === 'sm'
            ? 'px-3 py-1 text-[11px]'
            : 'px-3.5 py-1.5 text-xs',
        'font-semibold tracking-wide uppercase',
        'bg-button-primary-hover text-primary-text',
        'dark:bg-[#4a4180]/90 dark:text-[#e7deff] dark:ring-white/10',
        'shadow-sm ring-1 ring-black/5',
        className,
      )}
    >
      {children}
    </span>
  )
}
