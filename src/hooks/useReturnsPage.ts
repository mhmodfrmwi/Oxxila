// src/hooks/useReturnsPage.ts
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  createReturnRequest,
  getEligibleReturnOrders,
  PROOF_REQUIRED_REASONS,
  RETURN_REASONS,
  type EligibleReturnOrder,
  type ReturnReason,
} from '../api/returns'
import {
  getShippingCountries,
  getShippingGovernorates,
  getShippingZones,
  type ShippingDistrict,
  type ShippingGovernorate,
} from '../api/shipping'
import { getUserProfile } from '../api/users'
import { LOGIN_PATH } from '../config/routes'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useCartAddresses } from './useCartAddresses'
import { ApiError } from '../lib/api'
import {
  PREVIEW_DISTRICTS_BY_GOVERNORATE,
  PREVIEW_GOVERNORATES,
  resolveEligibleOrdersOrPreview,
} from '../mocks/returns'
import { formatAddressOneLine } from '../utils/userAddress'

export interface PickupFormState {
  governorateId: string
  districtId: string
  addressLine: string
}

export interface PickupFormErrors {
  governorateId?: string
  districtId?: string
  addressLine?: string
  reason?: string
  items?: string
  proofImages?: string
}

const emptyPickup: PickupFormState = {
  governorateId: '',
  districtId: '',
  addressLine: '',
}

const MAX_PROOF_FILES = 5
const MAX_PROOF_BYTES = 5 * 1024 * 1024

function formatOrderDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear()}`
}

function shortOrderCode(orderId: string) {
  const suffix = orderId.slice(-5).toUpperCase()
  return `OX-${suffix}`
}

export function useReturnsPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const { primaryAddress, loading: addressesLoading } = useCartAddresses()

  const [orders, setOrders] = useState<EligibleReturnOrder[]>([])
  const [usingPreviewData, setUsingPreviewData] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({})
  const [reason, setReason] = useState<ReturnReason | ''>('')
  const [note, setNote] = useState('')
  const [proofImages, setProofImages] = useState<File[]>([])
  const [pickup, setPickup] = useState<PickupFormState>(emptyPickup)
  const [useSavedAddress, setUseSavedAddress] = useState(false)
  const [phone, setPhone] = useState('')
  const [governorates, setGovernorates] = useState<ShippingGovernorate[]>([])
  const [districts, setDistricts] = useState<ShippingDistrict[]>([])
  const [hasDistricts, setHasDistricts] = useState(true)
  const [errors, setErrors] = useState<PickupFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    async function load() {
      await Promise.resolve()
      if (cancelled) return

      setLoading(true)
      setLoadError('')

      let nextOrders: EligibleReturnOrder[]
      let usingPreview: boolean

      try {
        const ordersResponse = await getEligibleReturnOrders({ limit: 50 })
        if (cancelled) return
        const resolved = resolveEligibleOrdersOrPreview(ordersResponse.data)
        nextOrders = resolved.orders
        usingPreview = resolved.usingPreview
      } catch {
        const resolved = resolveEligibleOrdersOrPreview(null)
        nextOrders = resolved.orders
        usingPreview = resolved.usingPreview
      }

      if (cancelled) return
      setOrders(nextOrders)
      setUsingPreviewData(usingPreview)

      const dates = new Set(
        nextOrders.map((order) => formatOrderDate(order.deliveredAt || '')),
      )
      const expanded: Record<string, boolean> = {}
      let first = true
      for (const date of dates) {
        expanded[date] = first
        first = false
      }
      setExpandedDates(expanded)

      try {
        const profileResponse = await getUserProfile()
        if (!cancelled) setPhone(profileResponse.data?.phone ?? '')
      } catch {
        /* optional for UI preview */
      }

      try {
        const countriesResponse = await getShippingCountries()
        if (cancelled) return
        const countries = countriesResponse.data ?? []
        const defaultCountry = countries[0]
        if (defaultCountry) {
          const govResponse = await getShippingGovernorates(defaultCountry._id)
          if (!cancelled) {
            const govs = govResponse.data ?? []
            setGovernorates(govs.length > 0 ? govs : PREVIEW_GOVERNORATES)
          }
        } else if (!cancelled) {
          setGovernorates(PREVIEW_GOVERNORATES)
        }
      } catch {
        if (!cancelled) setGovernorates(PREVIEW_GOVERNORATES)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, t])

  useEffect(() => {
    if (!pickup.governorateId) return

    let cancelled = false

    async function loadZones() {
      await Promise.resolve()
      if (cancelled) return

      const previewDistricts = PREVIEW_DISTRICTS_BY_GOVERNORATE[pickup.governorateId]
      if (previewDistricts) {
        setHasDistricts(true)
        setDistricts(previewDistricts)
        return
      }

      try {
        const response = await getShippingZones(pickup.governorateId)
        if (cancelled) return
        const data = response.data
        setHasDistricts(data?.hasDistricts ?? true)
        setDistricts(data?.districts ?? [])
        if (data && !data.hasDistricts) {
          setPickup((current) =>
            current.districtId === 'other'
              ? current
              : { ...current, districtId: 'other' },
          )
        }
      } catch {
        if (!cancelled) setDistricts([])
      }
    }

    void loadZones()

    return () => {
      cancelled = true
    }
  }, [pickup.governorateId])

  const ordersByDate = useMemo(() => {
    const groups = new Map<string, EligibleReturnOrder[]>()
    for (const order of orders) {
      const key = formatOrderDate(order.deliveredAt)
      const list = groups.get(key) ?? []
      list.push(order)
      groups.set(key, list)
    }
    return Array.from(groups.entries())
  }, [orders])

  const selectedOrder = useMemo(
    () => orders.find((order) => order._id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  )

  const selectedLineItems = useMemo(() => {
    if (!selectedOrder) return []
    return selectedOrder.items
      .filter((item) => (selectedItems[item.orderItemId] ?? 0) > 0)
      .map((item) => ({
        ...item,
        quantity: selectedItems[item.orderItemId] ?? 0,
      }))
  }, [selectedOrder, selectedItems])

  const savedAddressLabel = primaryAddress
    ? formatAddressOneLine(primaryAddress)
    : ''

  const proofRequired = Boolean(reason && PROOF_REQUIRED_REASONS.has(reason))

  function toggleDate(dateKey: string) {
    setExpandedDates((current) => ({
      ...current,
      [dateKey]: !current[dateKey],
    }))
  }

  function toggleItem(orderId: string, orderItemId: string, returnableQuantity: number) {
    setSubmitted(false)
    setErrors((current) => ({ ...current, items: undefined }))

    if (selectedOrderId && selectedOrderId !== orderId) {
      setSelectedOrderId(orderId)
      setSelectedItems({ [orderItemId]: Math.min(1, returnableQuantity) })
      return
    }

    setSelectedOrderId(orderId)
    setSelectedItems((current) => {
      const next = { ...current }
      if (next[orderItemId]) {
        delete next[orderItemId]
      } else {
        next[orderItemId] = Math.min(1, returnableQuantity)
      }
      if (Object.keys(next).length === 0) {
        setSelectedOrderId(null)
      }
      return next
    })
  }

  function updateItemQuantity(orderItemId: string, quantity: number, max: number) {
    const clamped = Math.max(1, Math.min(max, quantity))
    setSelectedItems((current) => ({ ...current, [orderItemId]: clamped }))
  }

  function updatePickupField<K extends keyof PickupFormState>(
    key: K,
    value: PickupFormState[K],
  ) {
    setUseSavedAddress(false)
    setPickup((current) => {
      const next = { ...current, [key]: value }
      if (key === 'governorateId') next.districtId = ''
      return next
    })
    if (key === 'governorateId') {
      setDistricts([])
      setHasDistricts(true)
    }
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function handleUseSavedAddress(checked: boolean) {
    setUseSavedAddress(checked)
    if (!checked || !primaryAddress) return

    setPickup({
      governorateId: String(primaryAddress.governorate?.id ?? ''),
      districtId: primaryAddress.isOther
        ? 'other'
        : String(primaryAddress.district?.id ?? 'other'),
      addressLine: primaryAddress.addressLine ?? '',
    })
    setErrors((current) => ({
      ...current,
      governorateId: undefined,
      districtId: undefined,
      addressLine: undefined,
    }))
  }

  function handleProofFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    const next = [...proofImages]
    for (const file of Array.from(fileList)) {
      if (next.length >= MAX_PROOF_FILES) break
      if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
        toast.error(t('returns.invalidImageType'))
        continue
      }
      if (file.size > MAX_PROOF_BYTES) {
        toast.error(t('returns.imageTooLarge'))
        continue
      }
      next.push(file)
    }
    setProofImages(next)
    setErrors((current) => ({ ...current, proofImages: undefined }))
  }

  function removeProofFile(index: number) {
    setProofImages((current) => current.filter((_, i) => i !== index))
  }

  function validate(): PickupFormErrors {
    const next: PickupFormErrors = {}
    if (!selectedOrderId || selectedLineItems.length === 0) {
      next.items = t('returns.validation.itemsRequired')
    }
    if (!reason) next.reason = t('returns.validation.reasonRequired')
    if (!pickup.governorateId.trim()) {
      next.governorateId = t('returns.validation.governorateRequired')
    }
    if (!pickup.districtId.trim()) {
      next.districtId = t('returns.validation.cityRequired')
    }
    if (!pickup.addressLine.trim() || pickup.addressLine.trim().length < 6) {
      next.addressLine = t('returns.validation.addressRequired')
    }
    if (proofRequired && proofImages.length === 0) {
      next.proofImages = t('returns.validation.proofRequired')
    }
    return next
  }

  async function handleSubmit() {
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t('returns.invalidForm'), t('returns.fillRequired'))
      return
    }

    const governorate = governorates.find((entry) => entry._id === pickup.governorateId)
    const district = districts.find((entry) => entry._id === pickup.districtId)
    const governorateName = governorate?.name ?? ''

    setSubmitting(true)
    try {
      if (usingPreviewData) {
        setSubmitted(true)
        toast.success(t('returns.submitSuccess'))
        setSelectedItems({})
        setSelectedOrderId(null)
        setReason('')
        setNote('')
        setProofImages([])
        setPickup(emptyPickup)
        setUseSavedAddress(false)
        return
      }

      await createReturnRequest({
        orderId: selectedOrderId!,
        items: selectedLineItems.map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
        })),
        reason: reason as ReturnReason,
        note: note.trim() || undefined,
        contactPhone: phone.trim() || undefined,
        pickupAddress: {
          firstLine: pickup.addressLine.trim(),
          city: governorateName,
          governorateName,
          governorateId: pickup.governorateId,
          districtId: pickup.districtId,
          districtName:
            pickup.districtId === 'other'
              ? t('returns.otherDistrict')
              : district?.name,
        },
        proofImages,
      })

      setSubmitted(true)
      toast.success(t('returns.submitSuccess'))
      setSelectedItems({})
      setSelectedOrderId(null)
      setReason('')
      setNote('')
      setProofImages([])
      setPickup(emptyPickup)
      setUseSavedAddress(false)

      const refreshed = await getEligibleReturnOrders({ limit: 50 })
      const resolved = resolveEligibleOrdersOrPreview(refreshed.data)
      setOrders(resolved.orders)
      setUsingPreviewData(resolved.usingPreview)
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t('returns.submitFailed')
      toast.error(t('returns.submitFailed'), message)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    isAuthenticated,
    loginPath: LOGIN_PATH,
    loading,
    loadError,
    orders,
    ordersByDate,
    expandedDates,
    toggleDate,
    formatOrderDate,
    shortOrderCode,
    selectedOrderId,
    selectedItems,
    toggleItem,
    updateItemQuantity,
    selectedLineItems,
    reason,
    setReason: (value: ReturnReason | '') => {
      setReason(value)
      setErrors((current) => ({ ...current, reason: undefined, proofImages: undefined }))
    },
    reasonOptions: RETURN_REASONS,
    note,
    setNote,
    proofImages,
    proofRequired,
    handleProofFiles,
    removeProofFile,
    pickup,
    updatePickupField,
    pickupErrors: errors,
    governorates,
    districts,
    hasDistricts,
    useSavedAddress,
    handleUseSavedAddress,
    savedAddressLabel,
    hasSavedAddress: Boolean(primaryAddress),
    addressesLoading,
    submitting,
    submitted,
    usingPreviewData,
    handleSubmit,
  }
}
