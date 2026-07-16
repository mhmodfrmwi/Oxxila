// src/context/CartContext.tsx
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
import {
  addToCart as addToCartRequest,
  applyCoupon as applyCouponRequest,
  getCart,
  removeCartItem as removeCartItemRequest,
  removeCoupon as removeCouponRequest,
  updateCartItem as updateCartItemRequest,
} from '../api/cart'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { ApiError } from '../lib/api'
import type { ApiCart } from '../types/cart'

interface CartContextValue {
  cart: ApiCart | null
  itemCount: number
  loading: boolean
  loadError: string | null
  updatingItemId: string | null
  couponLoading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateCartItem: (itemId: string, quantity: number) => Promise<void>
  removeCartItem: (itemId: string) => Promise<void>
  applyCoupon: (code: string) => Promise<void>
  removeCoupon: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

function resolveLoadError(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Unable to load cart. Please try again.'
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const userId = user?.id ?? null
  const toast = useToast()
  const [cart, setCart] = useState<ApiCart | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const updatingItemIdRef = useRef<string | null>(null)

  const clearCartState = useCallback(() => {
    setCart(null)
    setLoadError(null)
    setUpdatingItemId(null)
    updatingItemIdRef.current = null
    setCouponLoading(false)
  }, [])

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      clearCartState()
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError(null)
    try {
      const response = await getCart()
      setCart(response.data ?? null)
      setLoadError(null)
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        clearCartState()
      } else {
        setCart(null)
        setLoadError(resolveLoadError(error))
      }
    } finally {
      setLoading(false)
    }
  }, [clearCartState, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      clearCartState()
      setLoading(false)
      return
    }

    // Never show a previous user's cart while the next session loads.
    clearCartState()
    setLoading(true)

    let cancelled = false

    async function load() {
      setLoadError(null)
      try {
        const response = await getCart()
        if (cancelled) return
        setCart(response.data ?? null)
        setLoadError(null)
      } catch (error) {
        if (cancelled) return
        if (error instanceof ApiError && error.statusCode === 401) {
          clearCartState()
        } else {
          setCart(null)
          setLoadError(resolveLoadError(error))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [clearCartState, isAuthenticated, userId])

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    try {
      const response = await addToCartRequest(productId, quantity)
      if (!response.data) {
        throw new ApiError('Cart was not updated. Please try again.')
      }
      setCart(response.data)
      setLoadError(null)
      toast.success('Added to cart')
    } catch (error) {
      toast.error(
        'Unable to add to cart',
        error instanceof ApiError ? error.message : 'Please try again.',
      )
      throw error
    }
  }, [toast])

  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    if (updatingItemIdRef.current === itemId) return

    updatingItemIdRef.current = itemId
    setUpdatingItemId(itemId)
    try {
      const response = await updateCartItemRequest(itemId, quantity)
      setCart(response.data ?? null)
      toast.success('Quantity updated')
    } catch (error) {
      toast.error(
        'Unable to update quantity',
        error instanceof ApiError ? error.message : 'Please try again.',
      )
      throw error
    } finally {
      if (updatingItemIdRef.current === itemId) {
        updatingItemIdRef.current = null
        setUpdatingItemId(null)
      }
    }
  }, [toast])

  const removeCartItem = useCallback(async (itemId: string) => {
    if (updatingItemIdRef.current === itemId) return

    updatingItemIdRef.current = itemId
    setUpdatingItemId(itemId)
    try {
      const response = await removeCartItemRequest(itemId)
      setCart(response.data ?? null)
      toast.success('Removed from cart')
    } catch (error) {
      toast.error(
        'Unable to remove item',
        error instanceof ApiError ? error.message : 'Please try again.',
      )
      throw error
    } finally {
      if (updatingItemIdRef.current === itemId) {
        updatingItemIdRef.current = null
        setUpdatingItemId(null)
      }
    }
  }, [toast])

  const applyCoupon = useCallback(async (code: string) => {
    setCouponLoading(true)
    try {
      const response = await applyCouponRequest(code)
      setCart(response.data ?? null)
      toast.success('Coupon applied')
    } catch (error) {
      toast.error(
        'Unable to apply coupon',
        error instanceof ApiError ? error.message : 'Please try again.',
      )
      throw error
    } finally {
      setCouponLoading(false)
    }
  }, [toast])

  const removeCoupon = useCallback(async () => {
    setCouponLoading(true)
    try {
      const response = await removeCouponRequest()
      setCart(response.data ?? null)
      toast.success('Coupon removed')
    } catch (error) {
      toast.error(
        'Unable to remove coupon',
        error instanceof ApiError ? error.message : 'Please try again.',
      )
      throw error
    } finally {
      setCouponLoading(false)
    }
  }, [toast])

  const resolvedCart = isAuthenticated ? cart : null
  const resolvedLoading = isAuthenticated ? loading : false
  const resolvedLoadError = isAuthenticated ? loadError : null

  const itemCount = useMemo(
    () => resolvedCart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
    [resolvedCart],
  )

  const value = useMemo(
    () => ({
      cart: resolvedCart,
      itemCount,
      loading: resolvedLoading,
      loadError: resolvedLoadError,
      updatingItemId,
      couponLoading,
      addToCart,
      updateCartItem,
      removeCartItem,
      applyCoupon,
      removeCoupon,
      refreshCart,
    }),
    [
      resolvedCart,
      itemCount,
      resolvedLoading,
      resolvedLoadError,
      updatingItemId,
      couponLoading,
      addToCart,
      updateCartItem,
      removeCartItem,
      applyCoupon,
      removeCoupon,
      refreshCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
