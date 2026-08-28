// src/components/admin/categories/CategoriesTreeTable.tsx
import { ChevronRight, ImageOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import { cn } from '../../../lib/cn'
import type {
  AdminCategoryTreeRow,
  AdminCategoryTreeSubcategory,
} from '../../../types/adminCategories'
import { formatDashboardNumber } from '../../../utils/adminDashboardFormat'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'

interface CategoriesTreeTableProps {
  categories: readonly AdminCategoryTreeRow[]
  loading?: boolean
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: ReactNode
  totalCount: number
  togglingCategoryId?: string | null
  deletingCategoryId?: string | null
  togglingSubcategoryId?: string | null
  deletingSubcategoryId?: string | null
  onEditCategory?: (category: AdminCategoryTreeRow) => void
  onDeleteCategory?: (category: AdminCategoryTreeRow) => void
  onToggleCategoryActive?: (categoryId: string) => void
  onAddSubcategory?: (category: AdminCategoryTreeRow) => void
  onEditSubcategory?: (
    category: AdminCategoryTreeRow,
    subcategory: AdminCategoryTreeSubcategory,
  ) => void
  onDeleteSubcategory?: (
    category: AdminCategoryTreeRow,
    subcategory: AdminCategoryTreeSubcategory,
  ) => void
  onToggleSubcategoryActive?: (
    categoryId: string,
    subcategoryId: string,
  ) => void
}

function CategoryThumbnail({
  src,
  name,
  indented = false,
  expandControl,
  meta,
}: {
  src: string | null
  name: string
  indented?: boolean
  expandControl?: ReactNode
  meta?: ReactNode
}) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-3',
        indented && 'ps-8',
      )}
    >
      {expandControl}
      {showImage ? (
        <img
          src={src!}
          alt=""
          className="size-10 shrink-0 rounded-lg border border-white/10 object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={cn(
            'inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/30',
            indented && 'size-8',
          )}
          aria-hidden
        >
          <ImageOff size={indented ? 12 : 14} />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-primary-text" title={name}>
          {name}
        </p>
        {meta}
      </div>
    </div>
  )
}

function CreatedByCell({ name }: { name: string | null }) {
  return (
    <span className="text-sm text-white/70" title={name ?? undefined}>
      {name ?? '—'}
    </span>
  )
}

function ActiveSwitch({
  checked,
  label,
  disabled,
  onToggle,
}: {
  checked: boolean
  label: string
  disabled?: boolean
  onToggle?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors',
        checked ? 'border-accent/40 bg-accent' : 'border-white/15 bg-white/15',
        'disabled:pointer-events-none disabled:opacity-50',
        focusRingClasses,
      )}
      role="switch"
      aria-checked={checked}
      aria-busy={disabled || undefined}
      aria-label={label}
      title={label}
    >
      <span
        className={cn(
          'absolute top-0.5 start-0.5 size-4 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-4 rtl:-translate-x-4',
        )}
        aria-hidden
      />
    </button>
  )
}

function TreeRowSkeleton({ indented = false }: { indented?: boolean }) {
  return (
    <tr className="border-b border-white/5">
      <td className="px-6 py-4">
        <div className={cn('flex items-center gap-4', indented && 'ps-8')}>
          <Skeleton className={cn('shrink-0 rounded-lg', indented ? 'size-8' : 'size-10')} />
          <Skeleton className="h-4 w-32" />
        </div>
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-3 w-24" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-3 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-5 w-20" />
      </td>
      <td className="px-6 py-4 text-end">
        <Skeleton className="ms-auto h-8 w-24" />
      </td>
    </tr>
  )
}

export function CategoriesTreeTable({
  categories,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  totalCount,
  togglingCategoryId = null,
  deletingCategoryId = null,
  togglingSubcategoryId = null,
  deletingSubcategoryId = null,
  onEditCategory,
  onDeleteCategory,
  onToggleCategoryActive,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
  onToggleSubcategoryActive,
}: CategoriesTreeTableProps) {
  const { t, i18n } = useTranslation()
  const { can } = useAdminPermissions()
  const canCreate = can('categories', 'create')
  const canUpdate = can('categories', 'update')
  const canDelete = can('categories', 'delete')
  const locale = i18n.language
  const isEmpty = !loading && categories.length === 0
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  )

  const toggleExpanded = (categoryId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }

  const handleAddSubcategory = (category: AdminCategoryTreeRow) => {
    setExpandedIds((prev) => {
      if (prev.has(category.id)) return prev
      const next = new Set(prev)
      next.add(category.id)
      return next
    })
    onAddSubcategory?.(category)
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02]">
      <div className="border-b border-white/10 px-6 py-4">
        <p className="text-xs text-secondary-text">
          {t('admin.categories.tree.showing', {
            showing: formatDashboardNumber(categories.length, locale),
            total: formatDashboardNumber(totalCount, locale),
          })}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table
          className="w-full min-w-[56rem] border-collapse text-start"
          aria-label={t('admin.categories.tree.tableAria')}
        >
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-secondary-text">
              <th className="px-6 py-4 text-start font-semibold">
                {t('admin.categories.columns.name')}
              </th>
              <th className="px-6 py-4 text-start font-semibold">
                {t('admin.categories.columns.slug')}
              </th>
              <th className="px-6 py-4 text-start font-semibold">
                {t('admin.categories.columns.createdBy')}
              </th>
              <th className="px-6 py-4 text-start font-semibold">
                {t('admin.categories.columns.status')}
              </th>
              <th className="px-6 py-4 text-end font-semibold">
                {t('admin.categories.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && categories.length === 0 ? (
              <>
                <TreeRowSkeleton />
                <TreeRowSkeleton indented />
                <TreeRowSkeleton />
              </>
            ) : null}

            {categories.map((category) => {
              const hasSubcategories = category.subcategories.length > 0
              const isExpanded = expandedIds.has(category.id)

              return (
                <Fragment key={category.id}>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <td className="px-6 py-4">
                      <CategoryThumbnail
                        src={category.image}
                        name={category.name}
                        expandControl={
                          hasSubcategories ? (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(category.id)}
                              className={cn(
                                'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-white/45',
                                'transition-colors hover:bg-white/10 hover:text-white',
                                focusRingClasses,
                              )}
                              aria-expanded={isExpanded}
                              aria-label={
                                isExpanded
                                  ? t('admin.categories.tree.collapseAria', {
                                      name: category.name,
                                    })
                                  : t('admin.categories.tree.expandAria', {
                                      name: category.name,
                                    })
                              }
                            >
                              <ChevronRight
                                size={16}
                                className={cn(
                                  'transition-transform duration-200',
                                  isExpanded ? 'rotate-90' : 'rtl:rotate-180',
                                )}
                                aria-hidden
                              />
                            </button>
                          ) : (
                            <span className="size-7 shrink-0" aria-hidden />
                          )
                        }
                        meta={
                          hasSubcategories && !isExpanded ? (
                            <p className="mt-0.5 text-[11px] text-secondary-text">
                              {t('admin.categories.tree.subcategoryCount', {
                                count: formatDashboardNumber(
                                  category.subcategories.length,
                                  locale,
                                ),
                              })}
                            </p>
                          ) : null
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-secondary-text">
                        {category.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <CreatedByCell name={category.createdByName} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {canUpdate ? (
                          <ActiveSwitch
                            checked={category.isActive}
                            disabled={
                              loading || togglingCategoryId === category.id
                            }
                            label={
                              category.isActive
                                ? t('admin.categories.tree.hideAria', {
                                    name: category.name,
                                  })
                                : t('admin.categories.tree.showAria', {
                                    name: category.name,
                                  })
                            }
                            onToggle={() =>
                              onToggleCategoryActive?.(category.id)
                            }
                          />
                        ) : null}
                        <StatusBadge
                          tone={category.isActive ? 'success' : 'neutral'}
                        >
                          {category.isActive
                            ? t('admin.categories.tree.visible')
                            : t('admin.categories.tree.hidden')}
                        </StatusBadge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="inline-flex items-center justify-end gap-1">
                        {canCreate ? (
                          <button
                            type="button"
                            onClick={() => handleAddSubcategory(category)}
                            className={cn(
                              'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
                              'transition-colors hover:bg-accent/10 hover:text-accent',
                              focusRingClasses,
                            )}
                            aria-label={t(
                              'admin.categories.tree.addSubcategoryAria',
                              { name: category.name },
                            )}
                            title={t('admin.categories.tree.addSubcategory')}
                          >
                            <Plus size={13} aria-hidden />
                          </button>
                        ) : null}
                        {canUpdate ? (
                          <button
                            type="button"
                            onClick={() => onEditCategory?.(category)}
                            className={cn(
                              'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
                              'transition-colors hover:bg-white/10 hover:text-white',
                              focusRingClasses,
                            )}
                            aria-label={t('admin.categories.editAria', {
                              name: category.name,
                            })}
                          >
                            <Pencil size={13} aria-hidden />
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => onDeleteCategory?.(category)}
                            disabled={deletingCategoryId === category.id}
                            className={cn(
                              'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
                              'transition-colors hover:bg-support-error/10 hover:text-support-error',
                              'disabled:pointer-events-none disabled:opacity-40',
                              focusRingClasses,
                            )}
                            aria-label={t('admin.categories.deleteAria', {
                              name: category.name,
                            })}
                          >
                            <Trash2 size={13} aria-hidden />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>

                  {isExpanded
                    ? category.subcategories.map((subcategory) => (
                        <tr
                          key={`${category.id}-${subcategory.id}`}
                          className="border-b border-white/5"
                        >
                          <td className="px-6 py-3">
                            <CategoryThumbnail
                              src={null}
                              name={subcategory.name}
                              indented
                              expandControl={
                                <span className="size-7 shrink-0" aria-hidden />
                              }
                            />
                          </td>
                          <td className="px-6 py-3">
                            <span className="font-mono text-xs text-secondary-text">
                              {subcategory.slug}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <CreatedByCell name={subcategory.createdByName} />
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              {canUpdate ? (
                                <ActiveSwitch
                                  checked={subcategory.isActive}
                                  disabled={
                                    loading ||
                                    togglingSubcategoryId === subcategory.id
                                  }
                                  label={
                                    subcategory.isActive
                                      ? t(
                                          'admin.categories.tree.hideSubcategoryAria',
                                          { name: subcategory.name },
                                        )
                                      : t(
                                          'admin.categories.tree.showSubcategoryAria',
                                          { name: subcategory.name },
                                        )
                                  }
                                  onToggle={() =>
                                    onToggleSubcategoryActive?.(
                                      category.id,
                                      subcategory.id,
                                    )
                                  }
                                />
                              ) : null}
                              <StatusBadge
                                tone={
                                  subcategory.isActive ? 'success' : 'neutral'
                                }
                              >
                                {subcategory.isActive
                                  ? t('admin.categories.tree.visible')
                                  : t('admin.categories.tree.hidden')}
                              </StatusBadge>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-end">
                            <div className="inline-flex items-center justify-end gap-1">
                              {canUpdate ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onEditSubcategory?.(category, subcategory)
                                  }
                                  className={cn(
                                    'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
                                    'transition-colors hover:bg-white/10 hover:text-white',
                                    focusRingClasses,
                                  )}
                                  aria-label={t(
                                    'admin.categories.tree.editSubcategoryAria',
                                    { name: subcategory.name },
                                  )}
                                >
                                  <Pencil size={13} aria-hidden />
                                </button>
                              ) : null}
                              {canDelete ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onDeleteSubcategory?.(
                                      category,
                                      subcategory,
                                    )
                                  }
                                  disabled={
                                    deletingSubcategoryId === subcategory.id
                                  }
                                  className={cn(
                                    'inline-flex size-8 items-center justify-center rounded-lg text-white/50',
                                    'transition-colors hover:bg-support-error/10 hover:text-support-error',
                                    'disabled:pointer-events-none disabled:opacity-40',
                                    focusRingClasses,
                                  )}
                                  aria-label={t(
                                    'admin.categories.tree.deleteSubcategoryAria',
                                    { name: subcategory.name },
                                  )}
                                >
                                  <Trash2 size={13} aria-hidden />
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))
                    : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {isEmpty ? (
        <EmptyState
          bare
          className="py-12"
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : null}
    </div>
  )
}
