import { type ElementType, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

type HeadingVariant = 'page' | 'page-lg' | 'section' | 'card' | 'card-sm' | 'hero' | 'hero-lg'

const variantClasses: Record<HeadingVariant, string> = {
  page: 'font-serif text-3xl font-medium text-primary-text sm:text-4xl',
  'page-lg': 'font-serif text-4xl font-medium text-primary-text sm:text-[2.75rem]',
  section: 'font-serif text-3xl font-medium text-primary-text md:text-4xl lg:text-5xl',
  card: 'font-serif text-lg font-medium text-primary-text',
  'card-sm': 'font-serif text-sm font-medium text-primary-text sm:text-base',
  hero: 'font-serif text-4xl font-medium leading-[1.15] text-primary-text md:text-5xl lg:text-6xl',
  'hero-lg': 'font-serif text-5xl font-medium leading-[1.15] text-primary-text xl:text-6xl 2xl:text-7xl',
}

const defaultElement: Record<HeadingVariant, ElementType> = {
  page: 'h1',
  'page-lg': 'h1',
  section: 'h2',
  card: 'h3',
  'card-sm': 'h3',
  hero: 'h1',
  'hero-lg': 'h1',
}

interface HeadingProps {
  variant?: HeadingVariant
  as?: ElementType
  className?: string
  children: ReactNode
}

export function Heading({
  variant = 'section',
  as,
  className,
  children,
}: HeadingProps) {
  const Component = as ?? defaultElement[variant]

  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  )
}
