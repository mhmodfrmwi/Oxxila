import type { TrustedLogo } from './trustedLogos'

interface TrustedLogoItemProps {
  logo: TrustedLogo
}

const logoClasses = [
  'h-7 w-auto max-w-none object-contain sm:h-8',
  'transition-[filter,opacity] duration-300 ease-out',
  'opacity-70',
  '[filter:brightness(0)_saturate(100%)_invert(0.35)]',
  'dark:opacity-80 dark:[filter:brightness(0)_saturate(100%)_invert(0.78)]',
  'group-hover/logo:opacity-100 group-hover/logo:[filter:none]',
].join(' ')

export function TrustedLogoItem({ logo }: TrustedLogoItemProps) {
  return (
    <div
      className="group/logo flex h-8 shrink-0 items-center justify-center px-3 sm:h-9 sm:px-4 lg:h-10"
      title={logo.name}
    >
      <img
        src={logo.src}
        alt={logo.name}
        className={logoClasses}
        loading="lazy"
        draggable={false}
      />
    </div>
  )
}
