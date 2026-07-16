// src/utils/userAddress.ts
import type { UserAddress } from '../api/users'

export function getAddressCityName(address: UserAddress): string {
  if (address.isOther || !address.district?.name) {
    return address.governorate?.name ?? ''
  }
  return address.district.name
}

export function getAddressLabel(address: UserAddress, fallback = ''): string {
  const label = address.label?.trim()
  return label || fallback
}

export function formatAddressOneLine(address: UserAddress): string {
  const city = getAddressCityName(address)
  const parts = [address.addressLine, city, address.governorate?.name].filter(Boolean)
  return parts.join(', ')
}

export function findDefaultAddress(addresses: UserAddress[]): UserAddress | null {
  return addresses.find((entry) => entry.isDefault) ?? addresses[0] ?? null
}

export function zoneRefId(ref: { id?: string } | null | undefined): string {
  return String(ref?.id ?? '').trim()
}
