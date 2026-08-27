import { redirect } from 'next/navigation'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'

/**
 * One client is live on the skeleton at a time. When that client is a service
 * business, the whole host belongs to them — the product storefront (catalog,
 * cart, checkout, shipping) and the factory's own marketing pages (/, /demo,
 * /apply) are not theirs to show, and still carry the seed storefront's copy.
 *
 * Pages that only make sense in product mode call this first so a service
 * client's visitors always land back on the client site instead of reading
 * another business's content.
 */
export async function redirectStorefrontRouteInServiceMode() {
  const settings = await getPublicFactorySettings()
  if (settings.catalogSettings.catalogMode === 'services') {
    redirect('/site')
  }
}

export type FaqEntry = { question: string; answer: string }

/** Blueprint FAQ copy is blank-line separated blocks: question, then answer. */
export function parseFaqCopy(faqCopy: string): FaqEntry[] {
  return faqCopy
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
      if (lines.length < 2) return null
      return { question: lines[0], answer: lines.slice(1).join(' ') }
    })
    .filter((entry): entry is FaqEntry => entry !== null)
}
