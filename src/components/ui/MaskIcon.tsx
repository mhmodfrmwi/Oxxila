// src/components/ui/MaskIcon.tsx
import { cn } from '../../lib/cn'

interface MaskIconProps {
  src: string
  /** Native SVG size — preserves the asset's exact geometry. */
  width: number
  height: number
  /** Figma icon frame; the glyph is centered inside it. */
  frame?: number
  className?: string
}

/** Paints an SVG asset with currentColor (via CSS mask) so baked-in colors follow theme tokens. */
export function MaskIcon({ src, width, height, frame, className }: MaskIconProps) {
  const mask = `url("${src}") center / 100% 100% no-repeat`

  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center', className)}
      style={frame ? { width: frame, height: frame } : undefined}
    >
      <span className="block bg-current" style={{ width, height, mask, WebkitMask: mask }} />
    </span>
  )
}
