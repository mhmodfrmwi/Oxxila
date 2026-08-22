// src/api/settings.ts
import { apiRequest } from '../lib/api'

export interface ApiContactSettings {
  phone: string
  email: string
  location: string
  whatsapp: string
  whatsappUrl: string
}

export function getContactSettings() {
  return apiRequest<ApiContactSettings>('/settings/contact')
}
