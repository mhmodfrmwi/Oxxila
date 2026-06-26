interface CarouselControlsProps {
  count: number
  activeIndex: number
  onSelect: (index: number) => void
}

export function CarouselControls({ count, activeIndex, onSelect }: CarouselControlsProps) {
  return (
    <div className="flex items-center justify-center gap-1" role="tablist" aria-label="Product carousel">
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to product ${index + 1}`}
            onClick={() => onSelect(index)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full"
          >
            <span
              className={[
                'block h-2 rounded-full transition-all duration-300 ease-out',
                isActive
                  ? 'w-8 bg-button-primary'
                  : 'w-2 bg-accent-muted/60 hover:bg-button-primary/60 dark:bg-on-emphasis/20 dark:hover:bg-on-emphasis/40',
              ].join(' ')}
            />
          </button>
        )
      })}
    </div>
  )
}
