// src/utils/filterMappings.ts
/** Maps UI concern chip ids to backend `concerns` enum values. */
const CONCERN_ID_TO_API: Record<string, string> = {
  acne: 'acne',
  pigmentation: 'pigmentation',
  'dark-spots': 'pigmentation',
  wrinkles: 'wrinkles',
  'anti-aging': 'wrinkles',
  dryness: 'drought',
  drought: 'drought',
  'sensitive-skin': 'sensitive-skin',
  'wide-pores': 'wide-pores',
}

export function mapConcernIdsToApi(concernIds: string[]): string[] {
  const mapped = new Set<string>()
  for (const id of concernIds) {
    const apiValue = CONCERN_ID_TO_API[id]
    if (apiValue) mapped.add(apiValue)
  }
  return [...mapped]
}

export function mapSensitivityIdsToApi(sensitivityIds: string[]): { isSensitiveSkin?: boolean } {
  if (sensitivityIds.includes('sensitive-skin')) {
    return { isSensitiveSkin: true }
  }
  return {}
}

export function mapOfferIdsToApi(offerIds: string[]): {
  allOffers?: boolean
  todayOffers?: boolean
  isBestSeller?: boolean
} {
  return {
    allOffers: offerIds.includes('on-sale') || undefined,
    todayOffers: offerIds.includes('limited-offer') || undefined,
    isBestSeller: offerIds.includes('best-seller') || undefined,
  }
}
