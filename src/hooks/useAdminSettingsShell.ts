// src/hooks/useAdminSettingsShell.ts
import { useCallback, useState } from 'react'

export type AdminSettingsSectionKey =
  | 'payments'
  | 'coupons'
  | 'offers'
  | 'shipping'
  | 'recovery'
  | 'admins'

export interface AdminSettingsSectionState {
  loading: boolean
  error: string | null
}

type SectionsState = Record<AdminSettingsSectionKey, AdminSettingsSectionState>

const INITIAL: SectionsState = {
  payments: { loading: false, error: null },
  coupons: { loading: false, error: null },
  offers: { loading: false, error: null },
  shipping: { loading: false, error: null },
  recovery: { loading: false, error: null },
  admins: { loading: false, error: null },
}

/**
 * Phase 7A shell — no network. Each section exposes loading / error / retry
 * so UI states are wired for later data phases.
 */
export function useAdminSettingsShell() {
  const [sections, setSections] = useState<SectionsState>(INITIAL)

  const reloadSection = useCallback((key: AdminSettingsSectionKey) => {
    setSections((previous) => ({
      ...previous,
      [key]: { loading: true, error: null },
    }))

    // Shell has no API — settle back to empty after a short skeleton pass.
    window.setTimeout(() => {
      setSections((previous) => ({
        ...previous,
        [key]: { loading: false, error: null },
      }))
    }, 400)
  }, [])

  return {
    sections,
    reloadSection,
  }
}
