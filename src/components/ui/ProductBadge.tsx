import { cn } from '../../lib/cn'

interface ProductBadgeProps {
  children: string
  className?: string
}

export function ProductBadge({ children, className }: ProductBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1',
        'text-[10px] font-medium tracking-wide uppercase',
        'bg-button-primary-hover text-primary-text',
        'dark:bg-button-primary dark:text-on-emphasis',
        className,
      )}
    >
      {children}
    </span>
  )
}
