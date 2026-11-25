// src/hooks/useAddAddressPage.ts
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  getShippingCountries,
  getShippingGovernorates,
  getShippingZones,
  type ShippingDistrict,
  type ShippingGovernorate,
} from '../api/shipping'
import {
  createMyAddress,
  deleteMyAddress,
  getMyAddresses,
  getUserProfile,
  updateMyAddress,
  type CreateAddressPayload,
  type UserAddress,
} from '../api/users'
import { ADDRESSES_PATH, LOGIN_PATH } from '../config/routes'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import { zoneRefId } from '../utils/userAddress'

export interface AddressFormState {
  label: string
  /** Delivery phone for this address. */
  phone: string
  governorateId: string
  districtId: string
  addressLine: string
}

export interface AddressFormErrors {
  label?: string
  phone?: string
  governorateId?: string
  districtId?: string
  addressLine?: string
}

const emptyForm: AddressFormState = {
  label: '',
  phone: '',
  governorateId: '',
  districtId: '',
  addressLine: '',
}

function validateForm(
  form: AddressFormState,
  hasDistricts: boolean,
  t: (key: string) => string,
): AddressFormErrors {
  const errors: AddressFormErrors = {}
  if (!form.governorateId.trim()) {
    errors.governorateId = t('checkout.address.governmentRequired')
  }
  if (!form.districtId.trim()) {
    errors.districtId = t('checkout.address.cityRequired')
  } else if (hasDistricts && form.districtId !== 'other' && !/^[a-f\d]{24}$/i.test(form.districtId)) {
    errors.districtId = t('checkout.address.cityRequired')
  }
  if (!form.phone.trim()) {
    errors.phone = t('checkout.payment.phoneRequired')
  } else if (!/^(\+|00)?\d{8,15}$/.test(form.phone.replace(/[\s\-().]/g, ''))) {
    errors.phone = t('checkout.payment.phoneInvalid')
  }
  if (!form.addressLine.trim()) {
    errors.addressLine = t('checkout.address.addressRequired')
  } else if (form.addressLine.trim().length < 6) {
    errors.addressLine = t('checkout.address.addressMinLength')
  } else if (form.addressLine.trim().length > 500) {
    errors.addressLine = t('checkout.address.addressTooLong')
  }
  return errors
}

function buildAddressPayload(form: AddressFormState): CreateAddressPayload {
  return {
    governorateId: form.governorateId.trim(),
    districtId: form.districtId.trim() || 'other',
    addressLine: form.addressLine.trim(),
    phone: form.phone.replace(/[\s\-().]/g, ''),
    label: form.label.trim() || undefined,
  }
}

function formFromAddress(address: UserAddress): AddressFormState {
  return {
    label: address.label ?? '',
    phone: address.phone ?? '',
    governorateId: zoneRefId(address.governorate),
    districtId: address.isOther ? 'other' : zoneRefId(address.district) || 'other',
    addressLine: address.addressLine ?? '',
  }
}

export function useAddAddressPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState<AddressFormState>(emptyForm)
  const [errors, setErrors] = useState<AddressFormErrors>({})
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [governorates, setGovernorates] = useState<ShippingGovernorate[]>([])
  const [districts, setDistricts] = useState<ShippingDistrict[]>([])
  const [hasDistricts, setHasDistricts] = useState(true)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [zonesLoading, setZonesLoading] = useState(false)
  const [zonesError, setZonesError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    async function load() {
      await Promise.resolve()
      if (cancelled) return

      setLoading(true)
      setSubmitError(null)

      try {
        const [addressesResponse, profileResponse, countriesResponse] = await Promise.all([
          getMyAddresses(),
          getUserProfile(),
          getShippingCountries(),
        ])
        if (cancelled) return

        const nextAddresses = addressesResponse.data?.addresses ?? []
        setAddresses(nextAddresses)
        setPhone(profileResponse.data?.phone ?? '')
        // New addresses default to the account phone; the shopper can change it per address.
        setForm((current) => (current.phone ? current : { ...current, phone: profileResponse.data?.phone ?? '' }))

        const countries = countriesResponse.data ?? []
        const defaultCountry = countries[0]
        if (defaultCountry) {
          const governoratesResponse = await getShippingGovernorates(defaultCountry._id)
          if (!cancelled) setGovernorates(governoratesResponse.data ?? [])
        }

        const editId = (location.state as { editAddressId?: string } | null)?.editAddressId
        if (editId) {
          const entry = nextAddresses.find((item) => item._id === editId)
          if (entry) {
            setForm(formFromAddress(entry))
            setEditingAddressId(entry._id)
            setSelectedAddressId(entry._id)
          }
        }
      } catch (error) {
        if (!cancelled) {
          setSubmitError(
            error instanceof ApiError ? error.message : 'Unable to load address data.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, location.state])

  function updateField<K extends keyof AddressFormState>(key: K, value: AddressFormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'governorateId') {
        next.districtId = ''
      }
      return next
    })
    if (key === 'governorateId') {
      setDistricts([])
      setHasDistricts(true)
      setZonesError(null)
    }
    setErrors((current) => ({ ...current, [key]: undefined }))
    setSubmitError(null)
    if (!editingAddressId) {
      setSelectedAddressId(null)
    }
  }

  useEffect(() => {
    if (!form.governorateId) return

    let cancelled = false

    async function loadZones() {
      await Promise.resolve()
      if (cancelled) return

      setZonesLoading(true)
      setZonesError(null)
      try {
        const response = await getShippingZones(form.governorateId)
        if (cancelled) return

        const data = response.data
        setHasDistricts(data?.hasDistricts ?? true)
        setDistricts(data?.districts ?? [])
        setZonesError(null)

        if (data && !data.hasDistricts) {
          setForm((current) =>
            current.districtId === 'other' ? current : { ...current, districtId: 'other' },
          )
        }
      } catch (error) {
        if (!cancelled) {
          setDistricts([])
          setHasDistricts(true)
          setForm((current) =>
            current.districtId ? { ...current, districtId: '' } : current,
          )
          setZonesError(
            error instanceof ApiError
              ? error.message
              : t('checkout.address.zonesLoadFailed'),
          )
        }
      } finally {
        if (!cancelled) setZonesLoading(false)
      }
    }

    void loadZones()

    return () => {
      cancelled = true
    }
  }, [form.governorateId, t])

  function startEdit(address: UserAddress) {
    setForm(formFromAddress(address))
    setEditingAddressId(address._id)
    setSelectedAddressId(address._id)
    setErrors({})
    setSubmitError(null)
    setSubmitSuccess(null)
    setZonesError(null)
  }

  async function handleSave() {
    setSubmitError(null)
    setSubmitSuccess(null)

    if (zonesError) {
      setSubmitError(zonesError)
      toast.error(t('checkout.address.unableToSave'), zonesError)
      return
    }

    const validation = validateForm(form, hasDistricts, t)
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      toast.error(t('checkout.address.invalidForm'), t('checkout.address.fillRequired'))
      return
    }

    if (zonesLoading) {
      toast.error(t('checkout.address.unableToSave'), t('checkout.payment.loadingShipping'))
      return
    }

    setSubmitting(true)
    try {
      const payload = buildAddressPayload(form)

      if (editingAddressId) {
        const response = await updateMyAddress(editingAddressId, payload)
        const updated = response.data?.address
        if (updated) {
          setAddresses((current) =>
            current.map((entry) => (entry._id === updated._id ? updated : entry)),
          )
          setSelectedAddressId(updated._id)
        }
        setSubmitSuccess(t('checkout.address.updatedSuccess'))
        toast.success(t('checkout.address.toastUpdated'))
      } else {
        const response = await createMyAddress(payload)
        const created = response.data?.address
        if (created) {
          setAddresses((current) => [...current, created])
          setSelectedAddressId(created._id)
        }
        setSubmitSuccess(t('checkout.address.savedSuccess'))
        toast.success(t('checkout.address.toastAdded'))
      }

      setForm(emptyForm)
      setEditingAddressId(null)
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t('checkout.address.unableToSave')
      setSubmitError(message)
      toast.error(t('checkout.address.unableToSave'), message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(addressId: string) {
    setSubmitError(null)
    setDeletingId(addressId)
    try {
      await deleteMyAddress(addressId)

      try {
        const response = await getMyAddresses()
        setAddresses(response.data?.addresses ?? [])
      } catch {
        setAddresses((current) => {
          const next = current.filter((entry) => entry._id !== addressId)
          if (next.length === 0 || next.some((entry) => entry.isDefault)) return next
          return next.map((entry, index) => ({
            ...entry,
            isDefault: index === 0,
          }))
        })
      }

      if (selectedAddressId === addressId) setSelectedAddressId(null)
      if (editingAddressId === addressId) {
        setEditingAddressId(null)
        setForm(emptyForm)
      }
      toast.success(t('checkout.address.toastDeleted'))
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t('checkout.address.unableToDelete')
      setSubmitError(message)
      toast.error(t('checkout.address.unableToDelete'), message)
    } finally {
      setDeletingId(null)
    }
  }

  function handleSelectAddress(addressId: string) {
    setSelectedAddressId(addressId)
    setEditingAddressId(null)
    setForm(emptyForm)
    setErrors({})
    setSubmitError(null)
  }

  function handleClose() {
    navigate(ADDRESSES_PATH)
  }

  return {
    isAuthenticated,
    loginPath: LOGIN_PATH,
    userName: user?.name ?? 'User',
    phone,
    form,
    errors,
    addresses,
    governorates,
    districts,
    hasDistricts,
    zonesLoading,
    zonesError,
    selectedAddressId,
    loading,
    submitting,
    deletingId,
    submitError,
    submitSuccess,
    updateField,
    handleSave,
    handleDelete,
    handleSelectAddress,
    handleClose,
    startEdit,
    editingAddressId,
  }
}
