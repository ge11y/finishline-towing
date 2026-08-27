import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Anton, Hanken_Grotesk, Instrument_Serif, Lobster, Overpass, Overpass_Mono, Public_Sans, Schibsted_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { AppChrome } from "@/components/AppChrome";
import { getPublicFactorySettings } from "@/lib/public-factory-settings";
import { getLiveCatalogDisplayProducts } from "@/lib/catalog-live";
import "./globals.css";

// Font stacks that back brandSettings.fontPreset. Loaded here so the CSS
// variables exist document-wide; AppChrome maps a preset onto --font-heading /
// --font-body on the public shell only (admin keeps the system stack).
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});
const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
});
const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-schibsted",
});
// Served from app/fonts rather than next/font/google: Google rotated IBM Plex
// Sans' variable-axis files out of its CDN, so the google loader 404s on every
// cold build and takes down the whole app. These are the same family's static
// latin weights, vendored so builds no longer depend on that CDN.
const ibmPlexSans = localFont({
  src: [
    { path: "./fonts/IBMPlexSans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexSans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/IBMPlexSans-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/IBMPlexSans-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-ibm-plex",
});

// road_sign: Overpass is drawn from the FHWA Highway Gothic lettering used on
// US road signs; Public Sans is the US Web Design System face, built for small
// sizes; Overpass Mono carries plate numbers and measured labels.
const overpass = Overpass({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-overpass",
});
const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});
const overpassMono = Overpass_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-overpass-mono",
});

// The two faces matched to the client's logo.
//
// Anton for the block caps: heavy, condensed, squared terminals, the same
// build as the FINISHLINE lettering. It ships upright and the logo leans, so
// it is slanted in CSS with `font-style: oblique` — a transform would skew the
// element's box and knock the layout about, where oblique only leans the
// glyphs. This replaced Titan One, which was rounded, wide and upright: a
// reasonable guess against the old round badge and plainly wrong beside the
// new mark.
//
// Lobster for the script: heavy, connected, and it carries the long overhanging
// crossbar on the T that the logo's "Towing" is built around. It replaced
// Yellowtail, which is thinner and more steeply slanted than the brush here.
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});
const lobster = Lobster({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-lobster",
});

const fontVariableClass = [
  instrumentSerif.variable,
  hankenGrotesk.variable,
  schibstedGrotesk.variable,
  ibmPlexSans.variable,
  overpass.variable,
  publicSans.variable,
  overpassMono.variable,
  anton.variable,
  lobster.variable,
].join(" ");

/**
 * The site's own address. SITE_URL wins so a custom domain needs no code
 * change; otherwise Vercel supplies the production hostname at runtime.
 */
function siteUrl(): string {
  const explicit = process.env.SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`
  return 'https://finishline-towing.vercel.app'
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicFactorySettings()
  const title = settings.businessName || "Demo Business"
  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description: settings.siteContent.homepageSubheadline,
    // Indexable unless a deployment opts out. The factory shipped a hard
    // `noindex, nofollow` here, which is right for demo builds and silently
    // wrong for a real client: this site asked Google to ignore it on every
    // page, so schema, sitemaps and titles would all have counted for nothing
    // and the Google listing would have pointed at a page Google refused to
    // read. Preview deployments still opt out, via NOINDEX=1.
    robots:
      process.env.NOINDEX === '1'
        ? { index: false, follow: false }
        : { index: true, follow: true },
    metadataBase: new URL(siteUrl()),
    alternates: { canonical: '/' },
    // Header already uses Jacob Leete's lockup via brandSettings.logoUrl.
    // Favicon is the mascot only (no wordmark). OG points at the lockup.
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${siteUrl()}/site`,
      siteName: title,
      title,
      description: settings.siteContent.homepageSubheadline,
      images: [
        {
          url: '/clients/finish-line-towing/og-lockup.png',
          width: 1200,
          height: 630,
          alt: 'FINISHLINE Towing',
        },
        {
          url: '/clients/finish-line-towing/logo-jhook.png',
          width: 800,
          height: 1011,
          alt: 'FINISHLINE Towing',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: settings.siteContent.homepageSubheadline,
      images: [
        '/clients/finish-line-towing/og-lockup.png',
        '/clients/finish-line-towing/logo-jhook.png',
      ],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasGatewayAcceptance =
    (await cookies()).get("factory_access_gateway_v2")?.value === "accepted";
  const publicSettings = await getPublicFactorySettings();
  // Service clients navigate by service, so the header tabs come from the
  // live catalog rather than a fixed link list.
  const serviceLinks =
    publicSettings.catalogSettings.catalogMode === "services"
      ? (await getLiveCatalogDisplayProducts())
          .filter((product) => product.publicVisible !== false)
          .map((product) => ({ slug: product.slug, label: product.displayName }))
      : [];

  return (
    <html lang="en" className="dark">
      <body
        className={fontVariableClass}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          margin: 0,
        }}
      >
        <AppChrome hasGatewayAcceptance={hasGatewayAcceptance} publicSettings={publicSettings} serviceLinks={serviceLinks}>{children}</AppChrome>
      </body>
    </html>
  );
}
