// src/components/admin/layout/AdminNavIcon.tsx
import { cn } from '../../../lib/cn'

interface AdminNavIconProps {
  src: string
  /** Native Figma frame size in px (20 for products, 24 for the rest). */
  size: 20 | 24
  className?: string
}

/**
 * Renders the exact SVG asset exported from Figma Component 50 as an <img>.
 * No CSS mask, no path rewriting, no icon library fallback.
 */
export function AdminNavIcon({ src, size, className }: AdminNavIconProps) {
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn('shrink-0 object-contain', className)}
      aria-hidden
    />
  )
}
