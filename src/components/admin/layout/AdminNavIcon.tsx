// src/components/admin/layout/AdminNavIcon.tsx
import { cn } from '../../../lib/cn'
import { ADMIN_UI_SCALE } from '../config/adminPageShell'

interface AdminNavIconProps {
  src: string
  /** Native Figma frame size in px (20 for products, 24 for the rest). */
  size: 20 | 24
  className?: string
}

/**
 * Renders the exact SVG asset exported from Figma Component 50 as an <img>.
 * Display size is Figma × ADMIN_UI_SCALE (no CSS zoom/transform).
 */
export function AdminNavIcon({ src, size, className }: AdminNavIconProps) {
  const display = Math.round(size * ADMIN_UI_SCALE)

  return (
    <img
      src={src}
      alt=""
      width={display}
      height={display}
      className={cn('shrink-0 object-contain', className)}
      aria-hidden
    />
  )
}
