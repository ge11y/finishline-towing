'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react'
import {
  Building2,
  Boxes,
  Ellipsis,
  FileText,
  Hammer,
  House,
  Image as ImageIcon,
  LogOut,
  Mail,
  MessagesSquare,
  Target,
  PackagePlus,
  Percent,
  Settings2,
  Share2,
  ShoppingBag,
  Tag,
  Truck,
  Users,
  X,
} from 'lucide-react'
import type { AdminSettingsPayload, ModuleSettings } from '@/lib/admin-settings'
import { getAdminBackendLabel } from '@/lib/admin-backend'
import { loadSeenOrderIds } from '@/lib/admin-notifications'
import { getModuleLabel, getVisibleAdminLinks } from '@/lib/module-access'
import type { ManualOrderSubmission } from '@/lib/manual-orders'

interface AdminShellProps {
  active: string
  title: string
  description: string
  purpose?: string
  workflow?: string[]
  teamNotes?: string[]
  requiredModule?: keyof ModuleSettings
  children: ReactNode
}

type IconComponent = ComponentType<{ size?: number | string; strokeWidth?: number | string; 'aria-hidden'?: boolean }>

const LINK_ICONS: Record<string, IconComponent> = {
  '/admin': House,
  '/admin/factory': Settings2,
  '/admin/applications': FileText,
  '/admin/builds': Hammer,
  '/admin/business': Building2,
  '/admin/catalog': Tag,
  '/admin/emails': Mail,
  '/admin/inventory': Boxes,
  '/admin/assets': ImageIcon,
  '/admin/supply': Truck,
  '/admin/add-ons': PackagePlus,
  '/admin/orders': ShoppingBag,
  '/admin/clients': Users,
  '/admin/leads': Target,
  '/admin/inbox': MessagesSquare,
  '/admin/affiliates': Share2,
  '/admin/promos': Percent,
}

// The owner's daily-driver screens claim the mobile tab slots first;
// when a module toggle hides one, the next visible workspace fills in.
const TAB_PRIORITY = ['/admin', '/admin/orders', '/admin/catalog', '/admin/clients']
const TAB_LABELS: Record<string, string> = { '/admin': 'Home', '/admin/business': 'Business' }
// Compact display names so rail labels never truncate at 88px.
const RAIL_LABELS: Record<string, string> = { '/admin/business': 'Business' }

function OrderCountBadge({ count }: { count: number }) {
  if (!count) return null
  return (
    <span className="admin-count-badge" aria-label={`${count} new orders`}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function AdminShell({ active, title, description, purpose, workflow, teamNotes, requiredModule, children }: AdminShellProps) {
  const backendLabel = getAdminBackendLabel()
  const [moduleSettings, setModuleSettings] = useState<ModuleSettings | null>(null)
  const [unseenOrderCount, setUnseenOrderCount] = useState(0)
  const [loggingOut, setLoggingOut] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [titleScrolledAway, setTitleScrolledAway] = useState(false)
  const pageTitleRef = useRef<HTMLHeadingElement | null>(null)

  useEffect(() => {
    let activeSession = true

    async function loadModuleSettings() {
      try {
        const response = await fetch('/api/admin/settings', { cache: 'no-store' })
        const result = (await response.json()) as { ok?: boolean; settings?: AdminSettingsPayload }
        if (!activeSession || !response.ok || !result.ok || !result.settings) return
        setModuleSettings(result.settings.moduleSettings)
      } catch {
        if (activeSession) setModuleSettings(null)
      }
    }

    void loadModuleSettings()

    return () => {
      activeSession = false
    }
  }, [])

  useEffect(() => {
    let activeSession = true
    const seen = () => new Set(loadSeenOrderIds())

    function applyUnseenCount(orders: ManualOrderSubmission[]) {
      const unseen = orders.filter((order) => order.status !== 'fulfilled' && !seen().has(order.id)).length
      setUnseenOrderCount(unseen)
    }

    async function loadOrderNotifications() {
      try {
        const response = await fetch('/api/admin/orders', { cache: 'no-store' })
        const result = (await response.json()) as { ok: boolean; orders?: ManualOrderSubmission[] }
        if (!activeSession || !response.ok || !result.ok) return
        applyUnseenCount(result.orders ?? [])
      } catch {
        if (activeSession) setUnseenOrderCount(0)
      }
    }

    function handleOrdersUpdated(event: Event) {
      const customEvent = event as CustomEvent<{ orders?: ManualOrderSubmission[] }>
      if (customEvent.detail?.orders) {
        applyUnseenCount(customEvent.detail.orders)
        return
      }
      void loadOrderNotifications()
    }

    if (moduleSettings && !moduleSettings.crm) {
      return () => {
        activeSession = false
      }
    }

    void loadOrderNotifications()
    const interval = window.setInterval(loadOrderNotifications, 15000)
    window.addEventListener('admin-seen-orders-updated', loadOrderNotifications)
    window.addEventListener('admin-orders-updated', handleOrdersUpdated)

    return () => {
      activeSession = false
      window.clearInterval(interval)
      window.removeEventListener('admin-seen-orders-updated', loadOrderNotifications)
      window.removeEventListener('admin-orders-updated', handleOrdersUpdated)
    }
  }, [active, moduleSettings])

  const links = useMemo(
    () =>
      getVisibleAdminLinks(moduleSettings).map((item) => ({
        ...item,
        badge: item.href === '/admin/orders' ? unseenOrderCount : 0,
      })),
    [moduleSettings, unseenOrderCount],
  )

  const tabLinks = useMemo(() => {
    const picked = TAB_PRIORITY.map((href) => links.find((link) => link.href === href)).filter(
      (link): link is (typeof links)[number] => Boolean(link),
    )
    for (const link of links) {
      if (picked.length >= 4) break
      if (!picked.some((tab) => tab.href === link.href)) picked.push(link)
    }
    return picked
  }, [links])

  const sheetLinks = useMemo(() => links.filter((link) => !tabLinks.some((tab) => tab.href === link.href)), [links, tabLinks])

  useEffect(() => {
    const heading = pageTitleRef.current
    if (!heading || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setTitleScrolledAway(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: '-64px 0px 0px 0px' },
    )
    observer.observe(heading)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!sheetOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSheetOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [sheetOpen])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      window.location.href = '/admin/login'
    } finally {
      setLoggingOut(false)
    }
  }

  const requiredModuleEnabled = !requiredModule || !moduleSettings || Boolean(moduleSettings[requiredModule])
  const requiredModuleLabel = requiredModule ? getModuleLabel(requiredModule) : ''
  const hasGuide = Boolean(purpose || (workflow && workflow.length > 0) || (teamNotes && teamNotes.length > 0))

  return (
    <div className="admin-shell-root">
      <aside className="admin-rail" aria-label="Admin workspaces">
        <div className="admin-rail-brand" aria-hidden="true">
          A
        </div>
        {links.map((item) => {
          const Icon = LINK_ICONS[item.href] ?? House
          const isActive = active === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-rail-item${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="admin-tab-icon">
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden />
                <OrderCountBadge count={item.badge} />
              </span>
              <span>{RAIL_LABELS[item.href] ?? item.label}</span>
            </Link>
          )
        })}
      </aside>

      <div className="admin-body">
        <header className={`admin-topbar${titleScrolledAway ? ' scrolled' : ''}`}>
          <div className="admin-topbar-title" aria-hidden={!titleScrolledAway}>
            {title}
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-backend-chip">{backendLabel}</div>
            <button type="button" onClick={handleLogout} className="fm-btn-outline" disabled={loggingOut}>
              {loggingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </header>

        <main className="admin-main">
          <div className="admin-main-inner">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="section-label">Admin</div>
              <h1 ref={pageTitleRef} style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', margin: 0, letterSpacing: '-0.02em' }}>{title}</h1>
              <p style={{ margin: 0, maxWidth: '920px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{description}</p>
            </div>

            {hasGuide && (
              <section aria-label="Page guide" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  type="button"
                  className="admin-guide-toggle"
                  onClick={() => setGuideOpen((current) => !current)}
                  aria-expanded={guideOpen}
                >
                  {guideOpen ? 'Hide page guide' : 'Show page guide'}
                </button>
                <div className={`admin-guide-cards${guideOpen ? ' open' : ''}`}>
                  <div className="card" style={{ padding: '20px', display: 'grid', gap: '10px', alignContent: 'start' }}>
                    <div className="section-label">What This Page Is For</div>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                      {purpose || 'Manage this part of the storefront and keep the public site current.'}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '20px', display: 'grid', gap: '10px', alignContent: 'start' }}>
                    <div className="section-label">Typical Workflow</div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {(workflow && workflow.length > 0
                        ? workflow
                        : ['Review the records on this page.', 'Make needed updates.', 'Confirm the current status before moving on.']).map(
                        (item, index) => (
                          <div key={`${item}-${index}`} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr)', gap: '10px', alignItems: 'start' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '999px',
                                background: 'rgba(42,79,174,0.08)',
                                color: 'var(--accent-500)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                              }}
                            >
                              {index + 1}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item}</div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '20px', display: 'grid', gap: '10px', alignContent: 'start' }}>
                    <div className="section-label">Team Tips</div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {(teamNotes && teamNotes.length > 0
                        ? teamNotes
                        : ['Keep statuses current so the rest of the team can trust the queue.', 'Use notes fields for exceptions or follow-up.']).map((item) => (
                        <div key={item} style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                          <span style={{ color: 'var(--accent-500)', fontSize: '15px', lineHeight: 1.4 }}>•</span>
                          <span style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {requiredModuleEnabled ? (
              children
            ) : (
              <div className="card" style={{ padding: '28px', display: 'grid', gap: '16px', maxWidth: '760px' }}>
                <div className="section-label">Module Disabled</div>
                <h2 style={{ margin: 0, fontSize: '28px' }}>{requiredModuleLabel} is off for this build</h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  This page is hidden by the current tier/module bundle. Enable it from Factory settings if this client
                  has upgraded scope or needs this workflow.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <Link href="/admin/factory" className="fm-btn-primary">
                    Open Factory Settings
                  </Link>
                  <Link href="/admin/builds" className="fm-btn-outline">
                    Review Client Builds
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <nav className="admin-tabbar" aria-label="Admin navigation">
        {tabLinks.map((item) => {
          const Icon = LINK_ICONS[item.href] ?? House
          const isActive = active === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-tab${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="admin-tab-icon">
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden />
                <OrderCountBadge count={item.badge} />
              </span>
              <span>{TAB_LABELS[item.href] ?? item.label}</span>
            </Link>
          )
        })}
        <button
          type="button"
          className={`admin-tab${sheetOpen ? ' active' : ''}`}
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
        >
          <span className="admin-tab-icon">
            <Ellipsis size={22} strokeWidth={1.8} aria-hidden />
          </span>
          <span>More</span>
        </button>
      </nav>

      {sheetOpen ? (
        <>
          <button type="button" className="admin-sheet-backdrop" aria-label="Close menu" onClick={() => setSheetOpen(false)} />
          <div className="admin-sheet" role="dialog" aria-modal="true" aria-label="More workspaces">
            <div className="admin-sheet-grabber" aria-hidden="true" />
            <div className="admin-sheet-head">
              <div className="admin-sheet-title">More</div>
              {/* Sheet is a modal dialog; moving focus into it on open is the accessible behavior. */}
              <button type="button" className="admin-sheet-close" onClick={() => setSheetOpen(false)} aria-label="Close menu" autoFocus>
                <X size={20} aria-hidden />
              </button>
            </div>
            {sheetLinks.map((item) => {
              const Icon = LINK_ICONS[item.href] ?? House
              const isActive = active === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="admin-sheet-row"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setSheetOpen(false)}
                >
                  <span className="admin-sheet-row-icon">
                    <Icon size={19} strokeWidth={1.9} aria-hidden />
                    <OrderCountBadge count={item.badge} />
                  </span>
                  {item.label}
                </Link>
              )
            })}
            <button type="button" className="admin-sheet-row" onClick={handleLogout} disabled={loggingOut}>
              <span className="admin-sheet-row-icon">
                <LogOut size={19} strokeWidth={1.9} aria-hidden />
              </span>
              {loggingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
            <div className="admin-sheet-footer">{backendLabel}</div>
          </div>
        </>
      ) : null}
    </div>
  )
}
