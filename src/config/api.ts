const productionApiUrl = 'https://oxxila-api-01ced6342147.herokuapp.com/api/v1'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? '/api/v1' : productionApiUrl)

export const AUTH_TOKEN_KEY = 'oxxila_access_token'
