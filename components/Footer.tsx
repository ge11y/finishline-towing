"use client";

import Link from "next/link";
import { SITE_SETTINGS } from "@/lib/data-site";
import type { PublicFactorySettings } from "@/lib/public-factory-settings";

const columnHeadingStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  fontFamily: "var(--font-body)",
  marginBottom: "16px",
};

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        fontSize: "14px",
        color: "var(--text-secondary)",
        display: "block",
        lineHeight: 2,
        textDecoration: "none",
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = "var(--amber)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
      }}
    >
      {children}
    </Link>
  );
}

export function Footer({ settings }: { settings?: PublicFactorySettings }) {
  const businessName = settings?.businessName || SITE_SETTINGS.businessName;
  const tagline = settings?.siteContent.homepageSubheadline || SITE_SETTINGS.tagline;
  const footerDisclaimer = settings?.siteContent.footerDisclaimer || SITE_SETTINGS.footerDisclaimer;
  const catalogLabel = settings?.catalogSettings.productLabel || "Catalog";
  const isServiceMode = settings?.catalogSettings.catalogMode === "services";
  const serviceSite = settings?.serviceSite;
  const addOnLabel = settings?.catalogSettings.addOnLabel || "Add-ons";
  const showAddOns = settings?.moduleSettings.addOns ?? true;
  const showAffiliates = settings?.moduleSettings.affiliates ?? true;
  const showDocuments = settings?.moduleSettings.documents ?? true;

  return (
    <footer
      style={{
        backgroundColor: "var(--bg-base)",
        borderTop: "1px solid var(--border)",
        padding: "56px 40px 32px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "48px",
          alignItems: "flex-start",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Brand column */}
        <div style={{ flex: "0 0 240px" }}>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "24px",
              fontWeight: 400,
              color: "var(--accent-400)",
              marginBottom: "12px",
            }}
          >
            {businessName}
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              maxWidth: "200px",
            }}
          >
            {tagline}
          </p>
        </div>

        {/* Catalog */}
        <div>
          <p style={columnHeadingStyle}>{catalogLabel}</p>
          {/* The service label can be a phrase ("What we work on"), so don't
              interpolate it into a sentence — it reads badly. Service clients
              have no product catalog, so point at the site's services section
              rather than /products. */}
          {isServiceMode ? (
            <FooterLink href="/site#services">See all services</FooterLink>
          ) : (
            <FooterLink href="/products">View {catalogLabel}</FooterLink>
          )}
          {showAddOns ? <FooterLink href="/add-ons">View {addOnLabel}</FooterLink> : null}
          <FooterLink href="/contact">{isServiceMode ? "Request an estimate" : "Request Support"}</FooterLink>
        </div>

        {/* Company */}
        <div>
          <p style={columnHeadingStyle}>Company</p>
          <FooterLink href="/about">About</FooterLink>
          {showAddOns ? <FooterLink href="/add-ons">{addOnLabel}</FooterLink> : null}
          {showAffiliates ? <FooterLink href="/affiliate">Affiliate</FooterLink> : null}
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="/faq">FAQ</FooterLink>
          {isServiceMode ? null : <FooterLink href="/apply">Work With Us</FooterLink>}
        </div>

        {/* Business hours — service clients are judged on when they answer. */}
        {isServiceMode && serviceSite?.businessHours.length ? (
          <div>
            <p style={columnHeadingStyle}>Business Hours</p>
            <dl className="hs-foot-hours">
              {serviceSite.businessHours.map((entry) => (
                <div key={`${entry.days}-${entry.hours}`}>
                  <dt>{entry.days}</dt>
                  <dd>{entry.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {/* Serving area — the local-SEO column. */}
        {isServiceMode && serviceSite?.serviceAreaTowns.length ? (
          <div style={{ flex: "1 1 220px", minWidth: 0 }}>
            <p style={columnHeadingStyle}>Serving Area</p>
            <ul className="hs-foot-towns">
              {serviceSite.serviceAreaTowns.map((town) => (
                <li key={town}>{town}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Legal */}
        <div>
          <p style={columnHeadingStyle}>Legal</p>
          <FooterLink href="/terms">Terms of Service</FooterLink>
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
          {showDocuments && !isServiceMode ? <FooterLink href="/disclaimer">Disclaimer</FooterLink> : null}
          {isServiceMode ? null : <FooterLink href="/shipping-returns">Shipping &amp; Returns</FooterLink>}
        </div>
      </div>

      {/* Copyright bar */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          marginTop: "40px",
          paddingTop: "20px",
          fontSize: "11px",
          color: "var(--text-muted)",
          maxWidth: 1200,
          margin: "40px auto 0",
          lineHeight: 1.6,
        }}
      >
        © 2026 {businessName}. All rights reserved. {footerDisclaimer}
      </div>
    </footer>
  );
}
