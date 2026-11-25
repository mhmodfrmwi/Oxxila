import { type ElementType, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

type HeadingVariant =
  | 'page'
  | 'page-lg'
  | 'section'
  | 'section-lg'
  | 'section-md'
  | 'section-compact'
  | 'card'
  | 'card-sm'
  | 'hero'
  | 'hero-lg'

const variantClasses: Record<HeadingVariant, string> = {
  page: 'font-display text-3xl font-medium text-primary-text sm:text-4xl',
  'page-lg': 'font-display text-4xl font-medium text-primary-text sm:text-[2.75rem]',
  section: 'font-display text-3xl font-medium text-primary-text md:text-4xl lg:text-5xl',
  /** Figma Heading1 — responsive 36 / 44 / 52px */
  'section-lg': 'font-display text-heading-1 font-normal text-primary-text',
  /** Figma Heading4 — responsive 25 / 31 / 36px */
  'section-md': 'font-display text-heading-4 font-normal text-primary-text',
  /** Figma Heading5 — responsive 22 / 28 / 32px (shop section titles) */
  'section-compact': 'font-display text-heading-5 font-normal text-primary-text',
  card: 'font-display text-lg font-medium text-primary-text',
  'card-sm': 'font-display text-sm font-medium text-primary-text sm:text-base',
  hero: 'font-display text-4xl font-medium leading-[1.15] text-primary-text md:text-5xl lg:text-6xl',
  'hero-lg': 'font-display text-5xl font-medium leading-[1.15] text-primary-text xl:text-6xl 2xl:text-7xl',
}

const defaultElement: Record<HeadingVariant, ElementType> = {
  page: 'h1',
  'page-lg': 'h1',
  section: 'h2',
  'section-lg': 'h2',
  'section-md': 'h2',
  'section-compact': 'h2',
  card: 'h3',
  'card-sm': 'h3',
  hero: 'h1',
  'hero-lg': 'h1',
}

interface HeadingProps {
  variant?: HeadingVariant
  as?: ElementType
  id?: string
  className?: string
  children: ReactNode
}

export function Heading({
  variant = 'section',
  as,
  id,
  className,
  children,
}: HeadingProps) {
  const Component = as ?? defaultElement[variant]

  return (
    <Component id={id} className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  )
}
