import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'
import { getPublicThemeClass, getPublicThemeStyle } from '@/lib/public-theme'
import { getOwnerOverview } from '@/lib/tow-requests'
import { listSponsorApplications } from '@/lib/sponsors'
import { AdminNav } from '@/components/admin/AdminNav'

/**
 * Brand chrome and navigation for the owner's admin.
 *
 * It carries his theme tokens rather than a copy of his colours, so the admin
 * moves whenever the site does — the same `--sign-field`, `--sign-hivis` and
 * the checkered rule the public pages use. The mark is portrait because his
 * logo is; a square slot would shrink it to fit the width.
 *
 * Restraint is still the point. The research note about the site applies twice
 * over here: a thin checker rule, not a background. He opens this at two in
 * the morning to find out where a car is, and the livery must never be the
 * thing competing for that half second — so the brand lives in the bar and the
 * accents, and everything below stays quiet and high-contrast.
 *
 * Headings take Overpass and body text stays Public Sans. Titan One and the
 * script face are on his site and stay off this screen: they are display
 * faces, and a pickup address in a script font is an address he misreads.
 *
 * The counts are fetched once here rather than in each page, so the badges
 * agree with each other no matter which screen he is on.
 */
export async function TowShell({ children }: { children: React.ReactNode }) {
  const settings = await getPublicFactorySettings()
  const logo = settings.brandSettings.logoUrl

  const [overview, sponsors] = await Promise.all([
    getOwnerOverview().catch(() => null),
    listSponsorApplications().catch(() => []),
  ])
  const counts = {
    requests: overview?.waiting.length ?? 0,
    today: overview?.bookedToday.length ?? 0,
    sponsors: sponsors.filter((entry) => entry.status === 'new').length,
  }

  const style = {
    ...getPublicThemeStyle(settings.brandSettings),
    '--font-heading': 'var(--font-overpass), -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    '--font-body': 'var(--font-public-sans), -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    '--font-accent': 'var(--font-overpass-mono), ui-monospace, SFMono-Regular, Menlo, monospace',
  } as CSSProperties

  return (
    <div className={`tow-shell ${getPublicThemeClass(settings.brandSettings.themePreset)}`} style={style}>
      <header className="tow-brandbar">
        <Link href="/admin/overview" className="tow-brandbar-mark">
          {logo ? <Image src={logo} alt="" width={38} height={47} priority /> : null}
          <span>
            <strong>{settings.businessName}</strong>
            <small>Job book</small>
          </span>
        </Link>
        <a href={`tel:${settings.companyPhone.replace(/[^+\d]/g, '')}`} className="tow-brandbar-num">
          {settings.companyPhone}
        </a>
      </header>
      <div className="tow-checkrule" aria-hidden="true" />

      <div className="adm-shell">
        <AdminNav counts={counts} />
        <main className="adm-main">{children}</main>
      </div>
    </div>
  )
}
