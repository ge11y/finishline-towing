import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { listSponsorApplications } from '@/lib/sponsors'

export const dynamic = 'force-dynamic'

/**
 * Sponsorship enquiries for the 74.
 *
 * A quieter screen than the request list on purpose — these arrive rarely and
 * are answered in his own time, so there is no unread count and nothing shouts.
 */
export default async function SponsorsPage() {
  const applications = await listSponsorApplications()

  return (
    <div className="tow-page">
      <header className="tow-head">
        <h1>Sponsors</h1>
      </header>

      {applications.length ? (
        <ul className="tow-list">
          {applications.map((entry) => (
            <li key={entry.id} className="tow-card">
              <div className="tow-card-main">
                <div className="tow-card-top">
                  <strong>{entry.company}</strong>
                  <span className={`tow-badge tow-badge-${entry.status === 'new' ? 'new' : 'called'}`}>
                    {entry.status}
                  </span>
                </div>
                {entry.contactName ? <p className="tow-card-service">{entry.contactName}</p> : null}
                {entry.level ? <p className="tow-card-pickup">{entry.level}</p> : null}
                {entry.message ? <p className="tow-card-pickup">{entry.message}</p> : null}
                <p className="tow-card-time">
                  {new Date(entry.createdAt).toLocaleDateString('en-US', {
                    timeZone: 'America/New_York',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {entry.website ? ` · ${entry.website}` : ''}
                </p>
              </div>
              {entry.phone ? (
                <a href={`tel:${entry.phone.replace(/[^+\d]/g, '')}`} className="tow-card-call">
                  <Phone size={20} aria-hidden="true" />
                  <span>{entry.phone}</span>
                </a>
              ) : entry.email ? (
                <a href={`mailto:${entry.email}`} className="tow-card-call">
                  <Mail size={20} aria-hidden="true" />
                  <span>{entry.email}</span>
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="tow-empty">
          No sponsorship enquiries yet. They come in from{' '}
          <Link href="/racing">the 74 page</Link>.
        </p>
      )}
    </div>
  )
}
