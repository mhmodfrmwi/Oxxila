// src/context/CartContext.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  addToCart as addToCartRequest,
  applyCoupon as applyCouponRequest,
  getCart,
  removeCartItem as removeCartItemRequest,
  removeCoupon as removeCouponRequest,
  updateCartItem as updateCartItemRequest,
} from '../api/cart'
import { useAuth } from './AuthContext'
import { ApiError } from '../lib/api'
import type { ApiCart } from '../types/cart'

interface CartContextValue {
  cart: ApiCart | null
  itemCount: number
  loading: boolean
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

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<ApiCart | null>(null)
  const [loading, setLoading] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null)
      return
    }

    setLoading(true)
    try {
      const response = await getCart()
      setCart(response.data ?? null)
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        setCart(null)
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    async function load() {
      await Promise.resolve()
      if (cancelled) return

      setLoading(true)
      try {
        const response = await getCart()
        if (!cancelled) setCart(response.data ?? null)
      } catch (error) {
        if (!cancelled && error instanceof ApiError && error.statusCode === 401) {
          setCart(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    const response = await addToCartRequest(productId, quantity)
    setCart(response.data ?? null)
  }, [])

  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    setUpdatingItemId(itemId)
    try {
      const response = await updateCartItemRequest(itemId, quantity)
      setCart(response.data ?? null)
    } finally {
      setUpdatingItemId(null)
    }
  }, [])

  const removeCartItem = useCallback(async (itemId: string) => {
    setUpdatingItemId(itemId)
    try {
      const response = await removeCartItemRequest(itemId)
      setCart(response.data ?? null)
    } finally {
      setUpdatingItemId(null)
    }
  }, [])

  const applyCoupon = useCallback(async (code: string) => {
    setCouponLoading(true)
    try {
      const response = await applyCouponRequest(code)
      setCart(response.data ?? null)
    } finally {
      setCouponLoading(false)
    }
  }, [])

  const removeCoupon = useCallback(async () => {
    setCouponLoading(true)
    try {
      const response = await removeCouponRequest()
      setCart(response.data ?? null)
    } finally {
      setCouponLoading(false)
    }
  }, [])

  const resolvedCart = isAuthenticated ? cart : null
  const resolvedLoading = isAuthenticated ? loading : false

  const itemCount = useMemo(
    () => resolvedCart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
    [resolvedCart],
  )

  const value = useMemo(
    () => ({
      cart: resolvedCart,
      itemCount,
      loading: resolvedLoading,
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
