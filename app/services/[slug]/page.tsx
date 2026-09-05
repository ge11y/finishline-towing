import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check } from 'lucide-react'
import { getLiveCatalogDisplayProducts } from '@/lib/catalog-live'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'
import { QuoteForm } from '@/components/service/QuoteForm'
import { WhyIcon } from '@/components/WhyIcon'
import { SERVICE_COPY } from '@/lib/service-copy'

/* ------------------------------------------------------------------
 * /services/[slug] — one page per service, generated from the live
 * catalog. These are the landing targets for "Learn more" and the
 * local-SEO surface a home-service client is actually searched by
 * ("stone patios york maine"), so each carries its own photo, copy,
 * quote form, and links across to the other services.
 * ------------------------------------------------------------------ */

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

async function getService(slug: string) {
  const settings = await getPublicFactorySettings()
  if (settings.catalogSettings.catalogMode !== 'services') return null
  const products = await getLiveCatalogDisplayProducts()
  const services = products.filter((product) => product.publicVisible !== false)
  const service = services.find((entry) => entry.slug === slug)
  return service ? { settings, service, services } : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const found = await getService(slug)
  if (!found) return { title: 'Service' }

  const { settings, service } = found
  const area = settings.serviceSite.serviceAreaLine || settings.companyAddress
  return {
    title: { absolute: `${service.displayName}${area ? ` — ${area}` : ''} | ${settings.businessName}` },
    description: service.summaryFull || service.summaryShort,
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params
  const found = await getService(slug)
  if (!found) notFound()

  const { settings, service, services } = found
  const { serviceSite, siteContent } = settings
  const others = services.filter((entry) => entry.slug !== service.slug)
  const body = service.summaryFull || service.summaryShort
  const phone = settings.companyPhone.trim()
  const copy = SERVICE_COPY[service.slug]
  // A description written across several lines becomes bullets laid over the
  // header image; a single line stays a prose lead, so existing client files
  // are unaffected.
  const bulletPoints = body
    .split('\n')
    .map((line) => line.replace(/^[•\-–•]\s*/, '').trim())
    .filter(Boolean)
  const usesBullets = bulletPoints.length > 1

  return (
    <div className="hs-page hs-service-page">
      <section className="hs-service-hero">
        {/* Not aria-hidden when it carries the bullets — that would hide real
            content from assistive tech. */}
        {/* The theme gives this a border, a shadow and a flag rule, so with no
            photograph and no bullets it renders as a large empty framed box —
            worse than simply starting at the title. Only mounted when it has
            something to hold.
            Not aria-hidden when it carries the bullets — that would hide real
            content from assistive tech. */}
        {service.image || usesBullets ? (
          <div className="hs-service-hero-media" aria-hidden={usesBullets ? undefined : true}>
            {service.image ? (
              <Image src={service.image} alt="" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
            ) : null}
            <div className="hs-hero-scrim" />
            {usesBullets ? (
              <ul className="hs-hero-bullets">
                {bulletPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        <div className="hs-service-hero-inner">
          <nav className="hs-crumbs" aria-label="Breadcrumb">
            <Link href="/site">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/site#services">{settings.catalogSettings.serviceLabel}</Link>
          </nav>
          <h1>{service.displayName}</h1>
          {serviceSite.serviceAreaLine ? <p className="hs-service-area">{serviceSite.serviceAreaLine}</p> : null}
        </div>
      </section>

      <section className="hs-section hs-service-main">
        <div className="hs-service-copy">
          {usesBullets ? null : <p className="hs-service-lead">{body}</p>}

          {copy ? (
            <div className="hs-service-body">
              <p className="hs-service-lead">{copy.lead}</p>
              {copy.sections.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  <p>{section.body}</p>
                </section>
              ))}
            </div>
          ) : null}

          {serviceSite.whyChooseUs.length ? (
            <ul className="hs-service-checks">
              {serviceSite.whyChooseUs.map((item) => (
                <li key={item.text}>
                  <WhyIcon name={item.icon} size={16} />
                  {item.text}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="hs-service-cta">
            {phone ? (
              <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="hs-btn-primary">
                Call {phone}
              </a>
            ) : null}
            <Link href="/contact" className="hs-btn-outline">
              Request a scheduled tow
            </Link>
          </div>
        </div>

        <aside className="hs-service-aside">
          <QuoteForm
            services={services.map((entry) => entry.displayName)}
            defaultService={service.displayName}
            title={serviceSite.quoteFormTitle}
            note={serviceSite.quoteFormNote || settings.supportNote}
            submitLabel={siteContent.secondaryCtaLabel}
            variant="panel"
            phone={settings.companyPhone}
            ownerName="Josh"
          />
        </aside>
      </section>

      {others.length ? (
        <section className="hs-section">
          <div className="hs-section-head">
            {/* serviceLabel can be a phrase ("What we work on"), which reads
                badly after "Other" — only interpolate a one-word label. */}
            <h2>
              {/\s/.test(settings.catalogSettings.serviceLabel.trim())
                ? 'Other services'
                : `Other ${settings.catalogSettings.serviceLabel.toLowerCase()}`}
            </h2>
          </div>
          <div className="hs-otherservices">
            {others.map((entry) => (
              <Link key={entry.slug} href={`/services/${entry.slug}`} className="hs-otherservice">
                <span className="hs-otherservice-media">
                  {entry.image ? (
                    <Image src={entry.image} alt="" fill sizes="(max-width: 900px) 50vw, 260px" style={{ objectFit: 'cover' }} />
                  ) : null}
                </span>
                <span className="hs-otherservice-name">{entry.displayName}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
