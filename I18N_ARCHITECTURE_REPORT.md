# Internationalization Architecture Report

**Date:** July 4, 2026  
**Scope:** i18n foundation only (English + Arabic)  
**Backend:** Not modified

---

## Summary

Internationalization is wired with `i18next`, `react-i18next`, and `i18next-browser-languagedetector`. English is the default; Arabic enables RTL. Only shared shell components were translated for this pass.

`npm run lint` and `npm run build` both pass.

---

## i18n Architecture

```
src/i18n/
  index.ts                 # init, detector, RTL/lang document sync
  locales/
    en/
      common.json
    ar/
      common.json
```

### Behavior

| Concern | Implementation |
|---------|----------------|
| Default language | English (`en`) |
| Supported languages | `en`, `ar` |
| Persistence | `localStorage` key `oxxila-language` |
| First visit | Browser language via `i18next-browser-languagedetector` |
| RTL (Arabic) | `document.documentElement.dir = "rtl"`, `lang = "ar"` |
| LTR (English) | `dir = "ltr"`, `lang = "en"` |
| Theme / dark mode | Unchanged (`ThemeProvider` independent) |
| Routing | Unchanged |

### Bootstrap

- `src/main.tsx` imports `./i18n` before render
- Language changes call `applyDocumentLanguage()` on `languageChanged`

### Language Switcher

- `src/components/ui/LanguageSwitcher.tsx`
- Options: **English** / **العربية**
- Replaces the non-functional language control in `UtilityBar`
- Selection persists and updates `dir` / `lang` without touching theme or routes

---

## Files Modified / Added

### Added
| File | Purpose |
|------|---------|
| `src/i18n/index.ts` | i18n setup + document language/dir |
| `src/i18n/locales/en/common.json` | English strings |
| `src/i18n/locales/ar/common.json` | Arabic strings |
| `src/components/ui/LanguageSwitcher.tsx` | Reusable language control |
| `I18N_ARCHITECTURE_REPORT.md` | This report |

### Modified
| File | Purpose |
|------|---------|
| `package.json` / `package-lock.json` | `i18next`, `react-i18next`, `i18next-browser-languagedetector` |
| `src/main.tsx` | Import i18n bootstrap |
| `src/config/storage.ts` | `STORAGE_KEYS.language` |
| `src/components/layout/Navbar.tsx` | Translated nav / auth / cart labels |
| `src/components/layout/UtilityBar.tsx` | Search + LanguageSwitcher + theme label |
| `src/components/landing/footer/Footer.tsx` | Description, sections, links, copyright |
| `src/components/landing/footer/NewsletterForm.tsx` | Newsletter labels / CTA |
| `tsconfig.app.json` | `resolveJsonModule: true` |

---

## Shared Components Translated

| Component | Keys used |
|-----------|-----------|
| **Navbar** | Home, Shop, Categories, Docs, Cart (aria), Sign in / Register, Account, Log out, menu a11y labels |
| **UtilityBar** | Search label/placeholder, Language, Change Theme |
| **LanguageSwitcher** | Language, English, العربية |
| **Footer** | Description, Policies, Shopping, policy/shopping links, copyright |
| **NewsletterForm** (footer) | Email label, placeholder, Subscribe states |

### Common action keys prepared (in `common.json`)

Ready for future page migration:

- `actions.addToCart`
- `actions.search`
- `actions.login`
- `actions.register`
- `actions.continue`
- `actions.cancel`
- `actions.continueShopping`
- `nav.cart`
- `nav.profile`

These are **not** wired into page-specific components yet (product hero, cart page, auth forms, checkout, etc.).

---

## Remaining Pages / Areas Not Migrated

All page-specific and feature content remains English-only for now:

- Landing sections (Hero, Best Sellers, Skin Concerns, How It Works, Contact)
- Shop page sections (banners, more reasons, brands, offers)
- Category / collection / search pages
- Product detail (including Add to Cart button on product page)
- Cart, checkout, payment, order confirmation, track order
- Auth forms (Login / Register page copy — navbar labels only are translated)
- Account / addresses
- Toasts and form validation messages
- Breadcrumbs and page headings

---

## How to Extend

1. Add namespaces under `src/i18n/locales/{en,ar}/` (e.g. `cart.json`, `product.json`).
2. Register them in `src/i18n/index.ts` (`ns` + `resources`).
3. Replace hardcoded strings with `t('key')` / `useTranslation('namespace')` per page.

---

## Verification

```
npm run lint  ✅
npm run build ✅
```
