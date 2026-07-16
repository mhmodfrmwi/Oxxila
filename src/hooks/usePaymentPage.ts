// src/hooks/usePaymentPage.ts
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCodOrder, createPaymentSession } from '../api/orders'
import {
  createMyAddress,
  getUserProfile,
  type CreateAddressPayload,
} from '../api/users'
import {
  getShippingCountries,
  getShippingGovernorates,
  getShippingZones,
  resolveShippingPrice,
  type ShippingDistrict,
  type ShippingGovernorate,
} from '../api/shipping'
import { CART_PATH, LOGIN_PATH, orderConfirmationPath } from '../config/routes'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useCartAddresses } from './useCartAddresses'
import { ApiError } from '../lib/api'
import { storePaymentSessionId } from '../utils/paymentSessionStorage'

export type PaymentMethodId = 'stripe' | 'paymob' | 'cod'

export interface NewAddressFormState {
  label: string
  governorateId: string
  districtId: string
  addressLine: string
}

export interface NewAddressFormErrors {
  label?: string
  governorateId?: string
  districtId?: string
  addressLine?: string
}

const emptyNewAddressForm: NewAddressFormState = {
  label: '',
  governorateId: '',
  districtId: '',
  addressLine: '',
}

function validateNewAddressForm(
  form: NewAddressFormState,
  hasDistricts: boolean,
  t: (key: string) => string,
): NewAddressFormErrors {
  const errors: NewAddressFormErrors = {}
  if (!form.governorateId.trim()) {
    errors.governorateId = t('checkout.payment.governmentRequired')
  }
  if (!form.districtId.trim()) {
    errors.districtId = t('checkout.payment.cityRequired')
  } else if (
    hasDistricts &&
    form.districtId !== 'other' &&
    !/^[a-f\d]{24}$/i.test(form.districtId)
  ) {
    errors.districtId = t('checkout.payment.cityRequired')
  }
  if (!form.addressLine.trim()) {
    errors.addressLine = t('checkout.payment.addressRequired')
  } else if (form.addressLine.trim().length < 6) {
    errors.addressLine = t('checkout.payment.addressMinLength')
  }
  return errors
}

function resolveProvider(method: PaymentMethodId): 'stripe' | 'paymob' | 'cod' {
  if (method === 'paymob') return 'paymob'
  if (method === 'cod') return 'cod'
  return 'stripe'
}

function resolveDistrictIdForShipping(address: {
  isOther: boolean
  district: { id: string } | null
}): string {
  if (address.isOther || !address.district?.id) return 'other'
  return address.district.id
}

export function usePaymentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const {
    cart,
    loading: cartLoading,
    loadError: cartLoadError,
    couponLoading,
    applyCoupon,
    removeCoupon,
    refreshCart,
  } = useCart()
  const {
    addresses,
    loading: addressLoading,
    loadError: addressLoadError,
    selectedAddressId,
    setSelectedAddressId,
    selectedAddress,
    primaryAddress,
    refreshAddresses,
  } = useCartAddresses()

  const [phone, setPhone] = useState('')
  const [governorates, setGovernorates] = useState<ShippingGovernorate[]>([])
  const [districts, setDistricts] = useState<ShippingDistrict[]>([])
  const [hasDistricts, setHasDistricts] = useState(true)
  const [zonesLoading, setZonesLoading] = useState(false)
  const [zonesError, setZonesError] = useState<string | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newAddressForm, setNewAddressForm] = useState<NewAddressFormState>(emptyNewAddressForm)
  const [newAddressErrors, setNewAddressErrors] = useState<NewAddressFormErrors>({})
  const [savingAddress, setSavingAddress] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('stripe')
  const [pageLoading, setPageLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [shippingPrice, setShippingPrice] = useState<number | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const submittingRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    async function load() {
      await Promise.resolve()
      if (cancelled) return

      setPageLoading(true)
      try {
        const [profileResponse, countriesResponse] = await Promise.all([
          getUserProfile(),
          getShippingCountries(),
        ])
        if (cancelled) return

        setPhone(profileResponse.data?.phone ?? '')

        const countries = countriesResponse.data ?? []
        const defaultCountry = countries[0]
        if (defaultCountry) {
          const governoratesResponse = await getShippingGovernorates(defaultCountry._id)
          if (!cancelled) setGovernorates(governoratesResponse.data ?? [])
        }
      } catch (error) {
        if (!cancelled) {
          setSubmitError(
            error instanceof ApiError ? error.message : 'Unable to load payment data.',
          )
        }
      } finally {
        if (!cancelled) setPageLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!selectedAddress) {
      setShippingPrice(null)
      setShippingLoading(false)
      return
    }

    let cancelled = false
    const governorateId = selectedAddress.governorate.id
    const districtId = resolveDistrictIdForShipping(selectedAddress)

    async function loadShipping() {
      setShippingLoading(true)
      try {
        const response = await resolveShippingPrice(governorateId, districtId)
        if (cancelled) return
        const price = response.data?.shippingPrice
        setShippingPrice(typeof price === 'number' ? price : null)
      } catch {
        if (!cancelled) setShippingPrice(null)
      } finally {
        if (!cancelled) setShippingLoading(false)
      }
    }

    void loadShipping()

    return () => {
      cancelled = true
    }
  }, [selectedAddress])

  function selectAddress(addressId: string) {
    setSelectedAddressId(addressId)
    setShowNewAddressForm(false)
    setNewAddressForm(emptyNewAddressForm)
    setNewAddressErrors({})
    setSubmitError(null)
  }

  function openNewAddressForm() {
    setShowNewAddressForm(true)
    setSelectedAddressId(null)
    setNewAddressForm(emptyNewAddressForm)
    setNewAddressErrors({})
    setDistricts([])
    setHasDistricts(true)
    setSubmitError(null)
  }

  function updateNewAddressField<K extends keyof NewAddressFormState>(
    key: K,
    value: NewAddressFormState[K],
  ) {
    setNewAddressForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'governorateId') next.districtId = ''
      return next
    })
    if (key === 'governorateId') {
      setDistricts([])
      setHasDistricts(true)
      setZonesError(null)
    }
    setNewAddressErrors((current) => ({ ...current, [key]: undefined }))
    setSubmitError(null)
  }

  useEffect(() => {
    if (!showNewAddressForm || !newAddressForm.governorateId) return

    let cancelled = false

    async function loadZones() {
      await Promise.resolve()
      if (cancelled) return

      setZonesLoading(true)
      setZonesError(null)
      try {
        const response = await getShippingZones(newAddressForm.governorateId)
        if (cancelled) return

        const data = response.data
        setHasDistricts(data?.hasDistricts ?? true)
        setDistricts(data?.districts ?? [])
        setZonesError(null)

        if (data && !data.hasDistricts) {
          setNewAddressForm((current) =>
            current.districtId === 'other'
              ? current
              : { ...current, districtId: 'other' },
          )
        }
      } catch (error) {
        if (!cancelled) {
          setDistricts([])
          setHasDistricts(true)
          setNewAddressForm((current) =>
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
  }, [showNewAddressForm, newAddressForm.governorateId, t])

  async function handleCreateAddress() {
    if (zonesError) {
      setSubmitError(zonesError)
      toast.error(t('checkout.payment.paymentFailed'), zonesError)
      return
    }

    const validation = validateNewAddressForm(newAddressForm, hasDistricts, t)
    if (Object.keys(validation).length > 0) {
      setNewAddressErrors(validation)
      toast.error(t('checkout.payment.invalidForm'), t('checkout.payment.completeBilling'))
      return
    }

    if (zonesLoading) {
      toast.error(t('checkout.payment.paymentFailed'), t('checkout.payment.loadingShipping'))
      return
    }

    const payload: CreateAddressPayload = {
      governorateId: newAddressForm.governorateId.trim(),
      districtId: newAddressForm.districtId.trim() || 'other',
      addressLine: newAddressForm.addressLine.trim(),
      label: newAddressForm.label.trim() || undefined,
    }

    setSavingAddress(true)
    setSubmitError(null)
    try {
      const response = await createMyAddress(payload)
      const created = response.data?.address
      await refreshAddresses()
      if (created?._id) {
        setSelectedAddressId(created._id)
      }
      setShowNewAddressForm(false)
      setNewAddressForm(emptyNewAddressForm)
      toast.success(t('checkout.address.toastAdded'))
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t('checkout.address.unableToSave')
      setSubmitError(message)
      toast.error(t('checkout.address.unableToSave'), message)
    } finally {
      setSavingAddress(false)
    }
  }

  async function handlePayNow() {
    if (submittingRef.current) return

    setSubmitError(null)

    if (!selectedAddressId) {
      toast.error(
        t('checkout.payment.invalidForm'),
        t('checkout.payment.selectAddressRequired'),
      )
      return
    }

    const provider = resolveProvider(paymentMethod)

    submittingRef.current = true
    setSubmitting(true)
    try {
      if (provider === 'cod') {
        const response = await createCodOrder({
          paymentMethod: 'cod',
          addressId: selectedAddressId,
        })
        const created = response.data
        if (created?._id) {
          toast.success(t('checkout.payment.orderPlaced'))
          navigate(orderConfirmationPath(created._id))
        } else {
          navigate(CART_PATH)
        }
        return
      }

      const response = await createPaymentSession({
        provider,
        addressId: selectedAddressId,
      })
      const paymentSessionId = String(response.data?.paymentSessionId ?? '').trim()
      const checkoutUrl = response.data?.url?.trim()
      if (!paymentSessionId || !checkoutUrl) {
        throw new ApiError('Payment provider did not return a checkout URL', 502)
      }

      storePaymentSessionId(paymentSessionId)
      toast.info(t('checkout.payment.redirecting'))
      window.location.assign(checkoutUrl)
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t('checkout.payment.paymentFailed')
      setSubmitError(message)
      toast.error(t('checkout.payment.paymentFailed'), message)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  function handleBack() {
    navigate(CART_PATH)
  }

  async function retryAddresses() {
    try {
      await refreshAddresses()
    } catch {
      // loadError is set inside refreshAddresses
    }
  }

  return {
    isAuthenticated,
    loginPath: LOGIN_PATH,
    cart,
    cartLoading,
    cartLoadError,
    refreshCart,
    couponLoading,
    applyCoupon,
    removeCoupon,
    phone,
    addresses,
    selectedAddressId,
    selectedAddress,
    primaryAddress,
    addressLoading,
    addressLoadError,
    retryAddresses,
    selectAddress,
    showNewAddressForm,
    openNewAddressForm,
    newAddressForm,
    newAddressErrors,
    updateNewAddressField,
    handleCreateAddress,
    savingAddress,
    governorates,
    districts,
    hasDistricts,
    zonesLoading,
    zonesError,
    shippingPrice,
    shippingLoading,
    paymentMethod,
    setPaymentMethod,
    pageLoading,
    submitting,
    submitError,
    handlePayNow,
    handleBack,
  }
}
