// src/components/checkout/PaymentMethodSection.tsx
import { Banknote, CreditCard, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { MY_ACCOUNT_PATH } from '../../config/routes'
import type { usePaymentPage } from '../../hooks/usePaymentPage'
import { cn } from '../../lib/cn'
import { FormMessage } from '../auth/FormMessage'
import { SavedAddressCard } from '../account/SavedAddressCard'
import { Button } from '../ui/Button'
import { InputField } from '../ui/InputField'
import { SelectField } from '../ui/SelectField'
import { TextAreaField } from '../ui/TextAreaField'
import { focusRingClasses } from '../ui/interactionStyles'
import { PaymentMethodCard } from './PaymentMethodCard'

type PaymentPageState = ReturnType<typeof usePaymentPage>

interface PaymentMethodSectionProps {
  phone: PaymentPageState['phone']
  addresses: PaymentPageState['addresses']
  selectedAddressId: PaymentPageState['selectedAddressId']
  addressLoading: PaymentPageState['addressLoading']
  addressLoadError: PaymentPageState['addressLoadError']
  retryAddresses: PaymentPageState['retryAddresses']
  selectAddress: PaymentPageState['selectAddress']
  showNewAddressForm: PaymentPageState['showNewAddressForm']
  openNewAddressForm: PaymentPageState['openNewAddressForm']
  showSavedAddresses: PaymentPageState['showSavedAddresses']
  newAddressForm: PaymentPageState['newAddressForm']
  newAddressErrors: PaymentPageState['newAddressErrors']
  updateNewAddressField: PaymentPageState['updateNewAddressField']
  handleCreateAddress: PaymentPageState['handleCreateAddress']
  savingAddress: PaymentPageState['savingAddress']
  governorates: PaymentPageState['governorates']
  districts: PaymentPageState['districts']
  hasDistricts: PaymentPageState['hasDistricts']
  paymentMethod: PaymentPageState['paymentMethod']
  setPaymentMethod: PaymentPageState['setPaymentMethod']
  enabledPaymentMethods: PaymentPageState['enabledPaymentMethods']
  className?: string
}

export function PaymentMethodSection({
  phone,
  addresses,
  selectedAddressId,
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
  handleCreateAddress,
  savingAddress,
  governorates,
  districts,
  hasDistricts,
  paymentMethod,
  setPaymentMethod,
  enabledPaymentMethods,
  className,
}: PaymentMethodSectionProps) {
  const { t } = useTranslation()
  const phoneDisplay = phone?.trim() || t('checkout.payment.notSet')
  const hasSavedAddresses = addresses.length > 0
  const addressMode = showNewAddressForm || !hasSavedAddresses ? 'new' : 'saved'

  return (
    <section
      aria-label={t('checkout.payment.methodsAria')}
      className={cn('payment-method-section', className)}
    >
      <p className="payment-phone-line">
        <span className="payment-phone-line-text">
          {t('checkout.payment.phoneNumber', { phone: phoneDisplay })}
        </span>{' '}
        <Link
          to={MY_ACCOUNT_PATH}
          className={cn('payment-inline-link', focusRingClasses, 'rounded-sm')}
        >
          {t('checkout.payment.changePhone')}
        </Link>
      </p>

      <div className="payment-shipping-section" aria-label={t('checkout.payment.shippingAria')}>
        <div className="payment-shipping-header">
          <h3 className="payment-shipping-title">{t('checkout.payment.shippingTitle')}</h3>

          {hasSavedAddresses ? (
            <div
              className="payment-address-mode"
              role="tablist"
              aria-label={t('checkout.payment.addressModeAria')}
            >
              <button
                type="button"
                role="tab"
                aria-selected={addressMode === 'saved'}
                className={cn(
                  'payment-address-mode__tab',
                  addressMode === 'saved' && 'payment-address-mode__tab--active',
                  focusRingClasses,
                )}
                onClick={showSavedAddresses}
              >
                {t('checkout.payment.savedAddresses')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={addressMode === 'new'}
                className={cn(
                  'payment-address-mode__tab',
                  addressMode === 'new' && 'payment-address-mode__tab--active',
                  focusRingClasses,
                )}
                onClick={openNewAddressForm}
              >
                {t('checkout.payment.newAddress')}
              </button>
            </div>
          ) : null}
        </div>

        {addressLoading ? (
          <div className="payment-address-grid" aria-hidden>
            <div className="h-24 animate-pulse rounded-xl bg-surface-muted" />
            <div className="h-24 animate-pulse rounded-xl bg-surface-muted" />
          </div>
        ) : addressLoadError ? (
          <div className="space-y-3" role="alert">
            <FormMessage message={addressLoadError || t('profile.addresses.loadFailed')} />
            <Button type="button" variant="outline" onClick={() => void retryAddresses()}>
              {t('cart.retry')}
            </Button>
          </div>
        ) : addressMode === 'saved' ? (
          <div className="payment-address-grid">
            {addresses.map((address) => (
              <SavedAddressCard
                key={address._id}
                address={address}
                selected={selectedAddressId === address._id}
                density="compact"
                showActions={false}
                onSelect={() => selectAddress(address._id)}
              />
            ))}
          </div>
        ) : (
          <div className="payment-billing-panel">
            {!hasSavedAddresses ? (
              <p className="payment-new-address-hint">
                {t('checkout.payment.newAddressHint')}
              </p>
            ) : null}
            <div className="payment-billing-fields">
              <InputField
                label={t('checkout.address.label')}
                name="label"
                value={newAddressForm.label}
                onChange={(event) => updateNewAddressField('label', event.target.value)}
                placeholder={t('checkout.address.labelPlaceholder')}
                error={newAddressErrors.label}
                className="payment-field-input"
              />

              <SelectField
                label={t('checkout.payment.government')}
                name="governorateId"
                value={newAddressForm.governorateId}
                onChange={(event) =>
                  updateNewAddressField('governorateId', event.target.value)
                }
                error={newAddressErrors.governorateId}
                required
                className="payment-field-input"
              >
                <option value="" disabled>
                  {t('checkout.payment.govPlaceholder')}
                </option>
                {governorates.map((governorate) => (
                  <option key={governorate._id} value={governorate._id}>
                    {governorate.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label={t('checkout.payment.city')}
                name="districtId"
                value={newAddressForm.districtId}
                onChange={(event) =>
                  updateNewAddressField('districtId', event.target.value)
                }
                error={newAddressErrors.districtId}
                required
                disabled={!newAddressForm.governorateId}
                className="payment-field-input"
              >
                <option value="" disabled>
                  {t('checkout.payment.cityPlaceholder')}
                </option>
                {hasDistricts ? (
                  <>
                    {districts.map((district) => (
                      <option key={district._id} value={district._id}>
                        {district.name}
                      </option>
                    ))}
                    <option value="other">{t('checkout.payment.other')}</option>
                  </>
                ) : (
                  <option value="other">{t('checkout.payment.other')}</option>
                )}
              </SelectField>

              <TextAreaField
                label={t('checkout.payment.address')}
                name="addressLine"
                value={newAddressForm.addressLine}
                onChange={(event) =>
                  updateNewAddressField('addressLine', event.target.value)
                }
                placeholder={t('checkout.payment.addressPlaceholder')}
                error={newAddressErrors.addressLine}
                required
                className="payment-field-input payment-field-textarea"
              />
            </div>

            <Button
              type="button"
              variant="primary"
              fullWidth
              className="mt-4"
              disabled={savingAddress}
              onClick={() => void handleCreateAddress()}
            >
              {savingAddress
                ? t('checkout.address.saving')
                : t('checkout.address.save')}
            </Button>
          </div>
        )}
      </div>

      <div className="payment-methods-block">
        <h3 className="payment-methods-title">{t('checkout.payment.methodsTitle')}</h3>
        {enabledPaymentMethods.length === 0 ? (
          <p className="payment-methods-empty" role="status">
            {t('checkout.payment.noMethodsAvailable')}
          </p>
        ) : (
          <div
            className="payment-method-options"
            role="radiogroup"
            aria-label={t('checkout.payment.methodsAria')}
          >
            {enabledPaymentMethods.includes('stripe') ? (
              <PaymentMethodCard
                selected={paymentMethod === 'stripe'}
                onSelect={() => setPaymentMethod('stripe')}
                label={t('checkout.payment.stripe')}
                icon={<CreditCard strokeWidth={1.75} />}
              />
            ) : null}

            {enabledPaymentMethods.includes('paymob') ? (
              <PaymentMethodCard
                selected={paymentMethod === 'paymob'}
                onSelect={() => setPaymentMethod('paymob')}
                label={t('checkout.payment.paymob')}
                icon={<Wallet strokeWidth={1.75} />}
              />
            ) : null}

            {enabledPaymentMethods.includes('cod') ? (
              <PaymentMethodCard
                selected={paymentMethod === 'cod'}
                onSelect={() => setPaymentMethod('cod')}
                label={t('checkout.payment.cod')}
                icon={<Banknote strokeWidth={1.75} />}
              />
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
