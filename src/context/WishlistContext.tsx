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

  const resolvedItems = useMemo(
    () => (isAuthenticated && userId ? items : []),
    [isAuthenticated, userId, items],
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
    (productId: string) => productIds.has(productId) || optimisticAddedIds.includes(productId),
    [productIds, optimisticAddedIds],
  )

  const removeItem = useCallback(
    async (productId: string) => {
      const previous = items
      setItems((current) =>
        current.filter((item) => productIdFromItem(item) !== productId),
      )
      setOptimisticAddedIds((current) => current.filter((id) => id !== productId))
      setPendingProductId(productId)

      try {
        const response = await removeFromWishlistRequest(productId)
        setItems(response.data?.items ?? [])
        toast.success('Removed from wishlist')
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
    [items, toast],
  )

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        toast.error('Sign in required', 'Please sign in to manage your wishlist.')
        throw new ApiError('Unauthorized', 401)
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
        toast.success('Added to wishlist')
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
      items,
      optimisticAddedIds,
      pendingProductId,
      productIds,
      removeItem,
      toast,
    ],
  )

  const clearWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error(
        t('wishlist.signInRequired'),
        t('wishlist.signInRequiredDetail'),
      )
      throw new ApiError('Unauthorized', 401)
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
      loading: isAuthenticated ? loading : false,
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
