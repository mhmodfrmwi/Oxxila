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
          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
          : 'bg-green-500/10 text-green-700 dark:text-green-400',
      ].join(' ')}
    >
      {message}
    </p>
  )
}
