// src/components/account/AddAddressPageContent.tsx
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import {
  ADDRESSES_PATH,
  HOME_PATH,
  MY_ACCOUNT_PATH,
} from '../../config/routes'
import { useAddAddressPage } from '../../hooks/useAddAddressPage'
import { cn } from '../../lib/cn'
import { Breadcrumb } from '../ui/Breadcrumb'
import { Button } from '../ui/Button'
import { Footer } from '../landing/footer/Footer'
import { FormMessage } from '../auth/FormMessage'
import { Heading } from '../ui/Heading'
import { InputField } from '../ui/InputField'
import { SelectField } from '../ui/SelectField'
import { TextAreaField } from '../ui/TextAreaField'
import { focusRingClasses } from '../ui/interactionStyles'
import { SavedAddressCard } from './SavedAddressCard'

function AddAddressSkeleton() {
  return (
    <div className="add-address-card mx-auto max-w-2xl space-y-5" aria-hidden>
      <div className="h-8 w-40 animate-pulse rounded-lg bg-surface-muted" />
      <div className="h-12 animate-pulse rounded-xl bg-surface-muted" />
      <div className="h-12 animate-pulse rounded-xl bg-surface-muted" />
      <div className="h-28 animate-pulse rounded-xl bg-surface-muted" />
      <div className="h-12 animate-pulse rounded-full bg-surface-muted" />
    </div>
  )
}

export function AddAddressPageContent() {
  const { t } = useTranslation()
  const {
    isAuthenticated,
    loginPath,
    userName,
    phone,
    form,
    errors,
    addresses,
    governorates,
    districts,
    hasDistricts,
    selectedAddressId,
    loading,
    submitting,
    deletingId,
    submitError,
    submitSuccess,
    zonesError,
    updateField,
    handleSave,
    handleDelete,
    handleSelectAddress,
    handleClose,
    startEdit,
    editingAddressId,
  } = useAddAddressPage()

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />
  }

  function handleEditAddress(addressId: string) {
    const entry = addresses.find((item) => item._id === addressId)
    if (!entry) return
    startEdit(entry)
  }

  return (
    <>
      <div className="container-content pb-8 sm:pb-10">
        <Breadcrumb
          className="mb-5 sm:mb-6"
          items={[
            { label: t('nav.home'), href: HOME_PATH },
            { label: t('checkout.address.myAccount'), href: MY_ACCOUNT_PATH },
            { label: t('checkout.address.addresses'), href: ADDRESSES_PATH },
            { label: t('checkout.address.addAddress') },
          ]}
        />

        <header className="mb-6 sm:mb-8">
          <Heading variant="page" className="text-center sm:text-start">
            {t('checkout.address.pageTitle')}
          </Heading>
        </header>

        {loading ? (
          <AddAddressSkeleton />
        ) : (
          <div className="add-address-card relative mx-auto w-full max-w-2xl">
            <button
              type="button"
              className={cn(
                'add-address-close absolute end-4 top-4 sm:end-5 sm:top-5',
                focusRingClasses,
              )}
              onClick={handleClose}
              aria-label={t('checkout.address.close')}
            >
              <X size={18} strokeWidth={1.5} aria-hidden />
            </button>

            <Heading
              variant="card"
              as="h2"
              className="mb-6 pe-12 text-center font-serif text-2xl sm:text-[1.75rem]"
            >
              {t('checkout.address.cardTitle')}
            </Heading>

            {submitError && (
              <div className="mb-4">
                <FormMessage message={submitError} />
              </div>
            )}
            {!submitError && zonesError && (
              <div className="mb-4">
                <FormMessage message={zonesError} />
              </div>
            )}
            {submitSuccess && (
              <div className="mb-4">
                <FormMessage message={submitSuccess} type="success" />
              </div>
            )}

            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                void handleSave()
              }}
              noValidate
            >
              <InputField
                label={t('checkout.address.label')}
                name="label"
                value={form.label}
                onChange={(event) => updateField('label', event.target.value)}
                placeholder={t('checkout.address.labelPlaceholder')}
                error={errors.label}
              />
              <InputField
                label={t('checkout.payment.phoneLabel')}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder={t('checkout.payment.phonePlaceholder')}
                error={errors.phone}
              />

              <SelectField
                label={t('checkout.address.government')}
                name="governorateId"
                value={form.governorateId}
                onChange={(event) => updateField('governorateId', event.target.value)}
                error={errors.governorateId}
                required
              >
                <option value="" disabled>
                  {t('checkout.address.yourGov')}
                </option>
                {governorates.map((governorate) => (
                  <option key={governorate._id} value={governorate._id}>
                    {governorate.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label={t('checkout.address.city')}
                name="districtId"
                value={form.districtId}
                onChange={(event) => updateField('districtId', event.target.value)}
                error={errors.districtId}
                required
                disabled={!form.governorateId}
              >
                <option value="" disabled>
                  {t('checkout.address.selectCity')}
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
                label={t('checkout.address.address')}
                name="addressLine"
                value={form.addressLine}
                onChange={(event) => updateField('addressLine', event.target.value)}
                placeholder={t('checkout.address.addressPlaceholder')}
                error={errors.addressLine}
                required
              />

              {addresses.length > 0 && (
                <>
                  <div className="add-address-divider" aria-hidden>
                    <span>{t('checkout.address.or')}</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((entry) => (
                      <SavedAddressCard
                        key={entry._id}
                        address={entry}
                        name={userName}
                        phone={phone}
                        selected={selectedAddressId === entry._id}
                        deleting={deletingId === entry._id}
                        onSelect={() => handleSelectAddress(entry._id)}
                        onEdit={() => handleEditAddress(entry._id)}
                        onDelete={() => void handleDelete(entry._id)}
                      />
                    ))}
                  </div>
                </>
              )}

              <Button
                type="submit"
                variant="primary"
                pill
                fullWidth
                className="add-address-save-btn mt-2"
                disabled={submitting}
              >
                {submitting
                  ? t('checkout.address.saving')
                  : editingAddressId
                    ? t('checkout.address.update')
                    : t('checkout.address.save')}
              </Button>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
