// src/hooks/useProductCardActions.ts
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useWishlist } from '../context/WishlistContext'

/** How long the "Added ✓" confirmation shows before the card switches to a qty stepper. */
const ADDED_FEEDBACK_MS = 1200

type ButtonEvent = MouseEvent<HTMLButtonElement>

function stop(event?: ButtonEvent) {
  event?.preventDefault()
  event?.stopPropagation()
}

export function useProductCardActions(productId: string | undefined) {
  const { t } = useTranslation()
  const { addToCart, updateCartItem, removeCartItem, getProductQuantity, getProductLineId } =
    useCart()
  const { isWishlisted, toggleWishlist, pendingProductId } = useWishlist()
  const toast = useToast()
  const [addingToCart, setAddingToCart] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [updatingQty, setUpdatingQty] = useState(false)
  const feedbackTimer = useRef<number | null>(null)

  const wishlisted = Boolean(productId && isWishlisted(productId))
  const wishlistPending = Boolean(productId && pendingProductId === productId)
  const cartQuantity = productId ? getProductQuantity(productId) : 0

  useEffect(
    () => () => {
      if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current)
    },
    [],
  )

  /** Guests can add to cart too — sign-in is only asked for at checkout. */
  async function handleAddToCart(event?: ButtonEvent) {
    stop(event)
    if (addingToCart) return
    if (!productId) {
      toast.error(t('productDetail.cart.missingId'))
      return
    }

    setAddingToCart(true)
    try {
      await addToCart(productId, 1)
      setJustAdded(true)
      if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current)
      feedbackTimer.current = window.setTimeout(() => setJustAdded(false), ADDED_FEEDBACK_MS)
    } catch {
      // CartContext already surfaces the error toast.
    } finally {
      setAddingToCart(false)
    }
  }

  async function changeQuantity(delta: 1 | -1, event?: ButtonEvent) {
    stop(event)
    if (!productId || updatingQty) return
    const lineId = getProductLineId(productId)
    if (!lineId) return
    const next = cartQuantity + delta
    setUpdatingQty(true)
    try {
      if (next <= 0) await removeCartItem(lineId)
      else await updateCartItem(lineId, next)
    } catch {
      // CartContext already surfaces the error toast.
    } finally {
      setUpdatingQty(false)
    }
  }

  async function handleWishlistToggle(event?: ButtonEvent) {
    stop(event)
    if (!productId || wishlistPending) return

    // No sign-in wall: guests save to a local wishlist that merges into their account later.
    try {
      await toggleWishlist(productId)
    } catch {
      // WishlistContext already surfaces the error toast.
    }
  }

  return {
    wishlisted,
    wishlistPending,
    addingToCart,
    justAdded,
    cartQuantity,
    updatingQty,
    handleAddToCart,
    handleIncrement: (event?: ButtonEvent) => changeQuantity(1, event),
    handleDecrement: (event?: ButtonEvent) => changeQuantity(-1, event),
    handleWishlistToggle,
  }
}
