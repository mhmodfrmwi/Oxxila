// src/utils/authValidation.ts
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email)
}

export interface LoginFieldErrors {
  email?: string
  password?: string
}

export interface RegisterFieldErrors {
  name?: string
  email?: string
  phone?: string
  password?: string
}

export interface ForgotPasswordFieldErrors {
  email?: string
}

type Translate = (key: string, options?: Record<string, unknown>) => string

export function validateLoginFields(
  email: string,
  password: string,
  t: Translate,
): LoginFieldErrors {
  const errors: LoginFieldErrors = {}

  if (!email) {
    errors.email = t('auth.validation.emailRequired')
  } else if (!isValidEmail(email)) {
    errors.email = t('auth.validation.emailInvalid')
  }

  if (!password) {
    errors.password = t('auth.validation.passwordRequired')
  }

  return errors
}

export function validateRegisterFields(
  fields: { name: string; email: string; phone: string; password: string },
  t: Translate,
): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {}

  if (!fields.name) {
    errors.name = t('auth.validation.nameRequired')
  } else if (fields.name.length < 2) {
    errors.name = t('auth.validation.nameMinLength')
  }

  if (!fields.email) {
    errors.email = t('auth.validation.emailRequired')
  } else if (!isValidEmail(fields.email)) {
    errors.email = t('auth.validation.emailInvalid')
  }

  if (!fields.phone) {
    errors.phone = t('auth.validation.phoneRequired')
  }

  if (!fields.password) {
    errors.password = t('auth.validation.passwordRequired')
  } else if (fields.password.length < 8) {
    errors.password = t('auth.validation.passwordMinLength')
  }

  return errors
}

export function validateForgotPasswordFields(
  email: string,
  t: Translate,
): ForgotPasswordFieldErrors {
  const errors: ForgotPasswordFieldErrors = {}

  if (!email) {
    errors.email = t('auth.validation.emailRequired')
  } else if (!isValidEmail(email)) {
    errors.email = t('auth.validation.emailInvalid')
  }

  return errors
}

export type AuthFieldErrors =
  | LoginFieldErrors
  | RegisterFieldErrors
  | ForgotPasswordFieldErrors

export function hasFieldErrors(errors: AuthFieldErrors): boolean {
  return Object.values(errors).some(Boolean)
}
