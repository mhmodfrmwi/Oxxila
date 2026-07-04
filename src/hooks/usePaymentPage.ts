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
    districtId: address.city,
    addressLine: rest.join(', ') || address.address,
  }
}

function validateBillingForm(form: BillingFormState): BillingFormErrors {
  const errors: BillingFormErrors = {}
  if (!form.governorateId.trim()) errors.governorateId = 'Government is required'
  if (!form.districtId.trim()) errors.districtId = 'City is required'
  if (!form.addressLine.trim()) errors.addressLine = 'Address is required'
  else if (form.addressLine.trim().length < 6) {
    errors.addressLine = 'Address must be at least 6 characters'
  }
  return errors
}

function resolveProvider(method: PaymentMethodId): 'stripe' | 'paymob' | 'cod' {
  if (method === 'paymob') return 'paymob'
  if (method === 'cod') return 'cod'
  return 'stripe'
}

export function usePaymentPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const { cart, loading: cartLoading, couponLoading, applyCoupon, removeCoupon } = useCart()
  const { primaryAddress, loading: addressLoading } = useCartAddresses()

  const [phone, setPhone] = useState('')
  const [governorates, setGovernorates] = useState<ShippingGovernorate[]>([])
  const [districts, setDistricts] = useState<ShippingDistrict[]>([])
  const [hasDistricts, setHasDistricts] = useState(true)
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
    return buildBillingFromAddress(primaryAddress, governorates)
  }, [billingSameAsShipping, primaryAddress, governorates])

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

    const validation = validateBillingForm(effectiveBillingForm)
    if (Object.keys(validation).length > 0) {
      setBillingErrors(validation)
      toast.error('Invalid form', 'Please complete the billing address fields.')
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
          toast.success('Order placed')
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

      toast.info('Redirecting to payment')
      window.location.assign(checkoutUrl)
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Unable to complete payment.'
      setSubmitError(message)
      toast.error('Payment failed', message)
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
