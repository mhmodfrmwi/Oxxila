// src/components/admin/orders/B2BOrderDrawer.tsx
import { Loader2, Plus, Search, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAdminProducts } from '../../../api/admin/products'
import { useToast } from '../../../context/ToastContext'
import {
  useB2BOrderDrawer,
  type B2BOrderLineItem,
} from '../../../hooks/useB2BOrderDrawer'
import { cn } from '../../../lib/cn'
import type { ApiAdminOrder } from '../../../types/adminOrders'
import type { ApiProduct } from '../../../types/catalog'
import { focusRingClasses } from '../../ui/interactionStyles'
import { Drawer } from '../ui/Drawer'
import { Select } from '../ui/Select'

interface B2BOrderDrawerProps {
  open: boolean
  onClose: () => void
  onCreated: (order: ApiAdminOrder) => void
}

const fieldClass = cn(
  'w-full rounded-xl border border-white/10 bg-white/5 px-[13.6px] py-[10.4px]',
  'text-sm text-white placeholder:text-white/40',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

const labelClass = 'block text-xs font-medium leading-4 text-white/60'

function FieldError({ message }: { message?: string }) {
  const { t } = useTranslation()
  if (!message) return null
  return (
    <p className="mt-1 text-xs text-support-error">
      {t(`admin.orders.b2b.errors.${message}`, { defaultValue: message })}
    </p>
  )
}

function ProductSearchField({
  item,
  onSelect,
}: {
  item: B2BOrderLineItem
  onSelect: (product: { _id: string; name: string; stock?: number } | null) => void
}) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ApiProduct[]>([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const requestId = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const keyword = query.trim()
    if (!keyword) {
      setResults([])
      setSearching(false)
      return
    }
    const id = ++requestId.current
    setSearching(true)
    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await getAdminProducts({ keyword, limit: 8 })
          if (id !== requestId.current) return
          setResults(response.data ?? [])
        } catch {
          if (id !== requestId.current) return
          setResults([])
        } finally {
          if (id === requestId.current) setSearching(false)
        }
      })()
    }, 300)
    return () => window.clearTimeout(handle)
  }, [query])

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (item.productId) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-[13.6px] py-[10.4px]">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{item.productName}</p>
          {typeof item.productStock === 'number' ? (
            <p className="text-xs text-white/40">
              {t('admin.orders.b2b.stockHint', { stock: item.productStock })}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            'shrink-0 rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white',
            focusRingClasses,
          )}
          aria-label={t('actions.cancel')}
        >
          <X size={13} aria-hidden />
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={rootRef}>
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/30"
          aria-hidden
        />
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          placeholder={t('admin.orders.b2b.productSearchPlaceholder')}
          className={cn(fieldClass, 'ps-9')}
        />
      </div>
      {open && query.trim() ? (
        <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-[#151221] p-1 shadow-xl">
          {searching ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={14} className="animate-spin text-white/40" aria-hidden />
            </div>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-white/40">
              {t('admin.orders.b2b.productNotFound')}
            </p>
          ) : (
            results.map((product) => (
              <button
                key={product._id}
                type="button"
                onClick={() => {
                  onSelect({ _id: product._id, name: product.name, stock: product.stock })
                  setQuery('')
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm text-white/80 hover:bg-white/10"
              >
                <span className="truncate">{product.name}</span>
                {typeof product.stock === 'number' ? (
                  <span className="shrink-0 text-xs text-white/40">
                    {t('admin.orders.b2b.stockHint', { stock: product.stock })}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}

export function B2BOrderDrawer({ open, onClose, onCreated }: B2BOrderDrawerProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const formId = useId()

  const drawer = useB2BOrderDrawer({
    open,
    onCreated: (order) => {
      toast.success(t('admin.orders.b2b.success'))
      onCreated(order)
      onClose()
    },
  })

  const handleClose = () => {
    if (drawer.submitting) return
    onClose()
  }

  const footer = (
    <button
      type="submit"
      form={formId}
      disabled={drawer.submitting}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-2xl',
        'bg-gradient-to-r from-[#a394ff] to-[#8274d6] px-4 py-3.5',
        'text-sm font-bold text-white',
        'disabled:cursor-not-allowed disabled:opacity-50',
        focusRingClasses,
      )}
    >
      {drawer.submitting ? (
        <>
          <Loader2 size={13} className="animate-spin" aria-hidden />
          {t('admin.orders.b2b.submitting')}
        </>
      ) : (
        t('admin.orders.b2b.submit')
      )}
    </button>
  )

  return (
    <Drawer
      open={open}
      title={t('admin.orders.b2b.title')}
      description={t('admin.orders.b2b.subtitle')}
      onClose={handleClose}
      width="xl"
      footer={footer}
    >
      <form
        id={formId}
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault()
          void drawer.submit()
        }}
      >
        {drawer.submitError ? (
          <p
            className="rounded-xl border border-support-error/30 bg-support-error/10 px-4 py-3 text-sm text-support-error"
            role="alert"
          >
            {drawer.submitError}
          </p>
        ) : null}

        {/* Customer — free-text name (not linked to a registered User) */}
        <div>
          <label className={labelClass} htmlFor={`${formId}-customer`}>
            {t('admin.orders.b2b.customer')}
          </label>
          <input
            id={`${formId}-customer`}
            type="text"
            value={drawer.customerName}
            onChange={(event) => drawer.setCustomerName(event.target.value)}
            placeholder={t('admin.orders.b2b.customerNamePlaceholder', {
              defaultValue: 'Enter customer name...',
            })}
            className={cn(fieldClass, 'mt-2')}
            autoComplete="off"
          />
          <FieldError message={drawer.errors.customer} />
        </div>

        {/* Line items */}
        <div>
          <div className="flex items-center justify-between">
            <p className={labelClass}>{t('admin.orders.b2b.items')}</p>
            <button
              type="button"
              onClick={drawer.addItem}
              className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold text-[#a394ff] hover:opacity-80',
                focusRingClasses,
              )}
            >
              <Plus size={13} aria-hidden />
              {t('admin.orders.b2b.addItem')}
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-3">
            {drawer.items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <ProductSearchField
                    item={item}
                    onSelect={(product) => drawer.updateItemProduct(item.id, product)}
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[8px] uppercase text-white/30">
                        {t('admin.orders.b2b.quantity')}
                      </label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={item.quantity}
                        onChange={(event) =>
                          drawer.updateItemQuantity(item.id, event.target.value)
                        }
                        className={cn(fieldClass, 'mt-1')}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[8px] uppercase text-white/30">
                        {t('admin.orders.b2b.unitPriceOptional')}
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={item.unitPrice}
                        onChange={(event) =>
                          drawer.updateItemUnitPrice(item.id, event.target.value)
                        }
                        className={cn(fieldClass, 'mt-1')}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => drawer.removeItem(item.id)}
                  disabled={drawer.items.length <= 1}
                  aria-label={t('admin.orders.b2b.removeItemAria', { index: index + 1 })}
                  className={cn(
                    'shrink-0 rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white',
                    'disabled:cursor-not-allowed disabled:opacity-30',
                    focusRingClasses,
                  )}
                >
                  <X size={14} aria-hidden />
                </button>
              </div>
            ))}
          </div>
          <FieldError message={drawer.errors.items} />
        </div>

        {/* Address */}
        <div>
          <p className={labelClass}>{t('admin.orders.b2b.address')}</p>
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[8px] uppercase text-white/30">
                  {t('admin.orders.b2b.governorate')}
                </label>
                <Select
                  value={drawer.governorateId}
                  onValueChange={(next) => drawer.setGovernorateId(next)}
                  triggerClassName="mt-1"
                  placeholder={t('admin.orders.b2b.governoratePlaceholder')}
                  options={[
                    { value: '', label: t('admin.orders.b2b.governoratePlaceholder') },
                    ...drawer.governorates.map((gov) => ({
                      value: gov._id,
                      label: gov.name,
                    })),
                  ]}
                />
              </div>
              {drawer.hasDistricts ? (
                <div className="flex-1">
                  <label className="text-[8px] uppercase text-white/30">
                    {t('admin.orders.b2b.district')}
                  </label>
                  <Select
                    value={drawer.districtId}
                    disabled={!drawer.governorateId || drawer.zonesLoading}
                    onValueChange={(next) => drawer.setDistrictId(next)}
                    triggerClassName="mt-1"
                    placeholder={t('admin.orders.b2b.districtPlaceholder')}
                    options={[
                      { value: '', label: t('admin.orders.b2b.districtPlaceholder') },
                      ...drawer.districts.map((district) => ({
                        value: district._id,
                        label: district.name,
                      })),
                    ]}
                  />
                </div>
              ) : null}
            </div>
            <div>
              <label className="text-[8px] uppercase text-white/30">
                {t('admin.orders.b2b.addressLine')}
              </label>
              <textarea
                value={drawer.addressLine}
                onChange={(event) => drawer.setAddressLine(event.target.value)}
                rows={2}
                className={cn(fieldClass, 'mt-1 resize-none')}
              />
            </div>
          </div>
          <FieldError message={drawer.errors.address} />
        </div>

        {/* Coupon / free shipping / mark paid */}
        <div>
          <label className={labelClass} htmlFor={`${formId}-coupon`}>
            {t('admin.orders.b2b.couponCode')}
          </label>
          <input
            id={`${formId}-coupon`}
            type="text"
            value={drawer.couponCode}
            onChange={(event) => drawer.setCouponCode(event.target.value.toUpperCase())}
            className={cn(fieldClass, 'mt-2')}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm text-white">{t('admin.orders.b2b.freeShipping')}</span>
            <input
              type="checkbox"
              checked={drawer.freeShipping}
              onChange={(event) => drawer.setFreeShipping(event.target.checked)}
              className="size-4 accent-[#a394ff]"
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm text-white">{t('admin.orders.b2b.markPaid')}</span>
            <input
              type="checkbox"
              checked={drawer.markPaid}
              onChange={(event) => drawer.setMarkPaid(event.target.checked)}
              className="size-4 accent-[#a394ff]"
            />
          </label>
        </div>
      </form>
    </Drawer>
  )
}
