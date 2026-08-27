import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQ_CATEGORIES, FAQ_ITEMS } from '@/lib/data-faq'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'
import { parseFaqCopy } from '@/lib/service-mode'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicFactorySettings()
  return {
    title: 'FAQ',
    description: `Common questions about ${settings.businessName}.`,
  }
}

const STRAIGHT_ANSWERS = [
  {
    question: 'What are your candles made of?',
    answer:
      'Every candle at Demo Store is hand-poured with a natural soy wax blend, lead-free cotton wicks, and phthalate-free fragrance oils.',
  },
  {
    question: 'What is a Quality Report, and where do I find it?',
    answer:
      'A Quality Report documents the safety and quality checks for a specific product line. When a report is published, it is linked directly on the product page and in the Quality Reports library.',
  },
  {
    question: 'How fast do orders ship?',
    answer:
      'Demo Store offers fast tracked domestic shipping. Orders over $200 qualify for free shipping; orders under that amount use the current flat-rate shipping option shown at checkout.',
  },
  {
    question: 'What does "report pending" mean?',
    answer:
      'It means the quality documentation for that product line is still being finalized. Demo Store does not publish placeholder results; the real report is posted once checks are complete.',
  },
]

/**
 * Service clients answer from their own blueprint FAQ — the storefront copy
 * below is seed data for the product-mode demo store and is not theirs.
 */
function ServiceFaqPage({
  businessName,
  phone,
  faqs,
}: {
  businessName: string
  phone: string
  faqs: { question: string; answer: string }[]
}) {
  return (
    <div className="hs-page">
      <section className="hs-section">
        <div className="hs-section-head">
          <h2>Common questions</h2>
        </div>
        {faqs.length ? (
          <div className="hs-faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        ) : (
          <p className="hs-intro-copy">
            Call {businessName} and we&apos;ll answer anything that is not covered here.
          </p>
        )}
        <div style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Link href="/contact" className="hs-btn-primary">
            Request an estimate
          </Link>
          {phone ? (
            <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="hs-btn-outline">
              Call {phone}
            </a>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default async function FaqPage() {
  const settings = await getPublicFactorySettings()
  if (settings.catalogSettings.catalogMode === 'services') {
    return (
      <ServiceFaqPage
        businessName={settings.businessName}
        phone={settings.companyPhone.trim()}
        faqs={parseFaqCopy(settings.siteContent.faqCopy)}
      />
    )
  }

  return (
    <main className="storefront-blue-shell" style={{ minHeight: '100vh' }}>
      <style>{`
        .faq-straight-answer-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(260px, 1fr));
          gap: 14px;
        }

        @media (max-width: 720px) {
          .faq-straight-answer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <section
        className="products-page-header-visual"
        style={{
          padding: 'calc(56px + var(--promo-banner-offset, 0px)) 0 30px',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
        }}
      >
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 390px)',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          <div>
            <div className="section-label" style={{ marginBottom: '12px' }}>FAQ</div>
            <h1 style={{ fontSize: 'clamp(1.9rem, 3.4vw, 3rem)', lineHeight: 1.06, fontWeight: 900, margin: 0, color: 'var(--text-primary)', textWrap: 'balance' }}>
              Answers for catalog, quality reports, checkout, and shipping questions.
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.7, margin: '16px 0 0' }}>
              Use this page to understand how the Demo Store catalog is organized, how quality documentation is shown, and what customers should expect during ordering.
            </p>
          </div>
          <div className="card" style={{ padding: '16px', display: 'grid', gap: '10px' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Quick links</strong>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {FAQ_CATEGORIES.map((category) => (
                <a key={category} className="badge badge-blue" href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                  {category}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="catalog-shopping-section-visual" style={{ padding: '34px 0 72px', position: 'relative' }}>
        <div className="container" style={{ display: 'grid', gap: '36px' }}>
          <section>
            <div className="section-label" style={{ marginBottom: '16px' }}>Straight answers</div>
            <div className="faq-straight-answer-grid">
              {STRAIGHT_ANSWERS.map((faq) => (
                <article key={faq.question} className="card" style={{ padding: '20px' }}>
                  <h2 style={{ margin: '0 0 10px', color: 'var(--text-primary)', fontSize: '17px', lineHeight: 1.35, fontWeight: 850 }}>{faq.question}</h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>

          {FAQ_CATEGORIES.map((category) => {
            const items = FAQ_ITEMS.filter((faq) => faq.category === category).sort((a, b) => a.order - b.order)
            if (items.length === 0) return null
            return (
              <section key={category} id={category.toLowerCase().replace(/[^a-z0-9]+/g, '-')} style={{ scrollMarginTop: '120px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <div>
                    <div className="section-label" style={{ marginBottom: '8px' }}>{category}</div>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '24px', fontWeight: 900 }}>{category} questions</h2>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{items.length} answers</span>
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {items.map((faq) => (
                    <article key={faq.id} className="card" style={{ padding: '18px 20px' }}>
                      <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: '16px', lineHeight: 1.35, fontWeight: 850 }}>{faq.question}</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.72 }}>{faq.answer}</p>
                    </article>
                  ))}
                </div>
              </section>
            )
          })}

          <div className="card" style={{ padding: '22px', display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '20px', fontWeight: 900 }}>Still need help?</h2>
              <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Send a catalog or order question directly to Demo Store.</p>
            </div>
            <Link className="fm-btn-primary" href="/contact">Contact Us</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
