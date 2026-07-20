// src/config/accountNav.ts
import type { LucideIcon } from 'lucide-react'
import {
  Heart,
  KeyRound,
  MapPin,
  RotateCcw,
  Settings,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import {
  ACCOUNT_CHANGE_PASSWORD_PATH,
  ACCOUNT_ORDERS_PATH,
  ADDRESSES_PATH,
  MY_ACCOUNT_PATH,
  RETURNS_HISTORY_PATH,
  RETURNS_PATH,
  WISHLIST_PATH,
} from './routes'

/** Canonical account sidebar / dropdown navigation (text links). */
export const ACCOUNT_SIDEBAR_NAV = [
  { id: 'profile', labelKey: 'profile.nav.myProfile', to: MY_ACCOUNT_PATH, end: true },
  { id: 'orders', labelKey: 'profile.nav.myOrders', to: ACCOUNT_ORDERS_PATH },
  { id: 'wishlist', labelKey: 'profile.nav.wishlist', to: WISHLIST_PATH },
  { id: 'requestReturn', labelKey: 'profile.nav.requestReturn', to: RETURNS_PATH },
  { id: 'returns', labelKey: 'profile.nav.myReturns', to: RETURNS_HISTORY_PATH },
  { id: 'addresses', labelKey: 'profile.nav.myAddresses', to: ADDRESSES_PATH },
  {
    id: 'password',
    labelKey: 'profile.nav.changePassword',
    to: ACCOUNT_CHANGE_PASSWORD_PATH,
  },
] as const

export type AccountSidebarNavItem = (typeof ACCOUNT_SIDEBAR_NAV)[number]

export type AccountNavId = AccountSidebarNavItem['id']

/** Icons for account nav items — shared by sidebar dropdown + mobile menu. */
export const ACCOUNT_NAV_ICONS = {
  profile: Settings,
  orders: ShoppingCart,
  wishlist: Heart,
  requestReturn: RotateCcw,
  returns: Truck,
  addresses: MapPin,
  password: KeyRound,
} as const satisfies Record<AccountNavId, LucideIcon>
