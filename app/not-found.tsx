import Link from 'next/link'
import { Phone } from 'lucide-react'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'

/**
 * Someone reaching this may be standing on a shoulder with a bad URL, so the
 * page leads with the number and treats the navigation as secondary. The
 * previous version sent them to a product catalog, which does not exist here.
 */
export default async function NotFound() {
  const settings = await getPublicFactorySettings()
  const phone = settings.companyPhone.trim()

  return (
    <div className="nf-wrap">
      <p className="nf-kicker">404 — page not found</p>
      <h1 className="nf-title">That page isn’t here.</h1>
      <p className="nf-copy">
        It may have moved, or the address may have a typo in it. If you need a truck right now,
        calling is faster than looking for it.
      </p>

      {phone ? (
        <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="nf-call">
          <Phone size={18} aria-hidden="true" />
          Call {phone}
        </a>
      ) : null}

      <p className="nf-links">
        <Link href="/site">Home</Link>
        <Link href="/service-area">Service area</Link>
        <Link href="/contact">Contact</Link>
      </p>
    </div>
  )
}
