/**
 * Two lines, labeled by time. Service is 24/7; the number is not.
 *
 * Day / cell (603) 252-5568 — daytime through ~8pm. Painted on the truck
 * and on the citations (NH SOS, FMCSA, Yelp, MapQuest, Facebook).
 *
 * Night / pager (603) 615-6750 — 8pm–5am. The line he watches under a truck.
 *
 * Never publish one number as the only all-day CTA. Keep both labeled.
 */
export const DAY_CELL = '(603) 252-5568'
export const NIGHT_PAGER = '(603) 615-6750'

/** Alias kept for existing imports — same number as DAY_CELL. */
export const CELL_PHONE = DAY_CELL

export const DAY_CELL_CTA = 'Call day cell'
export const NIGHT_PAGER_CTA = 'Call night pager'
export const DAY_CELL_WHEN = 'Daytime through ~8pm'
export const NIGHT_PAGER_WHEN = 'Pager · 8pm–5am'
export const SERVICE_247 = '24/7 service'

export const CELL_NOTE = 'Day / cell — daytime through ~8pm'
export const PAGER_NOTE = 'Night / pager — 8pm–5am'

export const LABELED_HOURS = [
  { days: 'Day · cell', hours: `${DAY_CELL} · daytime through ~8pm` },
  { days: 'Night · pager', hours: `${NIGHT_PAGER} · 8pm–5am` },
] as const

export const PROOF_POINTS =
  `24/7 service · Day cell ${DAY_CELL} · Night pager 8pm–5am ${NIGHT_PAGER} · Locally owned, serving North Country NH 24/7 · Owner-operated · USDOT 3693451`

export const SUPPORT_NOTE =
  `24/7 service. Day / cell ${DAY_CELL} (daytime through ~8pm). Night / pager ${NIGHT_PAGER} (8pm–5am).`

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

/** Business name as filed (NH SOS / FMCSA) and as used on directory citations. */
export const BUSINESS_NAME = 'Finish Line Towing'
export const STREET = '585 Benton Rd'
export const CITY = 'North Haverhill'
export const REGION = 'NH'
export const POSTAL = '03774'
export const ADDRESS_LINE = `${STREET}, ${CITY}, ${REGION} ${POSTAL}`
export const MAP_EMBED_SRC =
  'https://maps.google.com/maps?q=Finish+Line+Towing,+585+Benton+Rd,+North+Haverhill,+NH+03774&z=11&output=embed'
export const MAP_LINK =
  'https://www.google.com/maps/search/?api=1&query=Finish+Line+Towing+585+Benton+Rd+North+Haverhill+NH+03774'
