// src/hooks/useB2BOrderDrawer.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createAdminB2BOrder } from '../api/admin/orders'
import { getAdminCustomers } from '../api/admin/customers'
import {
  getShippingCountries,
  getShippingGovernorates,
  getShippingZones,
  type ShippingDistrict,
  type ShippingGovernorate,
} from '../api/shipping'
import { ApiError } from '../lib/api'
import type { ApiAdminOrder } from '../types/adminOrders'
import type { ApiAdminCustomer } from '../types/adminCustomers'

export type B2BAddressMode = 'saved' | 'manual'

export interface B2BOrderLineItem {
  id: string
  productId: string | null
  productName: string
  productStock: number | null
  quantity: string
  unitPrice: string
}

export type B2BOrderFormErrors = {
  customer?: string
  items?: string
  address?: string
} & Record<string, string | undefined>

interface UseB2BOrderDrawerOptions {
  open: boolean
  onCreated: (order: ApiAdminOrder) => void
}

function emptyItem(): B2BOrderLineItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId: null,
    productName: '',
    productStock: null,
    quantity: '1',
    unitPrice: '',
  }
}

export function useB2BOrderDrawer({ open, onCreated }: UseB2BOrderDrawerOptions) {
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState<ApiAdminCustomer[]>([])
  const [customerSearching, setCustomerSearching] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<ApiAdminCustomer | null>(null)

  const [items, setItems] = useState<B2BOrderLineItem[]>(() => [emptyItem()])

  const [addressMode, setAddressMode] = useState<B2BAddressMode>('saved')
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [governorateId, setGovernorateIdState] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [governorates, setGovernorates] = useState<ShippingGovernorate[]>([])
  const [districts, setDistricts] = useState<ShippingDistrict[]>([])
  const [hasDistricts, setHasDistricts] = useState(true)
  const [zonesLoading, setZonesLoading] = useState(false)

  const [couponCode, setCouponCode] = useState('')
  const [freeShipping, setFreeShipping] = useState(false)
  const [markPaid, setMarkPaid] = useState(false)

  const [errors, setErrors] = useState<B2BOrderFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const customerRequestId = useRef(0)

  const reset = useCallback(() => {
    setCustomerQuery('')
    setCustomerResults([])
    setSelectedCustomer(null)
    setItems([emptyItem()])
    setAddressMode('saved')
    setSelectedAddressId('')
    setGovernorateIdState('')
    setDistrictId('')
    setAddressLine('')
    setGovernorates([])
    setDistricts([])
    setHasDistricts(true)
    setCouponCode('')
    setFreeShipping(false)
    setMarkPaid(false)
    setErrors({})
    setSubmitError(null)
  }, [])

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  // Load governorates for the manual-address mode once the drawer opens.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    void (async () => {
      try {
        const countries = await getShippingCountries()
        const defaultCountry = countries.data?.[0]
        if (!defaultCountry || cancelled) return
        const response = await getShippingGovernorates(defaultCountry._id)
        if (!cancelled) setGovernorates(response.data ?? [])
      } catch {
        // Manual address mode simply shows no governorate options.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    const keyword = customerQuery.trim()
    if (!keyword) {
      setCustomerResults([])
      setCustomerSearching(false)
      return
    }
    const requestId = ++customerRequestId.current
    setCustomerSearching(true)
    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await getAdminCustomers({ keyword, role: 'user', limit: 8 })
          if (requestId !== customerRequestId.current) return
          setCustomerResults(response.data ?? [])
        } catch {
          if (requestId !== customerRequestId.current) return
          setCustomerResults([])
        } finally {
          if (requestId === customerRequestId.current) setCustomerSearching(false)
        }
      })()
    }, 300)
    return () => window.clearTimeout(handle)
  }, [customerQuery])

  const selectCustomer = useCallback((customer: ApiAdminCustomer) => {
    setSelectedCustomer(customer)
    setCustomerQuery('')
    setCustomerResults([])
    setSelectedAddressId(customer.addresses?.find((a) => a.isDefault)?._id ?? '')
    setErrors((previous) => ({ ...previous, customer: undefined }))
  }, [])

  const clearCustomer = useCallback(() => {
    setSelectedCustomer(null)
    setSelectedAddressId('')
  }, [])

  const setGovernorateId = useCallback((value: string) => {
    setGovernorateIdState(value)
    setDistrictId('')
    setDistricts([])
    setHasDistricts(true)
    setErrors((previous) => ({ ...previous, address: undefined }))
  }, [])

  useEffect(() => {
    if (!governorateId) return
    let cancelled = false
    setZonesLoading(true)
    void (async () => {
      try {
        const response = await getShippingZones(governorateId)
        if (cancelled) return
        setHasDistricts(response.data?.hasDistricts ?? true)
        setDistricts(response.data?.districts ?? [])
      } catch {
        if (!cancelled) {
          setDistricts([])
          setHasDistricts(true)
        }
      } finally {
        if (!cancelled) setZonesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [governorateId])

  const addItem = useCallback(() => {
    setItems((previous) => [...previous, emptyItem()])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((previous) => (previous.length > 1 ? previous.filter((item) => item.id !== id) : previous))
  }, [])

  const updateItemProduct = useCallback(
    (id: string, product: { _id: string; name: string; stock?: number } | null) => {
      setItems((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                productId: product?._id ?? null,
                productName: product?.name ?? '',
                productStock: product?.stock ?? null,
              }
            : item,
        ),
      )
      setErrors((previous) => ({ ...previous, items: undefined }))
    },
    [],
  )

  const updateItemQuantity = useCallback((id: string, quantity: string) => {
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, quantity } : item)),
    )
  }, [])

  const updateItemUnitPrice = useCallback((id: string, unitPrice: string) => {
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, unitPrice } : item)),
    )
  }, [])

  const savedAddresses = useMemo(
    () => selectedCustomer?.addresses ?? [],
    [selectedCustomer],
  )

  const submit = useCallback(async () => {
    const nextErrors: B2BOrderFormErrors = {}
    if (!selectedCustomer) nextErrors.customer = 'customerRequired'

    if (items.length === 0) nextErrors.items = 'itemsRequired'
    else if (items.some((item) => !item.productId)) nextErrors.items = 'productRequired'

    if (addressMode === 'saved') {
      if (!selectedAddressId) nextErrors.address = 'addressRequired'
    } else if (!governorateId || addressLine.trim().length < 6) {
      nextErrors.address = 'addressRequired'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = {
        userId: selectedCustomer!._id,
        items: items.map((item) => ({
          productId: item.productId!,
          quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1),
          ...(item.unitPrice.trim() ? { unitPrice: Number.parseFloat(item.unitPrice) } : {}),
        })),
        ...(addressMode === 'saved'
          ? { addressId: selectedAddressId }
          : {
              governorateId,
              ...(districtId ? { districtId } : {}),
              addressLine: addressLine.trim(),
            }),
        ...(couponCode.trim() ? { couponCode: couponCode.trim() } : {}),
        ...(freeShipping ? { freeShipping: true } : {}),
        paymentMethod: 'cod' as const,
        ...(markPaid ? { markPaid: true } : {}),
      }

      const response = await createAdminB2BOrder(payload)
      const data = response.data
      if (!data) throw new ApiError(response.message || 'Unable to create order')
      onCreated(data)
      return true
    } catch (error) {
      if (isAbortError(error)) return false
      setSubmitError(error instanceof ApiError ? error.message : 'Unable to create order')
      return false
    } finally {
      setSubmitting(false)
    }
  }, [
    addressLine,
    addressMode,
    couponCode,
    districtId,
    freeShipping,
    governorateId,
    items,
    markPaid,
    onCreated,
    selectedAddressId,
    selectedCustomer,
  ])

  return {
    customerQuery,
    setCustomerQuery,
    customerResults,
    customerSearching,
    selectedCustomer,
    selectCustomer,
    clearCustomer,

    items,
    addItem,
    removeItem,
    updateItemProduct,
    updateItemQuantity,
    updateItemUnitPrice,

    addressMode,
    setAddressMode,
    savedAddresses,
    selectedAddressId,
    setSelectedAddressId,
    governorates,
    districts,
    hasDistricts,
    zonesLoading,
    governorateId,
    setGovernorateId,
    districtId,
    setDistrictId,
    addressLine,
    setAddressLine,

    couponCode,
    setCouponCode,
    freeShipping,
    setFreeShipping,
    markPaid,
    setMarkPaid,

    errors,
    submitting,
    submitError,
    submit,
    reset,
  }
}

export type UseB2BOrderDrawerReturn = ReturnType<typeof useB2BOrderDrawer>
