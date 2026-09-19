import Image from 'next/image'
import { BusinessSchema } from '@/components/BusinessSchema'
import { ROUND_LOGO, HERO_BANNER } from '@/lib/finishline-redlines'
import type { PublicFactorySettings } from '@/lib/public-factory-settings'

function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

/**
 * Public GBP face. No storefront chrome. Phone-first, Finishline-branded.
 */
export async function ComingSoonLanding({
  settings,
}: {
  settings: PublicFactorySettings
}) {
  const phone = settings.companyPhone.trim() || '(603) 615-6750'
  const hours = settings.serviceSite.businessHours
  const address = settings.companyAddress.trim()

  return (
    <div className="cs-page">
      <BusinessSchema pageUrl="/" />
      <div className="cs-media" aria-hidden="true">
        <Image src={HERO_BANNER} alt="" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        <div className="cs-scrim" />
      </div>
      <main className="cs-card">
        <div className="cs-logo">
          <Image
            src={ROUND_LOGO}
            alt="FINISHLINE Towing & Recovery"
            width={220}
            height={220}
            priority
            style={{ width: '168px', height: 'auto' }}
          />
        </div>
        <p className="cs-kicker">Coming soon</p>
        <h1>{settings.businessName}</h1>
        <p className="cs-local">Twin States towing &amp; recovery · North Haverhill, NH</p>
        <p className="cs-247">24/7</p>
        <a className="cs-call" href={telHref(phone)}>
          Call now {phone}
        </a>
        {hours.length ? (
          <dl className="cs-hours">
            {hours.map((row) => (
              <div key={`${row.days}-${row.hours}`}>
                <dt>{row.days}</dt>
                <dd>{row.hours}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {address ? <p className="cs-nap">{address}</p> : null}
        {settings.companyEmail ? <p className="cs-nap">{settings.companyEmail}</p> : null}
      </main>
    </div>
  )
}
