# Filters Sidebar — Sensitive Skin Layout Report

## Change

Moved the existing `SensitivityFilter` component to the **first** filter position in `FilterSidebar.tsx`, directly below the **Filter** / **Clear All** header.

## Filter order (after)

1. Sensitive Skin (`SensitivityFilter`)
2. Categories
3. Type of Category
4. Concerns
5. Offers
6. Brand
7. Price
8. Product Rating
9. Availability *(unchanged, retained after Rating)*

## What was not changed

- No new components or duplicates
- Filter logic and backend integration unchanged
- Accordion expand/collapse behavior unchanged
- `sensitivityOptions` still loaded from `filterOptionsData` (API-mapped values)

## Verification

| Check | Status |
|-------|--------|
| Sensitive Skin is first | ✓ |
| Remaining filters in correct order | ✓ |
| Filtering functionality unchanged | ✓ |
| No duplicated filter groups | ✓ |
| `npm run lint` | ✓ Pass |
| `npm run build` | ✓ Pass |

## File changed

- `src/components/category/filters/FilterSidebar.tsx` — reordered `filterGroups` JSX only
