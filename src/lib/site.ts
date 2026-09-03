/** Site-wide constants. Values ported verbatim from the static pages. */

export const SITE = {
  name: 'Sumit Ubale Photography',
  url: 'https://supf.in',
  author: 'Sumit Ubale',
  phone: '+919552265951',
  /** wa.me form — no plus, no spaces. */
  whatsappNumber: '919552265951',
  email: 'sumitubale5050@gmail.com',
  instagram: 'https://www.instagram.com/sumit_ubale_photography/',
  ogImage: 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?profile=true',
  themeColor: '#F5F5F2',
  geo: {
    region: 'IN-MH',
    placename: 'Shrigonda, Ahilyanagar',
    position: '18.6148;74.6953',
    icbm: '18.6148, 74.6953',
    latitude: 18.6148,
    longitude: 74.6953,
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Shrigonda',
    addressLocality: 'Ahilyanagar',
    addressRegion: 'Maharashtra',
    postalCode: '413701',
    addressCountry: 'IN',
  },
} as const

/** Turns a category slug ("pre-wedding-photos-and-videos") into a label. */
export function formatCategoryName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Builds a wa.me link with a pre-filled message. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`
}
