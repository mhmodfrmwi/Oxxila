// src/constants/whatsappDialCodes.ts

export interface WhatsAppDialCodeOption {
  dialCode: string
  labelKey: string
}

export const WHATSAPP_DIAL_CODE_OPTIONS: readonly WhatsAppDialCodeOption[] = [
  { dialCode: '20', labelKey: 'admin.settings.contact.dialCodes.eg' },
  { dialCode: '966', labelKey: 'admin.settings.contact.dialCodes.sa' },
  { dialCode: '971', labelKey: 'admin.settings.contact.dialCodes.ae' },
  { dialCode: '965', labelKey: 'admin.settings.contact.dialCodes.kw' },
  { dialCode: '974', labelKey: 'admin.settings.contact.dialCodes.qa' },
  { dialCode: '962', labelKey: 'admin.settings.contact.dialCodes.jo' },
  { dialCode: '961', labelKey: 'admin.settings.contact.dialCodes.lb' },
  { dialCode: '1', labelKey: 'admin.settings.contact.dialCodes.us' },
  { dialCode: '44', labelKey: 'admin.settings.contact.dialCodes.gb' },
] as const

export const DEFAULT_WHATSAPP_DIAL_CODE = '20'
