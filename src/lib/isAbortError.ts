// src/lib/isAbortError.ts

/** True when an error originates from an aborted fetch (AbortController). */
export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}
