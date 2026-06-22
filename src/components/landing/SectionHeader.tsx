import { cn } from '../../lib/cn'
import { Heading } from '../ui/Heading'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  align = 'left',
  className = '',
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        align === 'center' ? 'text-center' : 'text-left',
        className,
      )}
    >
      <Heading variant="section">{title}</Heading>
      {subtitle && (
        <p
          className={cn(
            'mt-2 max-w-2xl text-sm text-secondary-text md:text-base lg:text-lg',
            align === 'center' && 'mx-auto',
          )}
        >
          {subtitle}
        </p>
      )}
    </header>
  )
}
