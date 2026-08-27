import Link from 'next/link'
import { Phone, Plus } from 'lucide-react'
import { listTowRequests, type TowRequest } from '@/lib/tow-requests'
import { SOURCE_LABELS } from '@/lib/tow-fields'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'

export const dynamic = 'force-dynamic'

/**
 * Screen B — the request list, and the first thing he sees after signing in.
 *
 * The New tab is the default because the only question that matters on opening
 * this is "who am I not back to yet". Filtering is a link rather than client
 * state so the page needs no JavaScript to be useful on a bad signal.
 */

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const minutes = Math.round((Date.now() - then) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

function RequestCard({ request }: { request: TowRequest }) {
  return (
    <li className="tow-card">
      <Link href={`/admin/tows/${request.id}`} className="tow-card-main">
        <div className="tow-card-top">
          <strong>{request.name}</strong>
          <span className={`tow-badge tow-badge-${request.status}`}>{request.status}</span>
        </div>
        {request.serviceType ? <p className="tow-card-service">{request.serviceType}</p> : null}
        {request.source !== 'web' ? (
          <p className="tow-card-source">{SOURCE_LABELS[request.source]}</p>
        ) : null}
        {request.pickup ? <p className="tow-card-pickup">{request.pickup}</p> : null}
        <p className="tow-card-time">{relativeTime(request.createdAt)}</p>
      </Link>
      {/* Outside the card link so a thumb aiming at Call never opens detail. */}
      <a href={telHref(request.phone)} className="tow-card-call" aria-label={`Call ${request.name}`}>
        <Phone size={20} aria-hidden="true" />
        <span>{request.phone}</span>
      </a>
    </li>
  )
}

export default async function TowRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const showAll = tab === 'all'

  const settings = await getPublicFactorySettings()
  const mascot = settings.brandSettings.mascotUrl

  let requests: TowRequest[] = []
  let loadError = ''
  try {
    requests = await listTowRequests()
  } catch {
    loadError = 'Could not load requests. Pull down to try again.'
  }

  // "New" means needs attention — anything he has not dealt with yet.
  const visible = showAll ? requests : requests.filter((entry) => entry.status === 'new')
  const newCount = requests.filter((entry) => entry.status === 'new').length

  return (
    <div className="tow-page">
      <header className="tow-head">
        <h1>Requests</h1>
      </header>

      <Link href="/admin/tows/new" className="cal-add tow-btn-wide" style={{ marginBottom: '16px', justifyContent: 'center' }}>
        <Plus size={16} aria-hidden="true" />
        Write up a job
      </Link>

      <div className="tow-tabs" role="group" aria-label="Filter">
        <Link href="/admin/tows" className={showAll ? undefined : 'is-current'}>
          New{newCount ? ` (${newCount})` : ''}
        </Link>
        <Link href="/admin/tows?tab=all" className={showAll ? 'is-current' : undefined}>
          All
        </Link>
      </div>

      {loadError ? <p className="tow-error">{loadError}</p> : null}

      {visible.length ? (
        <ul className="tow-list">
          {visible.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </ul>
      ) : (
        <div className="tow-empty">
          {mascot ? (
            /* Decorative — the sentence below already says everything. */
            <img src={mascot} alt="" className="tow-empty-mascot" />
          ) : null}
          <p>
            {showAll ? 'No jobs in the book yet.' : 'Nothing waiting on you. '}
            {showAll ? null : <Link href="/admin/tows?tab=all">See all</Link>}
          </p>
        </div>
      )}
    </div>
  )
}
