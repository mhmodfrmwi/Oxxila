// src/utils/userProfile.ts
import type { AuthUser } from '../api/auth'
import type { UserProfile } from '../api/users'
import type { ApiAdminRole } from '../types/adminPermissions'
import { normalizePermissions } from './adminPermissions'
import { normalizeAvatarUrl } from './userAvatar'

function mapProfileAdminRole(
  role: UserProfile['adminRole'],
): ApiAdminRole | undefined {
  if (!role || typeof role !== 'object' || !role._id) return undefined

  return {
    _id: String(role._id),
    name: role.name ?? '',
    slug: role.slug ?? '',
    description: role.description,
    isSystem: role.isSystem,
    permissions: normalizePermissions(role.permissions),
  }
}

export function profileToAuthUser(
  profile: UserProfile,
  previous?: AuthUser | null,
): AuthUser {
  const avatar = normalizeAvatarUrl(profile.avatar)

  return {
    id: String(profile._id ?? profile.id ?? previous?.id ?? ''),
    name: profile.name,
    email: profile.email,
    role: profile.role ?? previous?.role ?? 'user',
    phone: profile.phone ?? previous?.phone ?? '',
    avatar,
    // Profile response is canonical — drop any provisional Google picture.
    provisionalAvatar: undefined,
    storeCreditBalance:
      profile.storeCreditBalance ?? previous?.storeCreditBalance ?? 0,
    adminRole:
      mapProfileAdminRole(profile.adminRole) ?? previous?.adminRole,
  }
}

export function splitFullName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim()
  if (!trimmed) return { firstName: '', lastName: '' }

  const spaceIndex = trimmed.indexOf(' ')
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: '' }
  }

  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  }
}

export function joinFullName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
}
