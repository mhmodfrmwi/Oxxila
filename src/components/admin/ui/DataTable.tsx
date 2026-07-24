// src/components/admin/ui/DataTable.tsx
import { type ReactNode } from 'react'
import { cn } from '../../../lib/cn'
import { EmptyState } from './EmptyState'
import { GlassCard } from './GlassCard'
import { Skeleton } from './Skeleton'

export interface DataTableColumn<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: readonly DataTableColumn<T>[]
  rows: readonly T[]
  getRowId: (row: T) => string
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  toolbar?: ReactNode
  footer?: ReactNode
  className?: string
  /** Products Figma uses ~24px cell pad; list tables use denser default. */
  density?: 'default' | 'spacious'
  /** Accessible name for the table region. */
  'aria-label'?: string
  /** Makes rows clickable (e.g. select a row into a split-view detail panel). */
  onRowClick?: (row: T) => void
  /** Row id (via `getRowId`) that should render as selected/highlighted. */
  selectedRowId?: string | null
}

const densityPad = {
  default: { header: 'px-6 py-4', cell: 'px-6 py-5' },
  /* Products Management: header/body ~p-24 / first col px-32 */
  spacious: { header: 'px-8 py-6', cell: 'px-8 py-6' },
} as const

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  loading = false,
  emptyTitle = 'No results',
  emptyDescription,
  emptyAction,
  toolbar,
  footer,
  className,
  density = 'default',
  'aria-label': ariaLabel,
  onRowClick,
  selectedRowId = null,
}: DataTableProps<T>) {
  const showEmpty = !loading && rows.length === 0
  const headerPad = densityPad[density].header
  const cellPad = densityPad[density].cell

  return (
    <GlassCard
      padding="none"
      strong
      className={cn(
        'w-full min-w-0 overflow-hidden rounded-[var(--admin-radius-xl)]',
        className,
      )}
      aria-busy={loading || undefined}
    >
      {toolbar && (
        <div className="border-b border-border-subtle px-4 py-3 sm:px-4">
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto">
        <table
          className="w-full min-w-0 border-collapse text-start text-sm"
          aria-label={ariaLabel}
        >
          <thead>
            <tr className="border-b border-white/5">
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    'admin-label whitespace-nowrap text-start text-[8px] tracking-[0.1em]',
                    headerPad,
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr
                  key={`skeleton-${rowIndex}`}
                  className="border-b border-white/5"
                >
                  {columns.map((column) => (
                    <td key={column.id} className={cellPad}>
                      <Skeleton className="h-4 w-full max-w-[8rem]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading &&
              rows.map((row) => {
                const rowId = getRowId(row)
                const isSelected = selectedRowId != null && rowId === selectedRowId
                return (
                  <tr
                    key={rowId}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    aria-selected={onRowClick ? isSelected : undefined}
                    className={cn(
                      'border-b border-white/5 last:border-b-0 hover:bg-white/[0.03]',
                      onRowClick && 'cursor-pointer',
                      isSelected && 'bg-white/[0.06]',
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          'align-middle text-primary-text',
                          cellPad,
                          column.className,
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {showEmpty && (
        <EmptyState
          bare
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      )}

      {footer && !showEmpty && (
        <div className="border-t border-white/5 bg-white/[0.02] px-4 py-4">
          {footer}
        </div>
      )}
    </GlassCard>
  )
}
