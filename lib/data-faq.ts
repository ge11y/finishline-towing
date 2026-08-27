// ============================================================
// Demo Storefront — FAQ Data
// All FAQ content lives here — no hardcoded text in components
// ============================================================

import type { FaqItem } from './types'

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-catalog-001',
    question: 'How do I shop the catalog?',
    answer:
      'Browse by category — candles, wax melts, room sprays, reed diffusers, gift sets, and accessories — or use the search bar, then choose a size, add it to cart, and continue through account sign-in and checkout.',
    category: 'Catalog & Products',
    order: 1,
  },
  {
    id: 'faq-catalog-002',
    question: 'Can I request a scent or product that is not listed?',
    answer:
      'Yes. Use the contact form and include the product name, size, and any details about what you are looking for. Seasonal scents rotate throughout the year.',
    category: 'Catalog & Products',
    order: 2,
  },
  {
    id: 'faq-care-001',
    question: 'How do I get the best burn from my candle?',
    answer:
      'On the first burn, let the melt pool reach the edge of the vessel (about 2-3 hours) to prevent tunneling. Trim the wick to about 1/4 inch before each burn, and never burn for more than 4 hours at a time.',
    category: 'Product Care',
    order: 1,
  },
  {
    id: 'faq-ordering-001',
    question: 'How does checkout work?',
    answer:
      'Create or sign into your account, place the order, follow the payment instructions, and upload proof of payment so the order can be confirmed.',
    category: 'Ordering & Shipping',
    order: 1,
  },
  {
    id: 'faq-ordering-002',
    question: 'How do I track my order?',
    answer:
      'After an order is placed, your account page shows order history and status updates. Shipment details are added once fulfillment is completed.',
    category: 'Ordering & Shipping',
    order: 2,
  },
  {
    id: 'faq-ordering-003',
    question: 'What is your return policy?',
    answer:
      'Unused, unopened items can be returned within 30 days of delivery for a refund. If anything arrives damaged, contact support within 48 hours with a photo and we will send a replacement.',
    category: 'Ordering & Shipping',
    order: 3,
  },
  {
    id: 'faq-wholesale-001',
    question: 'Do you offer wholesale or bulk pricing?',
    answer:
      'Yes. Wholesale pricing is available for qualifying retailers and event orders. Use the contact form with your business details and estimated quantities to request a line sheet.',
    category: 'Support',
    order: 1,
  },
  {
    id: 'faq-support-001',
    question: 'Who should I contact for order or catalog help?',
    answer:
      'Use the contact form or email hello@example.com. Include product names, sizes, or order numbers so the team can respond faster.',
    category: 'Support',
    order: 2,
  },
]

export const FAQ_CATEGORIES = [
  'Catalog & Products',
  'Product Care',
  'Ordering & Shipping',
  'Support',
]

export function getFaqsByCategory(category: string): FaqItem[] {
  if (category === 'All') return FAQ_ITEMS
  return FAQ_ITEMS.filter((f) => f.category === category).sort((a, b) => a.order - b.order)
}
