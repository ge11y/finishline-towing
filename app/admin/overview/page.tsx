import Link from 'next/link'
import { Phone } from 'lucide-react'
import { getOwnerOverview } from '@/lib/tow-requests'
import { listSponsorApplications } from '@/lib/sponsors'

export const dynamic = 'force-dynamic'

const ZONE = 'America/New_York'

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { timeZone: ZONE, hour: 'numeric', minute: '2-digit' })
}

function ago(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 60) return `${Math.max(minutes, 1)} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.round(hours / 24)} days ago`
}

/**
 * The first screen after signing in.
 *
 * Two questions, in this order: what needs me, and what is today. The stat row
 * answers the second at a glance; the list under it is the first, and every
 * line on it is something he can actually act on. Nothing decorative — no
 * charts, no totals-for-the-sake-of-totals. If the list is empty he is done,
 * and the screen says so plainly rather than showing him an empty table.
 */
export default async function OverviewPage() {
  const [{ waiting, bookedToday, bookedWeek, calledNotBooked }, sponsors] = await Promise.all([
    getOwnerOverview(),
    listSponsorApplications().catch(() => []),
  ])
  const newSponsors = sponsors.filter((entry) => entry.status === 'new')

  const todo = [
    ...waiting.map((entry) => ({
      key: entry.id,
      href: `/admin/tows/${entry.id}`,
      lead: `${entry.name} needs a call back`,
      rest: [entry.serviceType, entry.pickup, ago(entry.createdAt)].filter(Boolean).join(' · '),
      tone: 'urgent' as const,
    })),
    ...bookedToday.map((entry) => ({
      key: `today-${entry.id}`,
      href: `/admin/tows/${entry.id}`,
      lead: `${entry.scheduledFor ? timeOf(entry.scheduledFor) : 'Today'} — ${entry.name}`,
      rest: [entry.serviceType, entry.pickup].filter(Boolean).join(' · '),
      tone: 'today' as const,
    })),
    ...calledNotBooked.map((entry) => ({
      key: `open-${entry.id}`,
      href: `/admin/tows/${entry.id}`,
      lead: `${entry.name} — called back, nothing booked`,
      rest: 'Put a time on it or mark it done.',
      tone: 'open' as const,
    })),
    ...newSponsors.map((entry) => ({
      key: `spn-${entry.id}`,
      href: '/admin/sponsors',
      lead: `${entry.company} asked about sponsoring the 74`,
      rest: [entry.contactName, entry.level].filter(Boolean).join(' · '),
      tone: 'open' as const,
    })),
  ]

  const stats = [
    { n: waiting.length, label: 'waiting on a call back' },
    { n: bookedToday.length, label: 'booked today' },
    { n: bookedWeek.length, label: 'booked this week' },
    { n: newSponsors.length, label: 'new sponsor enquiries' },
  ]

  return (
    <div className="adm-page">
      <div className="adm-head">
        <h1>Today at a glance</h1>
        <p>Everything waiting on you this morning, and nothing that isn’t.</p>
      </div>

      <ul className="adm-stats">
        {stats.map((stat) => (
          <li key={stat.label}>
            <strong>{stat.n}</strong>
            <span>{stat.label}</span>
          </li>
        ))}
      </ul>

      <section className="adm-panel">
        <div className="adm-panel-bar">
          <h2>Needs you</h2>
          <span>{todo.length ? `${todo.length} to deal with` : 'all clear'}</span>
        </div>

        {todo.length ? (
          <ul className="adm-todo">
            {todo.map((item) => (
              <li key={item.key}>
                <Link href={item.href}>
                  <span className={`adm-dot adm-dot-${item.tone}`} aria-hidden="true" />
                  <span>
                    <strong>{item.lead}</strong>
                    {item.rest ? <em>{item.rest}</em> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="adm-clear">
            Nothing waiting. New requests land here and text you the moment they come in.
          </p>
        )}
      </section>

      <section className="adm-quick">
        <Link href="/admin/tows/new" className="adm-btn">
          Write up a job
        </Link>
        <Link href="/admin/schedule" className="adm-btn adm-btn-quiet">
          See the calendar
        </Link>
        <a href="tel:6036156750" className="adm-btn adm-btn-quiet">
          <Phone size={15} aria-hidden="true" />
          Your pager
        </a>
      </section>
    </div>
  )
}
