'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { NavIcon } from '@/components/service/NavIcon'
import { usePathname } from 'next/navigation'
import { Menu, Phone, Star, X } from 'lucide-react'
import type { PublicFactorySettings } from '@/lib/public-factory-settings'

export type ServiceNavLink = { slug: string; label: string }

function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

/**
 * Single-row header for home-service clients: proof and geography on the left,
 * the mark centred and large enough to read, and the two conversion actions
 * plus the menu on the right. Services run underneath as tabs on wide screens
 * and collapse into the drawer on phones, where the actions become two
 * full-width buttons instead.
 */
export function ServiceHeader({
  settings,
  serviceLinks,
}: {
  settings: PublicFactorySettings
  serviceLinks: ServiceNavLink[]
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { serviceSite } = settings
  const phone = settings.companyPhone.trim()
  const rating = serviceSite.ratingValue.trim()
  const ratingNumber = Number(rating)
  const hasRating = Boolean(rating) && Number.isFinite(ratingNumber)
  const logo = settings.brandSettings.navLogoUrl || settings.brandSettings.logoUrl

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const quoteLink = (
    <Link href="/contact" className="hs-hdr-quote">
      Request a quote
    </Link>
  )
  const phoneLink = phone ? (
    <a href={telHref(phone)} className="hs-hdr-phone">
      <Phone size={17} aria-hidden="true" />
      <span>
        <span className="hs-hdr-phone-label">Stranded? Call now!</span>
        <strong>{phone}</strong>
      </span>
    </a>
  ) : null

  return (
    <>
      <header className="hs-hdr">
        <div className="hs-hdr-inner">
          <div className="hs-hdr-proof">
            {hasRating ? (
              <ProofRating settings={settings} ratingNumber={ratingNumber} rating={rating} />
            ) : null}
            {serviceSite.serviceAreaLine ? <span className="hs-hdr-area">{serviceSite.serviceAreaLine}</span> : null}
          </div>

          <Link href="/site" className="hs-hdr-logo" aria-label={`${settings.businessName} home`}>
            {logo ? (
              <span className="hs-hdr-mark">
                <Image src={logo} alt={settings.businessName} fill sizes="160px" priority style={{ objectFit: 'contain' }} />
              </span>
            ) : (
              <span className="hs-hdr-wordmark">{settings.businessName}</span>
            )}
          </Link>

          <div className="hs-hdr-actions">
            {quoteLink}
            {phoneLink}
            <button
              type="button"
              className="hs-hdr-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Phones: both actions as full-width buttons under the header row. */}
        <div className="hs-hdr-mobile-actions">
          {quoteLink}
          {phoneLink}
        </div>

        {/* Wide screens: every service is a tab, each its own page. */}
        {serviceLinks.length ? (
          <nav className="hs-tabs" aria-label="Services">
            <Link href="/site" className={pathname === '/site' ? 'is-current' : undefined}>
              <NavIcon name="home" />
              Home
            </Link>
            {serviceLinks.map((link) => (
              <Link
                key={link.slug}
                href={`/services/${link.slug}`}
                className={pathname === `/services/${link.slug}` ? 'is-current' : undefined}
              >
                <NavIcon name={link.slug} />
                {link.label}
              </Link>
            ))}
            <Link href="/racing" className={pathname === '/racing' ? 'is-current' : undefined}>
              <NavIcon name="racing" />
              The 74
            </Link>
            <Link href="/merch" className={pathname === '/merch' ? 'is-current' : undefined}>
              <NavIcon name="merch" />
              Merch
            </Link>
            <Link
              href="/service-area"
              className={pathname === '/service-area' ? 'is-current' : undefined}
            >
              <NavIcon name="service-area" />
              Service Area
            </Link>
            <Link href="/contact" className={pathname === '/contact' ? 'is-current' : undefined}>
              <NavIcon name="contact" />
              Contact
            </Link>
          </nav>
        ) : null}
      </header>

      {menuOpen ? <div className="hs-drawer-scrim" role="presentation" onClick={() => setMenuOpen(false)} /> : null}
      <div
        className="hs-drawer"
        data-open={menuOpen}
        aria-hidden={!menuOpen}
        onClick={(event) => {
          // Navigating from the drawer should close it.
          if ((event.target as HTMLElement).closest('a')) setMenuOpen(false)
        }}
      >
        <p className="hs-drawer-heading">{settings.catalogSettings.serviceLabel}</p>
        {serviceLinks.map((link) => (
          <Link key={link.slug} href={`/services/${link.slug}`} className="hs-drawer-link">
            <NavIcon name={link.slug} size={17} />
            {link.label}
          </Link>
        ))}
        <p className="hs-drawer-heading">Company</p>
        <Link href="/site" className="hs-drawer-link">
          Home
        </Link>
        <Link href="/about" className="hs-drawer-link">
          About
        </Link>
        <Link href="/racing" className="hs-drawer-link">
          <NavIcon name="racing" size={17} />
          The 74 — Racing
        </Link>
        <Link href="/merch" className="hs-drawer-link">
          <NavIcon name="merch" size={17} />
          Merch
        </Link>
        <Link href="/service-area" className="hs-drawer-link">
          <NavIcon name="service-area" size={17} />
          Service Area
        </Link>
        <Link href="/faq" className="hs-drawer-link">
          FAQ
        </Link>
        <Link href="/contact" className="hs-drawer-link">
          Contact
        </Link>
        <Link href="/contact" className="hs-drawer-cta">
          Request a quote
        </Link>
      </div>
    </>
  )
}

function ProofRating({
  settings,
  rating,
  ratingNumber,
}: {
  settings: PublicFactorySettings
  rating: string
  ratingNumber: number
}) {
  const { serviceSite } = settings
  const body = (
    <span className="hs-hdr-rating">
      <strong>{rating}</strong>
      <span className="hs-hdr-stars" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => (
          <Star key={index} size={16} fill={index < Math.round(ratingNumber) ? 'currentColor' : 'none'} strokeWidth={1.5} />
        ))}
      </span>
      <span className="hs-hdr-rating-count">
        {serviceSite.ratingCount ? `${serviceSite.ratingCount} reviews` : 'reviews'}
        {serviceSite.ratingSource ? ` on ${serviceSite.ratingSource}` : ''}
      </span>
    </span>
  )

  return serviceSite.reviewsUrl ? (
    <a href={serviceSite.reviewsUrl} target="_blank" rel="noreferrer" className="hs-hdr-rating-link">
      {body}
    </a>
  ) : (
    body
  )
}
