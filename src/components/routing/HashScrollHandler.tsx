// src/components/routing/HashScrollHandler.tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to `location.hash` after client-side navigations (e.g. /home#contact, /shop#brand-stores-heading).
 * Retries briefly so lazy-loaded route content can mount first.
 */
export function HashScrollHandler() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return

    const id = decodeURIComponent(hash.replace(/^#/, ''))
    if (!id) return

    let cancelled = false
    const timeouts: number[] = []

    function tryScroll() {
      if (cancelled) return
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return true
      }
      return false
    }

    // Immediate + deferred attempts for Suspense / lazy sections.
    if (!tryScroll()) {
      timeouts.push(
        window.setTimeout(() => {
          if (!tryScroll()) {
            timeouts.push(window.setTimeout(tryScroll, 250))
          }
        }, 0),
      )
    }

    return () => {
      cancelled = true
      for (const timeoutId of timeouts) window.clearTimeout(timeoutId)
    }
  }, [pathname, hash])

  return null
}
