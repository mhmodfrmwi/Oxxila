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
      className={[
        align === 'center' ? 'text-center' : 'text-left',
        className,
      ].join(' ')}
    >
      <h2 className="font-serif text-3xl font-medium text-text-primary-light dark:text-text-primary-dark md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm text-text-secondary-light dark:text-text-secondary-dark md:text-base lg:text-lg">
          {subtitle}
        </p>
      )}
    </header>
  )
}
