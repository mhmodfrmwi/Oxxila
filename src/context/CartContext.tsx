// src/context/CartContext.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { addToCart as addToCartRequest, getCart } from '../api/cart'
import { useAuth } from './AuthContext'
import { ApiError } from '../lib/api'
import type { ApiCart } from '../types/cart'

interface CartContextValue {
  cart: ApiCart | null
  itemCount: number
  loading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<ApiCart | null>(null)
  const [loading, setLoading] = useState(false)

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
    void refreshCart()
  }, [refreshCart])

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      const response = await addToCartRequest(productId, quantity)
      setCart(response.data ?? null)
    },
    [],
  )

  const itemCount = useMemo(
    () => cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
    [cart],
  )

  const value = useMemo(
    () => ({
      cart,
      itemCount,
      loading,
      addToCart,
      refreshCart,
    }),
    [cart, itemCount, loading, addToCart, refreshCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
