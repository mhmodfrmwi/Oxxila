// src/types/adminUsers.ts

/** Raw admin from /api/v1/admins. */
export interface ApiAdminUser {
  _id: string
  name: string
  email: string
  role?: 'admin' | 'user'
  adminTitle?: string | null
  active?: boolean
  phone?: string
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

/** Normalized row for Admin Roles card. */
export interface AdminUserRow {
  id: string
  name: string
  email: string
  adminTitle: string | null
  titleLabel: string
  initials: string
  active: boolean
}

export interface AdminUsersListParams {
  page?: number
  limit?: number
  sort?: string
  keyword?: string
}

/** Payload for POST /api/v1/admins. */
export interface AdminUserCreatePayload {
  name: string
  email: string
  password: string
  adminTitle?: string | null
}

/** Payload for PUT /api/v1/admins/:id. */
export interface AdminUserUpdatePayload {
  name?: string
  email?: string
  adminTitle?: string | null
  active?: boolean
}

/** Drawer form values. */
export interface AdminUserFormValues {
  name: string
  email: string
  password: string
  adminTitle: string
  active: boolean
}

export type AdminUserFormErrors = Partial<
  Record<keyof AdminUserFormValues, string>
>
