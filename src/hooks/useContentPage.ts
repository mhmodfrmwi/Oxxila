// src/hooks/useContentPage.ts
import { useEffect, useRef, useState } from 'react'
import {
  getContentPage,
  type ApiContentPage,
  type ContentPageSlug,
} from '../api/settings'
import { ApiError } from '../lib/api'

export function useContentPage(slug: ContentPageSlug) {
  const [page, setPage] = useState<ApiContentPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const requestId = ++requestIdRef.current

    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const response = await getContentPage(slug)
        if (requestId !== requestIdRef.current) return

        if (!response.data) {
          setPage(null)
          setError(response.message || 'Page not found')
          setLoading(false)
          return
        }

        setPage(response.data)
        setLoading(false)
      } catch (err) {
        if (requestId !== requestIdRef.current) return
        setPage(null)
        setError(
          err instanceof ApiError
            ? err.message
            : 'Unable to load page content.',
        )
        setLoading(false)
      }
    })()
  }, [slug])

  return { page, loading, error }
}
