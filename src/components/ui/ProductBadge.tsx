import { cn } from '../../lib/cn'

export type ProductBadgeKind = 'bestSeller' | 'certified' | 'bundle'

interface ProductBadgeProps {
  children: string
  /** Kept for callers; every kind uses the same brand pill. */
  kind?: ProductBadgeKind | string
  /** sm = product cards, md = product page / large cards. */
  size?: 'sm' | 'md'
  className?: string
}

/** The original brand pill, just a touch bolder and more readable on product photos. */
export function ProductBadge({ children, size = 'md', className }: ProductBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full whitespace-nowrap',
        size === 'sm' ? 'px-3 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs',
        'font-semibold tracking-wide uppercase',
        'bg-button-primary-hover text-primary-text',
        'dark:bg-button-primary dark:text-on-emphasis',
        'shadow-sm ring-1 ring-black/5',
        className,
      )}
    >
      {children}
    </span>
  )
}
