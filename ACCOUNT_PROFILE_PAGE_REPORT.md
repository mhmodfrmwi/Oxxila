# Account / Profile Page Implementation Report

**Date:** July 4, 2026  
**Scope:** User Account layout, My Profile, account navigation shell, related account sections  
**Backend:** Not modified

---

## Summary

Implemented a reusable two-column account area (sidebar + content) with a fully wired **My Profile** form. Profile data loads and updates through existing user APIs. First/last name are split in the UI and joined into the backend `name` field on save. Avatar upload uses the existing multipart endpoint.

`npm run lint` and `npm run build` both pass.

**No backend files were modified.**

---

## Files Modified

| File | Change |
|------|--------|
| `src/api/auth.ts` | Optional `phone` / `avatar` on `AuthUser` |
| `src/api/users.ts` | Profile/password/avatar APIs; address update method `PATCH` |
| `src/lib/api.ts` | Support `FormData` bodies (avatar upload) |
| `src/config/routes.ts` | `ACCOUNT_ORDERS_PATH`, `ACCOUNT_CHANGE_PASSWORD_PATH` |
| `src/App.tsx` | Account routes |
| `src/components/layout/Navbar.tsx` | Account link (avatar + name) when authenticated |
| `src/styles/add-address.css` | `text-align: start` for RTL on address cards |
| `src/i18n/locales/en/common.json` | `profile.*` keys |
| `src/i18n/locales/ar/common.json` | `profile.*` keys |
| `src/pages/AccountPage.tsx` | Profile page |
| `src/pages/AddressesPage.tsx` | Addresses within account layout |

## Files Created

| File | Role |
|------|------|
| `src/components/account/AccountLayout.tsx` | Shared account shell (breadcrumb, sidebar, content, footer) |
| `src/components/account/AccountSidebar.tsx` | Reusable nav (routable items + logout) |
| `src/components/account/UserAvatar.tsx` | Avatar / initials fallback |
| `src/components/account/ProfilePageContent.tsx` | Profile form UI |
| `src/components/account/AccountChangePasswordContent.tsx` | Change-password form UI |
| `src/components/account/AccountAddressesContent.tsx` | Address list + add card |
| `src/components/account/AccountSectionPlaceholder.tsx` | Empty/placeholder section |
| `src/hooks/useProfilePage.ts` | Profile load/validate/save/avatar |
| `src/hooks/useAccountChangePassword.ts` | Password change logic |
| `src/hooks/useAccountAddresses.ts` | Address list/delete logic |
| `src/utils/userProfile.ts` | Name split/join + profile → `AuthUser` |
| `src/pages/AccountOrdersPage.tsx` | Orders placeholder (layout ready) |
| `src/pages/AccountChangePasswordPage.tsx` | Account change password |

---

## Components Reused

- `Layout`, `PageBleed`, `Navbar`, `Footer`
- `Breadcrumb`, `Button`, `Heading`, `InputField`
- `FormMessage`, `SavedAddressCard`
- Toast system (`useToast`)
- Theme tokens / typography / spacing utilities
- Auth context (`useAuth`)

## Components Created

- `AccountLayout`, `AccountSidebar`, `UserAvatar`
- `ProfilePageContent`, `AccountChangePasswordContent`, `AccountAddressesContent`
- `AccountSectionPlaceholder`

No duplicate form/input/card primitives were introduced.

---

## Translation Keys Added (`profile.*` in `common.json`)

No separate `profile.json` (same pattern as other pages).

| Group | Keys |
|-------|------|
| Shell | `myAccount`, `title`, `subtitle`, `sidebarAria`, `navAria` |
| Nav | `nav.myProfile`, `nav.myOrders`, `nav.myAddresses`, `nav.changePassword`, `nav.logout` |
| Fields | `fields.firstName`, `lastName`, `email`, `phone` (+ placeholders) |
| Photo | `photoAlt`, `changePhoto`, `uploadingPhoto`, `avatarUpdated`, `avatarUpdateFailed` |
| Actions / toasts | `saveChanges`, `saving`, `updateSuccess`, `updateFailed`, `loadFailed`, `invalidForm`, `fillRequired` |
| Validation | `validation.*` |
| Orders | `orders.title`, `orders.empty` |
| Addresses | `addresses.title`, `description`, `addNew`, `loadFailed` |
| Password | `password.*` |

### Reused keys

| Key | Usage |
|-----|--------|
| `nav.home` | Breadcrumb |
| `nav.logOut` / `nav.loggingOut` | Logout |
| `nav.account` | Navbar aria |
| `actions.continueShopping` | Orders empty CTA |
| `auth.fields.passwordPlaceholder` / `confirmPasswordPlaceholder` | Password form |
| `checkout.address.edit` / `delete` / toasts | Address cards |

Dynamic user name, email, phone, and address values are **not** translated.

---

## Backend Endpoints Used

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/users/getMe` | Load profile |
| `PATCH` | `/users/updateMe` | Update `name`, `email`, `phone` |
| `PATCH` | `/users/updateMyAvatar` | Upload avatar (`multipart`, field `avatar`) |
| `PATCH` | `/users/updateMyPassword` | Change password (`oldPassword`, `newPassword`) |
| `GET` | `/users/profile/addresses` | List addresses |
| `DELETE` | `/users/profile/addresses/:addressId` | Delete address |

### Notes

- Backend stores a single `name` field. UI uses First Name + Last Name and joins them on save.
- `GET /auth/me` only returns `{ id, name, email, role }` via `publicUser`; full profile (phone, avatar) requires `/users/getMe`.

---

## Remaining Backend Requirements

None required for the Profile page as implemented.

Optional future enhancements (not blockers):

| Item | Notes |
|------|--------|
| Separate `firstName` / `lastName` fields | Only if product requires independent storage |
| `GET /orders/my-orders` UI | Endpoint exists (`/orders/my-orders`); orders section is a placeholder for now |

No **Backend Changes Required** document is needed for current profile functionality.

---

## Layout & Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop / tablet | Sidebar + content grid; sidebar sticky on large screens |
| Mobile | Sidebar stacks above content |
| Active nav | Filled primary button style on active route |

Dark mode uses existing theme tokens (`bg-card`, `border-border-subtle`, `text-primary-text`, etc.).

---

## Confirmation

- **Backend files modified:** none  
- **i18n architecture / RTL system:** unchanged (logical properties used where touched)  
- **Lint / build:** pass
