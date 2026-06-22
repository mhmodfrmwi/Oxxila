interface FormMessageProps {
  message: string
  type?: 'error' | 'success'
}

export function FormMessage({ message, type = 'error' }: FormMessageProps) {
  return (
    <p
      role={type === 'error' ? 'alert' : 'status'}
      className={[
        'rounded-xl px-4 py-3 text-sm',
        type === 'error'
          ? 'bg-support-error/10 text-support-error'
          : 'bg-support-success/10 text-support-success',
      ].join(' ')}
    >
      {message}
    </p>
  )
}
