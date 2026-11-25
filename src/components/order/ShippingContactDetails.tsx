// src/components/order/ShippingContactDetails.tsx
import { MapPin, Phone, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface ShippingContactDetailsProps {
  name: string
  phone?: string
  addressLines: string[]
}

function DetailRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="shipping-detail-row">
      <span className="shipping-detail-icon" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="shipping-detail-label">{label}</p>
        <div className="shipping-detail-value">{children}</div>
      </div>
    </div>
  )
}

/** Labelled recipient / phone / address rows so each detail is clear at a glance. */
export function ShippingContactDetails({ name, phone, addressLines }: ShippingContactDetailsProps) {
  const { t } = useTranslation()

  return (
    <div className="shipping-details">
      <DetailRow icon={<User size={16} strokeWidth={1.75} />} label={t('checkout.confirmation.recipientLabel')}>
        <p className="shipping-detail-name">{name}</p>
      </DetailRow>
      {phone ? (
        <DetailRow icon={<Phone size={16} strokeWidth={1.75} />} label={t('checkout.confirmation.phoneLabel')}>
          <p dir="ltr" className="text-start">
            {phone}
          </p>
        </DetailRow>
      ) : null}
      <DetailRow icon={<MapPin size={16} strokeWidth={1.75} />} label={t('checkout.confirmation.addressLabel')}>
        {addressLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </DetailRow>
    </div>
  )
}
