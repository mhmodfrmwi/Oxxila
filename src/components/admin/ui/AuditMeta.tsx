// src/components/admin/ui/AuditMeta.tsx
import { History } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { AdminAuditBlock } from '../../../types/adminAudit'
import { formatAdminAuditDate } from '../../../utils/adminAuditFormat'
import { cn } from '../../../lib/cn'

interface AuditMetaProps {
  audit?: AdminAuditBlock | null
  className?: string
}

interface HistoryEntry {
  id: string
  label: string
  name: string
  date: string | null
}

function HistoryRow({
  label,
  name,
  date,
  locale,
}: {
  label: string
  name: string
  date: string | null
  locale: string
}) {
  return (
    <li className="flex flex-col gap-1 border-b border-white/10 py-3 last:border-b-0 last:pb-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">
        {label}
      </span>
      <div className="min-w-0 sm:text-end">
        <p className="truncate text-sm font-medium text-white/90">{name}</p>
        {date ? (
          <p className="mt-0.5 text-[11px] text-white/45">{formatAdminAuditDate(date, locale)}</p>
        ) : null}
      </div>
    </li>
  )
}

export function AuditMeta({ audit, className }: AuditMetaProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const entries = useMemo((): HistoryEntry[] => {
    if (!audit) return []

    const rows: HistoryEntry[] = []

    if (audit.createdBy?.name) {
      rows.push({
        id: 'created',
        label: t('admin.audit.createdBy'),
        name: audit.createdBy.name,
        date: audit.createdAt,
      })
    }

    if (audit.updatedBy?.name) {
      rows.push({
        id: 'updated',
        label: t('admin.audit.updatedBy'),
        name: audit.updatedBy.name,
        date: audit.updatedAt,
      })
    }

    if (audit.statusUpdatedBy?.name) {
      rows.push({
        id: 'status',
        label: t('admin.audit.statusUpdatedBy'),
        name: audit.statusUpdatedBy.name,
        date: audit.updatedAt,
      })
    }

    return rows
  }, [audit, t])

  if (!entries.length) return null

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]',
        className,
      )}
      aria-label={t('admin.audit.metaAria')}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <History size={14} className="shrink-0 text-accent/80" aria-hidden />
        <h3 className="text-xs font-semibold tracking-wide text-white/75">
          {t('admin.audit.title')}
        </h3>
      </div>
      <ul className="px-4 py-1">
        {entries.map((entry) => (
          <HistoryRow
            key={entry.id}
            label={entry.label}
            name={entry.name}
            date={entry.date}
            locale={locale}
          />
        ))}
      </ul>
    </section>
  )
}
