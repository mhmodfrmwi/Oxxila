// src/utils/userAvatar.ts
import type { AuthUser } from '../api/auth'

const GOOGLE_AVATAR_HOSTS = [
  'googleusercontent.com',
  'ggpht.com',
  'google.com',
]

/**
 * True when a URL looks like a Google (or similar OAuth) profile photo.
 * Used only for documentation / diagnostics — display always prefers `user.avatar`
 * from the hydrated profile, which the backend already overwrites on upload.
 */
export function isOAuthProviderAvatarUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return GOOGLE_AVATAR_HOSTS.some((entry) => host === entry || host.endsWith(`.${entry}`))
  } catch {
    return false
  }
}

/** Normalize avatar candidates — empty / invalid values become undefined. */
export function normalizeAvatarUrl(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed === 'null' || trimmed === 'undefined') return undefined
  return trimmed
}

/**
 * Single source of truth for which image URL to show.
 *
 * Backend stores one `avatar` field and only fills Google photo when empty,
 * so uploaded Cloudinary URLs always win once the profile is hydrated.
 *
 * Priority:
 * 1. Hydrated profile avatar (uploaded or Google fallback from API)
 * 2. Optional provisional Google/JWT picture (only before profile hydrate)
 * 3. undefined → initials / default icon in UserAvatar
 */
export function resolveUserAvatarSrc(options: {
  avatar?: string | null
  provisionalAvatar?: string | null
}): string | undefined {
  return (
    normalizeAvatarUrl(options.avatar) ??
    normalizeAvatarUrl(options.provisionalAvatar)
  )
}

export function resolveAuthUserAvatar(user: AuthUser | null | undefined): string | undefined {
  if (!user) return undefined
  return resolveUserAvatarSrc({
    avatar: user.avatar,
    provisionalAvatar: user.provisionalAvatar,
  })
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}
