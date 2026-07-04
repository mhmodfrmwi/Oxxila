// src/hooks/useSubCategories.ts
import { useEffect, useState } from 'react'
import { getSubCategories } from '../api/catalog'
import type { ApiSubCategory } from '../types/catalog'

export function useSubCategories(categoryId: string | undefined, shouldFetch = true) {
  const [subcategories, setSubcategories] = useState<ApiSubCategory[]>([])
  const [loading, setLoading] = useState(shouldFetch)

  useEffect(() => {
    if (!shouldFetch) return

    let cancelled = false

    async function load() {
      setLoading(true)

      try {
        const response = await getSubCategories(categoryId ? { category: categoryId } : undefined)
        if (cancelled) return
        setSubcategories(response.data ?? [])
      } catch {
        if (cancelled) return
        setSubcategories([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [categoryId, shouldFetch])

  return {
    subcategories,
    loading: shouldFetch && loading,
  }
}
