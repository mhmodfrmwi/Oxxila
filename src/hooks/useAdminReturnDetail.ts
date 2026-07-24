// src/hooks/useAdminReturnDetail.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { getAdminReturn } from '../api/admin/returns'
import { ApiError } from '../lib/api'
import type { AdminReturnDetail } from '../types/adminReturns'
import { mapApiReturnToDetail } from '../utils/adminReturnsFormat'

interface UseAdminReturnDetailOptions {
  returnId: string | null
}

interface ReturnDetailState {
  returnDetail: AdminReturnDetail | null
  loading: boolean
  error: string | null
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

/** Loads a single return's detail when a row is selected in the Returns split view. */
export function useAdminReturnDetail({ returnId }: UseAdminReturnDetailOptions) {
  const [state, setState] = useState<ReturnDetailState>({
    returnDetail: null,
    loading: false,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    if (!returnId) {
      setState({ returnDetail: null, loading: false, error: null })
      return
    }

    const requestId = ++requestIdRef.current
    const controller = new AbortController()

    setState((previous) => ({
      returnDetail: previous.returnDetail?.id === returnId ? previous.returnDetail : null,
      loading: true,
      error: null,
    }))

    void (async () => {
      try {
        const response = await getAdminReturn(returnId, { signal: controller.signal })
        if (requestId !== requestIdRef.current) return
        const data = response.data
        if (!data) {
          setState({
            returnDetail: null,
            loading: false,
            error: response.message || 'Return request not found',
          })
          return
        }
        setState({ returnDetail: mapApiReturnToDetail(data), loading: false, error: null })
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Unable to load return request'
        setState({ returnDetail: null, loading: false, error: message })
      }
    })()

    return () => {
      controller.abort()
    }
  }, [returnId, reloadToken])

  return {
    returnDetail: state.returnDetail,
    loading: state.loading,
    error: state.error,
    reload,
  }
}
