# Category Filters Sidebar — Visual Polish Report

## Scope

Visual-only refinements to match the Figma filter sidebar. **No changes** to filter logic, backend integration, or filter removal.

## Verification

| Check | Status |
|-------|--------|
| Filter order | ✓ |
| Accordion appearance | ✓ |
| Checkboxes | ✓ |
| Radio buttons | ✓ |
| Price (radio list, not slider) | ✓ |
| Typography | ✓ |
| Spacing | ✓ |
| Sidebar width (`lg:max-w-[17.5rem]`) | ✓ |
| Section dividers | ✓ |
| `npm run lint` | ✓ Pass |
| `npm run build` | ✓ Pass |

---

## Filter Order

Reordered in `FilterSidebar.tsx` to match the Figma hierarchy:

1. Category
2. Type of Category
3. Concerns
4. Offers
5. Brand
6. Price
7. Product Rating
8. Sensitivity *(retained, not in Figma frame)*
9. Availability *(retained, not in Figma frame)*

---

## Header

- Title: **Filter** (singular), serif, larger weight
- Action: **Clear All**, right-aligned on the same baseline as the title
- Mobile toggle label updated to **Filter** for consistency
- Sidebar width unchanged at `17.5rem` on desktop

---

## Accordion Consistency

All filter groups now use `FilterSection` with a unified accordion pattern:

- Lavender card background (`#f8f9ff` / `--filter-section-bg`)
- `1rem` corner radius
- Serif section titles with consistent size/weight
- `16px` chevron, rotates on expand/collapse
- Subtle divider between header and panel (`border-top` on `.filter-section-panel`)
- Uniform internal padding (`1rem 1.125rem`)

Removed `FilterStandaloneSection` — previously used for Type of Category, Concerns, Offers, Sensitivity, and Availability.

---

## Filter Controls

### Category chips
- White pill chips in a wrapping flex layout
- `6px` radius, subtle border, purple border on selected

### Checkboxes (Type of Category, Concerns, Offers, Sensitivity, Availability)
- `16px` circular controls
- Grey border default, purple fill + white checkmark when checked
- Hover border tint
- List row gap tightened to `0.625rem`

### Brand chips
- Switched from `grid-cols-2` to **flex-wrap** layout (matches Figma)
- Logo + name inline chip with selected purple border

### Price
- Radio buttons (All / Low to high / High to low) — **no slider**
- Same circular control styling as checkboxes with purple selected state

### Product Rating
- Five numbered boxes (`2.25rem`), horizontal row with wrap
- Selected state: purple border

### Concerns “more” link
- Italic, muted purple-grey (`--filter-sidebar-clear`)

---

## Spacing & Typography

- Section stack: `.filter-sidebar-groups` with `0.75rem` gap (lighter vertical rhythm)
- Header margin reduced (`mb-4` / `lg:mb-5`)
- Accordion panel: `0.875rem` top margin + padding above divider
- Label font sizes aligned to Figma scale (`0.8125×`–`0.875×` small token)
- Regular weight on option labels for a cleaner read

---

## Responsive

- **Desktop:** Sticky sidebar, scrollable panel, full filter hierarchy
- **Tablet:** Same layout within page grid
- **Mobile:** Collapsible drawer toggle unchanged functionally; expanded panel shows the same ordered accordion groups

---

## Files Changed

| File | Change |
|------|--------|
| `FilterSidebar.tsx` | Order, header copy, group spacing class |
| `FilterSection.tsx` | Unified header/panel structure |
| `filterStyles.ts` | Typography tokens for heading, title, clear action |
| `category-filters.css` | Tokens, accordion, controls, spacing, dividers |
| `CategoryFilter.tsx` | Title → “Category” |
| `TypeOfCategoryFilter.tsx` | Accordion wrapper |
| `ConcernsFilter.tsx` | Accordion wrapper |
| `OffersFilter.tsx` | Accordion wrapper |
| `SensitivityFilter.tsx` | Accordion wrapper |
| `AvailabilityFilter.tsx` | Accordion wrapper |
| `BrandFilter.tsx` | Flex-wrap chip layout |
| `FilterCheckboxList.tsx` | Shared list spacing classes |
| `PriceFilter.tsx` | Shared list spacing |
| `RatingFilter.tsx` | Flex-wrap on rating row |
| `FilterStandaloneSection.tsx` | **Deleted** (replaced by accordion) |
