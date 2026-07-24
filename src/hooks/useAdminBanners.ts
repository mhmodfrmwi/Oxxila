// src/hooks/useAdminBanners.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  deleteAdminBanner,
  getAdminBanners,
  setAdminBannerActive,
} from '../api/admin/banners'
import { ApiError } from '../lib/api'
import type { AdminBannerRow } from '../types/adminBanners'
import { mapApiBannerToRow } from '../utils/adminBannersFormat'

interface AsyncState {
  banners: AdminBannerRow[]
  loading: boolean
  error: string | null
}

export function useAdminBanners() {
  const [state, setState] = useState<AsyncState>({
    banners: [],
    loading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    setState((previous) => ({ ...previous, loading: true, error: null }))

    void (async () => {
      try {
        const response = await getAdminBanners({ signal: controller.signal })
        if (requestId !== requestIdRef.current) return
        setState({
          banners: (response.data ?? []).map(mapApiBannerToRow),
          loading: false,
          error: null,
        })
      } catch (error) {
        if (controller.signal.aborted || requestId !== requestIdRef.current)
          return
        if (isAbortError(error)) return
        setState((previous) => ({
          ...previous,
          loading: false,
          error:
            error instanceof ApiError
              ? error.message
              : 'Unable to load banners.',
        }))
      }
    })()

    return () => {
      controller.abort()
    }
  }, [reloadToken])

  const upsertBanner = useCallback((banner: AdminBannerRow) => {
    setState((previous) => {
      const index = previous.banners.findIndex((row) => row.id === banner.id)
      if (index === -1) {
        return { ...previous, banners: [banner, ...previous.banners] }
      }
      const next = [...previous.banners]
      next[index] = banner
      return { ...previous, banners: next }
    })
  }, [])

  const removeBanner = useCallback((id: string) => {
    setState((previous) => ({
      ...previous,
      banners: previous.banners.filter((row) => row.id !== id),
    }))
  }, [])

  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      const response = await setAdminBannerActive(id, isActive)
      const data = response.data
      if (data) upsertBanner(mapApiBannerToRow(data))
    },
    [upsertBanner],
  )

  const deleteBanner = useCallback(
    async (id: string) => {
      await deleteAdminBanner(id)
      removeBanner(id)
    },
    [removeBanner],
  )

  return {
    banners: state.banners,
    loading: state.loading,
    error: state.error,
    reload,
    upsertBanner,
    removeBanner,
    toggleActive,
    deleteBanner,
  }
}
