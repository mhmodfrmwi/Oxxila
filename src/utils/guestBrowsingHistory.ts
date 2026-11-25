// src/utils/guestBrowsingHistory.ts
import { STORAGE_KEYS } from '../config/storage'

const MAX_ITEMS = 20

export function readGuestHistoryIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEYS.guestBrowsingHistory) ?? '[]')
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id))
      : []
  } catch {
    return []
  }
}

/** Remember a product view for visitors without an account (newest first, deduped). */
export function recordGuestView(productId: string) {
  if (!/^[a-f\d]{24}$/i.test(productId)) return
  try {
    const next = [productId, ...readGuestHistoryIds().filter((id) => id !== productId)].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEYS.guestBrowsingHistory, JSON.stringify(next))
  } catch {
    // Storage unavailable — history is a nicety, not required.
  }
}
