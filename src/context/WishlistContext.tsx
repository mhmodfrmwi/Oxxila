// src/context/WishlistContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  addToWishlist as addToWishlistRequest,
  clearWishlist as clearWishlistRequest,
  getWishlist,
  removeFromWishlist as removeFromWishlistRequest,
} from '../api/wishlist'
import { getProductById } from '../api/catalog'
import { STORAGE_KEYS } from '../config/storage'
import { ApiError } from '../lib/api'
import type { WishlistItem } from '../types/wishlist'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

interface WishlistContextValue {
  items: WishlistItem[]
  itemCount: number
  loading: boolean
  clearingWishlist: boolean
  error: string | null
  pendingProductId: string | null
  isWishlisted: (productId: string) => boolean
  toggleWishlist: (productId: string) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  clearWishlist: () => Promise<void>
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

const OBJECT_ID = /^[a-f\d]{24}$/i

function readGuestIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEYS.guestWishlist) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string' && OBJECT_ID.test(id)) : []
  } catch {
    return []
  }
}

function writeGuestIds(ids: string[]) {
  try {
    if (ids.length) localStorage.setItem(STORAGE_KEYS.guestWishlist, JSON.stringify(ids))
    else localStorage.removeItem(STORAGE_KEYS.guestWishlist)
  } catch {
    // storage unavailable — the in-memory list still works for this visit
  }
}

/** Hydrate guest ids into wishlist items via the public product endpoint. */
async function loadGuestItems(ids: string[]): Promise<WishlistItem[]> {
  const settled = await Promise.allSettled(ids.map((id) => getProductById(id)))
  const items: WishlistItem[] = []
  settled.forEach((result, index) => {
    if (result.status !== 'fulfilled' || !result.value.data) return
    const p = result.value.data
    items.push({ _id: ids[index], product: p })
  })
  return items
}

function productIdFromItem(item: WishlistItem): string | null {
  const product = item.product
  if (!product || typeof product !== 'object') return null
  return product._id || null
}

function clearWishlistState(
  setItems: (items: WishlistItem[]) => void,
  setError: (error: string | null) => void,
  setOptimisticAddedIds: (ids: string[]) => void,
  setPendingProductId: (id: string | null) => void,
  setLoading: (loading: boolean) => void,
) {
  setItems([])
  setError(null)
  setOptimisticAddedIds([])
  setPendingProductId(null)
  setLoading(false)
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useAuth()
  const userId = user?.id ?? null
  const toast = useToast()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [clearingWishlist, setClearingWishlist] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingProductId, setPendingProductId] = useState<string | null>(null)
  const [optimisticAddedIds, setOptimisticAddedIds] = useState<string[]>([])
  const fetchGenerationRef = useRef(0)
  const clearingWishlistRef = useRef(false)
  // Guests keep their wishlist in localStorage — no account needed to save a product.
  const [guestIds, setGuestIds] = useState<string[]>(readGuestIds)
  const [guestItems, setGuestItems] = useState<WishlistItem[]>([])
  const [guestLoading, setGuestLoading] = useState(false)

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      clearWishlistState(setItems, setError, setOptimisticAddedIds, setPendingProductId, setLoading)
      return
    }

    const generation = ++fetchGenerationRef.current
    setLoading(true)
    setError(null)
    try {
      const response = await getWishlist()
      if (generation !== fetchGenerationRef.current) return
      setItems(response.data?.items ?? [])
    } catch (err) {
      if (generation !== fetchGenerationRef.current) return
      if (err instanceof ApiError && err.statusCode === 401) {
        clearWishlistState(setItems, setError, setOptimisticAddedIds, setPendingProductId, setLoading)
      } else {
        setError(err instanceof ApiError ? err.message : 'Unable to load wishlist.')
      }
    } finally {
      if (generation === fetchGenerationRef.current) setLoading(false)
    }
  }, [isAuthenticated, userId])

  useEffect(() => {
    let cancelled = false
    const generation = ++fetchGenerationRef.current

    async function syncWishlist() {
      // Yield so logout/user-switch resets are not synchronous setState-in-effect.
      await Promise.resolve()
      if (cancelled) return

      if (!isAuthenticated || !userId) {
        clearWishlistState(setItems, setError, setOptimisticAddedIds, setPendingProductId, setLoading)
        return
      }

      setLoading(true)
      setError(null)
      setItems([])
      setOptimisticAddedIds([])
      setPendingProductId(null)

      try {
        const response = await getWishlist()
        if (cancelled || generation !== fetchGenerationRef.current) return
        setItems(response.data?.items ?? [])
      } catch (err) {
        if (cancelled || generation !== fetchGenerationRef.current) return
        if (err instanceof ApiError && err.statusCode === 401) {
          clearWishlistState(setItems, setError, setOptimisticAddedIds, setPendingProductId, setLoading)
        } else {
          setItems([])
          setError(err instanceof ApiError ? err.message : 'Unable to load wishlist.')
        }
      } finally {
        if (!cancelled && generation === fetchGenerationRef.current) setLoading(false)
      }
    }

    void syncWishlist()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, userId])

  useEffect(() => {
    if (isAuthenticated) return
    if (!guestIds.length) {
      setGuestItems([])
      return
    }
    let cancelled = false
    setGuestLoading(true)
    loadGuestItems(guestIds)
      .then((loaded) => {
        if (!cancelled) setGuestItems(loaded)
      })
      .finally(() => {
        if (!cancelled) setGuestLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, guestIds])

  // On login, fold the guest wishlist into the account (best effort), then clear it locally.
  useEffect(() => {
    if (!isAuthenticated || !userId) return
    const pending = readGuestIds()
    if (!pending.length) return
    let cancelled = false
    void (async () => {
      for (const id of pending.slice().reverse()) {
        try {
          await addToWishlistRequest(id)
        } catch {
          // a removed/inactive product must not block the rest
        }
      }
      writeGuestIds([])
      if (!cancelled) {
        setGuestIds([])
        void refreshWishlist()
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, userId, refreshWishlist])

  const resolvedItems = useMemo(
    () => (isAuthenticated && userId ? items : guestItems),
    [isAuthenticated, userId, items, guestItems],
  )

  const productIds = useMemo(() => {
    const ids = new Set<string>()
    for (const item of resolvedItems) {
      const id = productIdFromItem(item)
      if (id) ids.add(id)
    }
    return ids
  }, [resolvedItems])

  const isWishlisted = useCallback(
    (productId: string) =>
      isAuthenticated
        ? productIds.has(productId) || optimisticAddedIds.includes(productId)
        : guestIds.includes(productId),
    [isAuthenticated, productIds, optimisticAddedIds, guestIds],
  )

  const removeItem = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        const next = guestIds.filter((id) => id !== productId)
        writeGuestIds(next)
        setGuestIds(next)
        setGuestItems((current) => current.filter((item) => item.product._id !== productId))
        toast.success(t('wishlist.toast.removed'))
        return
      }
      const previous = items
      setItems((current) =>
        current.filter((item) => productIdFromItem(item) !== productId),
      )
      setOptimisticAddedIds((current) => current.filter((id) => id !== productId))
      setPendingProductId(productId)

      try {
        const response = await removeFromWishlistRequest(productId)
        setItems(response.data?.items ?? [])
        toast.success(t('wishlist.toast.removed'))
      } catch (err) {
        setItems(previous)
        toast.error(
          'Unable to update wishlist',
          err instanceof ApiError ? err.message : 'Please try again.',
        )
        throw err
      } finally {
        setPendingProductId(null)
      }
    },
    [guestIds, isAuthenticated, items, t, toast],
  )

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        if (guestIds.includes(productId)) {
          await removeItem(productId)
          return
        }
        const next = [productId, ...guestIds]
        writeGuestIds(next)
        setGuestIds(next)
        toast.success(t('wishlist.toast.added'))
        return
      }

      if (pendingProductId === productId) return

      const alreadyInWishlist =
        productIds.has(productId) || optimisticAddedIds.includes(productId)

      if (alreadyInWishlist) {
        if (!productIds.has(productId)) {
          setOptimisticAddedIds((current) => current.filter((id) => id !== productId))
          return
        }
        await removeItem(productId)
        return
      }

      const previous = items
      setPendingProductId(productId)
      setOptimisticAddedIds((current) =>
        current.includes(productId) ? current : [...current, productId],
      )

      try {
        const response = await addToWishlistRequest(productId)
        setItems(response.data?.items ?? [])
        toast.success(t('wishlist.toast.added'))
      } catch (err) {
        setItems(previous)
        toast.error(
          'Unable to update wishlist',
          err instanceof ApiError ? err.message : 'Please try again.',
        )
        throw err
      } finally {
        setPendingProductId(null)
        setOptimisticAddedIds((current) => current.filter((id) => id !== productId))
      }
    },
    [
      isAuthenticated,
      guestIds,
      items,
      optimisticAddedIds,
      pendingProductId,
      productIds,
      removeItem,
      t,
      toast,
    ],
  )

  const clearWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      writeGuestIds([])
      setGuestIds([])
      setGuestItems([])
      toast.success(t('wishlist.clear.success'))
      return
    }
    if (clearingWishlistRef.current) return

    clearingWishlistRef.current = true
    setClearingWishlist(true)
    try {
      await clearWishlistRequest()
      // DELETE has no wishlist payload — empty local state so page + badge update.
      setItems([])
      setOptimisticAddedIds([])
      setPendingProductId(null)
      setError(null)
      toast.success(t('wishlist.clear.success'))
    } finally {
      clearingWishlistRef.current = false
      setClearingWishlist(false)
    }
  }, [isAuthenticated, t, toast])

  const value = useMemo(
    () => ({
      items: resolvedItems,
      itemCount: resolvedItems.length,
      loading: isAuthenticated ? loading : guestLoading,
      clearingWishlist,
      error: isAuthenticated ? error : null,
      pendingProductId,
      isWishlisted,
      toggleWishlist,
      removeItem,
      clearWishlist,
      refreshWishlist,
    }),
    [
      resolvedItems,
      isAuthenticated,
      loading,
      guestLoading,
      clearingWishlist,
      error,
      pendingProductId,
      isWishlisted,
      toggleWishlist,
      removeItem,
      clearWishlist,
      refreshWishlist,
    ],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
