/**
 * The merch line.
 *
 * A showcase, not a shop. Nothing is bought here: each item texts Josh with
 * the item and size already written, and he sorts it out from there. That is
 * deliberate — there is no stock yet, and standing up a checkout would hand a
 * one-truck towing business inventory, shipping and refunds to run, which is a
 * different job from towing.
 *
 * Designs are still with the designer, so most of these carry the standard
 * placeholder. `image: null` means exactly that and the card says so rather
 * than pretending a mockup is a product.
 */

export type MerchItem = {
  slug: string
  name: string
  blurb: string
  /** null until the real artwork lands from the designer. */
  image: string | null
  sizes: string
}

export const MERCH: MerchItem[] = [
  {
    slug: 'legal-hooker-tee',
    name: '“Legal Hooker” tee',
    blurb:
      'The one people ask about. A tow hook is a hooker — that is the whole joke, and every driver in the trade already knows it.',
    image: '/clients/finish-line-towing/legal-hooker.png',
    sizes: 'S through 3XL',
  },
  {
    slug: 'finishline-hoodie',
    name: 'FINISHLINE Towing hoodie',
    blurb: 'The mark off the truck, front and back. Heavyweight, for standing on a shoulder in November.',
    image: null,
    sizes: 'S through 3XL',
  },
  {
    slug: 'finishline-tee',
    name: 'FINISHLINE Towing tee',
    blurb: 'Same mark, lighter. The one you wear in July.',
    image: null,
    sizes: 'S through 3XL',
  },
  {
    slug: 'the-74-tee',
    name: 'The 74 tee',
    blurb: 'Kiptyn’s number and the checkered flag. Wearing one puts a bit toward the race season.',
    image: null,
    sizes: 'Youth S through adult 3XL',
  },
]

/** What the text says when somebody taps a card. */
export function orderMessage(itemName: string): string {
  return `Hi Josh — I'd like to order the ${itemName}. Size: `
}
