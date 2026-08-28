// src/utils/utilityBarCache.ts
import type { ApiUtilityBarSettings } from '../api/settings'

let cachedSettings: ApiUtilityBarSettings | null = null
let loadPromise: Promise<ApiUtilityBarSettings | null> | null = null

export function getUtilityBarCache() {
  return { cachedSettings, loadPromise }
}

export function setUtilityBarCache(
  settings: ApiUtilityBarSettings | null,
  promise: Promise<ApiUtilityBarSettings | null> | null = loadPromise,
) {
  cachedSettings = settings
  loadPromise = promise
}

export function invalidateUtilityBarCache() {
  cachedSettings = null
  loadPromise = null
}
