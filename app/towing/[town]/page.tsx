import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLiveCatalogDisplayProducts } from '@/lib/catalog-live'
import { orderServicesForDisplay } from '@/lib/finishline-redlines'
import { BUSINESS_NAME, DAY_CELL, NIGHT_PAGER } from '@/lib/contact'
import { TOWNS, getTown } from '@/lib/towns'
import { DualPhone } from '@/components/service/DualPhone'
import { NapBlock } from '@/components/service/NapBlock'
import { BusinessSchema } from '@/components/BusinessSchema'

interface Props {
  params: Promise<{ town: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return TOWNS.map((town) => ({ town: town.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const town = getTown((await params).town)
  if (!town) return {}
  const title = `Towing in ${town.name}, NH — 24/7 | ${BUSINESS_NAME}`
  const description = `24/7 flatbed towing, recovery and roadside help in ${town.name}, NH from ${BUSINESS_NAME} of North Haverhill. Day cell ${DAY_CELL}, night pager ${NIGHT_PAGER}.`
  const url = `/towing/${town.slug}`
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
    twitter: { title, description },
  }
}

export default async function TownPage({ params }: Props) {
  const town = getTown((await params).town)
  if (!town) notFound()

  let services: { slug: string; displayName: string }[] = []
  try {
    services = orderServicesForDisplay(
      (await getLiveCatalogDisplayProducts()).filter((product) => product.publicVisible !== false),
    )
  } catch {
    services = []
  }
  const nearby = TOWNS.filter((entry) => entry.slug !== town.slug)

  return (
    <div className="hs-page">
      <BusinessSchema pageUrl={`/towing/${town.slug}`} />
      <section className="hs-section hs-intro">
        <nav aria-label="Breadcrumb" className="hs-area-note">
          <Link href="/">Home</Link> › <Link href="/service-area">Service area</Link> › {town.name}
        </nav>
        <h1>Towing in {town.name}, NH</h1>
        <p className="hs-intro-copy">{town.intro}</p>
        <p className="hs-intro-copy">{town.body}</p>
        <div style={{ marginTop: 16 }}>
          <DualPhone variant="stack" />
        </div>
      </section>

      {services.length ? (
        <section className="hs-section">
          <div className="hs-section-head">
            <h2>Services in {town.name}</h2>
          </div>
          <ul className="hs-area-corridors">
            {services.map((service) => (
              <li key={service.slug}>
                <Link href={`/services/${service.slug}`}>{service.displayName}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="hs-section">
        <div className="hs-section-head">
          <h2>Roads around {town.name}</h2>
        </div>
        <ul className="hs-area-corridors">
          {town.roads.map((road) => (
            <li key={road}>{road}</li>
          ))}
        </ul>
      </section>

      <NapBlock heading={`Towing in ${town.name}: call ${BUSINESS_NAME}`} />

      <section className="hs-section">
        <div className="hs-section-head">
          <h2>Other New Hampshire towns we serve</h2>
        </div>
        <ul className="hs-area-corridors">
          {nearby.map((entry) => (
            <li key={entry.slug}>
              <Link href={`/towing/${entry.slug}`}>{entry.name}</Link>
            </li>
          ))}
        </ul>
        <p className="hs-intro-copy">
          <Link href="/contact">Request a tow</Link> · <Link href="/service-area">Full service area</Link>
        </p>
      </section>
    </div>
  )
}
