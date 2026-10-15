import Link from 'next/link'
import type { Metadata } from 'next'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'
import { TOWNS } from '@/lib/towns'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: 'Towing Service Area — Haverhill, Franconia, Sugar Hill & North Country NH | Finish Line Towing' },
    description:
      'New Hampshire towns and roads covered 24/7 by Finish Line Towing out of North Haverhill: Haverhill, Sugar Hill, Franconia, Bath, Bethlehem, Lisbon, Piermont, Benton, Easton, Monroe and surrounding North Country towns.',
    alternates: { canonical: '/service-area' },
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
    heading: 'Main towns',
    note: 'The towns Josh covers most — and surrounding North Country towns.',
    towns: TOWNS.map((town) => town.name),
  },
]

const CORRIDORS = ['US-302', 'NH-10', 'NH-25', 'NH-116', 'NH-117', 'NH-18', 'NH-135', 'I-93 near Franconia and Bethlehem']

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
          <h1>Where we tow in New Hampshire</h1>
        </div>
        <p className="hs-intro-copy">
          Based at 585 Benton Rd in North Haverhill, serving Haverhill and surrounding North Country towns, 24/7.
          If your town isn’t on this list, it’s still worth a call — long-distance work is
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
                {area.towns.map((town) => {
                  const page = TOWNS.find((entry) => entry.name === town)
                  return <li key={town}>{page ? <Link href={`/towing/${page.slug}`}>{town}</Link> : town}</li>
                })}
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
