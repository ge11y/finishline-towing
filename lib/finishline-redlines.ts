/**
 * Founder redlines for the Finishline /site punch.
 *
 * Production may serve settings and catalog from Supabase. These overlays
 * apply at read time so the marked-up copy and photos still appear when the
 * database row is stale. Facts only — no invented Josh quotes or FMCSA claims.
 */

import type { PublicFactorySettings } from '@/lib/public-factory-settings'
import type { Product } from '@/lib/types'
import { LABELED_HOURS, PROOF_POINTS, SUPPORT_NOTE } from '@/lib/contact'

export const ROUND_LOGO = '/clients/finish-line-towing/logo-round.png'
export const HERO_BANNER = '/clients/finish-line-towing/hero-racetruck-v3.jpg'
export const TOWING_SECTION_PHOTO = '/clients/finish-line-towing/work-camaro-randys.jpg'
export const RECOVERY_PHOTO = '/clients/finish-line-towing/gallery-2.jpg'

/** Stuck SUV in the woods — marked remove. Do not feature it. */
export const REMOVED_STUCK_SUV_PHOTO = '/clients/finish-line-towing/recovery.jpg'

export const HIDE_LEARN_MORE_SLUGS = new Set(['roadside-assistance', 'hauling-transport'])

export const SERVICE_REDLINES: Record<
  string,
  {
    summaryShort: string
    summaryFull: string
    image?: string
  }
> = {
  'flatbed-towing': {
    summaryShort:
      'Cars, light trucks and no-starts\nStrapped at the wheels, never chained to the frame\nBreakdowns, accidents and anything that shouldn\'t be dragged\nLoaded and unloaded by the owner',
    summaryFull:
      'Cars, light trucks and no-starts\nStrapped at the wheels, never chained to the frame\nBreakdowns, accidents and anything that shouldn\'t be dragged\nLoaded and unloaded by the owner',
    image: TOWING_SECTION_PHOTO,
  },
  'recovery-winch-outs': {
    summaryShort:
      'Off the shoulder, in a ditch, or backed into soft ground\nSlid off a dirt road in winter\nWinched out and set back on the road, or loaded up',
    summaryFull:
      'Off the shoulder, in a ditch, or backed into soft ground\nSlid off a dirt road in winter\nWinched out and set back on the road, or loaded up',
    image: RECOVERY_PHOTO,
  },
  'roadside-assistance': {
    summaryShort: 'Jump starts\nLockouts\nFlat tire changes',
    summaryFull: 'Jump starts\nLockouts\nFlat tire changes',
  },
  'hauling-transport': {
    summaryShort: 'Vehicles that don\'t run, and project cars\nAuction and dealer pickups\nSmall equipment',
    summaryFull: 'Vehicles that don\'t run, and project cars\nAuction and dealer pickups\nSmall equipment',
  },
  'junk-car-removal': {
    summaryShort:
      'Dead vehicles taken off your hands\nCleared off your lawn or driveway\nCall with the year, make and condition\nTitle required.',
    summaryFull:
      'Dead vehicles taken off your hands\nCleared off your lawn or driveway\nCall with the year, make and condition\nTitle required.',
  },
  'motorcycle-towing': {
    summaryShort: 'Hauled on the flatbed with care.',
    summaryFull: 'Hauled on the flatbed with care.',
  },
}

const ABOUT_COPY =
  'Finish Line Towing is Joshua Aldrich. Local, owner-operated flatbed towing and recovery out of North Haverhill — serving the Twin States since 2012. The truck rolls 24/7; the phone goes to him, not a call center. In his words: "I started in this business as an opportunity to provide for our area, with services much needed."'

const SUBHEAD =
  '24/7 flatbed towing and recovery out of North Haverhill, New Hampshire. Serving the Twin States.'

const PROOF = PROOF_POINTS

export function applyCatalogRedlines<T extends Pick<Product, 'slug' | 'summaryShort' | 'summaryFull' | 'image'>>(
  products: T[],
): T[] {
  return products.map((product) => {
    const redline = SERVICE_REDLINES[product.slug]
    if (!redline) return product
    const nextImage =
      redline.image !== undefined
        ? redline.image
        : product.image === REMOVED_STUCK_SUV_PHOTO
          ? ''
          : product.image
    return {
      ...product,
      summaryShort: redline.summaryShort,
      summaryFull: redline.summaryFull,
      image: nextImage,
    }
  })
}

/** Public grid / nav / forms. Motorcycle last — rarely towed, no photo. */
export const SERVICE_DISPLAY_ORDER = [
  'flatbed-towing',
  'recovery-winch-outs',
  'roadside-assistance',
  'hauling-transport',
  'junk-car-removal',
  'motorcycle-towing',
] as const

export function orderServicesForDisplay<T extends { slug: string }>(services: T[]): T[] {
  const rank = new Map<string, number>(SERVICE_DISPLAY_ORDER.map((slug, index) => [slug, index]))
  return [...services].sort((a, b) => {
    const aRank = rank.get(a.slug) ?? Number.MAX_SAFE_INTEGER
    const bRank = rank.get(b.slug) ?? Number.MAX_SAFE_INTEGER
    return aRank - bRank
  })
}

export function applyPublicRedlines(settings: PublicFactorySettings): PublicFactorySettings {
  return {
    ...settings,
    supportNote: SUPPORT_NOTE,
    brandSettings: {
      ...settings.brandSettings,
      logoUrl: ROUND_LOGO,
      navLogoUrl: ROUND_LOGO,
      heroLogoUrl: HERO_BANNER,
    },
    siteContent: {
      ...settings.siteContent,
      homepageHeadline: '24/7 Flatbed Towing.',
      homepageSubheadline: SUBHEAD,
      proofPoints: PROOF,
      primaryCtaLabel: 'Call day cell',
      aboutCopy: ABOUT_COPY,
    },
    serviceSite: {
      ...settings.serviceSite,
      serviceAreaLine: settings.serviceSite.serviceAreaLine || 'North Haverhill, NH · Twin States',
      businessHours: LABELED_HOURS.map((row) => ({ days: row.days, hours: row.hours })),
      ctaCards: settings.serviceSite.ctaCards.map((card) =>
        card.title === 'Broken down right now?'
          ? {
              ...card,
              body: SUPPORT_NOTE,
              actionLine: 'Day cell (603) 252-5568 · Night pager (603) 615-6750',
            }
          : card,
      ),
    },
  }
}

export function isPublicComingSoonPath(pathname: string) {
  return pathname === '/coming-soon'
}

export function isComingSoonFrontDoor(pathname: string) {
  return pathname === '/' || pathname === '/coming-soon'
}

export function splitServiceLines(text: string) {
  return text
    .split('\n')
    .map((line) => line.replace(/^[•\-–]\s*/, '').trim())
    .filter(Boolean)
}

export function isTitleRequiredLine(line: string) {
  return /title required/i.test(line)
}
