# Authentication Flow i18n Migration Report

**Date:** July 4, 2026  
**Scope:** Login, Register, Forgot Password, Reset Password, Email Verification  
**i18n architecture / RTL system:** Unchanged (no `auth.json`; keys live under `auth.*` in `common.json`)

---

## Summary

Auth UI labels use `auth.*` keys in existing `common.json` (EN + AR). Backend error messages, emails, and user names are not translated. Password visibility toggle on `InputField` uses logical positioning for RTL.

`npm run lint` and `npm run build` both pass.

---

## Files Modified

| File | Change |
|------|--------|
| `src/i18n/locales/en/common.json` | Added `auth.*` (EN) |
| `src/i18n/locales/ar/common.json` | Added `auth.*` (AR) |
| `src/components/auth/LoginForm.tsx` | Titles, fields, links, toasts, fallbacks |
| `src/components/auth/RegisterForm.tsx` | Titles, fields, links, toasts, fallbacks |
| `src/components/auth/ForgotPasswordForm.tsx` | Titles, fields, links, fallbacks |
| `src/components/auth/ChangePasswordForm.tsx` | Titles, fields, validation, toasts, fallbacks |
| `src/components/auth/VerifyOtpForm.tsx` | Titles, resend, links, fallbacks |
| `src/components/auth/AuthCard.tsx` | Form `aria-label` |
| `src/components/auth/AuthVisual.tsx` | Nav, info cards, ARIA |
| `src/components/auth/SocialLoginButtons.tsx` | Group / continue-with ARIA |
| `src/components/auth/PasswordStrength.tsx` | Strength messages + meter ARIA |
| `src/components/auth/OtpInput.tsx` | Digit / group ARIA |
| `src/components/ui/InputField.tsx` | Show/hide password ARIA; `pe-11` / `end-3` |
| `src/utils/oauth.ts` | OAuth error messages via `i18n.t` |
| `src/utils/oauthBootstrap.ts` | OAuth fallback via `i18n.t` |

**Not modified:** Categories, Profile, Wishlist, i18n config, Language Switcher, RTL architecture, page wrappers (thin shells only).

**No separate `auth.json`:** Keys follow the same `common.json` pattern as Home/Shop/Cart/Checkout.

---

## Translation Keys Added (`auth.*`)

| Group | Keys |
|-------|------|
| Login | `formAria`, `title`, `subtitle`, `submit`, `submitting`, `forgotPassword`, `noAccount`, `createAccount`, `successTitle`, `welcomeBack`, `failedTitle`, `failedFallback` |
| Register | `formAria`, `title`, `subtitle`, `fullName`, `namePlaceholder`, `phone`, `phonePlaceholder`, `createPassword`, `submit`, `submitting`, `hasAccount`, `loginHere`, `successTitle`, `successMessage`, `failedTitle`, `failedFallback` |
| Fields | `email`, `emailPlaceholder`, `password`, `passwordPlaceholder`, `newPassword`, `confirmPassword`, `confirmPasswordPlaceholder`, `showPassword`, `hidePassword` |
| Forgot | `title`, `subtitle`, `submit`, `submitting`, `rememberPassword`, `backToLogin`, `failedFallback` |
| Verify | `title`, `subtitleWithEmail`, `subtitleNoEmail`, `goToForgot`, `backToLogin`, `didNotReceive`, `resendLink`, `sending`, `changeEmail`, `enterEmailFirst`, `resendFailed` |
| Reset | `title`, `subtitle`, `submit`, `submitting`, `backToLogin`, `tokenMissing`, `tokenMissingPage`, `passwordsMismatch`, `invalidForm`, `successToast`, `successMessage`, `failedTitle`, `failedFallback` |
| Social | `ariaLabel`, `continueWith` |
| Visual | `ariaLabel`, `navAria`, `signUp`, `login`, `fasterCheckout`, `fasterCheckoutDesc`, `trackOrders`, `trackOrdersDesc` |
| Password strength | `ariaLabel`, `enterPassword`, `weak`, `medium`, `strong` |
| OTP | `ariaLabel`, `digit` |
| OAuth | `google_failed`, `facebook_failed`, `access_denied`, `failed` |

### Dynamic interpolation

| Key | Params |
|-----|--------|
| `auth.login.welcomeBack` | `{{name}}` (user name, not translated) |
| `auth.verify.subtitleWithEmail` | `{{email}}` (email address, not translated) |
| `auth.social.continueWith` | `{{provider}}` (Google / Facebook brand names) |
| `auth.otp.digit` | `{{current}}`, `{{total}}` |

---

## Components Migrated

| Component | UI strings |
|-----------|------------|
| `LoginForm` | Welcome back, fields, forgot password, login CTA, create account, toasts |
| `RegisterForm` | Create account, fields, password strength, social, toasts |
| `ForgotPasswordForm` | Forgot password copy, send link, back to login |
| `ChangePasswordForm` | Reset password fields, mismatch validation, toasts |
| `VerifyOtpForm` | Check email, resend link, change email |
| `AuthCard` | Login / registration form ARIA |
| `AuthVisual` | Sign up / Login nav, info cards |
| `SocialLoginButtons` | Social login ARIA |
| `PasswordStrength` | Strength meter messages |
| `OtpInput` | OTP digit ARIA (ready if used) |
| `InputField` | Password show/hide ARIA (auth password fields) |

---

## Remaining Hardcoded Strings (intentional)

| Item | Reason |
|------|--------|
| `ApiError.message` / `response.message` | Backend messages — not translated |
| User `name` in welcome toast | Dynamic user data |
| Email in verify subtitle | Dynamic address |
| Provider names `Google` / `Facebook` | Brand names |
| Phone placeholder `+1 (555) 000-0000` | Format example (same in AR) |
| Email placeholder `Example@example.com` | Format example (same in AR) |

---

## RTL Fixes

| Change | Why |
|--------|-----|
| `InputField`: `pr-11` → `pe-11`, `right-3` → `end-3` | Password toggle sits on the inline-end side in RTL |
| `LoginForm`: `text-right` → `text-end` | Forgot-password link aligns to inline-end |
| Forgot / Verify / Reset headers: `sm:text-left` → `sm:text-start` | Logical start alignment |

No changes to document `dir`/`lang`, Language Switcher, or global RTL infrastructure.
