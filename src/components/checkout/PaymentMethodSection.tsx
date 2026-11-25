// src/components/checkout/PaymentMethodSection.tsx
import { Banknote, CreditCard, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { usePaymentPage } from '../../hooks/usePaymentPage'
import { cn } from '../../lib/cn'
import { FormMessage } from '../auth/FormMessage'
import { Button } from '../ui/Button'
import { InputField } from '../ui/InputField'
import { SelectField } from '../ui/SelectField'
import { TextAreaField } from '../ui/TextAreaField'
import { AddressDropdown } from './AddressDropdown'
import { PaymentMethodCard } from './PaymentMethodCard'

type PaymentPageState = ReturnType<typeof usePaymentPage>

interface PaymentMethodSectionProps {
  addresses: PaymentPageState['addresses']
  selectedAddressId: PaymentPageState['selectedAddressId']
  addressLoading: PaymentPageState['addressLoading']
  addressLoadError: PaymentPageState['addressLoadError']
  retryAddresses: PaymentPageState['retryAddresses']
  selectAddress: PaymentPageState['selectAddress']
  showNewAddressForm: PaymentPageState['showNewAddressForm']
  openNewAddressForm: PaymentPageState['openNewAddressForm']
  newAddressForm: PaymentPageState['newAddressForm']
  newAddressErrors: PaymentPageState['newAddressErrors']
  updateNewAddressField: PaymentPageState['updateNewAddressField']
  governorates: PaymentPageState['governorates']
  districts: PaymentPageState['districts']
  hasDistricts: PaymentPageState['hasDistricts']
  paymentMethod: PaymentPageState['paymentMethod']
  setPaymentMethod: PaymentPageState['setPaymentMethod']
  enabledPaymentMethods: PaymentPageState['enabledPaymentMethods']
  className?: string
}

export function PaymentMethodSection({
  addresses,
  selectedAddressId,
  addressLoading,
  addressLoadError,
  retryAddresses,
  selectAddress,
  showNewAddressForm,
  openNewAddressForm,
  newAddressForm,
  newAddressErrors,
  updateNewAddressField,
  governorates,
  districts,
  hasDistricts,
  paymentMethod,
  setPaymentMethod,
  enabledPaymentMethods,
  className,
}: PaymentMethodSectionProps) {
  const { t } = useTranslation()
  const hasSavedAddresses = addresses.length > 0
  const formVisible = showNewAddressForm || !hasSavedAddresses

  return (
    <section
      aria-label={t('checkout.payment.methodsAria')}
      className={cn('payment-method-section', className)}
    >
      <div className="payment-shipping-section" aria-label={t('checkout.payment.shippingAria')}>
        <div className="payment-shipping-header">
          <h3 className="payment-shipping-title">{t('checkout.payment.shippingTitle')}</h3>
        </div>

        {addressLoading ? (
          <div className="space-y-3" aria-hidden>
            <div className="h-16 animate-pulse rounded-xl bg-surface-muted" />
          </div>
        ) : addressLoadError ? (
          <div className="space-y-3" role="alert">
            <FormMessage message={addressLoadError || t('profile.addresses.loadFailed')} />
            <Button type="button" variant="outline" onClick={() => void retryAddresses()}>
              {t('cart.retry')}
            </Button>
          </div>
        ) : (
          <>
            {/* Returning shoppers pick a saved address; first-timers get the form directly. */}
            {hasSavedAddresses ? (
              <AddressDropdown
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                addingNew={formVisible}
                onSelect={selectAddress}
                onAddNew={openNewAddressForm}
                className="mb-4"
              />
            ) : null}

            {formVisible ? (
              <div className="payment-billing-panel">
                {!hasSavedAddresses ? (
                  <p className="payment-new-address-hint">{t('checkout.payment.newAddressHint')}</p>
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

                  <InputField
                    label={t('checkout.payment.phoneLabel')}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                    value={newAddressForm.phone}
                    onChange={(event) => updateNewAddressField('phone', event.target.value)}
                    placeholder={t('checkout.payment.phonePlaceholder')}
                    error={newAddressErrors.phone}
                    required
                    className="payment-field-input"
                  />

                  <SelectField
                    label={t('checkout.payment.government')}
                    name="governorateId"
                    value={newAddressForm.governorateId}
                    onChange={(event) => updateNewAddressField('governorateId', event.target.value)}
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
                    onChange={(event) => updateNewAddressField('districtId', event.target.value)}
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
                    onChange={(event) => updateNewAddressField('addressLine', event.target.value)}
                    placeholder={t('checkout.payment.addressPlaceholder')}
                    error={newAddressErrors.addressLine}
                    required
                    className="payment-field-input payment-field-textarea"
                  />
                </div>

                {/* On by default; unchecking keeps this address for this order only. */}
                <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-primary-text">
                  <input
                    type="checkbox"
                    checked={newAddressForm.saveAddress}
                    onChange={(event) => updateNewAddressField('saveAddress', event.target.checked)}
                    className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-[var(--primary-button)]"
                  />
                  <span>
                    {t('checkout.payment.saveAddress')}
                    <span className="block text-xs text-secondary-text">
                      {t('checkout.payment.saveAddressHint')}
                    </span>
                  </span>
                </label>
              </div>
            ) : null}
          </>
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
                hint={t('checkout.payment.stripeHint')}
                method="stripe"
                icon={<CreditCard strokeWidth={1.6} />}
              />
            ) : null}

            {enabledPaymentMethods.includes('paymob') ? (
              <PaymentMethodCard
                selected={paymentMethod === 'paymob'}
                onSelect={() => setPaymentMethod('paymob')}
                label={t('checkout.payment.paymob')}
                hint={t('checkout.payment.paymobHint')}
                method="paymob"
                icon={<Wallet strokeWidth={1.6} />}
              />
            ) : null}

            {enabledPaymentMethods.includes('cod') ? (
              <PaymentMethodCard
                selected={paymentMethod === 'cod'}
                onSelect={() => setPaymentMethod('cod')}
                label={t('checkout.payment.cod')}
                hint={t('checkout.payment.codHint')}
                method="cod"
                icon={<Banknote strokeWidth={1.6} />}
              />
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
