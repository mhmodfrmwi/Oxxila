export interface FilterOption {
  id: string
  label: string
}

export const sensitivityOptions: FilterOption[] = [
  { id: 'sensitive-skin', label: 'Sensitive Skin' },
  { id: 'normal-skin', label: 'Normal Skin' },
  { id: 'dry-skin', label: 'Dry Skin' },
  { id: 'oily-skin', label: 'Oily Skin' },
  { id: 'combination-skin', label: 'Combination Skin' },
]

export const typeOfCategoryOptions: FilterOption[] = [
  { id: 'makeup', label: 'Makeup' },
  { id: 'skincare', label: 'Skincare' },
  { id: 'hair-care', label: 'Hair Care' },
  { id: 'fragrance', label: 'Fragrance' },
  { id: 'body-care', label: 'Body Care' },
]

export const concernOptions: FilterOption[] = [
  { id: 'acne', label: 'Acne' },
  { id: 'dark-spots', label: 'Dark Spots' },
  { id: 'wrinkles', label: 'Wrinkles' },
  { id: 'dryness', label: 'Dryness' },
  { id: 'redness', label: 'Redness' },
  { id: 'pigmentation', label: 'Pigmentation' },
  { id: 'anti-aging', label: 'Anti Aging' },
]

export const offerOptions: FilterOption[] = [
  { id: 'on-sale', label: 'On Sale' },
  { id: 'new-arrival', label: 'New Arrival' },
  { id: 'best-seller', label: 'Best Seller' },
  { id: 'buy-1-get-1', label: 'Buy 1 Get 1' },
  { id: 'limited-offer', label: 'Limited Offer' },
]

/** Number of concern options shown before the "more" control (Figma) */
export const concernsCollapsedCount = 5
