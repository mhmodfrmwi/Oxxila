import { useMediaQuery } from '../../hooks/useMediaQuery'
import { ContentSection } from '../layout/ContentSection'
import { StripCarousel } from '../carousel/StripCarousel'
import { CategoryCard } from './CategoryCard'
import { useLandingCatalogContext } from '../../hooks/useLandingCatalogContext'
import { SectionHeader } from './SectionHeader'
import { cn } from '../../lib/cn'

const TABLET_GRID_BREAKPOINT = '(min-width: 640px)'
const LARGE_GRID_BREAKPOINT = '(min-width: 1024px)'

function ConcernSkeleton({ layout }: { layout: 'grid' | 'carousel' }) {
  return (
    <div
      className={cn(
        'h-[min(280px,72vw)] animate-pulse rounded-3xl bg-surface-muted/70 dark:bg-surface-subtle/30',
        layout === 'carousel'
          ? 'w-[min(200px,78vw)] shrink-0 min-[480px]:w-[210px]'
          : 'min-w-0 w-full',
      )}
      aria-hidden
    />
  )
}

function ConcernGrid({ columns }: { columns: 3 | 6 }) {
  const { skinConcerns, loading } = useLandingCatalogContext()

  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 6 ? 'grid-cols-3 gap-4 lg:grid-cols-6 lg:gap-5' : 'grid-cols-3 gap-4',
      )}
    >
      {loading
        ? Array.from({ length: 6 }).map((_, index) => (
            <ConcernSkeleton key={index} layout="grid" />
          ))
        : skinConcerns.map((concern) => (
            <CategoryCard
              key={concern.id}
              name={concern.name}
              image={concern.image}
              href={concern.href}
              layout="grid"
            />
          ))}
    </div>
  )
}

function ConcernCarousel() {
  const { skinConcerns, loading } = useLandingCatalogContext()

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <ConcernSkeleton key={index} layout="carousel" />
        ))}
      </div>
    )
  }

  return (
    <StripCarousel
      items={skinConcerns}
      getItemKey={(concern) => concern.id}
      ariaLabel="Skin concerns"
      renderItem={(concern) => (
        <CategoryCard
          name={concern.name}
          image={concern.image}
          href={concern.href}
          layout="carousel"
        />
      )}
    />
  )
}

export interface SkinConcernSectionProps {
  title?: string
  subtitle?: string
  align?: 'left' | 'center'
  size?: 'default' | 'compact'
  className?: string
}

export function SkinConcernSection({
  title = 'Skin concerns',
  subtitle,
  align = 'left',
  size = 'compact',
  className,
}: SkinConcernSectionProps) {
  const isTabletGrid = useMediaQuery(TABLET_GRID_BREAKPOINT)
  const isLargeGrid = useMediaQuery(LARGE_GRID_BREAKPOINT)

  return (
    <ContentSection
      aria-labelledby="skin-concerns-heading"
      className={className}
      padding={size === 'default' ? 'spacious' : 'default'}
    >
      <SectionHeader
        id="skin-concerns-heading"
        align={align}
        title={title}
        subtitle={subtitle}
        size={size}
        className={align === 'center' ? 'mx-auto [&_p]:mx-auto [&_p]:text-secondary-text' : undefined}
      />

      <div className={cn(size === 'default' && 'mt-8 min-[1025px]:pt-6')}>
        {isLargeGrid ? (
          <ConcernGrid columns={6} />
        ) : isTabletGrid ? (
          <ConcernGrid columns={3} />
        ) : (
          <ConcernCarousel />
        )}
      </div>
    </ContentSection>
  )
}
