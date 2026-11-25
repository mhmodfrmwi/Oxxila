import { shopSectionHeaderSpacingClasses } from '../ui/interactionStyles'
import { cn } from '../../lib/cn'
import { Heading } from '../ui/Heading'

type SectionHeaderSize = 'default' | 'medium' | 'compact'

interface SectionHeaderProps {
  id?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  /** default = Figma Heading1, medium = Heading4, compact = Heading5 (shop strips) */
  size?: SectionHeaderSize
  className?: string
}

const headingVariants = {
  default: 'section-lg',
  medium: 'section-md',
  compact: 'section-compact',
} as const

export function SectionHeader({
  id,
  title,
  subtitle,
  align = 'left',
  size = 'default',
  className = '',
}: SectionHeaderProps) {
  const isCompact = size === 'compact'

  return (
    <header
      className={cn(
        align === 'center' ? 'text-center' : 'text-start',
        isCompact && shopSectionHeaderSpacingClasses,
        className,
      )}
    >
      <Heading variant={headingVariants[size]} id={id}>
        {title}
      </Heading>
      {subtitle && (
        <p
          className={cn(
            isCompact
              ? 'mt-2 max-w-2xl text-sm text-secondary-text md:text-base lg:text-lg'
              : 'landing-type landing-text-base mt-2 max-w-[46rem] text-secondary-text',
            align === 'center' && 'mx-auto',
          )}
        >
          {subtitle}
        </p>
      )}
    </header>
  )
}
