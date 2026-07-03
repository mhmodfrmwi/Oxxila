// src/components/ui/RouteFallback.tsx
export function RouteFallback() {
  return (
    <div
      className="container-content flex min-h-[40vh] items-center justify-center py-16"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border-subtle border-t-button-primary" />
    </div>
  )
}
