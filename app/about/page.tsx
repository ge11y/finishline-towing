import Link from 'next/link'
import type { Metadata } from 'next'
import { Check, ClipboardCheck, FlaskConical, PackageCheck, ShieldCheck } from 'lucide-react'
import { getLiveCatalogProducts } from '@/lib/catalog-live'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'
import { orderServicesForDisplay } from '@/lib/finishline-redlines'
import { WhyIcon } from '@/components/WhyIcon'
import { DualPhone } from '@/components/service/DualPhone'
import { SERVICE_247 } from '@/lib/contact'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicFactorySettings()
  if (settings.catalogSettings.catalogMode === 'services') {
    // The root layout already appends the business name to the title.
    return {
      title: 'About',
      alternates: { canonical: '/about' },
      description: settings.siteContent.homepageSubheadline,
    }
  }
  return {
    title: 'About',
    alternates: { canonical: '/about' },
    description:
      'Owner-operated 24/7 flatbed towing and recovery out of North Haverhill, NH, serving North Country NH.',
  }
}

export const dynamic = 'force-dynamic'

function formatCollection(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

/**
 * Service clients get their own blueprint copy — the product-mode
 * fallback below is only used when settings are not in services mode.
 */
function ServiceAboutPage({
  settings,
  services,
}: {
  settings: Awaited<ReturnType<typeof getPublicFactorySettings>>
  services: { slug: string; displayName: string }[]
}) {
  const proofPoints = settings.siteContent.proofPoints
    .split('·')
    .map((point) => point.trim())
    .filter(Boolean)
  const whyChooseUs = settings.serviceSite?.whyChooseUs ?? []

  return (
    <div className="hs-page">
      <section className="hs-section hs-intro">
        <div className="hs-section-head">
          <h2>About {settings.businessName}</h2>
        </div>
        <p className="hs-intro-copy">{settings.siteContent.aboutCopy}</p>
        <p className="hs-intro-copy hs-about-247">{SERVICE_247} — which number depends on the time.</p>
        <DualPhone variant="inline" />
      </section>

      {proofPoints.length ? (
        <div className="hs-proofstrip" aria-label="Credentials">
          <ul>
            {proofPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* hs-why-list is white type — it only reads on the dark hs-why panel. */}
      {whyChooseUs.length ? (
        <section className="hs-section hs-why-section">
          <div className="hs-why">
            <div className="hs-why-body">
              <h2>What you get with us</h2>
              <ul className="hs-why-list">
                {whyChooseUs.map((item) => (
                  <li key={item.text}>
                    <span className="hs-why-check" aria-hidden="true">
                      <WhyIcon name={item.icon} size={16} />
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {services.length ? (
        <section className="hs-section">
          <div className="hs-section-head">
            <h2>{settings.catalogSettings.serviceLabel}</h2>
          </div>
          <ul className="hs-about-services">
            {services.map((service) => (
              <li key={service.slug}>
                <Link href={`/services/${service.slug}`}>{service.displayName}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="hs-section">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Link href="/contact" className="hs-btn-primary">
            Request an estimate
          </Link>
          <DualPhone variant="inline" />
        </div>
      </section>
    </div>
  )
}

export default async function AboutPage() {
  const [products, settings] = await Promise.all([getLiveCatalogProducts(), getPublicFactorySettings()])
  const businessName = settings.businessName

  if (settings.catalogSettings.catalogMode === 'services') {
    return (
      <ServiceAboutPage
        settings={settings}
        services={orderServicesForDisplay(
          products
            .filter((product) => product.publicVisible !== false)
            .map((product) => ({ slug: product.slug, displayName: product.displayName })),
        )}
      />
    )
  }
  const visibleProducts = products.filter((product) => product.publicVisible !== false)
  const collections = Array.from(
    new Set(visibleProducts.map((product) => product.category || product.researchCategory).filter(Boolean)),
  ).slice(0, 6)

  const process = [
    {
      title: 'Owner-operated',
      body: 'Locally owned and run out of 585 Benton Rd, North Haverhill. The phone goes to the owner, not a call center.',
      icon: FlaskConical,
    },
    {
      title: 'Strapped at the wheels',
      body: 'Cars, light trucks and no-starts go on the flatbed strapped at the wheels, never chained to the frame.',
      icon: ShieldCheck,
    },
    {
      title: 'Recovery and winch-outs',
      body: 'Off the shoulder, in a ditch, or backed into soft ground: winched out and set back on the road, or loaded up.',
      icon: PackageCheck,
    },
    {
      title: '24/7 service',
      body: 'Day cell and night pager, so there is a number to call around the clock.',
      icon: ClipboardCheck,
    },
  ]

  return (
    <main className="storefront-blue-shell" style={{ minHeight: '100vh' }}>
      <section
        className="products-page-header-visual"
        style={{
          padding: 'calc(56px + var(--promo-banner-offset, 0px)) 0 30px',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
        }}
      >
        <div className="container">
          <div>
            <div className="section-label" style={{ marginBottom: '12px' }}>About {businessName}</div>
            <h1 style={{ fontSize: 'clamp(1.9rem, 3.4vw, 3rem)', lineHeight: 1.06, fontWeight: 900, margin: 0, maxWidth: '680px', color: 'var(--text-primary)', textWrap: 'balance' }}>
              24/7 flatbed towing and recovery out of North Haverhill, NH.
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.7, margin: '16px 0 0' }}>
              {businessName} is local, owner-operated flatbed towing and recovery out of North Haverhill, serving North Country NH. The truck rolls 24/7, and the phone goes to the owner, not a call center.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '24px' }}>
              <Link className="fm-btn-primary" href="/contact">Request a tow</Link>
              <Link className="fm-btn-outline" href="/services/flatbed-towing">Flatbed towing</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="catalog-shopping-section-visual" style={{ padding: '34px 0 72px', position: 'relative' }}>
        <div className="container" style={{ display: 'grid', gap: '34px' }}>
          {collections.length > 0 ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Live groups:</strong>
              {collections.map((collection) => (
                <span key={collection} className="badge badge-blue">{formatCollection(collection)}</span>
              ))}
            </div>
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
            {process.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.title} className="card" style={{ padding: '22px', display: 'grid', gap: '12px' }}>
                  <Icon size={24} color="var(--accent-400)" aria-hidden="true" />
                  <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px', fontWeight: 850 }}>{item.title}</h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>{item.body}</p>
                </article>
              )
            })}
          </div>

          <div className="card" style={{ padding: '26px', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(280px, 1.1fr)', gap: '28px', alignItems: 'start' }}>
            <div>
              <div className="section-label" style={{ marginBottom: '12px' }}>Service area</div>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '24px', fontWeight: 900 }}>North Country NH, 24/7.</h2>
            </div>
            <div style={{ display: 'grid', gap: '14px', color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '14px' }}>
              <p style={{ margin: 0 }}>
                Based at 585 Benton Rd, North Haverhill, serving Haverhill, Franconia, Sugar Hill, Bath and surrounding North Country towns.
              </p>
              <p style={{ margin: 0 }}>
                Flatbed towing, recovery and winch-outs, roadside assistance, hauling and transport, junk car removal, and motorcycle towing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
