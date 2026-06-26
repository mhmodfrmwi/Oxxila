import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface PageBleedProps {
  children: ReactNode
  className?: string
}

export function PageBleed({ children, className }: PageBleedProps) {
  return (
    <div
      className={cn(
        '-mx-3 -my-4 overflow-x-clip sm:-mx-4 sm:-my-5 lg:-mx-6 lg:-my-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
