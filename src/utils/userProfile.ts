// src/utils/userProfile.ts
import type { AuthUser } from '../api/auth'
import type { UserProfile } from '../api/users'

export function profileToAuthUser(profile: UserProfile): AuthUser {
  return {
    id: String(profile._id ?? profile.id ?? ''),
    name: profile.name,
    email: profile.email,
    role: profile.role ?? 'user',
    phone: profile.phone ?? '',
    avatar: profile.avatar ?? '',
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
