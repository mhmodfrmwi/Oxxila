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
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  addToCart as addToCartRequest,
  applyCoupon as applyCouponRequest,
  clearCart as clearCartRequest,
  getCart,
  mergeGuestCart,
  previewGuestCart,
  previewGuestCoupon,
  type GuestCouponPreview,
  removeCartItem as removeCartItemRequest,
  removeCoupon as removeCouponRequest,
  updateCartItem as updateCartItemRequest,
  type GuestCartLine,
} from '../api/cart'
import { getProductById } from '../api/catalog'
import { CART_PATH } from '../config/routes'
import { STORAGE_KEYS } from '../config/storage'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { ApiError } from '../lib/api'
import type { ApiCart } from '../types/cart'

interface CartContextValue {
  cart: ApiCart | null
  itemCount: number
  /** True while browsing without an account — cart lives in localStorage. */
  isGuest: boolean
  loading: boolean
  loadError: string | null
  updatingItemId: string | null
  couponLoading: boolean
  clearingCart: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateCartItem: (itemId: string, quantity: number) => Promise<void>
  removeCartItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  applyCoupon: (code: string) => Promise<void>
  removeCoupon: () => Promise<void>
  refreshCart: () => Promise<void>
  /** Promo code saved by a guest; applied automatically once they sign in. */
  pendingCoupon: string | null
  /** What the saved code would save right now (null while checking or if no longer valid). */
  couponPreview: GuestCouponPreview | null
  /** Why the saved code can't be used with the current cart (e.g. minimum order). */
  couponPreviewError: string | null
  /** Quantity of a product currently in the cart (0 when absent). */
  getProductQuantity: (productId: string) => number
  /** Cart line id for a product (server line id, or product id for guests). */
  getProductLineId: (productId: string) => string | null
}

const CartContext = createContext<CartContextValue | null>(null)

const EMPTY_CART: ApiCart = {
  items: [],
  couponCode: null,
  discountAmount: 0,
  storeCreditBalance: 0,
  storeCreditApplied: 0,
  subtotal: 0,
  totalPrice: 0,
}

function readGuestLines(): GuestCartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.guestCart)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((line) => ({
        productId: String((line as GuestCartLine)?.productId ?? ''),
        quantity: Math.floor(Number((line as GuestCartLine)?.quantity)),
      }))
      .filter((line) => /^[a-f\d]{24}$/i.test(line.productId) && line.quantity > 0)
  } catch {
    return []
  }
}

function writeGuestLines(lines: GuestCartLine[]) {
  try {
    if (lines.length) localStorage.setItem(STORAGE_KEYS.guestCart, JSON.stringify(lines))
    else localStorage.removeItem(STORAGE_KEYS.guestCart)
  } catch {
    // Private mode / quota — the in-memory cart still works for this visit.
  }
}

/** Fallback pricing for guest lines using `GET /products/:id` (public, always available). */
async function priceGuestLinesFromProducts(lines: GuestCartLine[]): Promise<ApiCart> {
  const settled = await Promise.allSettled(lines.map((line) => getProductById(line.productId)))
  const items: ApiCart['items'] = []
  settled.forEach((result, index) => {
    if (result.status !== 'fulfilled' || !result.value.data) return
    const product = result.value.data
    const stock = product.stock ?? 0
    if (product.isActive === false || stock <= 0) return
    const hasOffer =
      product.priceAfterDiscount != null &&
      (!product.offerEndsAt || new Date(product.offerEndsAt) > new Date())
    const price = hasOffer ? (product.priceAfterDiscount as number) : product.price
    items.push({
      _id: product._id,
      quantity: Math.min(lines[index].quantity, stock),
      price,
      product: {
        _id: product._id,
        name: product.name,
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        slug: product.slug,
        images: product.images ?? [],
        price: product.price,
        priceAfterDiscount: product.priceAfterDiscount ?? null,
        stock,
        isActive: true,
      },
    })
  })
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100
  return { ...EMPTY_CART, items, subtotal, totalPrice: subtotal }
}

function readPendingCoupon(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.pendingCoupon)
  } catch {
    return null
  }
}

function writePendingCoupon(code: string | null) {
  try {
    if (code) localStorage.setItem(STORAGE_KEYS.pendingCoupon, code)
    else localStorage.removeItem(STORAGE_KEYS.pendingCoupon)
  } catch {
    // storage unavailable
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const userId = user?.id ?? null
  const toast = useToast()
  const [serverCart, setServerCartRaw] = useState<ApiCart | null>(null)
  // Accounts with older carts can hold lines whose product was since deleted (product: null) or
  // that lack image data; drop/patch those so one bad line can't blank the whole app.
  const setServerCart = useCallback((next: ApiCart | null) => {
    setServerCartRaw(
      next
        ? {
            ...next,
            couponCode: next.couponCode ?? null,
            subtotal: next.subtotal ?? 0,
            totalPrice: next.totalPrice ?? 0,
            discountAmount: next.discountAmount ?? 0,
            storeCreditBalance: next.storeCreditBalance ?? 0,
            storeCreditApplied: next.storeCreditApplied ?? 0,
            items: (next.items ?? [])
              .filter((item) => item && item._id && item.product)
              .map((item) => ({
                ...item,
                product: { ...item.product, images: item.product.images ?? [], stock: item.product.stock ?? 0 },
              })),
          }
        : null,
    )
  }, [])
  const [guestLines, setGuestLines] = useState<GuestCartLine[]>(readGuestLines)
  // null until the guest lines are priced — the page shows a skeleton, never a false "empty" cart.
  const [guestCart, setGuestCart] = useState<ApiCart | null>(null)
  const [pendingCoupon, setPendingCoupon] = useState<string | null>(readPendingCoupon)
  const [couponPreview, setCouponPreview] = useState<GuestCouponPreview | null>(null)
  const [couponPreviewError, setCouponPreviewError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [clearingCart, setClearingCart] = useState(false)
  const updatingItemIdRef = useRef<string | null>(null)
  const clearingCartRef = useRef(false)
  // Latest guest lines for async callbacks; kept in sync by commitGuestLines.
  const guestLinesRef = useRef(guestLines)

  const isGuest = !isAuthenticated

  const errorDetail = useCallback(
    (error: unknown) => (error instanceof ApiError ? error.message : t('cart.toast.tryAgain')),
    [t],
  )

  const showAddedToast = useCallback(() => {
    toast.toast({
      title: t('cart.toast.added'),
      variant: 'success',
      action: { label: t('cart.toast.viewCart'), onClick: () => navigate(CART_PATH) },
    })
  }, [navigate, t, toast])

  /** Drop user-scoped client state without deleting the customer's server cart. */
  const resetServerState = useCallback(() => {
    setServerCart(null)
    setLoadError(null)
    setUpdatingItemId(null)
    updatingItemIdRef.current = null
    setCouponLoading(false)
    setClearingCart(false)
    clearingCartRef.current = false
  }, [])

  // ---------- guest cart ----------

  const commitGuestLines = useCallback((next: GuestCartLine[]) => {
    guestLinesRef.current = next
    setGuestLines(next)
    writeGuestLines(next)
  }, [])

  // Price guest lines (live offers + stock clamp) whenever they change.
  useEffect(() => {
    if (!isGuest) return
    if (!guestLines.length) {
      setGuestCart(EMPTY_CART)
      return
    }
    let cancelled = false
    setLoading(true)
    // Prefer the bulk preview endpoint; if it is unavailable (older API), price each line
    // from the public product endpoint so the cart still renders.
    previewGuestCart(guestLines)
      .then((response) => response.data ?? priceGuestLinesFromProducts(guestLines))
      .catch(() => priceGuestLinesFromProducts(guestLines))
      .then((priced) => {
        if (cancelled) return
        setGuestCart(priced)
        setLoadError(null)
        // Drop lines the server rejected (inactive / out of stock) and apply stock clamps.
        const pricedQty = new Map(priced.items.map((item) => [item._id, item.quantity]))
        const reconciled = guestLinesRef.current
          .filter((line) => pricedQty.has(line.productId))
          .map((line) => ({ ...line, quantity: pricedQty.get(line.productId) ?? line.quantity }))
        const changed =
          reconciled.length !== guestLinesRef.current.length ||
          reconciled.some((line, i) => line.quantity !== guestLinesRef.current[i]?.quantity)
        if (changed) commitGuestLines(reconciled)
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(errorDetail(error))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isGuest, guestLines, commitGuestLines, errorDetail])

  // Keep the guest's coupon savings in sync with the cart (items/quantities change the amount,
  // and a minimum-order rule can stop applying). Previewing never consumes the code.
  useEffect(() => {
    if (!isGuest || !pendingCoupon || !guestLines.length) {
      setCouponPreview(null)
      setCouponPreviewError(null)
      return
    }
    let cancelled = false
    previewGuestCoupon(pendingCoupon, guestLines)
      .then((response) => {
        if (cancelled) return
        setCouponPreview(response.data ?? null)
        setCouponPreviewError(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setCouponPreview(null)
        // 401/404 = server without the preview endpoint: stay quiet, the code is checked at checkout.
        const unavailable = error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 404)
        setCouponPreviewError(error instanceof ApiError && !unavailable ? error.message : null)
      })
    return () => {
      cancelled = true
    }
  }, [isGuest, pendingCoupon, guestLines])

  // ---------- server cart ----------

  const loadServerCart = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      // Fold any guest cart into the account first, then show the merged result.
      const pending = readGuestLines()
      const response = pending.length ? await mergeGuestCart(pending) : await getCart()
      if (pending.length) commitGuestLines([])
      setServerCart(response.data ?? null)

      // A code entered as a guest is applied now that there is an account to attach it to.
      const savedCode = readPendingCoupon()
      if (savedCode) {
        writePendingCoupon(null)
        setPendingCoupon(null)
        try {
          const applied = await applyCouponRequest(savedCode)
          setServerCart(applied.data ?? response.data ?? null)
          toast.success(t('cart.toast.couponApplied'))
        } catch (error) {
          toast.error(t('cart.summary.applyError'), errorDetail(error))
        }
      }
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        resetServerState()
      } else {
        setServerCart(null)
        setLoadError(errorDetail(error))
      }
    } finally {
      setLoading(false)
    }
  }, [commitGuestLines, errorDetail, resetServerState, t, toast])

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      const lines = readGuestLines()
      guestLinesRef.current = lines
      setGuestLines(lines)
      return
    }
    await loadServerCart()
  }, [isAuthenticated, loadServerCart])

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      resetServerState()
      return
    }
    // Never show a previous user's cart while the next session loads.
    resetServerState()
    void loadServerCart()
  }, [isAuthenticated, userId, loadServerCart, resetServerState])

  // ---------- mutations ----------

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (isGuest) {
        const lines = guestLinesRef.current
        const existing = lines.find((line) => line.productId === productId)
        commitGuestLines(
          existing
            ? lines.map((line) =>
                line.productId === productId
                  ? { ...line, quantity: line.quantity + quantity }
                  : line,
              )
            : [...lines, { productId, quantity }],
        )
        showAddedToast()
        return
      }
      try {
        const response = await addToCartRequest(productId, quantity)
        if (!response.data) throw new ApiError(t('cart.toast.tryAgain'))
        setServerCart(response.data)
        setLoadError(null)
        showAddedToast()
      } catch (error) {
        toast.error(t('cart.toast.addError'), errorDetail(error))
        throw error
      }
    },
    [commitGuestLines, errorDetail, isGuest, showAddedToast, t, toast],
  )

  const updateCartItem = useCallback(
    async (itemId: string, quantity: number) => {
      if (isGuest) {
        commitGuestLines(
          guestLinesRef.current.map((line) =>
            line.productId === itemId ? { ...line, quantity: Math.max(1, quantity) } : line,
          ),
        )
        return
      }
      if (updatingItemIdRef.current === itemId) return
      updatingItemIdRef.current = itemId
      setUpdatingItemId(itemId)
      try {
        const response = await updateCartItemRequest(itemId, quantity)
        setServerCart(response.data ?? null)
      } catch (error) {
        toast.error(t('cart.updateQuantityError'), errorDetail(error))
        throw error
      } finally {
        if (updatingItemIdRef.current === itemId) {
          updatingItemIdRef.current = null
          setUpdatingItemId(null)
        }
      }
    },
    [commitGuestLines, errorDetail, isGuest, t, toast],
  )

  const removeCartItem = useCallback(
    async (itemId: string) => {
      if (isGuest) {
        commitGuestLines(guestLinesRef.current.filter((line) => line.productId !== itemId))
        toast.success(t('cart.toast.removed'))
        return
      }
      if (updatingItemIdRef.current === itemId) return
      updatingItemIdRef.current = itemId
      setUpdatingItemId(itemId)
      try {
        const response = await removeCartItemRequest(itemId)
        setServerCart(response.data ?? null)
        toast.success(t('cart.toast.removed'))
      } catch (error) {
        toast.error(t('cart.removeItemError'), errorDetail(error))
        throw error
      } finally {
        if (updatingItemIdRef.current === itemId) {
          updatingItemIdRef.current = null
          setUpdatingItemId(null)
        }
      }
    },
    [commitGuestLines, errorDetail, isGuest, t, toast],
  )

  const clearCart = useCallback(async () => {
    if (isGuest) {
      commitGuestLines([])
      toast.success(t('cart.clear.success'))
      return
    }
    if (clearingCartRef.current) return
    clearingCartRef.current = true
    setClearingCart(true)
    try {
      await clearCartRequest()
      // The DELETE response has no cart payload; fetch the canonical empty cart
      // so totals, checkout summaries, and the navbar badge share one state.
      await loadServerCart()
      toast.success(t('cart.clear.success'))
    } finally {
      clearingCartRef.current = false
      setClearingCart(false)
    }
  }, [commitGuestLines, isGuest, loadServerCart, t, toast])

  const applyCoupon = useCallback(
    async (code: string) => {
      if (isGuest) {
        // Coupons are tied to an account (one use per customer), so keep the code and apply it at sign-in.
        const normalized = code.trim().toUpperCase()
        try {
          // Validate first so a wrong/expired code is rejected right away with the reason.
          const response = await previewGuestCoupon(normalized, guestLinesRef.current)
          writePendingCoupon(normalized)
          setPendingCoupon(normalized)
          setCouponPreview(response.data ?? null)
          setCouponPreviewError(null)
          toast.success(t('cart.toast.couponSaved'))
        } catch (error) {
          // An older server has no preview endpoint (it answers 401/404 for guests). That's not the
          // shopper's mistake: keep the code and validate it at checkout instead of showing an error.
          if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 404)) {
            writePendingCoupon(normalized)
            setPendingCoupon(normalized)
            setCouponPreview(null)
            setCouponPreviewError(null)
            toast.success(t('cart.toast.couponSaved'))
            return
          }
          toast.error(t('cart.summary.applyError'), errorDetail(error))
          throw error
        }
        return
      }
      setCouponLoading(true)
      try {
        const response = await applyCouponRequest(code)
        setServerCart(response.data ?? null)
        toast.success(t('cart.toast.couponApplied'))
      } catch (error) {
        toast.error(t('cart.summary.applyError'), errorDetail(error))
        throw error
      } finally {
        setCouponLoading(false)
      }
    },
    [errorDetail, isGuest, t, toast],
  )

  const removeCoupon = useCallback(async () => {
    if (isGuest) {
      writePendingCoupon(null)
      setPendingCoupon(null)
      setCouponPreview(null)
      setCouponPreviewError(null)
      return
    }
    setCouponLoading(true)
    try {
      const response = await removeCouponRequest()
      setServerCart(response.data ?? null)
      toast.success(t('cart.toast.couponRemoved'))
    } catch (error) {
      toast.error(t('cart.summary.removeError'), errorDetail(error))
      throw error
    } finally {
      setCouponLoading(false)
    }
  }, [errorDetail, isGuest, t, toast])

  // ---------- derived ----------

  const resolvedCart = isGuest ? (guestLines.length ? guestCart : EMPTY_CART) : serverCart
  // Guests with items but no price yet are "loading" (skeleton), not empty.
  const resolvedLoading = isGuest ? guestLines.length > 0 && !guestCart : loading

  // Guests: count from local lines so badges/steppers react instantly (before pricing returns).
  const quantityByProduct = useMemo(() => {
    const map = new Map<string, { qty: number; lineId: string }>()
    if (isGuest) {
      for (const line of guestLines) map.set(line.productId, { qty: line.quantity, lineId: line.productId })
    } else {
      for (const item of serverCart?.items ?? []) {
        const id = item.product?._id
        if (id) map.set(id, { qty: item.quantity, lineId: item._id })
      }
    }
    return map
  }, [guestLines, isGuest, serverCart])

  const itemCount = useMemo(() => {
    let total = 0
    for (const { qty } of quantityByProduct.values()) total += qty
    return total
  }, [quantityByProduct])

  const getProductQuantity = useCallback(
    (productId: string) => quantityByProduct.get(productId)?.qty ?? 0,
    [quantityByProduct],
  )
  const getProductLineId = useCallback(
    (productId: string) => quantityByProduct.get(productId)?.lineId ?? null,
    [quantityByProduct],
  )

  const value = useMemo(
    () => ({
      cart: resolvedCart,
      itemCount,
      isGuest,
      pendingCoupon,
      couponPreview,
      couponPreviewError,
      loading: resolvedLoading,
      loadError,
      updatingItemId,
      couponLoading,
      clearingCart,
      addToCart,
      updateCartItem,
      removeCartItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      refreshCart,
      getProductQuantity,
      getProductLineId,
    }),
    [
      resolvedCart,
      itemCount,
      isGuest,
      pendingCoupon,
      couponPreview,
      couponPreviewError,
      resolvedLoading,
      loadError,
      updatingItemId,
      couponLoading,
      clearingCart,
      addToCart,
      updateCartItem,
      removeCartItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      refreshCart,
      getProductQuantity,
      getProductLineId,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
