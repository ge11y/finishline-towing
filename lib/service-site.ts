// ---------------------------------------------------------------------------
// Service-site content model.
//
// The home-service genre (masonry, plumbing, HVAC, roofing, landscaping…)
// needs proof surfaces the product storefront never did: a rating in the
// chrome, service-area geography, checkmark differentiators, named reviews,
// business hours, supplier badges, and a project gallery.
//
// Every field is per-client data carried by the build blueprint and applied
// into settings — no client language ever lives in code. Defaults are empty,
// and each public section hides itself when its field is empty, so a client
// who supplies nothing still gets a coherent page.
// ---------------------------------------------------------------------------

export type ServiceSiteHours = {
  days: string
  hours: string
}

export type ServiceSiteCtaCard = {
  title: string
  body: string
  actionLine: string
}

export type ServiceSiteReview = {
  author: string
  rating: number
  text: string
  date: string
  source: string
}

export type ServiceSiteImage = {
  src: string
  alt: string
}

export type ServiceSiteBadge = {
  name: string
  logoUrl: string
}

/**
 * A differentiator line, optionally carrying its own symbol.
 *
 * `icon` is a name from SERVICE_SITE_ICONS — never a path or a component — so
 * client data stays serialisable and no client can inject markup. An unknown or
 * empty name falls back to the generic check, which is also what every
 * string-only client file resolves to.
 */
export type ServiceSiteWhy = {
  text: string
  icon: string
}

/**
 * The symbols a client may name. Deliberately generic across trades: a name
 * describes what the line is *about*, not one business's wording.
 */
export const SERVICE_SITE_ICONS = [
  'check',
  'clock',
  'phone',
  'shield',
  'award',
  'truck',
  'car',
  'route',
  'wrench',
  'leaf',
  'flame',
  'droplet',
  'bolt',
  'lock',
  'money',
  'thumbsUp',
  'calendar',
  'mapPin',
  'link',
  'sparkle',
] as const

export type ServiceSiteIcon = (typeof SERVICE_SITE_ICONS)[number]

export function isServiceSiteIcon(value: string): value is ServiceSiteIcon {
  return (SERVICE_SITE_ICONS as readonly string[]).includes(value)
}

export type ServiceSiteSettings = {
  /** Aggregate rating shown in the chrome, e.g. "5.0". Empty hides the block. */
  ratingValue: string
  /** Number of ratings behind ratingValue, e.g. "14". */
  ratingCount: string
  /** Where the rating comes from, e.g. "Thumbtack" / "Google". */
  ratingSource: string
  /** Outbound link to the review profile. */
  reviewsUrl: string
  /** One-line geography for the chrome, e.g. "York, Maine & the Seacoast". */
  serviceAreaLine: string
  /** Towns for the footer's local-SEO column. */
  serviceAreaTowns: string[]
  businessHours: ServiceSiteHours[]
  /**
   * Differentiators. Four to six reads best. Client files may write each entry
   * as a plain string or as { text, icon } — see normalizeServiceSite.
   */
  whyChooseUs: ServiceSiteWhy[]
  /** Photo beside the differentiators — crew, truck, or equipment at work. */
  whyChooseUsImage: string
  /** Two side-by-side offers in the mid-page CTA band. */
  ctaCards: ServiceSiteCtaCard[]
  /** Real, attributed reviews only. Never seed this with invented text. */
  reviews: ServiceSiteReview[]
  /** Certifications and supplier/manufacturer marks. */
  badges: ServiceSiteBadge[]
  /** Project photos for the gallery band — distinct from service-card images. */
  galleryImages: ServiceSiteImage[]
  /** Heading over the hero quote form. */
  quoteFormTitle: string
  /** Small print under the hero quote form. */
  quoteFormNote: string
}

export const DEFAULT_SERVICE_SITE: ServiceSiteSettings = {
  ratingValue: '',
  ratingCount: '',
  ratingSource: '',
  reviewsUrl: '',
  serviceAreaLine: '',
  serviceAreaTowns: [],
  businessHours: [],
  whyChooseUs: [],
  whyChooseUsImage: '',
  ctaCards: [],
  reviews: [],
  badges: [],
  galleryImages: [],
  quoteFormTitle: 'Request a quote',
  quoteFormNote: '',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function str(record: Record<string, unknown> | undefined, key: string, fallback = '') {
  const value = record?.[key]
  return typeof value === 'string' ? value.trim() : fallback
}

function stringList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback
  return value.filter((entry): entry is string => typeof entry === 'string').map((entry) => entry.trim()).filter(Boolean)
}

/**
 * Differentiators accept two shapes so older client files keep working:
 *   "Fully insured"                         -> { text, icon: 'check' }
 *   { "text": "Fully insured", "icon": "shield" }
 * An unrecognised icon name degrades to the check rather than rendering nothing.
 */
function whyList(value: unknown, fallback: ServiceSiteWhy[]): ServiceSiteWhy[] {
  if (!Array.isArray(value)) return fallback
  const out: ServiceSiteWhy[] = []
  for (const entry of value) {
    if (typeof entry === 'string') {
      const text = entry.trim()
      if (text) out.push({ text, icon: 'check' })
      continue
    }
    if (isRecord(entry)) {
      const text = str(entry, 'text')
      if (!text) continue
      const icon = str(entry, 'icon')
      out.push({ text, icon: isServiceSiteIcon(icon) ? icon : 'check' })
    }
  }
  return out
}

function objectList<T>(value: unknown, fallback: T[], map: (record: Record<string, unknown>) => T | null): T[] {
  if (!Array.isArray(value)) return fallback
  return value.filter(isRecord).map(map).filter((entry): entry is T => entry !== null)
}

export function normalizeServiceSite(value: unknown, fallback: ServiceSiteSettings = DEFAULT_SERVICE_SITE): ServiceSiteSettings {
  const record = isRecord(value) ? value : undefined

  return {
    ratingValue: str(record, 'ratingValue', fallback.ratingValue),
    ratingCount: str(record, 'ratingCount', fallback.ratingCount),
    ratingSource: str(record, 'ratingSource', fallback.ratingSource),
    reviewsUrl: str(record, 'reviewsUrl', fallback.reviewsUrl),
    serviceAreaLine: str(record, 'serviceAreaLine', fallback.serviceAreaLine),
    serviceAreaTowns: stringList(record?.serviceAreaTowns, fallback.serviceAreaTowns),
    businessHours: objectList(record?.businessHours, fallback.businessHours, (entry) => {
      const days = str(entry, 'days')
      const hours = str(entry, 'hours')
      return days || hours ? { days, hours } : null
    }),
    whyChooseUs: whyList(record?.whyChooseUs, fallback.whyChooseUs),
    whyChooseUsImage: str(record, 'whyChooseUsImage', fallback.whyChooseUsImage),
    ctaCards: objectList(record?.ctaCards, fallback.ctaCards, (entry) => {
      const title = str(entry, 'title')
      return title ? { title, body: str(entry, 'body'), actionLine: str(entry, 'actionLine') } : null
    }),
    reviews: objectList(record?.reviews, fallback.reviews, (entry) => {
      const author = str(entry, 'author')
      const text = str(entry, 'text')
      if (!author || !text) return null
      const rawRating = entry.rating
      const rating = typeof rawRating === 'number' && Number.isFinite(rawRating) ? Math.min(5, Math.max(0, rawRating)) : 5
      return { author, rating, text, date: str(entry, 'date'), source: str(entry, 'source') }
    }),
    badges: objectList(record?.badges, fallback.badges, (entry) => {
      const name = str(entry, 'name')
      return name ? { name, logoUrl: str(entry, 'logoUrl') } : null
    }),
    galleryImages: objectList(record?.galleryImages, fallback.galleryImages, (entry) => {
      const src = str(entry, 'src')
      return src ? { src, alt: str(entry, 'alt') } : null
    }),
    quoteFormTitle: str(record, 'quoteFormTitle', fallback.quoteFormTitle) || DEFAULT_SERVICE_SITE.quoteFormTitle,
    quoteFormNote: str(record, 'quoteFormNote', fallback.quoteFormNote),
  }
}
