// src/components/promo-carousel/PromoLockIcon.tsx
interface PromoLockIconProps {
  variant: 'light' | 'dark'
  className?: string
}

/** Vuesax bulk lock-circle, tilted like Figma instance (~24° CCW). */
export function PromoLockIcon({ variant, className }: PromoLockIconProps) {
  const fill = variant === 'dark' ? '#ffffff' : '#161616'

  return (
    <svg
      className={className}
      viewBox="0 0 333 333"
      width={333}
      height={333}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      overflow="visible"
    >
      {/* Scale down before rotate so the tilt stays fully visible inside the box */}
      <g transform="translate(166.5 166.5) rotate(-28) scale(0.86) translate(-166.5 -166.5)">
        <path
          opacity="0.4"
          d="M123.875 262.407C176.843 286.068 238.964 262.311 262.625 209.343C286.287 156.375 262.529 94.2542 209.561 70.5928C156.593 46.9313 94.4722 70.689 70.8108 123.657C47.1493 176.625 70.907 238.746 123.875 262.407Z"
          fill={fill}
        />
        <path
          d="M208.124 170.386L211.251 163.385C215.236 154.465 227.317 127.419 191.352 111.353C155.387 95.2872 143.305 122.333 139.321 131.252L136.194 138.254C123.336 135.616 116.019 141.436 108.693 157.836L104.409 167.427C94.9835 188.527 98.5919 197.962 119.691 207.387L167.645 228.809C188.745 238.234 198.18 234.626 207.605 213.526L211.889 203.935C219.215 187.535 218.668 178.202 208.124 170.386ZM153.436 196.231C147.586 193.618 144.986 186.819 147.6 180.969C150.213 175.118 157.012 172.518 162.862 175.131C168.712 177.745 171.312 184.544 168.699 190.394C166.085 196.244 159.287 198.845 153.436 196.231ZM194.209 162.904L151.051 143.625L153.707 137.679C159.962 123.676 166.799 117.642 184.926 125.739C203.052 133.837 203.12 142.956 196.865 156.958L194.209 162.904Z"
          fill={fill}
        />
      </g>
    </svg>
  )
}
