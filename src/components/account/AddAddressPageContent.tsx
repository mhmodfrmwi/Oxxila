// src/components/account/AddAddressPageContent.tsx
import { X } from 'lucide-react'
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
  const {
    isAuthenticated,
    loginPath,
    userName,
    phone,
    form,
    errors,
    addresses,
    governorates,
    cityOptions,
    selectedAddressId,
    loading,
    submitting,
    deletingId,
    submitError,
    submitSuccess,
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
            { label: 'Home', href: HOME_PATH },
            { label: 'My Account', href: MY_ACCOUNT_PATH },
            { label: 'Addresses', href: ADDRESSES_PATH },
            { label: 'Add Address' },
          ]}
        />

        <header className="mb-6 sm:mb-8">
          <Heading variant="page" className="text-center sm:text-left">
            Add New Address
          </Heading>
        </header>

        {loading ? (
          <AddAddressSkeleton />
        ) : (
          <div className="add-address-card relative mx-auto w-full max-w-2xl">
            <button
              type="button"
              className={cn('add-address-close absolute right-4 top-4 sm:right-5 sm:top-5', focusRingClasses)}
              onClick={handleClose}
              aria-label="Close add address"
            >
              <X size={18} strokeWidth={1.5} aria-hidden />
            </button>

            <Heading variant="card" as="h2" className="mb-6 pr-12 text-center font-serif text-2xl sm:text-[1.75rem]">
              Add Address
            </Heading>

            {submitError && (
              <div className="mb-4">
                <FormMessage message={submitError} />
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
              <SelectField
                label="City"
                name="city"
                value={form.city}
                onChange={(event) => updateField('city', event.target.value)}
                error={errors.city}
                required
              >
                <option value="" disabled>
                  Select city
                </option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
                {governorates.map((governorate) => (
                  <option key={governorate._id} value={governorate.name}>
                    {governorate.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Government"
                name="government"
                value={form.government}
                onChange={(event) => updateField('government', event.target.value)}
                error={errors.government}
                required
              >
                <option value="" disabled>
                  Your Gov.
                </option>
                {governorates.map((governorate) => (
                  <option key={governorate._id} value={governorate.name}>
                    {governorate.name}
                  </option>
                ))}
              </SelectField>

              <TextAreaField
                label="Address"
                name="address"
                value={form.address}
                onChange={(event) => updateField('address', event.target.value)}
                placeholder="Street address, building, floor, apartment"
                error={errors.address}
                required
              />

              {addresses.length > 0 && (
                <>
                  <div className="add-address-divider" aria-hidden>
                    <span>Or</span>
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
                {submitting ? 'Saving...' : editingAddressId ? 'Update' : 'Save'}
              </Button>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
