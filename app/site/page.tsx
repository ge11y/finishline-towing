import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Check, Star } from 'lucide-react'
import { getLiveCatalogDisplayProducts } from '@/lib/catalog-live'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'
import { CELL_PHONE } from '@/lib/contact'
import { QuoteForm } from '@/components/service/QuoteForm'
import { BusinessSchema } from '@/components/BusinessSchema'
import { WhyIcon } from '@/components/WhyIcon'
import { parseFaqCopy } from '@/lib/service-mode'

/* ------------------------------------------------------------------
 * /site — home-service client landing (settings-driven, zero client
 * literals; every fact flows from the applied build blueprint).
 *
 * THESIS: the finished stone sells the estimate — real job photos lead
 * and the quote form is in the first viewport, not a page away.
 * Refuses the contractor-template hero (stock photo, three icon cards,
 * fake urgency).
 * OWN-WORLD: active theme preset tokens + --factory-brand-* client
 * palette; stacked-stone coursing divider as the signature mark; one
 * action colour, used only on things you click.
 * STORY: a local customer sees work like the job they need doing, sees the
 * business is rated and established, and books an estimate in three fields.
 * FIRST VIEWPORT: full-bleed client job photo; left = headline, sub,
 * capability checks, phone; right = quote form panel.
 * FORM: photo-led trade landing — hero+form → credentials → why-us →
 * alternating service rows → dual offer → projects → reviews → badges
 * → FAQ → close. Structure #1 of the derivation, extended against the
 * granitestatelandscaping.com teardown in docs/.
 * ------------------------------------------------------------------ */

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicFactorySettings()
  return {
    title: {
      absolute: `24 Hour Flatbed Towing in North Haverhill, NH | ${settings.businessName}`,
    },
    description: settings.siteContent.homepageSubheadline,
  }
}

function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

export default async function HomeServiceLandingPage() {
  const [settings, products] = await Promise.all([
    getPublicFactorySettings(),
    getLiveCatalogDisplayProducts(),
  ])

  const { siteContent, catalogSettings, brandSettings, serviceSite } = settings
  const services = products.filter((product) => product.publicVisible !== false)
  const heroImage = brandSettings.heroLogoUrl || services[0]?.image || ''
  const proofPoints = siteContent.proofPoints
    .split('·')
    .map((point) => point.trim())
    .filter(Boolean)
  const faqs = parseFaqCopy(siteContent.faqCopy)
  const hasPhone = settings.companyPhone.trim().length > 0
  const serviceNames = services.map((service) => service.displayName)
  // The hero carries the quickest capability promises; the mid-page band
  // carries the full list. Same source, two levels of patience.
  const heroChecks = serviceSite.whyChooseUs.slice(0, 3)

  return (
    <div className="hs-page">
      <BusinessSchema />
      {/* Hero — the client's own finished work, with the form on top of it. */}
      <section className="hs-hero">
        <div className="hs-hero-media" aria-hidden="true">
          {heroImage ? (
            <Image src={heroImage} alt="" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
          ) : null}
          <div className="hs-hero-scrim" />
        </div>
        <div className="hs-hero-inner">
          <div className="hs-hero-copy">
            <p className="hs-kicker">{settings.businessName}</p>
            <h1>{siteContent.homepageHeadline}</h1>
            <p className="hs-hero-sub">{siteContent.homepageSubheadline}</p>
            {heroChecks.length ? (
              <ul className="hs-hero-checks">
                {heroChecks.map((item) => (
                  <li key={item.text}>
                    <WhyIcon name={item.icon} size={17} />
                    {item.text}
                  </li>
                ))}
              </ul>
            ) : null}
            {hasPhone ? (
              <a href={telHref(settings.companyPhone)} className="hs-btn-primary hs-hero-call">
                {siteContent.primaryCtaLabel}
              </a>
            ) : null}
          </div>
          <div className="hs-hero-form">
            <QuoteForm
              services={serviceNames}
              title={serviceSite.quoteFormTitle}
              note={serviceSite.quoteFormNote || settings.supportNote}
              submitLabel={siteContent.secondaryCtaLabel}
              phone={settings.companyPhone}
              ownerName="Josh"
            />
          </div>
        </div>
      </section>

      {/* Proof strip — the blueprint's scannable credentials. */}
      {proofPoints.length ? (
        <div className="hs-proofstrip" aria-label="Credentials">
          <ul>
            {proofPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Credibility — who runs this crew and how they work. */}
      <section className="hs-section hs-intro">
        <div className="hs-section-head">
          <h2>Why customers call us</h2>
        </div>
        <p className="hs-intro-copy">{siteContent.aboutCopy}</p>
        <p className="hs-intro-copy hs-intro-single">
          Most of the work comes from neighbors, shops, and people who call him directly.
        </p>
      </section>

      {/* Differentiators — the objection-killers, on a dark panel. */}
      {serviceSite.whyChooseUs.length ? (
        <section className="hs-section hs-why-section">
          <div className="hs-why">
            <div className="hs-why-body">
              <h2>What you get with us</h2>
              <ul className="hs-why-list">
                {serviceSite.whyChooseUs.map((item) => (
                  <li key={item.text}>
                    <span className="hs-why-check" aria-hidden="true">
                      <WhyIcon name={item.icon} size={16} />
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            {serviceSite.whyChooseUsImage ? (
              <div className="hs-why-media">
                <Image src={serviceSite.whyChooseUsImage} alt="" fill sizes="(max-width: 900px) 100vw, 380px" style={{ objectFit: 'cover' }} />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Reviews — attributed and dated, never invented. */}
      {serviceSite.reviews.length ? (
        <section className="hs-section">
          <div className="hs-section-head">
            <h2>What customers say</h2>
          </div>
          <div className="hs-reviews">
            {serviceSite.reviews.map((review) => (
              <figure key={`${review.author}-${review.date}`} className="hs-review">
                <div className="hs-review-stars" aria-label={`${review.rating} out of 5`}>
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Star key={index} size={15} fill={index < Math.round(review.rating) ? 'currentColor' : 'none'} strokeWidth={1.5} aria-hidden="true" />
                  ))}
                </div>
                <blockquote>{review.text}</blockquote>
                <figcaption>
                  <strong>{review.author}</strong>
                  {review.date ? <span> · {review.date}</span> : null}
                  {review.source ? <span> · {review.source}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
          {serviceSite.reviewsUrl ? (
            <a href={serviceSite.reviewsUrl} target="_blank" rel="noreferrer" className="hs-btn-outline hs-reviews-more">
              Read all reviews
            </a>
          ) : null}
        </section>
      ) : null}

      {/* Services — alternating rows so each trade gets a photo at size. */}
      <section className="hs-section" id="services">
        <div className="hs-section-head">
          <h2>{catalogSettings.serviceLabel}</h2>
        </div>
        <div className="hs-rows">
          {services.map((service) => (
            <article key={service.slug} className={`hs-row${service.image ? '' : ' hs-row-noimg'}`}>
              {/* No empty media panel when there is no photograph — an image
                  slot with nothing in it reads as a broken image, not as a
                  design choice. The row goes single-column instead. */}
              {service.image ? (
                <div className="hs-row-media">
                  <Image
                    src={service.image}
                    alt={service.displayName}
                    fill
                    sizes="(max-width: 900px) 100vw, 560px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : null}
              <div className="hs-row-body">
                <h3>{service.displayName}</h3>
                <p>{service.summaryShort}</p>
                <Link href={`/services/${service.slug}`} className="hs-btn-outline">
                  Learn more
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="hs-course" role="presentation" />

      {/* Two offers — a visitor who is not ready to quote still has a reason. */}
      {serviceSite.ctaCards.length ? (
        <section className="hs-offers">
          <div className="hs-offers-inner">
            {serviceSite.ctaCards.map((card) => (
              <article key={card.title} className="hs-offer-card">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                {card.actionLine ? <p className="hs-offer-action">{card.actionLine}</p> : null}
                {hasPhone ? (
                  <a href={telHref(settings.companyPhone)} className="hs-btn-primary">
                    {settings.companyPhone}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* Recent projects — its own photo set, not the service-card images. */}
      {serviceSite.galleryImages.length ? (
        <section className="hs-projects">
          <div className="hs-section-head hs-projects-head">
            <h2>Recent projects</h2>
          </div>
          <div className="hs-projects-grid">
            {serviceSite.galleryImages.map((image) => (
              <figure key={image.src}>
                <Image src={image.src} alt={image.alt} fill sizes="(max-width: 900px) 50vw, 320px" style={{ objectFit: 'cover' }} />
              </figure>
            ))}
          </div>
        </section>
      ) : null}


      {/* Certifications and supplier marks — trust currency in the trades. */}
      {serviceSite.badges.length ? (
        <section className="hs-badges" aria-label="Certifications">
          <ul>
            {serviceSite.badges.map((badge) => (
              <li key={badge.name}>
                {badge.logoUrl ? (
                  <Image src={badge.logoUrl} alt={badge.name} width={120} height={48} style={{ objectFit: 'contain', height: 'auto' }} />
                ) : (
                  <span>{badge.name}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="hs-course" role="presentation" />

      {/* FAQ — parsed from the blueprint's faqCopy blocks. */}
      {faqs.length ? (
        <section className="hs-section">
          <div className="hs-section-head">
            <h2>Common questions</h2>
          </div>
          <div className="hs-faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* Close — committed brand band; the page ends on the ask. */}
      <section className="hs-close">
        <div className="hs-close-inner">
          <div>
            <h2>Tell us what you need</h2>
            <p className="hs-close-sub">{siteContent.legalSupportCopy}</p>
            <p className="hs-close-meta">
              {settings.companyAddress ? <>{settings.companyAddress} · </> : null}
              {hasPhone ? <a href={telHref(settings.companyPhone)}>{settings.companyPhone}</a> : null}
              {' · '}
              <a href={telHref(CELL_PHONE)}>{CELL_PHONE}</a>
            </p>
          </div>
          <div className="hs-close-actions">
            <Link href="/contact" className="hs-btn-primary">
              {siteContent.secondaryCtaLabel}
            </Link>
            {settings.socials.map((social) => (
              <a key={social.label} href={social.url} className="hs-btn-ghost" target="_blank" rel="noreferrer">
                Find us on {social.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
