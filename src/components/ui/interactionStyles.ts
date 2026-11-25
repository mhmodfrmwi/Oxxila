/** Shared focus ring for interactive cards and links */
export const focusRingClasses =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** Subtle card lift on hover (desktop pointer devices) */
export const cardHoverLiftClasses = [
  'transition-[transform,box-shadow] duration-200 ease-out',
  '[@media(hover:hover)]:hover:-translate-y-0.5',
  '[@media(hover:hover)]:hover:shadow-md [@media(hover:hover)]:hover:shadow-black/10',
  'dark:[@media(hover:hover)]:hover:shadow-lg dark:[@media(hover:hover)]:hover:shadow-black/25',
].join(' ')

/** Bottom margin for shop-style section headers — Figma Gaps/small (16px) */
export const shopSectionHeaderSpacingClasses = 'mb-4'
