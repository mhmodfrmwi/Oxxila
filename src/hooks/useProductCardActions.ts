// src/hooks/useProductCardActions.ts
import { useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LOGIN_PATH } from '../config/routes'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useWishlist } from '../context/WishlistContext'

export function useProductCardActions(productId: string | undefined) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist, pendingProductId } = useWishlist()
  const toast = useToast()
  const [addingToCart, setAddingToCart] = useState(false)

  const wishlisted = Boolean(productId && isWishlisted(productId))
  const wishlistPending = Boolean(productId && pendingProductId === productId)

  async function handleAddToCart(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault()
    event?.stopPropagation()

    if (addingToCart) return

    if (!productId) {
      toast.error(t('productDetail.cart.missingId'))
      return
    }

    setAddingToCart(true)
    try {
      await addToCart(productId, 1)
    } catch {
      // CartContext already surfaces the error toast.
    } finally {
      setAddingToCart(false)
    }
  }

  async function handleWishlistToggle(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault()
    event?.stopPropagation()

    if (!productId || wishlistPending) return

    if (!isAuthenticated) {
      toast.error(t('wishlist.signInRequired'), t('wishlist.signInRequiredDetail'))
      navigate(LOGIN_PATH)
      return
    }

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
    handleAddToCart,
    handleWishlistToggle,
  }
}
