// src/hooks/useFormulaSpecsDrawer.ts
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  archiveProduct,
  createProduct,
  deleteProduct as apiDeleteProduct,
  getAdminProduct,
  updateProduct,
} from '../api/admin/products'
import { ApiError } from '../lib/api'
import type { ApiProduct } from '../types/catalog'
import type { AdminProductWriteFields } from '../types/adminProducts'
import {
  ADMIN_PRODUCT_CONCERNS,
  ADMIN_PRODUCT_IMAGES_MAX,
  emptyAdminProductForm,
  type AdminProductConcern,
  type AdminProductFormErrors,
  type AdminProductFormValues,
  validateAdminProductCreate,
  validateAdminProductUpdate,
  validateCatalogFile,
  validateImageFile,
} from '../utils/adminProductValidation'

export type FormulaSpecsMode = 'create' | 'edit'

/** Re-fetch existing gallery URLs as Files so one multipart PUT can keep them. */
async function filesFromImageUrls(urls: string[]): Promise<File[]> {
  const files: File[] = []
  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index]
    const response = await fetch(url)
    if (!response.ok) {
      throw new ApiError(
        `Unable to read existing image ${index + 1}. Save was cancelled so the gallery was not changed.`,
      )
    }
    const blob = await response.blob()
    const ext = blob.type.split('/')[1]?.split(';')[0] || 'jpeg'
    const fromUrl = url.split('/').pop()?.split('?')[0]
    const name = fromUrl && fromUrl.includes('.') ? fromUrl : `existing-${index + 1}.${ext}`
    files.push(new File([blob], name, { type: blob.type || `image/${ext}` }))
  }
  return files
}

interface UseFormulaSpecsDrawerOptions {
  open: boolean
  mode: FormulaSpecsMode
  productId: string | null
  onSaved: (product: ApiProduct) => void
  onArchived: (productId: string) => void
  onDeleted: (productId: string) => void
}

function productToForm(product: ApiProduct): AdminProductFormValues {
  const categoryId =
    product.category && typeof product.category === 'object'
      ? product.category._id
      : typeof product.category === 'string'
        ? product.category
        : ''
  const sub =
    Array.isArray(product.subCategory) && product.subCategory[0]
      ? typeof product.subCategory[0] === 'object'
        ? product.subCategory[0]._id
        : String(product.subCategory[0])
      : ''
  const concerns = (product.concerns ?? []).filter((c): c is AdminProductConcern =>
    ADMIN_PRODUCT_CONCERNS.includes(c as AdminProductConcern),
  )

  return {
    name: product.name ?? '',
    price: String(product.price ?? ''),
    stock: String(product.stock ?? ''),
    category: categoryId,
    subCategory: sub,
    concerns,
    isSensitiveSkin: Boolean(product.isSensitiveSkin),
    description: product.description ?? '',
    advantages: product.advantages ?? '',
    composition: product.composition ?? '',
  }
}

function toWriteFields(values: AdminProductFormValues): AdminProductWriteFields {
  return {
    name: values.name.trim(),
    price: Number(values.price),
    stock: Number(values.stock),
    category: values.category,
    subCategory: values.subCategory ? [values.subCategory] : [],
    concerns: values.concerns,
    isSensitiveSkin: values.isSensitiveSkin,
    description: values.description.trim(),
    advantages: values.advantages.trim(),
    composition: values.composition.trim(),
  }
}

export function useFormulaSpecsDrawer({
  open,
  mode,
  productId,
  onSaved,
  onArchived,
  onDeleted,
}: UseFormulaSpecsDrawerOptions) {
  const [values, setValues] = useState<AdminProductFormValues>(emptyAdminProductForm)
  const [baseline, setBaseline] = useState('')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [existingCatalog, setExistingCatalog] = useState<string | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [catalogFile, setCatalogFile] = useState<File | null>(null)
  const [removeCatalog, setRemoveCatalog] = useState(false)
  const [slug, setSlug] = useState<string | null>(null)
  const [errors, setErrors] = useState<AdminProductFormErrors>({})
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const snapshot = useCallback(
    (
      nextValues: AdminProductFormValues,
      images: string[],
      catalog: string | null,
      files: File[],
      catalogNext: File | null,
      dropCatalog: boolean,
    ) =>
      JSON.stringify({
        values: nextValues,
        images,
        catalog,
        fileNames: files.map((f) => `${f.name}:${f.size}`),
        catalogName: catalogNext ? `${catalogNext.name}:${catalogNext.size}` : null,
        dropCatalog,
      }),
    [],
  )

  const resetCreate = useCallback(() => {
    const form = emptyAdminProductForm()
    setValues(form)
    setExistingImages([])
    setExistingCatalog(null)
    setNewImages([])
    setCatalogFile(null)
    setRemoveCatalog(false)
    setSlug(null)
    setErrors({})
    setLoadError(null)
    setBaseline(snapshot(form, [], null, [], null, false))
  }, [snapshot])

  useEffect(() => {
    if (!open) return

    if (mode === 'create') {
      resetCreate()
      return
    }

    if (!productId) return

    let cancelled = false
    async function load() {
      setLoadingProduct(true)
      setLoadError(null)
      try {
        const response = await getAdminProduct(productId!)
        if (cancelled) return
        const product = response.data
        if (!product) {
          setLoadError('No product found')
          return
        }
        const form = productToForm(product)
        const images = (product.images ?? []).filter(Boolean)
        const catalog = product.catalog ?? null
        setValues(form)
        setExistingImages(images)
        setExistingCatalog(catalog)
        setNewImages([])
        setCatalogFile(null)
        setRemoveCatalog(false)
        setSlug(product.slug ?? null)
        setErrors({})
        setBaseline(snapshot(form, images, catalog, [], null, false))
      } catch (error) {
        if (cancelled) return
        setLoadError(
          error instanceof ApiError ? error.message : 'Unable to load product.',
        )
      } finally {
        if (!cancelled) setLoadingProduct(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [open, mode, productId, resetCreate, snapshot])

  const dirty = useMemo(() => {
    if (!open || loadingProduct) return false
    return (
      snapshot(
        values,
        existingImages,
        existingCatalog,
        newImages,
        catalogFile,
        removeCatalog,
      ) !== baseline
    )
  }, [
    open,
    loadingProduct,
    values,
    existingImages,
    existingCatalog,
    newImages,
    catalogFile,
    removeCatalog,
    baseline,
    snapshot,
  ])

  const setField = useCallback(
    <K extends keyof AdminProductFormValues>(key: K, value: AdminProductFormValues[K]) => {
      setValues((previous) => ({ ...previous, [key]: value }))
      setErrors((previous) => ({ ...previous, [key]: undefined }))
    },
    [],
  )

  const toggleConcern = useCallback((concern: AdminProductConcern) => {
    setValues((previous) => {
      const exists = previous.concerns.includes(concern)
      return {
        ...previous,
        concerns: exists
          ? previous.concerns.filter((item) => item !== concern)
          : [...previous.concerns, concern],
      }
    })
    setErrors((previous) => ({ ...previous, concerns: undefined }))
  }, [])

  const addImages = useCallback((fileList: FileList | null) => {
    if (!fileList?.length) return
    const next = [...newImages]
    let imageError: string | undefined
    for (const file of Array.from(fileList)) {
      const total = existingImages.length + next.length
      if (total >= ADMIN_PRODUCT_IMAGES_MAX) break
      const fileError = validateImageFile(file)
      if (fileError) {
        imageError = fileError
        continue
      }
      next.push(file)
    }
    setNewImages(next)
    setErrors((previous) => ({ ...previous, images: imageError }))
  }, [existingImages.length, newImages])

  const removeExistingImage = useCallback((url: string) => {
    setExistingImages((previous) => previous.filter((item) => item !== url))
  }, [])

  const removeNewImage = useCallback((index: number) => {
    setNewImages((previous) => previous.filter((_, i) => i !== index))
  }, [])

  const setCatalog = useCallback((file: File | null) => {
    if (!file) {
      setCatalogFile(null)
      return
    }
    const fileError = validateCatalogFile(file)
    if (fileError) {
      setErrors((previous) => ({ ...previous, catalog: fileError }))
      return
    }
    setCatalogFile(file)
    setRemoveCatalog(false)
    setErrors((previous) => ({ ...previous, catalog: undefined }))
  }, [])

  const clearCatalog = useCallback(() => {
    setCatalogFile(null)
    setRemoveCatalog(true)
    setExistingCatalog(null)
  }, [])

  const save = useCallback(async () => {
    const nextErrors =
      mode === 'create'
        ? validateAdminProductCreate(values)
        : validateAdminProductUpdate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return { ok: false as const, message: 'Please fix the highlighted fields.' }
    }

    const fields = toWriteFields(values)
    setSubmitting(true)
    try {
      if (mode === 'create') {
        const response = await createProduct(fields, {
          images: newImages,
          catalog: catalogFile,
        })
        const product = response.data
        if (!product) throw new ApiError('Product created without payload.')
        onSaved(product)
        return { ok: true as const, product }
      }

      if (!productId) throw new ApiError('Missing product id.')

      let saved: ApiProduct | undefined

      if (newImages.length > 0 && existingImages.length > 0) {
        // Never call uploadImages first — that replaces the gallery with only
        // new files. Re-upload existing URLs + new files in one PUT so a failed
        // request leaves the previous gallery untouched.
        const existingFiles = await filesFromImageUrls(existingImages)
        const mergedFiles = [...existingFiles, ...newImages].slice(
          0,
          ADMIN_PRODUCT_IMAGES_MAX,
        )
        const response = await updateProduct(
          productId,
          {
            ...fields,
            ...(removeCatalog ? { catalog: null } : {}),
          },
          {
            images: mergedFiles,
            catalog: catalogFile,
          },
        )
        saved = response.data
      } else if (newImages.length > 0) {
        const response = await updateProduct(
          productId,
          {
            ...fields,
            ...(removeCatalog ? { catalog: null } : {}),
          },
          {
            images: newImages,
            catalog: catalogFile,
          },
        )
        saved = response.data
      } else {
        const response = await updateProduct(
          productId,
          {
            ...fields,
            images: existingImages,
            ...(removeCatalog ? { catalog: null } : {}),
          },
          catalogFile ? { catalog: catalogFile } : undefined,
        )
        saved = response.data
      }

      if (!saved) throw new ApiError('Product updated without payload.')

      if (removeCatalog && !catalogFile) {
        const cleared = await updateProduct(productId, {
          ...fields,
          images: saved.images ?? existingImages,
          catalog: null,
        })
        saved = cleared.data ?? saved
      }

      onSaved(saved)
      setBaseline(
        snapshot(
          values,
          saved.images ?? existingImages,
          saved.catalog ?? existingCatalog,
          [],
          null,
          false,
        ),
      )
      setNewImages([])
      setCatalogFile(null)
      setExistingImages(saved.images ?? [])
      setExistingCatalog(saved.catalog ?? null)
      return { ok: true as const, product: saved }
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Unable to save formulation.'
      return { ok: false as const, message }
    } finally {
      setSubmitting(false)
    }
  }, [
    mode,
    values,
    newImages,
    catalogFile,
    productId,
    existingImages,
    existingCatalog,
    removeCatalog,
    onSaved,
    snapshot,
  ])

  const archive = useCallback(async () => {
    if (!productId || mode !== 'edit') {
      return { ok: false as const, message: 'Nothing to archive.' }
    }
    setArchiving(true)
    try {
      await archiveProduct(productId)
      onArchived(productId)
      return { ok: true as const }
    } catch (error) {
      return {
        ok: false as const,
        message:
          error instanceof ApiError ? error.message : 'Unable to archive formulation.',
      }
    } finally {
      setArchiving(false)
    }
  }, [productId, mode, onArchived])

  const deleteProduct = useCallback(async () => {
    if (!productId || mode !== 'edit') {
      return { ok: false as const, message: 'Nothing to delete.' }
    }
    setDeleting(true)
    try {
      await apiDeleteProduct(productId)
      onDeleted(productId)
      return { ok: true as const }
    } catch (error) {
      return {
        ok: false as const,
        message:
          error instanceof ApiError ? error.message : 'Unable to delete formulation.',
      }
    } finally {
      setDeleting(false)
    }
  }, [productId, mode, onDeleted])

  const imageSlotsUsed = existingImages.length + newImages.length
  const canUploadMore = imageSlotsUsed < ADMIN_PRODUCT_IMAGES_MAX

  return {
    values,
    errors,
    slug,
    existingImages,
    existingCatalog,
    newImages,
    catalogFile,
    removeCatalog,
    loadingProduct,
    loadError,
    submitting,
    archiving,
    deleting,
    dirty,
    imageSlotsUsed,
    canUploadMore,
    setField,
    toggleConcern,
    addImages,
    removeExistingImage,
    removeNewImage,
    setCatalog,
    clearCatalog,
    save,
    archive,
    deleteProduct,
  }
}
