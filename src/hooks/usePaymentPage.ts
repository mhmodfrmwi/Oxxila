// src/hooks/usePaymentPage.ts
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCodOrder, createPaymentSession } from '../api/orders'
import { getMe } from '../api/auth'
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
import type { UserAddress } from '../api/users'

export type PaymentMethodId = 'stripe' | 'paymob' | 'cod'

export interface BillingFormState {
  governorateId: string
  districtId: string
  addressLine: string
}

export interface BillingFormErrors {
  governorateId?: string
  districtId?: string
  addressLine?: string
}

const emptyBillingForm: BillingFormState = {
  governorateId: '',
  districtId: '',
  addressLine: '',
}

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i

function resolveDistrictIdFromCity(
  cityName: string,
  districts: ShippingDistrict[],
  hasDistricts: boolean,
): string {
  if (!hasDistricts) return 'other'

  const normalizedCity = cityName.trim().toLowerCase()
  if (!normalizedCity) return ''

  const matchedDistrict = districts.find(
    (district) => district.name.trim().toLowerCase() === normalizedCity,
  )
  return matchedDistrict?._id ?? 'other'
}

function isValidBillingDistrictId(districtId: string, hasDistricts: boolean): boolean {
  if (!districtId.trim()) return false
  if (districtId === 'other') return true
  return hasDistricts ? OBJECT_ID_PATTERN.test(districtId) : true
}

function buildBillingFromAddress(
  address: UserAddress,
  governorates: ShippingGovernorate[],
): BillingFormState {
  const [government = '', ...rest] = address.address.split(',').map((part) => part.trim())
  const matchedGovernorate = governorates.find(
    (entry) => entry.name.toLowerCase() === government.toLowerCase(),
  )

  return {
    governorateId: matchedGovernorate?._id ?? '',
    districtId: '',
    addressLine: rest.join(', ') || address.address,
  }
}

function validateBillingForm(
  form: BillingFormState,
  hasDistricts: boolean,
  t: (key: string) => string,
): BillingFormErrors {
  const errors: BillingFormErrors = {}
  if (!form.governorateId.trim()) {
    errors.governorateId = t('checkout.payment.governmentRequired')
  }
  if (!form.districtId.trim()) {
    errors.districtId = t('checkout.payment.cityRequired')
  } else if (!isValidBillingDistrictId(form.districtId, hasDistricts)) {
    errors.districtId = t('checkout.payment.cityRequired')
  }
  if (!form.addressLine.trim()) errors.addressLine = t('checkout.payment.addressRequired')
  else if (form.addressLine.trim().length < 6) {
    errors.addressLine = t('checkout.payment.addressMinLength')
  }
  return errors
}

function resolveProvider(method: PaymentMethodId): 'stripe' | 'paymob' | 'cod' {
  if (method === 'paymob') return 'paymob'
  if (method === 'cod') return 'cod'
  return 'stripe'
}

export function usePaymentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const { cart, loading: cartLoading, couponLoading, applyCoupon, removeCoupon } = useCart()
  const { primaryAddress, loading: addressLoading } = useCartAddresses()

  const [phone, setPhone] = useState('')
  const [governorates, setGovernorates] = useState<ShippingGovernorate[]>([])
  const [districts, setDistricts] = useState<ShippingDistrict[]>([])
  const [hasDistricts, setHasDistricts] = useState(true)
  const [zonesLoading, setZonesLoading] = useState(false)
  const [billingForm, setBillingForm] = useState<BillingFormState>(emptyBillingForm)
  const [billingErrors, setBillingErrors] = useState<BillingFormErrors>({})
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('stripe')
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [shippingPrice, setShippingPrice] = useState(0)
  const [shippingCompareAt, setShippingCompareAt] = useState<number | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const derivedBillingFromShipping = useMemo(() => {
    if (!billingSameAsShipping || !primaryAddress || governorates.length === 0) return null
    const base = buildBillingFromAddress(primaryAddress, governorates)
    if (!base.governorateId) return base

    return {
      ...base,
      districtId: resolveDistrictIdFromCity(primaryAddress.city, districts, hasDistricts),
    }
  }, [billingSameAsShipping, primaryAddress, governorates, districts, hasDistricts])

  const effectiveBillingForm = derivedBillingFromShipping ?? billingForm
  const activeGovernorateId = effectiveBillingForm.governorateId

  const shippingAddressLabel = useMemo(() => {
    if (!primaryAddress) return null
    return `${primaryAddress.address}, ${primaryAddress.city}`
  }, [primaryAddress])

  const activeDistricts = useMemo(
    () => (activeGovernorateId ? districts : []),
    [activeGovernorateId, districts],
  )
  const resolvedShippingPrice = activeGovernorateId ? shippingPrice : 0
  const resolvedShippingCompareAt = activeGovernorateId ? shippingCompareAt : null

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    async function load() {
      await Promise.resolve()
      if (cancelled) return

      setPageLoading(true)
      try {
        const [profileResponse, countriesResponse] = await Promise.all([
          getMe(),
          getShippingCountries(),
        ])
        if (cancelled) return

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
    if (!activeGovernorateId) return

    let cancelled = false

    async function loadZones() {
      await Promise.resolve()
      if (cancelled) return

      setZonesLoading(true)

      try {
        const response = await getShippingZones(activeGovernorateId)
        if (cancelled) return

        const data = response.data
        if (!data) return

        setHasDistricts(data.hasDistricts)
        setDistricts(data.districts ?? [])

        if (!data.hasDistricts && !billingSameAsShipping) {
          setBillingForm((current) => ({
            ...current,
            districtId: 'other',
          }))
        }
      } catch {
        if (!cancelled) setDistricts([])
      } finally {
        if (!cancelled) setZonesLoading(false)
      }
    }

    void loadZones()

    return () => {
      cancelled = true
    }
  }, [activeGovernorateId, billingSameAsShipping])

  useEffect(() => {
    if (!activeGovernorateId) return

    let cancelled = false

    async function loadShippingPrice() {
      await Promise.resolve()
      if (cancelled) return

      try {
        const districtId =
          effectiveBillingForm.districtId && effectiveBillingForm.districtId !== 'other'
            ? effectiveBillingForm.districtId
            : effectiveBillingForm.districtId === 'other'
              ? 'other'
              : undefined

        const response = await resolveShippingPrice(activeGovernorateId, districtId)
        if (cancelled) return

        const price = response.data?.shippingPrice ?? 0
        const governorate = governorates.find((entry) => entry._id === activeGovernorateId)
        const district = activeDistricts.find(
          (entry) => entry._id === effectiveBillingForm.districtId,
        )

        setShippingPrice(price)
        if (price === 0) {
          const compare = district?.shippingPrice ?? governorate?.shippingPrice ?? null
          setShippingCompareAt(compare && compare > 0 ? compare : null)
        } else {
          setShippingCompareAt(null)
        }
      } catch {
        if (!cancelled) {
          setShippingPrice(0)
          setShippingCompareAt(null)
        }
      }
    }

    void loadShippingPrice()

    return () => {
      cancelled = true
    }
  }, [
    activeGovernorateId,
    effectiveBillingForm.districtId,
    governorates,
    activeDistricts,
  ])

  function updateBillingField<K extends keyof BillingFormState>(
    key: K,
    value: BillingFormState[K],
  ) {
    setBillingSameAsShipping(false)
    setBillingForm((current) => {
      const base = derivedBillingFromShipping ?? current
      const next = { ...base, [key]: value }
      if (key === 'governorateId') {
        next.districtId = ''
      }
      return next
    })
    setBillingErrors((current) => ({ ...current, [key]: undefined }))
    setSubmitError(null)
  }

  function handleBillingSameChange(checked: boolean) {
    if (!checked && derivedBillingFromShipping) {
      setBillingForm(derivedBillingFromShipping)
    }
    setBillingSameAsShipping(checked)
  }

  async function handlePayNow() {
    setSubmitError(null)

    const validation = validateBillingForm(effectiveBillingForm, hasDistricts, t)
    if (Object.keys(validation).length > 0) {
      setBillingErrors(validation)
      toast.error(t('checkout.payment.invalidForm'), t('checkout.payment.completeBilling'))
      return
    }

    if (zonesLoading) {
      toast.error(t('checkout.payment.paymentFailed'), t('checkout.payment.loadingShipping'))
      return
    }

    const provider = resolveProvider(paymentMethod)
    const payload = {
      governorateId: effectiveBillingForm.governorateId,
      districtId:
        effectiveBillingForm.districtId === 'other'
          ? ('other' as const)
          : effectiveBillingForm.districtId,
      addressLine: effectiveBillingForm.addressLine.trim(),
    }

    setSubmitting(true)
    try {
      if (provider === 'cod') {
        const response = await createCodOrder({ ...payload, paymentMethod: 'cod' })
        const created = response.data
        if (created?._id) {
          toast.success(t('checkout.payment.orderPlaced'))
          navigate(orderConfirmationPath(created._id))
        } else {
          navigate(CART_PATH)
        }
        return
      }

      const response = await createPaymentSession({ ...payload, provider })
      const checkoutUrl = response.data?.url
      if (!checkoutUrl) {
        throw new ApiError('Payment provider did not return a checkout URL', 502)
      }

      toast.info(t('checkout.payment.redirecting'))
      window.location.assign(checkoutUrl)
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t('checkout.payment.paymentFailed')
      setSubmitError(message)
      toast.error(t('checkout.payment.paymentFailed'), message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleBack() {
    navigate(CART_PATH)
  }

  const totalCompareAt =
    cart && resolvedShippingCompareAt
      ? cart.subtotal + resolvedShippingCompareAt
      : null

  return {
    isAuthenticated,
    loginPath: LOGIN_PATH,
    cart,
    cartLoading,
    couponLoading,
    applyCoupon,
    removeCoupon,
    phone,
    governorates,
    districts: activeDistricts,
    hasDistricts,
    billingForm: effectiveBillingForm,
    billingErrors,
    paymentMethod,
    setPaymentMethod,
    billingSameAsShipping,
    handleBillingSameChange,
    shippingPrice: resolvedShippingPrice,
    shippingCompareAt: resolvedShippingCompareAt,
    shippingAddressLabel,
    primaryAddress,
    addressLoading,
    pageLoading,
    submitting,
    submitError,
    updateBillingField,
    handlePayNow,
    handleBack,
    totalCompareAt,
  }
}
