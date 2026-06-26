import brandClarins from '../../../assets/brands/clarins.png'
import brandChristianDior from '../../../assets/brands/christian-dior.png'
import brandClinique from '../../../assets/brands/clinique.png'
import brandGivenchy from '../../../assets/brands/givenchy.png'
import brandGuerlain from '../../../assets/brands/guerlain.png'
import brandLancome from '../../../assets/brands/lancome-paris.png'
import brandLoreal from '../../../assets/brands/loreal.png'
import brandMac from '../../../assets/brands/mac-cosmetics.png'
import brandNars from '../../../assets/brands/nars-cosmetics.png'
import brandNeutrogena from '../../../assets/brands/neutrogena.png'
import brandNuxe from '../../../assets/brands/nuxe.png'
import brandShuUemura from '../../../assets/brands/shu-uemura.png'

export interface BrandStore {
  id: string
  name: string
  logo: string
  logoAlt: string
  href: string
}

export const brandStores: BrandStore[] = [
  {
    id: 'mac-cosmetics',
    name: 'MACCosmetics',
    logo: brandMac,
    logoAlt: 'MAC Cosmetics logo',
    href: '/shop?brand=mac-cosmetics',
  },
  {
    id: 'loreal',
    name: "L'Oreal",
    logo: brandLoreal,
    logoAlt: "L'Oreal Paris logo",
    href: '/shop?brand=loreal',
  },
  {
    id: 'clinique',
    name: 'Clinique',
    logo: brandClinique,
    logoAlt: 'Clinique logo',
    href: '/shop?brand=clinique',
  },
  {
    id: 'christian-dior',
    name: 'Christian Dior SE',
    logo: brandChristianDior,
    logoAlt: 'Christian Dior logo',
    href: '/shop?brand=christian-dior',
  },
  {
    id: 'lancome-paris',
    name: 'Lancome Paris',
    logo: brandLancome,
    logoAlt: 'Lancome Paris logo',
    href: '/shop?brand=lancome-paris',
  },
  {
    id: 'nars-cosmetics',
    name: 'NARS Cosmetics',
    logo: brandNars,
    logoAlt: 'NARS Cosmetics logo',
    href: '/shop?brand=nars-cosmetics',
  },
  {
    id: 'neutrogena',
    name: 'Neutrogena',
    logo: brandNeutrogena,
    logoAlt: 'Neutrogena logo',
    href: '/shop?brand=neutrogena',
  },
  {
    id: 'clarins',
    name: 'Clarins',
    logo: brandClarins,
    logoAlt: 'Clarins logo',
    href: '/shop?brand=clarins',
  },
  {
    id: 'guerlain',
    name: 'Guerlain',
    logo: brandGuerlain,
    logoAlt: 'Guerlain logo',
    href: '/shop?brand=guerlain',
  },
  {
    id: 'givenchy',
    name: 'GIVENCHY',
    logo: brandGivenchy,
    logoAlt: 'Givenchy logo',
    href: '/shop?brand=givenchy',
  },
  {
    id: 'shu-uemura',
    name: 'Shu Uemura',
    logo: brandShuUemura,
    logoAlt: 'Shu Uemura logo',
    href: '/shop?brand=shu-uemura',
  },
  {
    id: 'nuxe',
    name: 'NUX',
    logo: brandNuxe,
    logoAlt: 'NUX logo',
    href: '/shop?brand=nuxe',
  },
]
