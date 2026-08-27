'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AffiliateReferralCapture } from '@/components/AffiliateReferralCapture'
import { CartProvider } from '@/components/CartProvider'
import { Footer } from '@/components/Footer'
import { NavBar } from '@/components/NavBar'
import { PromoExperience } from '@/components/PromoExperience'
import type { CSSProperties } from 'react'
import type { BrandSettings, FactoryThemePresetId } from '@/lib/admin-settings'
import type { PublicFactorySettings } from '@/lib/public-factory-settings'
import { getPublicThemeClass, getPublicThemeStyle } from '@/lib/public-theme'
import { ServiceHeader, type ServiceNavLink } from '@/components/service/ServiceHeader'
import { CallBar } from '@/components/service/CallBar'
import { ScrollReveal } from '@/components/ScrollReveal'

// Maps brandSettings.fontPreset onto the shell's --font-heading / --font-body.
// Presentation-only: the font variables are loaded in app/layout.tsx, and this
// override lives on the public shell, so admin keeps the system stack. Boutique
// Soft demos default to the editorial pairing when the preset is still the
// untouched 'system' default.
function getPublicFontStyle(brandSettings: BrandSettings, themePreset: FactoryThemePresetId): CSSProperties {
  const preset =
    brandSettings.fontPreset === 'system' && themePreset === 'boutique_soft' ? 'editorial' : brandSettings.fontPreset

  if (preset === 'editorial') {
    return {
      '--font-heading': "var(--font-instrument-serif), 'Iowan Old Style', Georgia, serif",
      '--font-body': 'var(--font-hanken), -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      // Instrument Serif ships weight 400 only; without this, headings that set
      // 700–800 would faux-bold. Snap them to the real 400 the design intends.
      fontSynthesisWeight: 'none',
    } as CSSProperties
  }
  if (preset === 'modern_sans') {
    return {
      '--font-heading': 'var(--font-schibsted), -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      '--font-body': 'var(--font-schibsted), -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    } as CSSProperties
  }
  if (preset === 'road_sign') {
    return {
      '--font-heading': 'var(--font-overpass), -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      '--font-body': 'var(--font-public-sans), -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      '--font-accent': 'var(--font-overpass-mono), ui-monospace, SFMono-Regular, Menlo, monospace',
      '--font-display': 'var(--font-anton), var(--font-overpass), system-ui, sans-serif',
      '--font-script': 'var(--font-lobster), ui-rounded, "Segoe Script", cursive',
    } as CSSProperties
  }
  if (preset === 'clinical') {
    return {
      '--font-heading': 'var(--font-ibm-plex), -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      '--font-body': 'var(--font-ibm-plex), -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    } as CSSProperties
  }
  return {}
}

export function AppChrome({
  children,
  hasGatewayAcceptance,
  publicSettings,
  serviceLinks = [],
}: {
  children: React.ReactNode
  hasGatewayAcceptance: boolean
  publicSettings: PublicFactorySettings
  serviceLinks?: ServiceNavLink[]
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  // The factory surfaces (marketing home + client application) are ge11yz's own
  // brand/chrome; every other public route is the Demo Store demo store.
  const isFactoryHome = pathname === '/' || pathname === '/apply' || Boolean(pathname?.startsWith('/demo'))
  void hasGatewayAcceptance
  const publicThemeClass = getPublicThemeClass(publicSettings.brandSettings.themePreset)
  const publicThemeStyle = getPublicThemeStyle(publicSettings.brandSettings)
  const publicFontStyle = getPublicFontStyle(publicSettings.brandSettings, publicSettings.brandSettings.themePreset)
  // Optional brand character. Only set when the client supplies one, so themes
  // can key decoration off its presence without any client path in shared CSS.
  const mascotUrl = publicSettings.brandSettings.mascotUrl?.trim()
  const mascotStyle = (mascotUrl ? { '--client-mascot': `url("${mascotUrl}")` } : {}) as CSSProperties
  // Service clients get a solid header (utility band + nav) rather than the
  // storefront's nav floating over the hero — the band needs a ground.
  const isServiceChrome = publicSettings.catalogSettings.catalogMode === 'services'

  if (isAdminRoute) {
    return (
      <CartProvider>
        <main style={{ flex: 1 }}>{children}</main>
      </CartProvider>
    )
  }

  return (
      <CartProvider>
        <div
          className={`factory-public-shell ${publicThemeClass}${isServiceChrome ? ' hs-service-chrome' : ''}`}
          style={{ ...publicThemeStyle, ...publicFontStyle, ...mascotStyle, display: 'flex', minHeight: '100vh', flexDirection: 'column' }}
        >
          <ScrollReveal />
          {publicSettings.moduleSettings.affiliates ? <AffiliateReferralCapture /> : null}
          {isFactoryHome ? (
            <header className="fx-nav">
              <Link href="/" className="fx-nav-brand">ge11yz</Link>
              <div className="fx-nav-actions">
                <Link href="/demo" className="fx-nav-link">See the demo</Link>
                <Link href="/apply" className="fx-nav-apply">Apply</Link>
              </div>
            </header>
          ) : (
            <>
              <PromoExperience enabled={publicSettings.moduleSettings.promos} />
              {isServiceChrome ? (
                <ServiceHeader settings={publicSettings} serviceLinks={serviceLinks} />
              ) : (
                <NavBar settings={publicSettings} />
              )}
            </>
          )}
          <main style={{ flex: 1, paddingTop: isFactoryHome ? 0 : 'var(--promo-banner-offset, 0px)' }}>{children}</main>
          {isFactoryHome ? null : <Footer settings={publicSettings} />}
          {isServiceChrome ? <CallBar phone={publicSettings.companyPhone} /> : null}
        </div>
    </CartProvider>
  )
}
