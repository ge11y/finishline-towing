import type { Metadata } from 'next'
import { Mail, MapPin, MessageSquareText, PackageSearch, Phone } from 'lucide-react'
import { getLiveCatalogProducts } from '@/lib/catalog-live'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'
import { QuoteForm } from '@/components/service/QuoteForm'
import { BusinessSchema } from '@/components/BusinessSchema'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicFactorySettings()
  return {
    title: 'Contact a Tow Truck in North Haverhill, NH',
    description: `Contact ${settings.businessName}. ${settings.supportNote}`,
  }
}

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const [settings, products] = await Promise.all([getPublicFactorySettings(), getLiveCatalogProducts()])
  const isServiceMode = settings.catalogSettings.catalogMode === 'services'
  const visibleProducts = products.filter((product) => product.publicVisible !== false)
  const phone = settings.companyPhone.trim()

  const supportItems = [
    ...(isServiceMode && phone
      ? [
          {
            label: 'Call or text',
            value: phone,
            note: settings.supportNote,
            icon: Phone,
            href: `tel:${phone.replace(/[^+\d]/g, '')}`,
          },
        ]
      : []),
    // Hides when empty, like every other settings-driven surface — a client
    // with no published email should not get a dead card.
    ...(settings.companyEmail.trim()
      ? [
          {
            label: 'Email',
            value: settings.companyEmail,
            note: isServiceMode
              ? 'Estimate requests, questions, and scheduling.'
              : 'Catalog questions, availability checks, order updates, and account support.',
            icon: Mail,
            href: `mailto:${settings.companyEmail}`,
          },
        ]
      : []),
    isServiceMode
      ? {
          label: 'Based at',
          value: settings.companyAddress || settings.businessName,
          note: 'Serving the surrounding area — get in touch if you are not sure whether you are in it.',
          icon: MapPin,
        }
      : {
          label: 'Live catalog',
          value: `${visibleProducts.length} active listings`,
          note: 'Product records are pulled from the shared live catalog data.',
          icon: PackageSearch,
        },
  ]

  // Kept trade-neutral: clients range from crews that travel to a job site to
  // shops the customer drives to, so avoid "project" / "where the work is".
  const headline = isServiceMode ? 'Get in touch.' : 'Questions, order support, and catalog help.'
  // supportNote already sits on the "Call or text" card when there is a phone,
  // so only fold it into the subline when that card is absent.
  const subline = isServiceMode
    ? `Send ${settings.businessName} a note about what you need — what is going on, and when you would like it looked at.${phone ? '' : ` ${settings.supportNote}`}`
    : `Send ${settings.businessName} the product name, size, order number, or question you need help with. Typical response time is 1–2 business days.`
  const detailsNote = isServiceMode
    ? 'Include the type of work you need, anything that helps us understand it, and photos if you have them — it makes the first estimate faster.'
    : 'Include product names, sizes, order numbers, or quality-report details so the team can respond faster.'

  return (
    <main className="storefront-blue-shell" style={{ minHeight: '100vh' }}>
      <BusinessSchema />
      <section
        className="products-page-header-visual"
        style={{
          padding: 'calc(56px + var(--promo-banner-offset, 0px)) 0 30px',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
        }}
      >
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 360px)', gap: '24px', alignItems: 'start' }}>
          <div>
            <div className="section-label" style={{ marginBottom: '12px' }}>Contact</div>
            <h1 style={{ fontSize: 'clamp(1.9rem, 3.4vw, 3rem)', lineHeight: 1.06, fontWeight: 900, margin: 0, color: 'var(--text-primary)', textWrap: 'balance' }}>
              {headline}
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.7, margin: '16px 0 0' }}>
              {subline}
            </p>
          </div>
          <div className="card" style={{ padding: '16px', display: 'grid', gap: '10px' }}>
            <MessageSquareText size={26} color="var(--accent-400)" aria-hidden="true" />
            <strong style={{ color: 'var(--text-primary)' }}>Best message details</strong>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.65 }}>
              {detailsNote}
            </p>
          </div>
        </div>
      </section>

      <section className="catalog-shopping-section-visual" style={{ padding: '34px 0 72px', position: 'relative' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 0.85fr) minmax(320px, 1.15fr)', gap: '28px', alignItems: 'start' }}>
          <aside style={{ display: 'grid', gap: '14px' }}>
            {supportItems.map((item) => {
              const Icon = item.icon
              const content = (
                <article className="card" style={{ padding: '20px', display: 'grid', gap: '10px' }}>
                  <Icon size={22} color="var(--accent-400)" aria-hidden="true" />
                  <div>
                    <div className="section-label" style={{ marginBottom: '6px' }}>{item.label}</div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '16px' }}>{item.value}</strong>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.65 }}>{item.note}</p>
                </article>
              )
              return item.href ? (
                <a key={item.label} href={item.href} style={{ textDecoration: 'none' }}>{content}</a>
              ) : (
                <div key={item.label}>{content}</div>
              )
            })}
          </aside>

          <section>
            <div style={{ marginBottom: '16px' }}>
              <div className="section-label" style={{ marginBottom: '8px' }}>Send Message</div>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '24px', fontWeight: 900 }}>Tell us what you need.</h2>
            </div>
            {/* Same form as the rest of the site, so every lead lands in one
                place with one shape. */}
            <QuoteForm
              services={visibleProducts.map((product) => product.displayName)}
              title={settings.serviceSite.quoteFormTitle}
              note={settings.serviceSite.quoteFormNote || settings.supportNote}
              submitLabel={settings.siteContent.secondaryCtaLabel}
              variant="panel"
              phone={settings.companyPhone}
              ownerName="Josh"
            />
          </section>
        </div>
      </section>
    </main>
  )
}
