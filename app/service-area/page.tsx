import Link from 'next/link'
import type { Metadata } from 'next'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Towing Service Area — Haverhill, Woodsville, Littleton & Wells River',
    description:
      'Towns and highway corridors covered by Finish Line Towing, out of North Haverhill, New Hampshire — both sides of the Connecticut River, 23.5 hours a day.',
  }
}

/**
 * "Do you cover me?" is the first thing a stranded caller wants answered, and
 * no listing anywhere states it. The tiers are honest about distance rather
 * than claiming a blanket radius: the core towns are the ones he reaches
 * quickly, the extended list is a longer run, and anything past that is quoted.
 */
const AREAS = [
  {
    heading: 'Close by',
    note: 'The home ground — usually the fastest to reach.',
    towns: [
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
    ],
  },
  {
    heading: 'Farther out in New Hampshire',
    note: 'A longer run, still routine.',
    towns: [
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
    ],
  },
  {
    heading: 'Across the river, in Vermont',
    note: 'The Connecticut River is not the edge of the map.',
    towns: ['Wells River', 'Newbury', 'Bradford', 'Fairlee', 'Ryegate'],
  },
]

const CORRIDORS = ['US-302', 'NH-10', 'NH-25', 'I-91 on the Vermont side', 'I-93 as a longer run']

// 585 Benton Road. The keyless embed endpoint — no API key to leak or expire.
const MAP_SRC =
  'https://maps.google.com/maps?q=585+Benton+Road,+North+Haverhill,+NH+03774&z=10&output=embed'

export default async function ServiceAreaPage() {
  const settings = await getPublicFactorySettings()
  const phone = settings.companyPhone.trim()
  const telHref = `tel:${phone.replace(/[^+\d]/g, '')}`

  return (
    <div className="hs-page">
      <section className="hs-section hs-intro">
        <div className="hs-section-head">
          <h2>Where we go</h2>
        </div>
        <p className="hs-intro-copy">
          Based at 585 Benton Road in North Haverhill, running both sides of the river, 23.5 hours
          a day. If your town isn’t on this list, it’s still worth a call — long-distance work is
          quoted, and the truck has taken loads well past these lines.
        </p>
      </section>

      <section className="hs-section">
        <div className="hs-area-map">
          <iframe
            src={MAP_SRC}
            title="Map showing Finish Line Towing in North Haverhill, New Hampshire"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>

      <section className="hs-section">
        <div className="hs-area-grid">
          {AREAS.map((area) => (
            <article key={area.heading} className="hs-area-card">
              <h3>{area.heading}</h3>
              <p className="hs-area-note">{area.note}</p>
              <ul className="hs-area-towns">
                {area.towns.map((town) => (
                  <li key={town}>{town}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="hs-section">
        <div className="hs-section-head">
          <h2>Roads we run</h2>
        </div>
        <ul className="hs-area-corridors">
          {CORRIDORS.map((road) => (
            <li key={road}>{road}</li>
          ))}
        </ul>
        <p className="hs-area-legal">
          Finish Line Towing is USDOT registered and active (USDOT 3693451), for motor vehicles and
          drive-away. Longer hauls are quoted before the truck rolls.
        </p>
      </section>

      <section className="hs-section">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {phone ? (
            <a href={telHref} className="hs-btn-primary">
              Call {phone}
            </a>
          ) : null}
          <Link href="/contact" className="hs-btn-outline">
            Request a tow
          </Link>
        </div>
      </section>
    </div>
  )
}
