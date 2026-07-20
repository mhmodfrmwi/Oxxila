// src/components/routing/ScrollToTop.tsx
import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Scrolls to the top on client-side navigations (Link / navigate).
 * Skips hash targets (handled by HashScrollHandler) and POP so back/forward
 * can restore the previous scroll position.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (hash) return
    if (navigationType === 'POP') return

    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash, navigationType])

  return null
}
