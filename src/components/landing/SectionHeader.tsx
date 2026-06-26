import { shopSectionHeaderSpacingClasses } from '../ui/interactionStyles'
import { cn } from '../../lib/cn'
import { Heading } from '../ui/Heading'

interface SectionHeaderProps {
  id?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  size?: 'default' | 'compact'
  className?: string
}

export function SectionHeader({
  id,
  title,
  subtitle,
  align = 'left',
  size = 'default',
  className = '',
}: SectionHeaderProps) {
  const headingVariant = size === 'compact' ? 'section-compact' : 'section'

  return (
    <header
      className={cn(
        align === 'center' ? 'text-center' : 'text-left',
        size === 'compact' && shopSectionHeaderSpacingClasses,
        className,
      )}
    >
      <Heading variant={headingVariant} id={id}>
        {title}
      </Heading>
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
