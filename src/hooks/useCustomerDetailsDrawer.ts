// src/hooks/useCustomerDetailsDrawer.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getAdminCustomer } from '../api/admin/customers'
import { ApiError } from '../lib/api'
import type { AdminCustomerDetail } from '../types/adminCustomers'
import { mapApiCustomerToAdminDetail } from '../utils/adminCustomersFormat'

interface UseCustomerDetailsDrawerOptions {
  open: boolean
  customerId: string | null
}

interface CustomerDetailsState {
  customer: AdminCustomerDetail | null
  loading: boolean
  error: string | null
}

export function useCustomerDetailsDrawer({
  open,
  customerId,
}: UseCustomerDetailsDrawerOptions) {
  const [state, setState] = useState<CustomerDetailsState>({
    customer: null,
    loading: false,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    if (!open || !customerId) {
      setState({ customer: null, loading: false, error: null })
      return
    }

    const requestId = ++requestIdRef.current
    const controller = new AbortController()

    setState((prev) => ({
      customer: prev.customer?.id === customerId ? prev.customer : null,
      loading: true,
      error: null,
    }))

    void (async () => {
      try {
        const response = await getAdminCustomer(customerId, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return
        const data = response.data
        if (!data) {
          setState({
            customer: null,
            loading: false,
            error: response.message || 'Customer not found',
          })
          return
        }
        setState({
          customer: mapApiCustomerToAdminDetail(data),
          loading: false,
          error: null,
        })
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Unable to load customer'
        setState({ customer: null, loading: false, error: message })
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, customerId, reloadToken])

  return {
    customer: state.customer,
    loading: state.loading,
    error: state.error,
    reload,
  }
}
