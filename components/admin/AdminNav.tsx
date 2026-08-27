'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Flag, Inbox, LayoutDashboard, PenLine } from 'lucide-react'

/**
 * The admin's navigation.
 *
 * A rail on a wide screen and a scrolling strip on a phone — same links, same
 * order, same counts. The rail is worth having on a laptop, where there is
 * room for it and it shows every section at once, but it is the wrong shape on
 * a phone and Josh is mostly on a phone. So the layout changes and the
 * information does not.
 *
 * Counts sit on the links they belong to. A number beside "Requests" is the
 * whole reason he opens this, and burying it a screen deep would waste it.
 */

const LINKS = [
  { href: '/admin/overview', label: 'Overview', Icon: LayoutDashboard, count: null },
  { href: '/admin/tows', label: 'Requests', Icon: Inbox, count: 'requests' },
  { href: '/admin/schedule', label: 'Schedule', Icon: CalendarDays, count: 'today' },
  { href: '/admin/sponsors', label: 'Sponsors', Icon: Flag, count: 'sponsors' },
  { href: '/admin/tows/new', label: 'Write up a job', Icon: PenLine, count: null },
] as const

export function AdminNav({
  counts,
}: {
  counts: { requests: number; today: number; sponsors: number }
}) {
  const pathname = usePathname()

  return (
    <nav className="adm-nav" aria-label="Dashboard sections">
      {LINKS.map(({ href, label, Icon, count }) => {
        // "Write up a job" lives under /admin/tows, so a prefix match would
        // light up Requests as well. Exact for that one, prefix for the rest.
        const current = href === '/admin/tows' ? pathname === href : pathname.startsWith(href)
        const badge = count ? counts[count] : 0

        return (
          <Link key={href} href={href} className={current ? 'is-current' : undefined}>
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
            {badge > 0 ? (
              <em className="adm-badge" aria-label={`${badge} needing attention`}>
                {badge}
              </em>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
