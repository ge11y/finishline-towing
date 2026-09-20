import Image from 'next/image'
import { BusinessSchema } from '@/components/BusinessSchema'
import { DualPhone } from '@/components/service/DualPhone'
import { ROUND_LOGO, HERO_BANNER } from '@/lib/finishline-redlines'
import { SERVICE_247 } from '@/lib/contact'
import type { PublicFactorySettings } from '@/lib/public-factory-settings'

/**
 * Public GBP face. No storefront chrome. Phone-first, Finishline-branded.
 * Preview unlock is visible so humans with the password can enter the full site;
 * this page itself stays ungated for crawlers.
 */
export async function ComingSoonLanding({
  settings,
  badPassword = false,
}: {
  settings: PublicFactorySettings
  badPassword?: boolean
}) {
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
        <p className="cs-247">{SERVICE_247} — which number depends on the time</p>
        <DualPhone variant="stack" />
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
        <section className="cs-unlock" aria-labelledby="cs-unlock-heading">
          <p className="cs-unlock-title" id="cs-unlock-heading">
            Have a preview password?
          </p>
          {badPassword ? (
            <p className="cs-err" role="alert">
              That password didn&apos;t match. Check with whoever sent you the link.
            </p>
          ) : null}
          <form method="POST" action="/api/preview-unlock">
            <label htmlFor="cs-pw">Access password</label>
            <input
              id="cs-pw"
              name="password"
              type="password"
              autoComplete="current-password"
              spellCheck={false}
              placeholder="••••••••••••"
            />
            <button type="submit">View the full site</button>
          </form>
        </section>
      </main>
    </div>
  )
}
