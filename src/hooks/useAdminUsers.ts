// src/hooks/useAdminUsers.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getAdminUsers,
  updateAdminUser,
} from '../api/admin/admins'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import type { ApiPagination } from '../lib/api'
import type {
  AdminUserRow,
  AdminUsersListParams,
} from '../types/adminUsers'
import { mapApiAdminToRow } from '../utils/adminUsersFormat'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const DEFAULT_SORT = '-createdAt'

interface AsyncState {
  admins: AdminUserRow[]
  pagination: ApiPagination | null
  loading: boolean
  error: string | null
  lockingId: string | null
}

export function useAdminUsers() {
  const { user } = useAuth()
  const currentUserId = user?.id ?? null
  const [page, setPageState] = useState(DEFAULT_PAGE)
  const [state, setState] = useState<AsyncState>({
    admins: [],
    pagination: null,
    loading: true,
    error: null,
    lockingId: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const query = useMemo<AdminUsersListParams>(
    () => ({
      page,
      limit: DEFAULT_LIMIT,
      sort: DEFAULT_SORT,
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
        const response = await getAdminUsers(query, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        const admins = (response.data ?? []).map(mapApiAdminToRow)
        const pagination = response.pagination ?? null
        const totalPages = Math.max(pagination?.numberOfPages ?? 1, 1)

        if (page > totalPages) {
          setState((previous) => ({ ...previous, loading: false }))
          setPageState(totalPages)
          return
        }

        setState((previous) => ({
          ...previous,
          admins,
          pagination,
          loading: false,
          error: null,
        }))
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
              : 'Unable to load admins.',
          ...(previous.admins.length === 0
            ? { admins: [], pagination: null }
            : {}),
        }))
      }
    })()

    return () => {
      controller.abort()
    }
  }, [page, query, reloadToken])

  const upsertAdmin = useCallback((admin: AdminUserRow) => {
    setState((previous) => {
      const index = previous.admins.findIndex((row) => row.id === admin.id)
      if (index === -1) {
        return { ...previous, admins: [admin, ...previous.admins] }
      }
      const next = [...previous.admins]
      next[index] = admin
      return { ...previous, admins: next }
    })
  }, [])

  const setActive = useCallback(async (adminId: string, active: boolean) => {
    if (currentUserId && adminId === currentUserId && active === false) {
      setState((previous) => ({
        ...previous,
        error: 'You cannot lock or disable your own account.',
      }))
      return false
    }

    setState((previous) => ({ ...previous, lockingId: adminId }))
    try {
      const response = await updateAdminUser(adminId, { active })
      const data = response.data
      if (!data) {
        throw new ApiError(response.message || 'Unable to update admin.')
      }
      const row = mapApiAdminToRow(data)
      setState((previous) => ({
        ...previous,
        lockingId: null,
        admins: previous.admins.map((item) =>
          item.id === row.id ? row : item,
        ),
      }))
      return true
    } catch (error) {
      setState((previous) => ({
        ...previous,
        lockingId: null,
        error:
          error instanceof ApiError
            ? error.message
            : 'Unable to update admin.',
      }))
      return false
    }
  }, [currentUserId])

  return {
    admins: state.admins,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    lockingId: state.lockingId,
    currentUserId,
    page,
    setPage,
    reload,
    upsertAdmin,
    setActive,
  }
}
