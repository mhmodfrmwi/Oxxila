// src/hooks/useAdminUrlOpen.ts
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Opens an admin drawer/detail when `?open=<id>` is present, then clears the param.
 */
export function useAdminUrlOpen(
  onOpen: (id: string) => void,
  paramName = 'open',
) {
  const [searchParams, setSearchParams] = useSearchParams()
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen

  useEffect(() => {
    const id = searchParams.get(paramName)?.trim()
    if (!id) return

    onOpenRef.current(id)

    const next = new URLSearchParams(searchParams)
    next.delete(paramName)
    setSearchParams(next, { replace: true })
  }, [paramName, searchParams, setSearchParams])
}
