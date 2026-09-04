/**
 * Josh runs two lines, and they have never agreed on this site.
 *
 * The pager is `companyPhone` in settings and stays the primary number —
 * he asked for it that way at the demo, because it is the one he actually
 * watches when he is under a truck.
 *
 * The cell is the number painted on the door of the flatbed, and it is the
 * number on every citation that already exists: the NH Secretary of State
 * filing, FMCSA, Yelp, MapQuest and Facebook. Publishing only the pager left
 * the site contradicting both his own truck — visible in the photographs on
 * this very page — and every listing Google cross-references when it decides
 * whether this business is who it claims to be. Inconsistent name/address/
 * phone data is one of the few local-SEO mistakes that actively suppresses
 * ranking, so the fix is to carry both and be explicit about which is which,
 * rather than to pick one and leave five listings wrong.
 */
export const CELL_PHONE = '(603) 252-5568'

export const PAGER_NOTE = 'Pager — the fastest way to reach him'
export const CELL_NOTE = 'Cell — if the pager does not catch him'

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}
