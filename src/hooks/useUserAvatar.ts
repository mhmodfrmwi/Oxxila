// src/hooks/useUserAvatar.ts
import { useAuth } from '../context/AuthContext'
import { resolveAuthUserAvatar } from '../utils/userAvatar'

/**
 * Shared avatar view-model — every surface should use this (or UserAvatar + these values)
 * so header, dropdown, and account pages never disagree.
 */
export function useUserAvatar() {
  const { user, profileLoading, isAuthenticated } = useAuth()
  const src = resolveAuthUserAvatar(user)
  const name = user?.name ?? ''

  return {
    name,
    src,
    /** Skeleton until first profile hydrate when we don't yet have a usable image. */
    loading: Boolean(isAuthenticated && profileLoading && !src),
    storeCreditBalance: user?.storeCreditBalance ?? 0,
    user,
  }
}
