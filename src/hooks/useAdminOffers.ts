// src/hooks/useAdminOffers.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { deleteAdminOffer, deleteAllAdminOffers, getAdminOffers } from '../api/admin/offers'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import type {
  AdminOfferRow,
  AdminOffersListParams,
} from '../types/adminOffers'
import { mapApiOfferToAdminRow } from '../utils/adminOffersFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

interface AsyncState {
  offers: AdminOfferRow[]
  pagination: ApiPagination | null
  loading: boolean
  error: string | null
}

export function useAdminOffers() {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const locale = i18n.language
  const [page, setPageState] = useState(DEFAULT_PAGE)
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null)
  const deletingOfferIdRef = useRef<string | null>(null)
  const [deletingAll, setDeletingAll] = useState(false)
  const deletingAllRef = useRef(false)
  const [state, setState] = useState<AsyncState>({
    offers: [],
    pagination: null,
    loading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const query = useMemo<AdminOffersListParams>(
    () => ({
      page,
      limit: DEFAULT_LIMIT,
    }),
    [page],
  )

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const setPage = useCallback((next: number) => {
    setPageState(Math.max(1, next))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    setState((previous) => ({
      ...previous,
      loading: true,
      error: null,
    }))

    void (async () => {
      try {
        const response = await getAdminOffers(query, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        const offers = (response.data ?? []).map((offer) =>
          mapApiOfferToAdminRow(offer, locale),
        )
        const pagination = response.pagination ?? null
        const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)

        if (page > totalPages) {
          setState((previous) => ({ ...previous, loading: false }))
          setPageState(totalPages)
          return
        }

        setState({
          offers,
          pagination,
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
              : 'Unable to load offers.',
          ...(previous.offers.length === 0
            ? { offers: [], pagination: null }
            : {}),
        }))
      }
    })()

    return () => {
      controller.abort()
    }
  }, [locale, page, query, reloadToken])

  const upsertOffer = useCallback((offer: AdminOfferRow) => {
    setState((previous) => {
      const index = previous.offers.findIndex((row) => row.id === offer.id)
      if (index === -1) {
        return {
          ...previous,
          offers: [offer, ...previous.offers],
        }
      }
      const next = [...previous.offers]
      next[index] = offer
      return { ...previous, offers: next }
    })
  }, [])

  /** Rethrows so the confirm dialog can surface a translated message inline. */
  const deleteOffer = useCallback(
    async (offerId: string) => {
      if (deletingOfferIdRef.current || deletingAllRef.current) return
      deletingOfferIdRef.current = offerId
      setDeletingOfferId(offerId)

      try {
        await deleteAdminOffer(offerId)
        setState((previous) => ({
          ...previous,
          offers: previous.offers.filter((row) => row.id !== offerId),
        }))
        // Refetch the current page so pagination totals stay accurate.
        reload()
        toast.success(t('admin.settings.offers.delete.success'))
      } finally {
        deletingOfferIdRef.current = null
        setDeletingOfferId(null)
      }
    },
    [reload, t, toast],
  )

  /** Rethrows so the confirm dialog can surface a translated message inline. */
  const deleteAllOffers = useCallback(async () => {
    if (deletingAllRef.current || deletingOfferIdRef.current) return
    deletingAllRef.current = true
    setDeletingAll(true)

    try {
      const response = await deleteAllAdminOffers()
      const deletedCount = response.data?.deletedCount ?? 0
      setState((previous) => ({
        ...previous,
        offers: [],
        pagination: previous.pagination
          ? {
              ...previous.pagination,
              currentPage: 1,
              numberOfPages: 1,
              totalDocuments: 0,
              nextPage: null,
              prevPage: null,
              results: 0,
            }
          : null,
      }))
      setPageState(DEFAULT_PAGE)
      reload()
      toast.success(
        t('admin.settings.offers.deleteAll.success', { count: deletedCount }),
      )
    } finally {
      deletingAllRef.current = false
      setDeletingAll(false)
    }
  }, [reload, t, toast])

  return {
    offers: state.offers,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    page,
    deletingOfferId,
    deletingAll,
    setPage,
    reload,
    upsertOffer,
    deleteOffer,
    deleteAllOffers,
  }
}
