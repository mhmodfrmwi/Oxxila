// src/utils/contactSettings.ts

export function buildWhatsAppUrl(whatsapp: string, whatsappUrl?: string): string | undefined {
  const trimmedUrl = whatsappUrl?.trim()
  if (trimmedUrl) return trimmedUrl

  const digits = whatsapp.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : undefined
}
