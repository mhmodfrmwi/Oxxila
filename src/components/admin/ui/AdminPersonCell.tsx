// src/components/admin/ui/AdminPersonCell.tsx
import { AdminInitialsAvatar } from './AdminInitialsAvatar'

interface AdminPersonCellProps {
  name: string
  email?: string | null
  initials: string
}

export function AdminPersonCell({ name, email, initials }: AdminPersonCellProps) {
  return (
    <div className="flex min-w-[8rem] items-center gap-3">
      <AdminInitialsAvatar initials={initials} />
      <div className="min-w-0 flex flex-col">
        <span className="truncate text-sm font-medium text-[#e2e2e2]" title={name}>
          {name}
        </span>
        {email ? (
          <span className="truncate text-xs leading-5 text-white/45" title={email}>
            {email}
          </span>
        ) : null}
      </div>
    </div>
  )
}
