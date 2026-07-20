// src/components/admin/products/InventoryStatusCell.tsx
import { useTranslation } from 'react-i18next'
import type { AdminProductInventoryStatus } from '../../../types/adminProducts'
import { formatAdminStockCount } from '../../../utils/adminProductsFormat'
import { cn } from '../../../lib/cn'

interface InventoryStatusCellProps {
  status: AdminProductInventoryStatus
  stock: number
  progress: number
}

const statusToneClass: Record<AdminProductInventoryStatus, string> = {
  in_stock: 'text-support-success',
  low_stock: 'text-support-warning',
  out_of_stock: 'text-support-error',
}

const barToneClass: Record<AdminProductInventoryStatus, string> = {
  in_stock: 'bg-support-success',
  low_stock: 'bg-support-warning shadow-[0_0_8px_rgb(251_191_36_/_0.5)]',
  out_of_stock: 'bg-support-error',
}

export function InventoryStatusCell({
  status,
  stock,
  progress,
}: InventoryStatusCellProps) {
  const { t, i18n } = useTranslation()
  const countLabel = formatAdminStockCount(stock, i18n.language)
  const label = t(`admin.products.inventory.${status}`, { formatted: countLabel })
  const clamped = Math.min(Math.max(progress, 0), 100)
  const fillWidth = status === 'out_of_stock' ? 0 : Math.max(clamped, 4)

  return (
    <div className="flex min-w-[7rem] flex-col gap-1">
      <p className={cn('text-sm font-medium tabular-nums', statusToneClass[status])}>
        {label}
      </p>
      {/* Flex fill grows from inline-start so RTL mirrors correctly. */}
      <div
        className="flex h-1 w-24 overflow-hidden rounded-full bg-white/5"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn('h-full shrink-0 rounded-full transition-[width]', barToneClass[status])}
          style={{ width: `${fillWidth}%` }}
        />
      </div>
    </div>
  )
}
