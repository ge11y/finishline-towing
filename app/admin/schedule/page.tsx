import Link from 'next/link'
import { Phone, Plus } from 'lucide-react'
import { listScheduled, type TowRequest } from '@/lib/tow-requests'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'

export const dynamic = 'force-dynamic'

/**
 * The calendar — one day at a time, laid out against the clock.
 *
 * A month grid is the obvious thing to reach for and the wrong one here: on a
 * phone it is twenty-eight unreadable squares, most of them empty, and it
 * cannot show a time. What he needs to see is his day in order with the gaps
 * visible, so this is an hour column with jobs sitting in their slot, and a
 * week strip above it to move between days.
 *
 * The window runs 6am to 10pm because that is where the bookable work is. He
 * takes calls around the clock, but nobody schedules a transport for 3am — and
 * anything that does land outside the window is still shown, pinned to the
 * nearest end, rather than silently dropped.
 */

const ZONE = 'America/New_York'
const DAY_START = 6
const DAY_END = 22

function ymd(date: Date): string {
  // en-CA gives ISO-shaped YYYY-MM-DD, which sorts and compares cleanly.
  return date.toLocaleDateString('en-CA', { timeZone: ZONE })
}

function hourIn(iso: string): number {
  const hour = Number(
    new Date(iso).toLocaleString('en-US', { timeZone: ZONE, hour: 'numeric', hour12: false }),
  )
  return Number.isFinite(hour) ? hour : DAY_START
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: ZONE,
    hour: 'numeric',
    minute: '2-digit',
  })
}

function hourLabel(hour: number): string {
  if (hour === 12) return 'noon'
  return hour > 12 ? `${hour - 12} pm` : `${hour} am`
}

function JobCard({ job }: { job: TowRequest }) {
  return (
    <div className="cal-job">
      <Link href={`/admin/tows/${job.id}`} className="cal-job-main">
        <div className="cal-job-top">
          <strong>{job.scheduledFor ? timeOf(job.scheduledFor) : ''}</strong>
          <span className={`tow-badge tow-badge-${job.status}`}>{job.status}</span>
        </div>
        <p className="cal-job-who">{job.name}</p>
        {job.serviceType ? <p className="cal-job-what">{job.serviceType}</p> : null}
        {job.pickup ? <p className="cal-job-where">{job.pickup}</p> : null}
        {job.situation.length ? (
          <p className="cal-job-situation">{job.situation.join(' · ')}</p>
        ) : null}
      </Link>
      <a
        href={`tel:${job.phone.replace(/[^+\d]/g, '')}`}
        className="cal-job-call"
        aria-label={`Call ${job.name}`}
      >
        <Phone size={17} aria-hidden="true" />
      </a>
    </div>
  )
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>
}) {
  const { d } = await searchParams
  const today = ymd(new Date())
  // A bad ?d= falls back to today rather than erroring — this is a URL he may
  // well end up editing by hand or sharing.
  const selected = d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : today

  // Pull a wide window once, then bucket in memory. The volume here is one
  // truck's work, so a second query per day would be pure overhead.
  const from = new Date(`${selected}T00:00:00Z`)
  from.setUTCDate(from.getUTCDate() - 8)
  const all = await listScheduled(from.toISOString())
  const settings = await getPublicFactorySettings()
  const mascot = settings.brandSettings.mascotUrl

  const onDay = all.filter((job) => job.scheduledFor && ymd(new Date(job.scheduledFor)) === selected)

  // Seven days starting Monday of the selected week.
  const anchor = new Date(`${selected}T12:00:00Z`)
  const weekday = (anchor.getUTCDay() + 6) % 7
  const monday = new Date(anchor)
  monday.setUTCDate(anchor.getUTCDate() - weekday)
  const week = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday)
    day.setUTCDate(monday.getUTCDate() + index)
    const key = day.toISOString().slice(0, 10)
    return {
      key,
      label: day.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short' }),
      date: day.toLocaleDateString('en-US', { timeZone: 'UTC', day: 'numeric' }),
      count: all.filter((job) => job.scheduledFor && ymd(new Date(job.scheduledFor)) === key).length,
    }
  })

  const hours = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i)
  const bucket = new Map<number, TowRequest[]>()
  for (const job of onDay) {
    if (!job.scheduledFor) continue
    // Anything before or after the window is pinned to the end rather than lost.
    const slot = Math.min(Math.max(hourIn(job.scheduledFor), DAY_START), DAY_END)
    bucket.set(slot, [...(bucket.get(slot) ?? []), job])
  }

  const heading = new Date(`${selected}T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="tow-page">
      <header className="tow-head">
        <h1>Schedule</h1>
      </header>

      <nav className="cal-week" aria-label="Week">
        {week.map((day) => (
          <Link
            key={day.key}
            href={`/admin/schedule?d=${day.key}`}
            className={`cal-day${day.key === selected ? ' is-selected' : ''}${day.key === today ? ' is-today' : ''}`}
            aria-current={day.key === selected ? 'date' : undefined}
          >
            <span className="cal-day-name">{day.label}</span>
            <span className="cal-day-num">{day.date}</span>
            {day.count ? <span className="cal-day-dot" aria-label={`${day.count} booked`} /> : null}
          </Link>
        ))}
      </nav>

      <div className="cal-headline">
        <h2>{selected === today ? `Today — ${heading}` : heading}</h2>
        <Link href="/admin/tows/new" className="cal-add">
          <Plus size={16} aria-hidden="true" />
          Write up a job
        </Link>
      </div>

      {onDay.length ? (
        <div className="cal-grid">
          {hours.map((hour) => {
            const jobs = bucket.get(hour) ?? []
            return (
              <div key={hour} className={`cal-row${jobs.length ? ' has-job' : ''}`}>
                <div className="cal-hour">{hourLabel(hour)}</div>
                <div className="cal-slot">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="tow-empty">
          {mascot ? <img src={mascot} alt="" className="tow-empty-mascot" /> : null}
          <p>
            Nothing booked this day. <Link href="/admin/tows/new">Write up a job</Link> or set a
            time on a request.
          </p>
        </div>
      )}
    </div>
  )
}
