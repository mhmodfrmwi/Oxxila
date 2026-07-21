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
  /** Accessible name for the table region. */
  'aria-label'?: string
}

/** Figma table cells use ~16px horizontal / denser vertical rhythm. */
const cellPad = 'px-4 py-2.5 sm:px-4'

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
  'aria-label': ariaLabel,
}: DataTableProps<T>) {
  const showEmpty = !loading && rows.length === 0

  return (
    <GlassCard
      padding="none"
      className={cn('overflow-hidden', className)}
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
                    'admin-label whitespace-nowrap text-start text-[10px] tracking-[0.1em] text-white/40',
                    cellPad,
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
                      <Skeleton className="h-4 w-full max-w-[10rem]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading &&
              rows.map((row) => (
                <tr
                  key={getRowId(row)}
                  className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.03]"
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
              ))}
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
