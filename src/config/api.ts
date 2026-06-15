// Use same-origin /api/v1 in dev (Vite proxy) and production (Vercel rewrite).
// Override only if you need a direct API URL, e.g. for a non-proxied deployment.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const AUTH_TOKEN_KEY = 'oxxila_access_token'
