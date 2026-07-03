// src/components/checkout/PaymentMethodSection.tsx
import { Link } from 'react-router-dom'
import { ADD_ADDRESS_PATH } from '../../config/routes'
import type { usePaymentPage } from '../../hooks/usePaymentPage'
import { cn } from '../../lib/cn'
import { SelectField } from '../ui/SelectField'
import { TextAreaField } from '../ui/TextAreaField'
import { focusRingClasses } from '../ui/interactionStyles'
import { PaymentMethodCard } from './PaymentMethodCard'

type PaymentPageState = ReturnType<typeof usePaymentPage>

interface PaymentMethodSectionProps {
  phone: PaymentPageState['phone']
  governorates: PaymentPageState['governorates']
  districts: PaymentPageState['districts']
  hasDistricts: PaymentPageState['hasDistricts']
  billingForm: PaymentPageState['billingForm']
  billingErrors: PaymentPageState['billingErrors']
  paymentMethod: PaymentPageState['paymentMethod']
  setPaymentMethod: PaymentPageState['setPaymentMethod']
  billingSameAsShipping: PaymentPageState['billingSameAsShipping']
  handleBillingSameChange: PaymentPageState['handleBillingSameChange']
  updateBillingField: PaymentPageState['updateBillingField']
  className?: string
}

export function PaymentMethodSection({
  phone,
  governorates,
  districts,
  hasDistricts,
  billingForm,
  billingErrors,
  paymentMethod,
  setPaymentMethod,
  billingSameAsShipping,
  handleBillingSameChange,
  updateBillingField,
  className,
}: PaymentMethodSectionProps) {
  const phoneDisplay = phone?.trim() || 'Not set'

  return (
    <section
      aria-label="Payment methods"
      className={cn('payment-method-section', className)}
    >
      <div className="payment-billing-panel">
        <p className="payment-phone-line">
          <span className="payment-phone-line-text">Phone Number {phoneDisplay}</span>
          {' '}
          <Link
            to={ADD_ADDRESS_PATH}
            className={cn('payment-inline-link', focusRingClasses, 'rounded-sm')}
          >
            Change Address
          </Link>
        </p>

        <div className="payment-billing-fields">
          <SelectField
            label="City"
            name="city"
            value={billingForm.districtId}
            onChange={(event) => updateBillingField('districtId', event.target.value)}
            error={billingErrors.districtId}
            required
            className="payment-field-input"
          >
            <option value="" disabled>
              Your Number
            </option>
            {hasDistricts ? (
              <>
                {districts.map((district) => (
                  <option key={district._id} value={district._id}>
                    {district.name}
                  </option>
                ))}
                <option value="other">Other</option>
              </>
            ) : (
              governorates
                .filter((entry) => entry._id === billingForm.governorateId)
                .map((entry) => (
                  <option key={entry._id} value="other">
                    {entry.name}
                  </option>
                ))
            )}
          </SelectField>

          <SelectField
            label="Government"
            name="government"
            value={billingForm.governorateId}
            onChange={(event) => updateBillingField('governorateId', event.target.value)}
            error={billingErrors.governorateId}
            required
            className="payment-field-input"
          >
            <option value="" disabled>
              Your Gov.
            </option>
            {governorates.map((governorate) => (
              <option key={governorate._id} value={governorate._id}>
                {governorate.name}
              </option>
            ))}
          </SelectField>

          <TextAreaField
            label="Address"
            name="address"
            value={billingForm.addressLine}
            onChange={(event) => updateBillingField('addressLine', event.target.value)}
            placeholder="Your Number"
            error={billingErrors.addressLine}
            required
            className="payment-field-input payment-field-textarea"
          />
        </div>
      </div>

      <div className="payment-method-options">
        <PaymentMethodCard
          selected={paymentMethod === 'stripe'}
          onSelect={() => setPaymentMethod('stripe')}
          label="Stripe"
        />

        <PaymentMethodCard
          selected={paymentMethod === 'paymob'}
          onSelect={() => setPaymentMethod('paymob')}
          label="Paymob"
        />

        <PaymentMethodCard
          selected={paymentMethod === 'cod'}
          onSelect={() => setPaymentMethod('cod')}
          label="Cash on delivery"
        />
      </div>

      <label className="payment-billing-checkbox">
        <input
          type="checkbox"
          className="payment-billing-checkbox-input"
          checked={billingSameAsShipping}
          onChange={(event) => handleBillingSameChange(event.target.checked)}
        />
        <span className="payment-billing-checkbox-text">
          Billing address is the same as shipping address!!
          {' '}
          <Link
            to={ADD_ADDRESS_PATH}
            className={cn('payment-inline-link', focusRingClasses, 'rounded-sm')}
            onClick={(event) => event.stopPropagation()}
          >
            Change Address
          </Link>
        </span>
      </label>
    </section>
  )
}
