// src/utils/contactSettings.ts
import { DEFAULT_WHATSAPP_DIAL_CODE } from '../constants/whatsappDialCodes'
import { normalizeWhatsAppPhoneDigits } from './phoneNumber'

export { normalizeWhatsAppPhoneDigits, validateWhatsAppPhone } from './phoneNumber'

export function buildWhatsAppUrl(
  whatsapp: string,
  dialCode: string = DEFAULT_WHATSAPP_DIAL_CODE,
  whatsappUrl?: string,
): string | undefined {
  const trimmedUrl = whatsappUrl?.trim()
  if (trimmedUrl) {
    try {
      const url = new URL(trimmedUrl)
      const phone = url.searchParams.get('phone')
      if (phone) {
        const digits = normalizeWhatsAppPhoneDigits(phone, dialCode)
        if (digits) {
          url.searchParams.set('phone', digits)
          return url.toString()
        }
      }
      const waMeMatch = url.pathname.match(/^\/(\d+)\/?$/)
      if (waMeMatch && url.hostname.endsWith('wa.me')) {
        const digits = normalizeWhatsAppPhoneDigits(waMeMatch[1], dialCode)
        if (digits) return `https://api.whatsapp.com/send?phone=${digits}`
      }
    } catch {
      // Fall through to rebuild from the raw number.
    }
  }

  const digits = normalizeWhatsAppPhoneDigits(whatsapp, dialCode)
  return digits ? `https://api.whatsapp.com/send?phone=${digits}` : undefined
}
