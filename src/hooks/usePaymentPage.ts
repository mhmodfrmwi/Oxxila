// src/hooks/usePaymentPage.ts
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createCodOrder,
  createPaymentSession,
  getEnabledPaymentGateways,
  type EnabledPaymentGateway,
  type PaymentGatewayCode,
} from '../api/orders'
import { getUserProfile } from '../api/users'
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
import { findDefaultAddress } from '../utils/userAddress'

export type PaymentMethodId = PaymentGatewayCode

const PAYMENT_METHOD_ORDER: PaymentMethodId[] = ['stripe', 'paymob', 'cod']

function sortEnabledMethods(gateways: EnabledPaymentGateway[]): PaymentMethodId[] {
  const enabled = new Set(
    gateways
      .map((gateway) => gateway.code)
      .filter((code): code is PaymentMethodId =>
        PAYMENT_METHOD_ORDER.includes(code as PaymentMethodId),
      ),
  )
  return PAYMENT_METHOD_ORDER.filter((code) => enabled.has(code))
}

export interface NewAddressFormState {
  label: string
  /** Delivery phone for this order/address (prefilled from the account, editable). */
  phone: string
  governorateId: string
  districtId: string
  addressLine: string
  /** Save to the address book — on by default so the next order is one click. */
  saveAddress: boolean
}

export interface NewAddressFormErrors {
  label?: string
  phone?: string
  governorateId?: string
  districtId?: string
  addressLine?: string
}

const emptyNewAddressForm: NewAddressFormState = {
  label: '',
  phone: '',
  governorateId: '',
  districtId: '',
  addressLine: '',
  saveAddress: true,
}

/** 8–15 digits with an optional leading + / 00 (matches the API validator). */
const PHONE_PATTERN = /^(\+|00)?\d{8,15}$/
function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(value.replace(/[\s\-().]/g, ''))
}

function validateNewAddressForm(
  form: NewAddressFormState,
  hasDistricts: boolean,
  t: (key: string) => string,
): NewAddressFormErrors {
  const errors: NewAddressFormErrors = {}
  if (!form.phone.trim()) {
    errors.phone = t('checkout.payment.phoneRequired')
  } else if (!isValidPhone(form.phone)) {
    errors.phone = t('checkout.payment.phoneInvalid')
  }
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
  const { t, i18n } = useTranslation()
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

  // Account phone — only used to prefill the new-address form.
  const [profilePhone, setProfilePhone] = useState('')
  const [governorates, setGovernorates] = useState<ShippingGovernorate[]>([])
  const [districts, setDistricts] = useState<ShippingDistrict[]>([])
  const [hasDistricts, setHasDistricts] = useState(true)
  const [zonesLoading, setZonesLoading] = useState(false)
  const [zonesError, setZonesError] = useState<string | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newAddressForm, setNewAddressForm] = useState<NewAddressFormState>(emptyNewAddressForm)
  const [newAddressErrors, setNewAddressErrors] = useState<NewAddressFormErrors>({})
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId | null>(null)
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<PaymentMethodId[]>([])
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
      setSubmitError(null)
      try {
        const [profileResult, countriesResult, gatewaysResult] = await Promise.allSettled([
          getUserProfile(),
          getShippingCountries(),
          getEnabledPaymentGateways(),
        ])
        if (cancelled) return

        if (profileResult.status === 'fulfilled') {
          setProfilePhone(profileResult.value.data?.phone ?? '')
        }

        if (gatewaysResult.status === 'fulfilled') {
          const enabledMethods = sortEnabledMethods(gatewaysResult.value.data ?? [])
          setEnabledPaymentMethods(enabledMethods)
          setPaymentMethod((current) => {
            if (current && enabledMethods.includes(current)) return current
            return enabledMethods[0] ?? null
          })
        } else {
          setEnabledPaymentMethods([])
          setPaymentMethod(null)
        }

        if (countriesResult.status === 'fulfilled') {
          const countries = countriesResult.value.data ?? []
          const defaultCountry = countries[0]
          if (defaultCountry) {
            const governoratesResponse = await getShippingGovernorates(defaultCountry._id)
            if (!cancelled) setGovernorates(governoratesResponse.data ?? [])
          }
        }

        const firstError = [profileResult, countriesResult, gatewaysResult].find(
          (result) => result.status === 'rejected',
        )
        if (firstError && firstError.status === 'rejected') {
          const reason = firstError.reason
          setSubmitError(
            reason instanceof ApiError ? reason.message : 'Unable to load payment data.',
          )
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

  // Shipping is priced from the chosen saved address, or from the form's zone while adding a new one.
  const shippingGovernorateId = showNewAddressForm
    ? newAddressForm.governorateId
    : (selectedAddress?.governorate.id ?? '')
  const shippingDistrictId = showNewAddressForm
    ? newAddressForm.districtId
    : selectedAddress
      ? resolveDistrictIdForShipping(selectedAddress)
      : ''

  useEffect(() => {
    if (!shippingGovernorateId || !shippingDistrictId) {
      setShippingPrice(null)
      setShippingLoading(false)
      return
    }

    let cancelled = false

    async function loadShipping() {
      setShippingLoading(true)
      try {
        const response = await resolveShippingPrice(shippingGovernorateId, shippingDistrictId)
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
  }, [shippingGovernorateId, shippingDistrictId])

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
    setNewAddressForm({ ...emptyNewAddressForm, phone: profilePhone })
    setNewAddressErrors({})
    setDistricts([])
    setHasDistricts(true)
    setSubmitError(null)
  }

  function showSavedAddresses() {
    setShowNewAddressForm(false)
    setNewAddressForm(emptyNewAddressForm)
    setNewAddressErrors({})
    setDistricts([])
    setHasDistricts(true)
    setSubmitError(null)
    setSelectedAddressId((current) => {
      if (current && addresses.some((entry) => entry._id === current)) return current
      return findDefaultAddress(addresses)?._id ?? null
    })
  }

  // No saved addresses yet → stay on the new-address form by default.
  useEffect(() => {
    if (addressLoading || addressLoadError) return
    if (addresses.length === 0) setShowNewAddressForm(true)
  }, [addressLoading, addressLoadError, addresses.length])

  // Prefill the form phone from the account once it is known (never overwrites typing).
  useEffect(() => {
    if (!profilePhone) return
    setNewAddressForm((current) => (current.phone ? current : { ...current, phone: profilePhone }))
  }, [profilePhone])

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

  async function handlePayNow() {
    if (submittingRef.current) return

    setSubmitError(null)

    // Saved address → send its id; new address → validate and send it inline with the order.
    let addressPayload:
      | { addressId: string }
      | {
          governorateId: string
          districtId: string
          addressLine: string
          phone: string
          saveAddress: boolean
          label?: string
        }
    if (showNewAddressForm || !selectedAddressId) {
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
      addressPayload = {
        governorateId: newAddressForm.governorateId.trim(),
        districtId: newAddressForm.districtId.trim() || 'other',
        addressLine: newAddressForm.addressLine.trim(),
        phone: newAddressForm.phone.replace(/[\s\-().]/g, ''),
        saveAddress: newAddressForm.saveAddress,
        label: newAddressForm.label.trim() || undefined,
      }
    } else {
      addressPayload = { addressId: selectedAddressId }
    }

    if (!paymentMethod) {
      toast.error(
        t('checkout.payment.invalidForm'),
        t('checkout.payment.noMethodsAvailable'),
      )
      return
    }

    const provider = resolveProvider(paymentMethod)
    const locale = i18n.language.startsWith('en') ? ('en' as const) : ('ar' as const)

    submittingRef.current = true
    setSubmitting(true)
    try {
      if (provider === 'cod') {
        const response = await createCodOrder({ paymentMethod: 'cod', locale, ...addressPayload })
        const created = response.data
        if (created?._id) {
          toast.success(t('checkout.payment.orderPlaced'))
          navigate(orderConfirmationPath(created._id))
        } else {
          navigate(CART_PATH)
        }
        return
      }

      const response = await createPaymentSession({ provider, locale, ...addressPayload })
      const paymentSessionId = String(response.data?.paymentSessionId ?? '').trim()
      const checkoutUrl = response.data?.url?.trim() || ''
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
    profilePhone,
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
    showSavedAddresses,
    newAddressForm,
    newAddressErrors,
    updateNewAddressField,
    governorates,
    districts,
    hasDistricts,
    zonesLoading,
    zonesError,
    shippingPrice,
    shippingLoading,
    paymentMethod,
    setPaymentMethod,
    enabledPaymentMethods,
    pageLoading,
    submitting,
    submitError,
    handlePayNow,
    handleBack,
  }
}
