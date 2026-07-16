// src/components/returns/ReturnsPageContent.tsx
import {
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Globe2,
  Image,
  Info,
} from 'lucide-react'
import { useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'
import { RETURNS_HISTORY_PATH, SHOP_PATH } from '../../config/routes'
import { useReturnsPage } from '../../hooks/useReturnsPage'
import { cn } from '../../lib/cn'
import { formatCartPrice } from '../../utils/formatProductPrice'
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  resolveProductImageUrl,
} from '../../utils/productImage'
import { FormMessage } from '../auth/FormMessage'
import { Footer } from '../landing/footer/Footer'
import { Button } from '../ui/Button'
import { focusRingClasses } from '../ui/interactionStyles'
import { InputField } from '../ui/InputField'
import { SelectField } from '../ui/SelectField'
import { TextAreaField } from '../ui/TextAreaField'
import { ReturnsStepper } from './ReturnsStepper'

function ReturnsSkeleton() {
  return (
    <div className="returns-layout" aria-hidden>
      <div className="h-80 animate-pulse rounded-2xl bg-surface-muted" />
      <div className="h-80 animate-pulse rounded-2xl bg-surface-muted" />
      <div className="h-80 animate-pulse rounded-2xl bg-surface-muted" />
    </div>
  )
}

export function ReturnsPageContent() {
  const { t } = useTranslation()
  const proofInputId = useId()
  const proofInputRef = useRef<HTMLInputElement>(null)
  const {
    isAuthenticated,
    loginPath,
    loading,
    loadError,
    orders,
    ordersByDate,
    expandedDates,
    toggleDate,
    shortOrderCode,
    selectedOrderId,
    selectedItems,
    toggleItem,
    updateItemQuantity,
    reason,
    setReason,
    reasonOptions,
    note,
    setNote,
    proofImages,
    proofRequired,
    handleProofFiles,
    removeProofFile,
    pickup,
    updatePickupField,
    pickupErrors,
    governorates,
    districts,
    hasDistricts,
    useSavedAddress,
    handleUseSavedAddress,
    savedAddressLabel,
    hasSavedAddress,
    submitting,
    submitted,
    handleSubmit,
  } = useReturnsPage()

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />
  }

  return (
    <>
      <div className="container-content returns-page">
        <ReturnsStepper currentStep={submitted ? 'approval' : 'request'} />

        {loadError && (
          <div className="mb-6">
            <FormMessage message={loadError} />
          </div>
        )}

        {submitted && (
          <div className="mb-6 space-y-3">
            <FormMessage message={t('returns.submitSuccessDetail')} type="success" />
            <Link
              to={RETURNS_HISTORY_PATH}
              className={cn(
                'inline-flex text-sm font-medium text-link underline-offset-2 hover:underline',
                focusRingClasses,
              )}
            >
              {t('returns.viewHistory')}
            </Link>
          </div>
        )}

        {loading ? (
          <ReturnsSkeleton />
        ) : orders.length === 0 ? (
          <div className="returns-empty">
            <h2>{t('returns.emptyTitle')}</h2>
            <p>{t('returns.emptyMessage')}</p>
            <div className="mt-5">
              <Link
                to={SHOP_PATH}
                className={cn(
                  'inline-flex min-h-11 items-center justify-center rounded-xl bg-button-primary px-6 text-sm font-medium text-on-emphasis',
                  focusRingClasses,
                )}
              >
                {t('returns.browseShop')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="returns-layout">
            <section className="returns-panel" aria-labelledby="returns-select-title">
              <div className="returns-panel-header">
                <h2 id="returns-select-title" className="returns-panel-title">
                  {t('returns.selectItems')}
                </h2>
                <p className="returns-panel-subtitle">
                  {selectedOrderId
                    ? t('returns.selectItemsSubtitleOrder', {
                        order: shortOrderCode(selectedOrderId),
                      })
                    : t('returns.selectItemsSubtitle')}
                </p>
              </div>

              {pickupErrors.items && (
                <p className="text-xs text-support-error" role="alert">
                  {pickupErrors.items}
                </p>
              )}

              <div className="returns-order-list">
                {ordersByDate.map(([dateKey, dateOrders]) => {
                  const expanded = expandedDates[dateKey] ?? false
                  return (
                    <div key={dateKey} className="returns-order-group">
                      <button
                        type="button"
                        className={cn('returns-order-group-toggle', focusRingClasses)}
                        onClick={() => toggleDate(dateKey)}
                        aria-expanded={expanded}
                      >
                        <span>{dateKey}</span>
                        {expanded ? (
                          <ChevronUp size={18} aria-hidden />
                        ) : (
                          <ChevronDown size={18} aria-hidden />
                        )}
                      </button>

                      {expanded && (
                        <div className="returns-order-group-body">
                          {dateOrders.map((order) =>
                            order.items.map((item) => {
                              const selectedQty = selectedItems[item.orderItemId] ?? 0
                              const selected = selectedQty > 0
                              const disabled =
                                item.returnableQuantity <= 0 ||
                                (Boolean(selectedOrderId) &&
                                  selectedOrderId !== order._id &&
                                  !selected)
                              const imageSrc =
                                resolveProductImageUrl(item.image) ||
                                PRODUCT_IMAGE_PLACEHOLDER

                              return (
                                <article
                                  key={`${order._id}-${item.orderItemId}`}
                                  className={cn(
                                    'returns-item-card',
                                    selected && 'returns-item-card--selected',
                                    disabled && 'returns-item-card--disabled',
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    className="returns-item-check"
                                    checked={selected}
                                    disabled={disabled}
                                    onChange={() =>
                                      toggleItem(
                                        order._id,
                                        item.orderItemId,
                                        item.returnableQuantity,
                                      )
                                    }
                                    aria-label={t('returns.selectProduct', {
                                      name: item.name,
                                    })}
                                  />
                                  <img
                                    src={imageSrc}
                                    alt=""
                                    className="returns-item-image"
                                    loading="lazy"
                                    onError={(event) => {
                                      event.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER
                                    }}
                                  />
                                  <div className="min-w-0">
                                    <p className="returns-item-name">{item.name}</p>
                                    {selected && item.returnableQuantity > 1 && (
                                      <div className="returns-item-qty">
                                        <button
                                          type="button"
                                          aria-label={t('returns.decreaseQty')}
                                          onClick={() =>
                                            updateItemQuantity(
                                              item.orderItemId,
                                              selectedQty - 1,
                                              item.returnableQuantity,
                                            )
                                          }
                                        >
                                          −
                                        </button>
                                        <span>{selectedQty}</span>
                                        <button
                                          type="button"
                                          aria-label={t('returns.increaseQty')}
                                          onClick={() =>
                                            updateItemQuantity(
                                              item.orderItemId,
                                              selectedQty + 1,
                                              item.returnableQuantity,
                                            )
                                          }
                                        >
                                          +
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <span className="returns-item-price">
                                    {formatCartPrice(item.price)}
                                  </span>
                                </article>
                              )
                            }),
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <aside className="returns-assistance" aria-label={t('returns.needAssistance')}>
                <h3 className="returns-assistance-title">{t('returns.needAssistance')}</h3>
                <ul className="returns-assistance-list">
                  <li>
                    <span>
                      <Info size={16} strokeWidth={1.5} aria-hidden />
                      {t('returns.help.eligibility')}
                    </span>
                  </li>
                  <li>
                    <span>
                      <Globe2 size={16} strokeWidth={1.5} aria-hidden />
                      {t('returns.help.international')}
                    </span>
                  </li>
                  <li>
                    <span>
                      <FlaskConical size={16} strokeWidth={1.5} aria-hidden />
                      {t('returns.help.medical')}
                    </span>
                  </li>
                </ul>
              </aside>
            </section>

            <section className="returns-panel" aria-labelledby="returns-reason-title">
              <div className="returns-panel-header">
                <h2 id="returns-reason-title" className="returns-panel-title">
                  {t('returns.reasonTitle')}
                </h2>
                <p className="returns-panel-subtitle">{t('returns.reasonSubtitle')}</p>
              </div>

              <div className="returns-form-stack">
                <SelectField
                  label={t('returns.selectReason')}
                  name="reason"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value as typeof reason)
                  }
                  error={pickupErrors.reason}
                  required
                >
                  <option value="" disabled>
                    {t('returns.reasonPlaceholder')}
                  </option>
                  {reasonOptions.map((option) => (
                    <option key={option} value={option}>
                      {t(`returns.reasons.${option}`)}
                    </option>
                  ))}
                </SelectField>

                <TextAreaField
                  label={t('returns.medicalNote')}
                  name="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={t('returns.medicalNotePlaceholder')}
                />

                <div>
                  <span className="returns-field-label">
                    {t('returns.clinicalProof')}
                    {proofRequired ? ` *` : ''}
                  </span>
                  <input
                    ref={proofInputRef}
                    id={proofInputId}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                      handleProofFiles(event.target.files)
                      event.target.value = ''
                    }}
                  />
                  <button
                    type="button"
                    className={cn('returns-upload', focusRingClasses)}
                    onClick={() => proofInputRef.current?.click()}
                  >
                    <Image size={28} strokeWidth={1.5} aria-hidden className="text-button-primary" />
                    <span className="returns-upload-title">{t('returns.uploadTitle')}</span>
                    <span className="returns-upload-hint">{t('returns.uploadHint')}</span>
                  </button>
                  {pickupErrors.proofImages && (
                    <p className="mt-2 text-xs text-support-error" role="alert">
                      {pickupErrors.proofImages}
                    </p>
                  )}
                  {proofImages.length > 0 && (
                    <ul className="returns-proof-list">
                      {proofImages.map((file, index) => (
                        <li key={`${file.name}-${index}`} className="returns-proof-chip">
                          <span className="truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeProofFile(index)}
                            aria-label={t('returns.removeImage')}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>

            <section className="returns-panel" aria-labelledby="returns-pickup-title">
              <div className="returns-panel-header">
                <h2 id="returns-pickup-title" className="returns-panel-title">
                  {t('returns.pickupTitle')}
                </h2>
                <p className="returns-panel-subtitle">{t('returns.pickupSubtitle')}</p>
              </div>

              <div className="returns-pickup-card">
                <span className="returns-field-label">{t('returns.pickupAddress')}</span>

                <div className="returns-pickup-row">
                  <SelectField
                    label={t('returns.city')}
                    name="governorateId"
                    value={pickup.governorateId}
                    onChange={(event) =>
                      updatePickupField('governorateId', event.target.value)
                    }
                    error={pickupErrors.governorateId}
                    required
                  >
                    <option value="" disabled>
                      {t('returns.cityPlaceholder')}
                    </option>
                    {governorates.map((governorate) => (
                      <option key={governorate._id} value={governorate._id}>
                        {governorate.name}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    label={t('returns.community')}
                    name="districtId"
                    value={pickup.districtId}
                    onChange={(event) =>
                      updatePickupField('districtId', event.target.value)
                    }
                    error={pickupErrors.districtId}
                    required
                    disabled={!pickup.governorateId}
                  >
                    <option value="" disabled>
                      {t('returns.communityPlaceholder')}
                    </option>
                    {hasDistricts ? (
                      <>
                        {districts.map((district) => (
                          <option key={district._id} value={district._id}>
                            {district.name}
                          </option>
                        ))}
                        <option value="other">{t('returns.otherDistrict')}</option>
                      </>
                    ) : (
                      <option value="other">{t('returns.otherDistrict')}</option>
                    )}
                  </SelectField>
                </div>

                <InputField
                  label={t('returns.address')}
                  name="addressLine"
                  value={pickup.addressLine}
                  onChange={(event) =>
                    updatePickupField('addressLine', event.target.value)
                  }
                  placeholder={t('returns.addressPlaceholder')}
                  error={pickupErrors.addressLine}
                  required
                />
              </div>

              {hasSavedAddress && (
                <label className="returns-saved-address">
                  <input
                    type="checkbox"
                    checked={useSavedAddress}
                    onChange={(event) =>
                      handleUseSavedAddress(event.target.checked)
                    }
                  />
                  <span>
                    {t('returns.shipToSaved', { address: savedAddressLabel })}
                  </span>
                </label>
              )}

              <Button
                type="button"
                variant="primary"
                fullWidth
                className="returns-submit-btn"
                disabled={submitting}
                onClick={() => void handleSubmit()}
              >
                {submitting ? t('returns.submitting') : t('returns.submit')}
              </Button>
            </section>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
