// src/utils/postLoginRedirect.ts
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_PATH,
  HOME_PATH,
  LOGIN_PATH,
} from '../config/routes'

/** Same role check as RequireAdmin — keep in sync; do not hardcode elsewhere. */
export function isAdminRole(role: string | undefined | null): boolean {
  return role?.toLowerCase() === 'admin'
}

/** Internal return paths only — blocks open redirects and admin URLs for customers. */
function isSafeCustomerReturnPath(path: string): boolean {
  if (!path.startsWith('/')) return false
  if (path.startsWith('//')) return false
  if (path === LOGIN_PATH || path.startsWith(`${LOGIN_PATH}?`)) return false
  if (path === ADMIN_PATH || path.startsWith(`${ADMIN_PATH}/`)) return false
  return true
}

/**
 * Post-login destination from the authenticated user's role.
 * Admins → admin dashboard. Customers → optional `from`, else storefront home.
 */
export function resolvePostLoginPath(
  role: string | undefined | null,
  from?: string | null,
): string {
  if (isAdminRole(role)) return ADMIN_DASHBOARD_PATH

  if (typeof from === 'string' && isSafeCustomerReturnPath(from)) {
    return from
  }

  return HOME_PATH
}
