// src/utils/adminUsersFormat.ts
import type {
  AdminUserCreatePayload,
  AdminUserFormErrors,
  AdminUserFormValues,
  AdminUserRow,
  AdminUserUpdatePayload,
  ApiAdminUser,
} from '../types/adminUsers'

export function getAdminInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export function mapApiAdminToRow(admin: ApiAdminUser): AdminUserRow {
  const name = admin.name?.trim() || '—'
  const adminTitle =
    admin.adminTitle == null || admin.adminTitle.trim() === ''
      ? null
      : admin.adminTitle.trim()

  return {
    id: String(admin._id),
    name,
    email: admin.email ?? '',
    adminTitle,
    titleLabel: adminTitle ?? '—',
    initials: getAdminInitials(name),
    active: admin.active !== false,
  }
}

export function emptyAdminFormValues(): AdminUserFormValues {
  return {
    name: '',
    email: '',
    password: '',
    adminTitle: '',
    active: true,
  }
}

export function adminToFormValues(admin: ApiAdminUser): AdminUserFormValues {
  return {
    name: admin.name ?? '',
    email: admin.email ?? '',
    password: '',
    adminTitle: admin.adminTitle ?? '',
    active: admin.active !== false,
  }
}

/** Client validation aligned with admin.validator.js. */
export function validateAdminForm(
  values: AdminUserFormValues,
  mode: 'create' | 'edit',
): AdminUserFormErrors {
  const errors: AdminUserFormErrors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const adminTitle = values.adminTitle.trim()

  if (mode === 'create' || name) {
    if (!name) {
      errors.name = 'Name is required'
    } else if (name.length < 2 || name.length > 60) {
      errors.name = 'Name must be 2-60 characters'
    }
  }

  if (mode === 'create' || email) {
    if (!email) {
      errors.email = 'Valid email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Valid email is required'
    }
  }

  if (mode === 'create') {
    const password = values.password
    if (!password || password.length < 8 || password.length > 128) {
      errors.password = 'Password must be 8-128 characters'
    }
  }

  if (adminTitle.length > 80) {
    errors.adminTitle = 'Admin title cannot exceed 80 characters'
  }

  return errors
}

export function formValuesToCreatePayload(
  values: AdminUserFormValues,
): AdminUserCreatePayload {
  const adminTitle = values.adminTitle.trim()
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password,
    adminTitle: adminTitle === '' ? null : adminTitle,
  }
}

export function formValuesToUpdatePayload(
  values: AdminUserFormValues,
): AdminUserUpdatePayload {
  const adminTitle = values.adminTitle.trim()
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    adminTitle: adminTitle === '' ? null : adminTitle,
    active: values.active,
  }
}
