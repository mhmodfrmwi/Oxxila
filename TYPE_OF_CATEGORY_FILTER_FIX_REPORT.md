# Type of Category Filter — Fix Report

## Issue

The **Type of Category** filter section was missing from the sidebar on the main categories view (`/categories`).

### Root cause

`TypeOfCategoryFilter` returned `null` when `subcategories.length === 0`, and subcategories were only sourced from the **currently selected category’s nested data**:

```ts
const subcategories = selectedCategory?.subcategories ?? []
```

On the unfiltered categories page (no `?category=` query), `selectedCategory` is `undefined`, so the list was always empty and the entire section was hidden.

---

## Fix

### 1. Always render Type of Category

`TypeOfCategoryFilter` no longer unmounts when the list is empty. It always renders as its own accordion section directly below **Categories**, with loading and empty states when needed.

### 2. Load subcategories from the API

Added `useSubCategories` hook calling the existing `GET /api/v1/subcategories` endpoint via `getSubCategories()`:

- **No category selected** → fetches all active subcategories
- **Category selected** → fetches with `?category=<categoryId>` so types scope to that parent

### 3. Catalog fallback (no hardcoded values)

Added `collectSubcategoriesFromCategories()` to merge unique subcategories already embedded in the categories API response. Used only when:

- The dedicated subcategories request returns no rows, or
- Before/while the subcategories request is in flight on the all-categories view

All values come from backend data — nothing is hardcoded.

### 4. Separate sections preserved

- **Categories** — navigation chips (unchanged logic)
- **Type of Category** — checkbox list bound to `filters.typeOfCategoryIds` (unchanged logic)

Selecting a category does **not** remove the Type of Category section; it refreshes the available types for that parent when the API supports it.

---

## Filter order (unchanged, matches Figma)

1. Categories  
2. Type of Category  
3. Concerns  
4. Offers  
5. Brand  
6. Price  
7. Product Rating  
8. Sensitivity *(retained)*  
9. Availability *(retained)*  

---

## Verification

| Check | Status |
|-------|--------|
| Categories exists | ✓ |
| Type of Category exists | ✓ |
| Separate accordion sections | ✓ |
| Correct order | ✓ |
| API integration (`getSubCategories`) | ✓ |
| No duplicated filters | ✓ |
| Filter logic unchanged | ✓ |
| Backend unchanged | ✓ |
| `npm run lint` | ✓ Pass |
| `npm run build` | ✓ Pass |

---

## Files changed

| File | Change |
|------|--------|
| `src/hooks/useSubCategories.ts` | **Added** — fetches subcategories from API |
| `src/utils/catalogSubcategories.ts` | **Added** — deduped fallback from category payloads |
| `src/components/category/CategoryPageContent.tsx` | Wire hook + merged subcategory list |
| `src/components/category/filters/TypeOfCategoryFilter.tsx` | Always render; loading/empty states |
| `src/components/category/filters/FilterSidebar.tsx` | Pass `subcategoriesLoading` |
| `src/components/category/filters/CategoryFilter.tsx` | Title → **Categories** |
