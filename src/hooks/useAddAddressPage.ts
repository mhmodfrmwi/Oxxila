// src/hooks/useAddAddressPage.ts
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getShippingCountries, getShippingGovernorates } from '../api/shipping'
import {
  createMyAddress,
  deleteMyAddress,
  getMyAddresses,
  updateMyAddress,
  type UserAddress,
} from '../api/users'
import { getMe } from '../api/auth'
import { ADDRESSES_PATH, LOGIN_PATH } from '../config/routes'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'

export interface AddressFormState {
  city: string
  government: string
  address: string
}

export interface AddressFormErrors {
  city?: string
  government?: string
  address?: string
}

const emptyForm: AddressFormState = {
  city: '',
  government: '',
  address: '',
}

function validateForm(form: AddressFormState): AddressFormErrors {
  const errors: AddressFormErrors = {}
  if (!form.city.trim()) errors.city = 'City is required'
  if (!form.government.trim()) errors.government = 'Government is required'
  if (!form.address.trim()) errors.address = 'Address is required'
  else if (form.address.trim().length > 500) errors.address = 'Address is too long'
  return errors
}

function buildAddressPayload(form: AddressFormState) {
  return {
    city: form.city.trim(),
    address: `${form.government.trim()}, ${form.address.trim()}`,
  }
}

export function useAddAddressPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState<AddressFormState>(emptyForm)
  const [errors, setErrors] = useState<AddressFormErrors>({})
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [governorates, setGovernorates] = useState<{ _id: string; name: string }[]>([])
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const cityOptions = useMemo(() => {
    const names = new Set<string>()
    for (const entry of addresses) {
      if (entry.city?.trim()) names.add(entry.city.trim())
    }
    if (form.city.trim()) names.add(form.city.trim())
    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }, [addresses, form.city])

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
          getMe(),
          getShippingCountries(),
        ])
        if (cancelled) return

        setAddresses(addressesResponse.data?.addresses ?? [])
        const profile = profileResponse.data as { phone?: string } | undefined
        setPhone(profile?.phone ?? '')

        const countries = countriesResponse.data ?? []
        const defaultCountry = countries[0]
        if (defaultCountry) {
          const governoratesResponse = await getShippingGovernorates(defaultCountry._id)
          if (!cancelled) setGovernorates(governoratesResponse.data ?? [])
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
  }, [isAuthenticated])

  function startEdit(address: UserAddress) {
    const [government = '', ...rest] = address.address.split(',').map((part) => part.trim())
    setForm({
      city: address.city,
      government,
      address: rest.join(', '),
    })
    setEditingAddressId(address._id)
    setSelectedAddressId(address._id)
    setErrors({})
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  function updateField<K extends keyof AddressFormState>(key: K, value: AddressFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setSubmitError(null)
    if (!editingAddressId) {
      setSelectedAddressId(null)
    }
  }

  async function handleSave() {
    setSubmitError(null)
    setSubmitSuccess(null)

    const validation = validateForm(form)
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      toast.error('Invalid form', 'Please fill in all required fields.')
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
        }
        setSubmitSuccess('Address updated successfully.')
        toast.success('Address updated')
      } else {
        const response = await createMyAddress(payload)
        const created = response.data?.address
        if (created) {
          setAddresses((current) => [...current, created])
          setSelectedAddressId(created._id)
        }
        setSubmitSuccess('Address saved successfully.')
        toast.success('Address added')
      }

      setForm(emptyForm)
      setEditingAddressId(null)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to save address.'
      setSubmitError(message)
      toast.error('Unable to save address', message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(addressId: string) {
    setSubmitError(null)
    setDeletingId(addressId)
    try {
      await deleteMyAddress(addressId)
      setAddresses((current) => current.filter((entry) => entry._id !== addressId))
      if (selectedAddressId === addressId) setSelectedAddressId(null)
      toast.success('Address deleted')
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to delete address.'
      setSubmitError(message)
      toast.error('Unable to delete address', message)
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

  function handleCancel() {
    navigate(ADDRESSES_PATH)
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
    cityOptions,
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
    handleCancel,
    handleClose,
    startEdit,
    editingAddressId,
  }
}
