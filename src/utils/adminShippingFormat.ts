// src/utils/adminShippingFormat.ts
import type { StatusBadgeTone } from '../components/admin/ui/StatusBadge'
import type {
  AdminCarrierFormErrors,
  AdminCarrierFormValues,
  AdminCarrierPickupRow,
  AdminCarrierRow,
  AdminCountryRow,
  AdminDistrictRow,
  AdminGovernorateRow,
  AdminPickupFormErrors,
  AdminPickupFormValues,
  AdminShippingMethodRow,
  AdminShippingMethodType,
  ApiAdminCarrier,
  ApiCarrierCoverageItem,
  ApiCarrierPickup,
  ApiCountry,
  ApiDistrict,
  ApiGovernorate,
  ApiShippingMethod,
  CreateCarrierPayload,
  CreateCarrierPickupPayload,
  UpdateCarrierPayload,
} from '../types/adminShipping'
import { customerInitials } from './adminOrdersFormat'

export function carrierStatusBadgeTone(isActive: boolean): StatusBadgeTone {
  return isActive ? 'success' : 'neutral'
}

export function carrierInitials(name: string): string {
  return customerInitials(name)
}

export function mapApiCarrierToAdminRow(carrier: ApiAdminCarrier): AdminCarrierRow {
  const coverage = (carrier.coverage ?? []).filter(Boolean)
  return {
    id: String(carrier._id),
    name: carrier.name?.trim() || '—',
    code: carrier.code?.trim() || '—',
    type: carrier.type ?? 'known',
    logo: carrier.logo?.trim() || null,
    deliveryDays: carrier.deliveryDays?.trim() || null,
    cost: null,
    coverageLabel: coverage.length > 0 ? coverage.join(', ') : '—',
    isActive: carrier.isActive !== false,
    apiProvider: carrier.apiProvider ?? null,
    apiBaseUrl: carrier.apiBaseUrl?.trim() || null,
    hasApiKey: Boolean(carrier.hasApiKey),
  }
}

export function filterCarriersByKeyword(
  carriers: readonly AdminCarrierRow[],
  keyword: string,
): AdminCarrierRow[] {
  const q = keyword.trim().toLowerCase()
  if (!q) return [...carriers]
  return carriers.filter(
    (carrier) =>
      carrier.name.toLowerCase().includes(q) ||
      carrier.code.toLowerCase().includes(q),
  )
}

export function emptyCarrierFormValues(): AdminCarrierFormValues {
  return {
    name: '',
    code: '',
    type: 'known',
    isActive: true,
    deliveryDays: '',
    apiKey: '',
    apiBaseUrl: '',
  }
}

export function carrierRowToFormValues(row: AdminCarrierRow): AdminCarrierFormValues {
  return {
    name: row.name === '—' ? '' : row.name,
    code: row.code === '—' ? '' : row.code,
    type: row.type,
    isActive: row.isActive,
    deliveryDays: row.deliveryDays ?? '',
    apiKey: '',
    apiBaseUrl: row.apiBaseUrl ?? '',
  }
}

export function validateCarrierForm(
  values: AdminCarrierFormValues,
  mode: 'create' | 'edit',
): AdminCarrierFormErrors {
  const errors: AdminCarrierFormErrors = {}
  if (!values.name.trim()) errors.name = 'Name is required.'
  if (mode === 'create' && !values.code.trim()) errors.code = 'Code is required.'
  if (values.type === 'api') {
    if (mode === 'create' && !values.apiKey.trim()) {
      errors.apiKey = 'API key is required for Bosta carriers.'
    }
  } else if (!values.deliveryDays.trim()) {
    errors.deliveryDays = 'Delivery days is required.'
  }
  return errors
}

export function formValuesToCreateCarrierPayload(
  values: AdminCarrierFormValues,
): CreateCarrierPayload {
  const payload: CreateCarrierPayload = {
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    type: values.type,
    isActive: values.isActive,
  }
  if (values.type === 'api') {
    payload.apiProvider = 'bosta'
    payload.apiKey = values.apiKey.trim()
    if (values.apiBaseUrl.trim()) payload.apiBaseUrl = values.apiBaseUrl.trim()
  } else {
    payload.deliveryDays = values.deliveryDays.trim()
  }
  return payload
}

export function formValuesToUpdateCarrierPayload(
  values: AdminCarrierFormValues,
  original: AdminCarrierRow,
): UpdateCarrierPayload {
  const payload: UpdateCarrierPayload = {
    name: values.name.trim(),
    isActive: values.isActive,
  }
  if (original.type === 'api') {
    if (values.apiKey.trim()) payload.apiKey = values.apiKey.trim()
    payload.apiBaseUrl = values.apiBaseUrl.trim() || undefined
  } else {
    payload.deliveryDays = values.deliveryDays.trim()
  }
  return payload
}

export function mapApiCoverageToGovernorateIds(
  items: readonly ApiCarrierCoverageItem[],
): string[] {
  return items
    .map((item) =>
      typeof item.governorate === 'string' ? item.governorate : item.governorate?._id,
    )
    .filter((id): id is string => Boolean(id))
}

export function mapApiPickupToRow(pickup: ApiCarrierPickup): AdminCarrierPickupRow {
  const address = pickup.address ?? {}
  const contact = pickup.contactPerson ?? {}
  const cityParts = [address.city, address.districtName].filter(Boolean)
  return {
    id: String(pickup._id),
    locationName: pickup.locationName?.trim() || '—',
    isDefault: Boolean(pickup.isDefault),
    contactName: contact.name?.trim() || '—',
    contactPhone: contact.phone?.trim() || '—',
    addressLine: address.firstLine?.trim() || '—',
    cityLabel: cityParts.length > 0 ? cityParts.join(', ') : '—',
  }
}

export function emptyPickupFormValues(): AdminPickupFormValues {
  return {
    locationName: '',
    firstLine: '',
    city: '',
    cityId: '',
    districtId: '',
    districtName: '',
    zoneId: '',
    contactName: '',
    contactPhone: '',
    isDefault: false,
  }
}

export function validatePickupForm(values: AdminPickupFormValues): AdminPickupFormErrors {
  const errors: AdminPickupFormErrors = {}
  if (!values.locationName.trim()) errors.locationName = 'Location name is required.'
  if (!values.firstLine.trim()) errors.firstLine = 'Address is required.'
  if (!values.city.trim()) errors.city = 'City is required.'
  if (!values.districtId.trim()) errors.districtId = 'District is required.'
  if (!values.zoneId.trim()) errors.zoneId = 'Zone is required.'
  if (!values.contactName.trim()) errors.contactName = 'Contact name is required.'
  if (!values.contactPhone.trim()) errors.contactPhone = 'Contact phone is required.'
  return errors
}

export function formValuesToPickupPayload(
  values: AdminPickupFormValues,
): CreateCarrierPickupPayload {
  return {
    locationName: values.locationName.trim(),
    isDefault: values.isDefault,
    address: {
      firstLine: values.firstLine.trim(),
      city: values.city.trim(),
      cityId: values.cityId.trim() || undefined,
      zoneId: values.zoneId.trim(),
      districtId: values.districtId.trim(),
      districtName: values.districtName.trim() || undefined,
    },
    contactPerson: {
      name: values.contactName.trim(),
      phone: values.contactPhone.trim(),
    },
  }
}

const METHOD_TYPE_ORDER: AdminShippingMethodType[] = ['api', 'known', 'internal']

function defaultMethodName(type: AdminShippingMethodType): string {
  switch (type) {
    case 'api':
      return 'API Carriers (Bosta)'
    case 'known':
      return 'Known Carriers'
    case 'internal':
      return 'Internal Delivery'
    default:
      return type
  }
}

export function mapApiShippingMethods(
  methods: readonly ApiShippingMethod[],
): AdminShippingMethodRow[] {
  const byType = new Map(methods.map((method) => [method.type, method]))
  return METHOD_TYPE_ORDER.map((type) => {
    const found = byType.get(type)
    return {
      type,
      name: found?.name?.trim() || defaultMethodName(type),
      isEnabled: Boolean(found?.isEnabled),
    }
  })
}

function resolveRefId(value: string | { _id: string } | undefined): string {
  if (!value) return ''
  return typeof value === 'string' ? value : String(value._id)
}

export function mapApiCountryToRow(country: ApiCountry): AdminCountryRow {
  return {
    id: String(country._id),
    name: country.name?.trim() || '—',
    code: country.code?.trim().toUpperCase() || '—',
    currency: country.currency?.trim().toUpperCase() || '—',
    flag: country.flag?.trim() || null,
    isActive: country.isActive !== false,
  }
}

export function mapApiGovernorateToRow(gov: ApiGovernorate): AdminGovernorateRow {
  return {
    id: String(gov._id),
    countryId: resolveRefId(gov.country),
    name: gov.name?.trim() || '—',
    shippingPrice: gov.shippingPrice ?? 0,
    districtCount: gov.districtCount ?? null,
    isActive: gov.isActive !== false,
  }
}

export function mapApiDistrictToRow(district: ApiDistrict): AdminDistrictRow {
  return {
    id: String(district._id),
    governorateId: resolveRefId(district.governorate),
    name: district.name?.trim() || '—',
    shippingPrice: district.shippingPrice ?? 0,
    isCovered: district.isCovered !== false,
    bostaCovered: Boolean(district.bostaCovered),
  }
}
