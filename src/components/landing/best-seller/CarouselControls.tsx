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
                  ? 'w-8 bg-oxxila-accent dark:bg-[#9886FF]'
                  : 'w-2 bg-[#C0B5DE]/60 hover:bg-oxxila-accent/60 dark:bg-white/20 dark:hover:bg-white/40',
              ].join(' ')}
            />
          </button>
        )
      })}
    </div>
  )
}
