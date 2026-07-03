export interface FilterOption {
  id: string
  label: string
}

/** Backend supports `isSensitiveSkin` only — other skin types are UI-only until API adds them. */
export const sensitivityOptions: FilterOption[] = [
  { id: 'sensitive-skin', label: 'Sensitive Skin' },
]

export const concernOptions: FilterOption[] = [
  { id: 'acne', label: 'Acne' },
  { id: 'pigmentation', label: 'Pigmentation' },
  { id: 'sensitive-skin', label: 'Sensitive Skin' },
  { id: 'drought', label: 'Dryness' },
  { id: 'wrinkles', label: 'Wrinkles' },
  { id: 'wide-pores', label: 'Wide Pores' },
]

/** Mapped to backend `allOffers`, `todayOffers`, and `isBestSeller`. */
export const offerOptions: FilterOption[] = [
  { id: 'on-sale', label: 'On Sale' },
  { id: 'best-seller', label: 'Best Seller' },
  { id: 'limited-offer', label: "Today's Offers" },
]

export const concernsCollapsedCount = 5
