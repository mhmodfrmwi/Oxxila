// src/utils/catalogLocaleNames.ts
/**
 * Client-side Arabic fallbacks by slug when API omits nameAr
 * (e.g. older backend schema strict mode). Prefer API nameAr when present.
 */

export const CATEGORY_NAME_AR: Record<string, string> = {
  'skin-care': 'العناية بالبشرة',
  'hair-care': 'العناية بالشعر',
  'body-care': 'العناية بالجسم',
  fragrance: 'العطور',
  makeup: 'المكياج',
  'personal-care': 'العناية الشخصية',
  'baby-care': 'العناية بالطفل',
  'sun-protection': 'الحماية من الشمس',
  'face-treatments': 'علاجات الوجه',
  'anti-aging': 'مكافحة الشيخوخة',
  acne: 'حلول حب الشباب',
  pigmentation: 'التصبغات والتفتيح',
  sensitive: 'بشرة حساسة',
}

export const SUBCATEGORY_NAME_AR: Record<string, string> = {
  cleanser: 'غسول الوجه',
  toner: 'تونر',
  serum: 'سيروم',
  'cream-moisturizer': 'كريم / مرطب',
  sunscreen: 'واقي شمس',
  'eye-care': 'العناية بالعين',
  'face-mask': 'ماسك للوجه',
  exfoliator: 'مقشر',
  'cleansers-and-toners': 'غسول وتونر',
  serums: 'سيرومات',
  moisturizers: 'مرطبات',
  treatments: 'علاجات',
  'face-spf': 'واقي شمس للوجه',
  'body-spf': 'واقي شمس للجسم',
  'tinted-spf': 'واقي شمس ملون',
  'barrier-repair': 'إصلاح الحاجز الجلدي',
  'calming-masks': 'ماسكات مهدئة',
  shampoo: 'شامبو',
  conditioner: 'بلسم',
  'hair-mask': 'ماسك للشعر',
  'hair-oil': 'زيت للشعر',
  'hair-serum': 'سيروم للشعر',
  'leave-in-conditioner': 'بلسم بدون شطف',
  'styling-products': 'منتجات التصفيف',
  perfume: 'عطر',
  'body-mist': 'بخاخ للجسم',
  'deodorant-spray': 'مزيل عرق بخاخ',
  'roll-on': 'رول أون',
  foundation: 'فاونديشن',
  concealer: 'كونسيلر',
  powder: 'بودرة',
  blush: 'بلاشر',
  highlighter: 'هايلايتر',
  eyeshadow: 'ظلال عيون',
  mascara: 'ماسكارا',
  eyeliner: 'آيلاينر',
  lipstick: 'أحمر شفاه',
  'lip-gloss': 'ملمع شفاه',
  deodorant: 'مزيل عرق',
  'intimate-care': 'العناية بالمناطق الحساسة',
  'oral-care': 'العناية بالفم',
  'feminine-care': 'العناية النسائية',
  'shaving-products': 'منتجات الحلاقة',
  'baby-cleanser': 'غسول للأطفال',
  'baby-shampoo': 'شامبو للأطفال',
  'baby-lotion': 'لوشن للأطفال',
  'baby-cream': 'كريم للأطفال',
  'baby-oil': 'زيت للأطفال',
  'diaper-care': 'العناية بالحفاض',
}

export const BRAND_NAME_AR: Record<string, string> = {
  oxxila: 'أوكسيلا',
  'oxxila-pharma': 'أوكسيلا فارما',
}

export function arabicNameBySlug(
  kind: 'category' | 'subcategory' | 'brand',
  slug?: string | null,
): string {
  if (!slug) return ''
  const key = slug.toLowerCase()
  if (kind === 'category') return CATEGORY_NAME_AR[key] ?? ''
  if (kind === 'subcategory') return SUBCATEGORY_NAME_AR[key] ?? ''
  return BRAND_NAME_AR[key] ?? ''
}
