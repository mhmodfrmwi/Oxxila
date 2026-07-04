// src/context/ToastContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { focusRingClasses } from '../components/ui/interactionStyles'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastInput {
  title: string
  description?: string
  variant?: ToastVariant
  durationMs?: number
}

interface ToastItem extends Required<Pick<ToastInput, 'title' | 'variant' | 'durationMs'>> {
  id: string
  description?: string
}

interface ToastContextValue {
  toast: (input: ToastInput) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION_MS = 4000

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-support-success/40 bg-card text-primary-text',
  error: 'border-support-error/40 bg-card text-primary-text',
  info: 'border-support-info/40 bg-card text-primary-text',
}

const variantIconStyles: Record<ToastVariant, string> = {
  success: 'text-support-success',
  error: 'text-support-error',
  info: 'text-support-info',
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const className = cn('shrink-0', variantIconStyles[variant])
  if (variant === 'success') return <CheckCircle2 size={18} className={className} aria-hidden />
  if (variant === 'error') return <AlertCircle size={18} className={className} aria-hidden />
  return <Info size={18} className={className} aria-hidden />
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (input: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const item: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? 'info',
        durationMs: input.durationMs ?? DEFAULT_DURATION_MS,
      }

      setToasts((current) => [...current, item].slice(-4))

      window.setTimeout(() => {
        dismiss(id)
      }, item.durationMs)
    },
    [dismiss],
  )

  const success = useCallback(
    (title: string, description?: string) => toast({ title, description, variant: 'success' }),
    [toast],
  )

  const error = useCallback(
    (title: string, description?: string) => toast({ title, description, variant: 'error' }),
    [toast],
  )

  const info = useCallback(
    (title: string, description?: string) => toast({ title, description, variant: 'info' }),
    [toast],
  )

  const value = useMemo(
    () => ({ toast, success, error, info }),
    [toast, success, error, info],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-end gap-3 p-4 sm:p-6"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg',
              'animate-[toast-in_0.25s_ease-out]',
              variantStyles[item.variant],
            )}
          >
            <ToastIcon variant={item.variant} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-primary-text">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-xs text-secondary-text">{item.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className={cn(
                'shrink-0 rounded-md p-1 text-secondary-text transition-colors hover:text-primary-text',
                focusRingClasses,
              )}
              aria-label="Dismiss notification"
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
