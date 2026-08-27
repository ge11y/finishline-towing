import { getPublicFactorySettings } from '@/lib/public-factory-settings'

/**
 * Structured data for the business, so a search engine can read the phone
 * number, the address and the hours rather than guess at them from the page.
 *
 * Typed as LocalBusiness + AutomotiveBusiness. The build spec asked for
 * "LocalBusiness / TowingService", but TowingService is not a schema.org type —
 * emitting it would produce markup that validators reject. AutomotiveBusiness
 * is the real subtype that covers this, and the services themselves are listed
 * explicitly underneath.
 *
 * Everything comes from settings rather than being written out here, so the
 * markup cannot drift from the page a customer is reading — including the
 * phone number, which is still the open question on the citation side.
 *
 * Hours are given as 00:00–23:59. He answers around the clock but the site
 * says 23.5 hours a day, and claiming a flat 24/7 in machine-readable markup
 * while the page beside it says otherwise is the kind of small dishonesty
 * that is trivially checkable.
 */

const SERVICES = [
  'Flatbed Towing',
  'Recovery & Winch-Outs',
  'Roadside Assistance',
  'Motorcycle Towing',
  'Hauling & Transport',
  'Junk Car Removal',
]

// From the NH Secretary of State filing and FMCSA, cross-checked in the dossier.
const GEO = { latitude: 44.084412, longitude: -72.005957 }

const AREA_SERVED = [
  'North Haverhill',
  'Haverhill',
  'Woodsville',
  'Benton',
  'Bath',
  'Piermont',
  'Landaff',
  'Lisbon',
  'Monroe',
  'Lyman',
  'Orford',
  'Lyme',
  'Hanover',
  'Lebanon',
  'Littleton',
  'Franconia',
  'Sugar Hill',
  'Plymouth',
  'Warren',
  'Wentworth',
  'Rumney',
]

function siteUrl(): string {
  const explicit = process.env.SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`
  return 'https://finishline-towing.vercel.app'
}

export async function BusinessSchema() {
  const settings = await getPublicFactorySettings()
  const base = siteUrl()

  const schema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'AutomotiveBusiness'],
    '@id': `${base}/#business`,
    name: 'Finish Line Towing, LLC',
    alternateName: settings.businessName,
    description: settings.siteContent.homepageSubheadline,
    url: `${base}/site`,
    telephone: settings.companyPhone,
    email: settings.companyEmail,
    image: settings.brandSettings.logoUrl ? `${base}${settings.brandSettings.logoUrl}` : undefined,
    logo: settings.brandSettings.logoUrl ? `${base}${settings.brandSettings.logoUrl}` : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '585 Benton Road',
      addressLocality: 'North Haverhill',
      addressRegion: 'NH',
      postalCode: '03774',
      addressCountry: 'US',
    },
    geo: { '@type': 'GeoCoordinates', ...GEO },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    areaServed: AREA_SERVED.map((name) => ({ '@type': 'City', name })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Towing and recovery',
      itemListElement: SERVICES.map((service) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: service },
      })),
    },
    // Public federal registration, and the strongest third-party proof he has.
    identifier: { '@type': 'PropertyValue', name: 'USDOT', value: '3693451' },
    sameAs: settings.socials.map((social) => social.url).filter(Boolean),
    founder: { '@type': 'Person', name: 'Joshua Aldrich' },
    foundingDate: '2021-07-16',
  }

  return (
    <script
      type="application/ld+json"
      // Serialised from our own values, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
