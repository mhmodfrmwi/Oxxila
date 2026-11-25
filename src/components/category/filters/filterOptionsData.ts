// src/components/category/filters/filterOptionsData.ts
export interface FilterOption {
  id: string
  /** i18n key under categoryFilters.options.* or a raw label fallback */
  labelKey: string
  /** English fallback when key missing */
  label: string
}

/** Backend supports `isSensitiveSkin` only — other skin types are UI-only until API adds them. */
export const sensitivityOptions: FilterOption[] = [
  {
    id: 'sensitive-skin',
    labelKey: 'categoryFilters.options.sensitivity.sensitiveSkin',
    label: 'Sensitive Skin',
  },
]

export const concernOptions: FilterOption[] = [
  { id: 'acne', labelKey: 'categoryFilters.options.concerns.acne', label: 'Acne' },
  {
    id: 'pigmentation',
    labelKey: 'categoryFilters.options.concerns.pigmentation',
    label: 'Pigmentation',
  },
  {
    id: 'sensitive-skin',
    labelKey: 'categoryFilters.options.concerns.sensitiveSkin',
    label: 'Sensitive Skin',
  },
  { id: 'drought', labelKey: 'categoryFilters.options.concerns.dryness', label: 'Dryness' },
  { id: 'wrinkles', labelKey: 'categoryFilters.options.concerns.wrinkles', label: 'Wrinkles' },
  {
    id: 'wide-pores',
    labelKey: 'categoryFilters.options.concerns.widePores',
    label: 'Wide Pores',
  },
]

/** Mapped to backend `allOffers`, `todayOffers`, and `isBestSeller`. */
export const offerOptions: FilterOption[] = [
  { id: 'on-sale', labelKey: 'categoryFilters.options.offers.onSale', label: 'On Sale' },
  {
    id: 'best-seller',
    labelKey: 'categoryFilters.options.offers.bestSeller',
    label: 'Best Seller',
  },
  {
    id: 'limited-offer',
    labelKey: 'categoryFilters.options.offers.todayOffers',
    label: "Today's Offers",
  },
]

export const concernsCollapsedCount = 5
