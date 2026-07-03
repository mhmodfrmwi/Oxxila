// src/components/cart/CartPageSkeleton.tsx
export function CartPageSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="h-10 w-56 animate-pulse rounded-lg bg-surface-muted" />
      <div className="h-12 animate-pulse rounded-xl bg-surface-muted" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-xl bg-surface-muted" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    </div>
  )
}
