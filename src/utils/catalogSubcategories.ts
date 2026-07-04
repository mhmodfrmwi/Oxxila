// src/utils/catalogSubcategories.ts
import type { ApiCategory, ApiSubCategory } from '../types/catalog'

/** Unique subcategories from nested category payloads (catalog fallback). */
export function collectSubcategoriesFromCategories(categories: ApiCategory[]): ApiSubCategory[] {
  const byId = new Map<string, ApiSubCategory>()

  for (const category of categories) {
    for (const subcategory of category.subcategories ?? []) {
      if (!byId.has(subcategory._id)) {
        byId.set(subcategory._id, subcategory)
      }
    }
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
}
