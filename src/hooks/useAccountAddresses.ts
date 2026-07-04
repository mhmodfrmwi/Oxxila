// src/hooks/useAccountAddresses.ts
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  deleteMyAddress,
  getMyAddresses,
  getUserProfile,
  type UserAddress,
} from '../api/users'
import { ADD_ADDRESS_PATH } from '../config/routes'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'
import { profileToAuthUser } from '../utils/userProfile'

export function useAccountAddresses() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setUser, user } = useAuth()
  const toast = useToast()

  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [name, setName] = useState(user?.name ?? '')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      await Promise.resolve()
      if (cancelled) return

      setLoading(true)
      setLoadError('')

      try {
        const [addressesResponse, profileResponse] = await Promise.all([
          getMyAddresses(),
          getUserProfile(),
        ])
        if (cancelled) return

        setAddresses(addressesResponse.data?.addresses ?? [])

        if (profileResponse.data) {
          setName(profileResponse.data.name)
          setPhone(profileResponse.data.phone ?? '')
          setUser(profileToAuthUser(profileResponse.data))
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.message : t('profile.addresses.loadFailed'),
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [setUser, t])

  function handleAdd() {
    navigate(ADD_ADDRESS_PATH)
  }

  function handleEdit(addressId: string) {
    navigate(ADD_ADDRESS_PATH, { state: { editAddressId: addressId } })
  }

  async function handleDelete(addressId: string) {
    setDeletingId(addressId)

    try {
      await deleteMyAddress(addressId)
      setAddresses((prev) => prev.filter((item) => item._id !== addressId))
      toast.success(t('checkout.address.toastDeleted'))
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t('checkout.address.unableToDelete')
      toast.error(t('checkout.address.unableToDelete'), message)
    } finally {
      setDeletingId(null)
    }
  }

  return {
    addresses,
    phone,
    name,
    loading,
    loadError,
    deletingId,
    handleAdd,
    handleEdit,
    handleDelete,
  }
}
