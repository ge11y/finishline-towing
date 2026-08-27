// ============================================================
// Demo Storefront — Products Data
// Centralized product catalog — all product data lives here.
// Demo catalog: neutral home-fragrance (candle) shop.
// ============================================================

import type { Product } from './types'
import { SITE_SETTINGS } from './data-site'

// Slugs whose imagery is a transparent cutout render rather than a
// photo-style shot. Empty for the demo catalog — all demo images are
// photo-style front renders.
const TRANSPARENT_CUTOUT_IMAGE_SLUGS = new Set<string>([])

export const PLACEHOLDER_PRODUCT_IMAGE = '/products/front.png'

// Slugs still awaiting final product art. Empty for the demo catalog —
// every demo product ships with a generated front render.
export const PLACEHOLDER_RENDER_SLUGS: readonly string[] = []

export const NEEDED_PRICES = [] as const

// ─── Category Reference ──────────────────────────────────────
// slug → label:
//   candles      → Candles
//   wax_melts    → Wax Melts
//   room_sprays  → Room Sprays
//   diffusers    → Reed Diffusers
//   gift_sets    → Gift Sets
//   accessories  → Accessories
// ─────────────────────────────────────────────────────────────

function demoProduct(input: {
  slug: string
  displayName: string
  fullName?: string
  alias: string
  category: string
  structureType: string
  formatType: string
  strength: number
  unit: string
  priceEach: string
  summaryShort: string
  summaryFull: string
  features: string[]
  accentColor: string
  accentColorHex: string
  batchNumber: string
  status?: Product['status']
  inventoryOnHand?: number | null
  coaStatus?: Product['coaStatus']
  coaUrl?: string
  coaNotRequired?: boolean
  testingLab?: string
  variantGroup?: string
  variantLabel?: string
}): Product {
  return {
    slug: input.slug,
    displayName: input.displayName,
    fullName: input.fullName ?? input.displayName,
    alias: input.alias,
    category: input.category,
    researchCategory: input.category,
    structureType: input.structureType,
    strength: input.strength,
    unit: input.unit,
    formatType: input.formatType,
    status: input.status ?? 'in_stock',
    coaStatus: input.coaStatus ?? 'not_available',
    coaUrl: input.coaUrl ?? '',
    verificationUrl: '',
    batchNumber: input.batchNumber,
    testingLab: input.testingLab ?? '',
    purityPercent: '',
    summaryShort: input.summaryShort,
    summaryFull: input.summaryFull,
    coaNotRequired: input.coaNotRequired ?? true,
    priceEach: input.priceEach,
    inventoryOnHand: input.inventoryOnHand ?? null,
    publicVisible: true,
    features: input.features,
    accentColor: input.accentColor,
    accentColorHex: input.accentColorHex,
    image: `/products/${input.slug}/front.png`,
    hoverSpinFrames: [],
    publishStatus: 'confirmed',
    needsFounderConfirmation: false,
    riskTier: 'tier2_standard',
    variantGroup: input.variantGroup,
    variantLabel: input.variantLabel,
  }
}

// ─── Image Asset Mapping ─────────────────────────────────────
// Maps product slugs to their source files. 'front' is required
// for the catalog card and product detail hero. 'side' is optional.
// 'hoverSpinFrames' can be added later without refactoring.
// ─────────────────────────────────────────────────────────────

export const PRODUCT_IMAGES: Record<string, { front: string; side?: string; hoverSpinFrames?: string[] }> = {
  'amber-noir-8oz':           { front: '/products/amber-noir-8oz/front.png' },
  'amber-noir-12oz':          { front: '/products/amber-noir-12oz/front.png' },
  'cedar-sage-8oz':           { front: '/products/cedar-sage-8oz/front.png' },
  'vanilla-oak-8oz':          { front: '/products/vanilla-oak-8oz/front.png' },
  'sea-salt-driftwood-8oz':   { front: '/products/sea-salt-driftwood-8oz/front.png' },
  'fireside-ember-8oz':       { front: '/products/fireside-ember-8oz/front.png' },
  'golden-hour-8oz':          { front: '/products/golden-hour-8oz/front.png' },
  'white-tea-ginger-8oz':     { front: '/products/white-tea-ginger-8oz/front.png' },
  'lavender-fields-melts':    { front: '/products/lavender-fields-melts/front.png' },
  'citrus-basil-melts':       { front: '/products/citrus-basil-melts/front.png' },
  'eucalyptus-mint-spray-4oz': { front: '/products/eucalyptus-mint-spray-4oz/front.png' },
  'linen-breeze-spray-4oz':   { front: '/products/linen-breeze-spray-4oz/front.png' },
  'teakwood-diffuser-6oz':    { front: '/products/teakwood-diffuser-6oz/front.png' },
  'fig-cassis-diffuser-6oz':  { front: '/products/fig-cassis-diffuser-6oz/front.png' },
  'seasonal-trio-gift-set':   { front: '/products/seasonal-trio-gift-set/front.png' },
  'relaxation-gift-set':      { front: '/products/relaxation-gift-set/front.png' },
}

export const PRODUCTS: Record<string, Product> = {

  // ─── Candles ─────────────────────────────────────────────────

  'amber-noir-8oz': demoProduct({
    slug: 'amber-noir-8oz',
    displayName: 'Amber Noir Candle',
    alias: 'Amber Noir',
    category: 'candles',
    structureType: 'candle',
    formatType: 'candle',
    strength: 8,
    unit: 'oz',
    priceEach: '$28',
    summaryShort: 'Smoky amber and black vanilla layered over sandalwood in a hand-poured soy-coconut candle.',
    summaryFull:
      'Amber Noir opens with smoky amber and bergamot, settles into black vanilla and cedar, and finishes on a warm sandalwood base. Hand-poured in small batches with a soy-coconut wax blend and a lead-free cotton wick, the 8 oz size burns for approximately 45 hours.',
    features: [
      'Scent notes: smoky amber, black vanilla, sandalwood',
      'Soy-coconut wax blend, lead-free cotton wick',
      'Approx. 45-hour burn time (8 oz)',
      'Reusable amber glass vessel',
    ],
    accentColor: 'warm amber',
    accentColorHex: '#8A6E4B',
    batchNumber: 'DEMO-001',
    coaStatus: 'available',
    coaUrl: '/documents/demo-quality-report.pdf#page=1',
    coaNotRequired: false,
    testingLab: 'Demo Quality Lab',
    variantGroup: 'amber-noir',
    variantLabel: '8 oz',
    inventoryOnHand: 24,
  }),

  'amber-noir-12oz': demoProduct({
    slug: 'amber-noir-12oz',
    displayName: 'Amber Noir Candle',
    alias: 'Amber Noir',
    category: 'candles',
    structureType: 'candle',
    formatType: 'candle',
    strength: 12,
    unit: 'oz',
    priceEach: '$38',
    summaryShort: 'The signature Amber Noir blend in a larger three-wick format for bigger rooms.',
    summaryFull:
      'The 12 oz Amber Noir carries the same smoky amber, black vanilla, and sandalwood profile as the original in a wider three-wick vessel built for living rooms and open spaces. Approximately 70 hours of burn time from a soy-coconut wax blend.',
    features: [
      'Scent notes: smoky amber, black vanilla, sandalwood',
      'Three lead-free cotton wicks for an even melt pool',
      'Approx. 70-hour burn time (12 oz)',
      'Reusable amber glass vessel',
    ],
    accentColor: 'warm amber',
    accentColorHex: '#8A6E4B',
    batchNumber: 'DEMO-002',
    variantGroup: 'amber-noir',
    variantLabel: '12 oz',
    inventoryOnHand: 16,
  }),

  'cedar-sage-8oz': demoProduct({
    slug: 'cedar-sage-8oz',
    displayName: 'Cedar & Sage Candle',
    alias: 'Cedar & Sage',
    category: 'candles',
    structureType: 'candle',
    formatType: 'candle',
    strength: 8,
    unit: 'oz',
    priceEach: '$26',
    summaryShort: 'Crisp garden sage and cedarwood with a bright citrus top note.',
    summaryFull:
      'Cedar & Sage pairs fresh-cut garden sage with grounded cedarwood and a bright grapefruit top note. A clean, woodsy everyday candle that suits entryways and kitchens. Hand-poured soy-coconut wax, approximately 45 hours of burn time.',
    features: [
      'Scent notes: garden sage, cedarwood, grapefruit',
      'Soy-coconut wax blend, lead-free cotton wick',
      'Approx. 45-hour burn time (8 oz)',
    ],
    accentColor: 'sage green',
    accentColorHex: '#7C8465',
    batchNumber: 'DEMO-003',
    inventoryOnHand: 24,
  }),

  'vanilla-oak-8oz': demoProduct({
    slug: 'vanilla-oak-8oz',
    displayName: 'Vanilla Oak Candle',
    alias: 'Vanilla Oak',
    category: 'candles',
    structureType: 'candle',
    formatType: 'candle',
    strength: 8,
    unit: 'oz',
    priceEach: '$26',
    summaryShort: 'Warm vanilla bean rounded out with toasted oak and tonka.',
    summaryFull:
      'Vanilla Oak blends slow-simmered vanilla bean with toasted oak barrel and a soft tonka finish — cozy without being cloying. Hand-poured soy-coconut wax with a lead-free cotton wick and approximately 45 hours of burn time.',
    features: [
      'Scent notes: vanilla bean, toasted oak, tonka',
      'Soy-coconut wax blend, lead-free cotton wick',
      'Approx. 45-hour burn time (8 oz)',
    ],
    accentColor: 'toasted caramel',
    accentColorHex: '#A98C6B',
    batchNumber: 'DEMO-004',
    inventoryOnHand: 20,
  }),

  'sea-salt-driftwood-8oz': demoProduct({
    slug: 'sea-salt-driftwood-8oz',
    displayName: 'Sea Salt & Driftwood Candle',
    alias: 'Sea Salt & Driftwood',
    category: 'candles',
    structureType: 'candle',
    formatType: 'candle',
    strength: 8,
    unit: 'oz',
    priceEach: '$28',
    summaryShort: 'Coastal sea salt and weathered driftwood with a whisper of white musk.',
    summaryFull:
      'Sea Salt & Driftwood captures an overcast shoreline: mineral sea salt, weathered driftwood, and a trace of white musk. A fresh, airy scent for bathrooms and bedrooms. Hand-poured soy-coconut wax, approximately 45 hours of burn time.',
    features: [
      'Scent notes: sea salt, driftwood, white musk',
      'Soy-coconut wax blend, lead-free cotton wick',
      'Approx. 45-hour burn time (8 oz)',
    ],
    accentColor: 'weathered stone',
    accentColorHex: '#A8A29A',
    batchNumber: 'DEMO-005',
    inventoryOnHand: 3,
  }),

  'fireside-ember-8oz': demoProduct({
    slug: 'fireside-ember-8oz',
    displayName: 'Fireside Ember Candle',
    alias: 'Fireside Ember',
    category: 'candles',
    structureType: 'candle',
    formatType: 'candle',
    strength: 8,
    unit: 'oz',
    priceEach: '$28',
    summaryShort: 'Smoked birch, clove, and glowing embers — a cabin evening in a jar.',
    summaryFull:
      'Fireside Ember layers smoked birch and crackling clove over a low, ember-warm base of leather and cade. Our coziest cold-weather pour. Hand-poured soy-coconut wax with approximately 45 hours of burn time.',
    features: [
      'Scent notes: smoked birch, clove, warm embers',
      'Soy-coconut wax blend, lead-free cotton wick',
      'Approx. 45-hour burn time (8 oz)',
    ],
    accentColor: 'ember clay',
    accentColorHex: '#8B5E4A',
    batchNumber: 'DEMO-006',
    status: 'out_of_stock',
    inventoryOnHand: 0,
  }),

  'golden-hour-8oz': demoProduct({
    slug: 'golden-hour-8oz',
    displayName: 'Golden Hour Candle',
    alias: 'Golden Hour',
    category: 'candles',
    structureType: 'candle',
    formatType: 'candle',
    strength: 8,
    unit: 'oz',
    priceEach: '$28',
    summaryShort: 'Sun-ripened apricot and wildflower honey wrapped in warm musk.',
    summaryFull:
      'Golden Hour is late-afternoon light in scent form: sun-ripened apricot, wildflower honey, and a soft warm-musk base. Hand-poured soy-coconut wax with a lead-free cotton wick and approximately 45 hours of burn time.',
    features: [
      'Scent notes: apricot, wildflower honey, warm musk',
      'Soy-coconut wax blend, lead-free cotton wick',
      'Approx. 45-hour burn time (8 oz)',
    ],
    accentColor: 'honey gold',
    accentColorHex: '#C29A5E',
    batchNumber: 'DEMO-007',
    status: 'incoming',
  }),

  'white-tea-ginger-8oz': demoProduct({
    slug: 'white-tea-ginger-8oz',
    displayName: 'White Tea & Ginger Candle',
    alias: 'White Tea & Ginger',
    category: 'candles',
    structureType: 'candle',
    formatType: 'candle',
    strength: 8,
    unit: 'oz',
    priceEach: '$26',
    summaryShort: 'Delicate white tea brightened with fresh ginger and neroli.',
    summaryFull:
      'White Tea & Ginger steeps delicate white tea leaves with fresh-grated ginger and a touch of neroli blossom. Light, clean, and spa-like — ideal for workspaces. Hand-poured soy-coconut wax, approximately 45 hours of burn time.',
    features: [
      'Scent notes: white tea, fresh ginger, neroli',
      'Soy-coconut wax blend, lead-free cotton wick',
      'Approx. 45-hour burn time (8 oz)',
    ],
    accentColor: 'soft linen',
    accentColorHex: '#CFC5B0',
    batchNumber: 'DEMO-008',
    inventoryOnHand: 18,
  }),

  // ─── Wax Melts ───────────────────────────────────────────────

  'lavender-fields-melts': demoProduct({
    slug: 'lavender-fields-melts',
    displayName: 'Lavender Fields Wax Melts',
    alias: 'Lavender Fields',
    category: 'wax_melts',
    structureType: 'melt',
    formatType: 'melt',
    strength: 6,
    unit: 'ct',
    priceEach: '$14',
    summaryShort: 'Six flame-free soy wax melts of French lavender and chamomile.',
    summaryFull:
      'Lavender Fields brings calming French lavender and chamomile to any wax warmer — no flame required. Each pack contains six break-apart soy wax cubes, with each cube fragrancing a room for roughly 8 hours of warm time.',
    features: [
      'Scent notes: French lavender, chamomile, soft musk',
      '6 break-apart soy wax cubes per pack',
      'Approx. 8 hours of fragrance per cube',
      'For use with any standard wax warmer',
    ],
    accentColor: 'dusty lilac',
    accentColorHex: '#A79AA8',
    batchNumber: 'DEMO-009',
    inventoryOnHand: 40,
  }),

  'citrus-basil-melts': demoProduct({
    slug: 'citrus-basil-melts',
    displayName: 'Citrus & Basil Wax Melts',
    alias: 'Citrus & Basil',
    category: 'wax_melts',
    structureType: 'melt',
    formatType: 'melt',
    strength: 6,
    unit: 'ct',
    priceEach: '$14',
    summaryShort: 'Bright Sicilian citrus and garden basil in six flame-free soy melts.',
    summaryFull:
      'Citrus & Basil pairs zesty Sicilian lemon and mandarin with peppery garden basil for a kitchen-fresh lift. Six break-apart soy wax cubes per pack, each delivering roughly 8 hours of fragrance in a standard wax warmer.',
    features: [
      'Scent notes: Sicilian lemon, mandarin, garden basil',
      '6 break-apart soy wax cubes per pack',
      'Approx. 8 hours of fragrance per cube',
    ],
    accentColor: 'warm citron',
    accentColorHex: '#C5B26A',
    batchNumber: 'DEMO-010',
    inventoryOnHand: 40,
  }),

  // ─── Room Sprays ─────────────────────────────────────────────

  'eucalyptus-mint-spray-4oz': demoProduct({
    slug: 'eucalyptus-mint-spray-4oz',
    displayName: 'Eucalyptus Mint Room Spray',
    alias: 'Eucalyptus Mint',
    category: 'room_sprays',
    structureType: 'spray',
    formatType: 'spray',
    strength: 4,
    unit: 'oz',
    priceEach: '$18',
    summaryShort: 'An instant refresh of cool eucalyptus and garden mint in a fine-mist bottle.',
    summaryFull:
      'Eucalyptus Mint delivers a crisp, spa-like refresh in two or three pumps. Cool eucalyptus leaf and garden mint ride a fine, fast-drying mist that is safe on most linens. 4 oz glass bottle, several hundred sprays per bottle.',
    features: [
      'Scent notes: eucalyptus leaf, garden mint, cool water',
      'Fine-mist sprayer, fast-drying formula',
      'Linen-safe on most fabrics',
      '4 oz recyclable glass bottle',
    ],
    accentColor: 'soft eucalyptus',
    accentColorHex: '#96A694',
    batchNumber: 'DEMO-011',
    inventoryOnHand: 30,
  }),

  'linen-breeze-spray-4oz': demoProduct({
    slug: 'linen-breeze-spray-4oz',
    displayName: 'Linen Breeze Room Spray',
    alias: 'Linen Breeze',
    category: 'room_sprays',
    structureType: 'spray',
    formatType: 'spray',
    strength: 4,
    unit: 'oz',
    priceEach: '$18',
    summaryShort: 'Line-dried linen and white florals for an instant fresh-laundry feel.',
    summaryFull:
      'Linen Breeze recreates the smell of sheets dried in open air: clean cotton, white florals, and a hint of blue sky ozone. A quick mist freshens bedrooms, closets, and upholstery. 4 oz glass bottle with a fine-mist sprayer.',
    features: [
      'Scent notes: line-dried cotton, white florals, light ozone',
      'Fine-mist sprayer, fast-drying formula',
      '4 oz recyclable glass bottle',
    ],
    accentColor: 'fresh linen',
    accentColorHex: '#C9C4B8',
    batchNumber: 'DEMO-012',
    inventoryOnHand: 30,
  }),

  // ─── Reed Diffusers ──────────────────────────────────────────

  'teakwood-diffuser-6oz': demoProduct({
    slug: 'teakwood-diffuser-6oz',
    displayName: 'Teakwood Reed Diffuser',
    alias: 'Teakwood',
    category: 'diffusers',
    structureType: 'diffuser',
    formatType: 'diffuser',
    strength: 6,
    unit: 'oz',
    priceEach: '$34',
    summaryShort: 'Rich teakwood and black pepper in a flame-free reed diffuser lasting up to 90 days.',
    summaryFull:
      'The Teakwood Reed Diffuser fills a room with rich teak, black pepper, and a trace of leather — no flame, no power. Eight natural rattan reeds draw the 6 oz oil blend upward for a steady scent throw lasting up to 90 days.',
    features: [
      'Scent notes: teakwood, black pepper, leather',
      '8 natural rattan reeds included',
      'Up to 90 days of continuous fragrance',
      '6 oz amber glass vessel',
    ],
    accentColor: 'deep teak',
    accentColorHex: '#7B5F45',
    batchNumber: 'DEMO-013',
    coaStatus: 'available',
    coaUrl: '/documents/demo-quality-report.pdf#page=2',
    coaNotRequired: false,
    testingLab: 'Demo Quality Lab',
    inventoryOnHand: 18,
  }),

  'fig-cassis-diffuser-6oz': demoProduct({
    slug: 'fig-cassis-diffuser-6oz',
    displayName: 'Fig & Cassis Reed Diffuser',
    alias: 'Fig & Cassis',
    category: 'diffusers',
    structureType: 'diffuser',
    formatType: 'diffuser',
    strength: 6,
    unit: 'oz',
    priceEach: '$34',
    summaryShort: 'Green fig and blackcurrant in a flame-free reed diffuser lasting up to 90 days.',
    summaryFull:
      'Fig & Cassis pairs green fig leaf with juicy blackcurrant over a soft woody base — fruity but grown-up. Eight rattan reeds diffuse the 6 oz oil blend continuously for up to 90 days of flame-free fragrance.',
    features: [
      'Scent notes: green fig, blackcurrant, soft woods',
      '8 natural rattan reeds included',
      'Up to 90 days of continuous fragrance',
      '6 oz amber glass vessel',
    ],
    accentColor: 'fig plum',
    accentColorHex: '#8A6A72',
    batchNumber: 'DEMO-014',
    inventoryOnHand: 18,
  }),

  // ─── Gift Sets ───────────────────────────────────────────────

  'seasonal-trio-gift-set': demoProduct({
    slug: 'seasonal-trio-gift-set',
    displayName: 'Seasonal Trio Gift Set',
    alias: 'Seasonal Trio',
    category: 'gift_sets',
    structureType: 'set',
    formatType: 'set',
    strength: 3,
    unit: 'pc',
    priceEach: '$58',
    summaryShort: 'Three seasonal 4 oz candles in a ready-to-gift keepsake box.',
    summaryFull:
      'The Seasonal Trio bundles three 4 oz versions of our current seasonal pours — Amber Noir, Fireside Ember, and Golden Hour — in a keepsake gift box with a matchbook included. Roughly 25 hours of burn time per candle.',
    features: [
      'Three 4 oz candles: Amber Noir, Fireside Ember, Golden Hour',
      'Keepsake gift box with matchbook included',
      'Approx. 25-hour burn time per candle',
    ],
    accentColor: 'gift kraft',
    accentColorHex: '#B49B7F',
    batchNumber: 'DEMO-015',
    inventoryOnHand: 12,
  }),

  'relaxation-gift-set': demoProduct({
    slug: 'relaxation-gift-set',
    displayName: 'Relaxation Gift Set',
    alias: 'Relaxation Set',
    category: 'gift_sets',
    structureType: 'set',
    formatType: 'set',
    strength: 3,
    unit: 'pc',
    priceEach: '$52',
    summaryShort: 'A wind-down set: lavender candle, lavender melts, and a linen room spray.',
    summaryFull:
      'The Relaxation Gift Set pairs a 4 oz Lavender Fields candle with a pack of Lavender Fields wax melts and a travel-size Linen Breeze room spray. Everything needed for a calmer evening, boxed and ready to gift.',
    features: [
      '4 oz Lavender Fields candle',
      'Lavender Fields wax melts (6 ct)',
      'Travel-size Linen Breeze room spray',
      'Ready-to-gift keepsake box',
    ],
    accentColor: 'calm lilac',
    accentColorHex: '#A39AAD',
    batchNumber: 'DEMO-016',
    inventoryOnHand: 12,
  }),
}

// ─── Category & Slug Lists ───────────────────────────────────

export const PRODUCT_CATEGORIES = [
  'All',
  'candles',
  'wax_melts',
  'room_sprays',
  'diffusers',
  'gift_sets',
  'accessories',
]

// PUBLIC_SLUGS — the sole source of truth for public visibility.
export const PUBLIC_SLUGS = [
  'amber-noir-8oz',
  'amber-noir-12oz',
  'cedar-sage-8oz',
  'vanilla-oak-8oz',
  'sea-salt-driftwood-8oz',
  'fireside-ember-8oz',
  'golden-hour-8oz',
  'white-tea-ginger-8oz',
  'lavender-fields-melts',
  'citrus-basil-melts',
  'eucalyptus-mint-spray-4oz',
  'linen-breeze-spray-4oz',
  'teakwood-diffuser-6oz',
  'fig-cassis-diffuser-6oz',
  'seasonal-trio-gift-set',
  'relaxation-gift-set',
] as const

export const CONFIRMED_SLUGS = [
  'amber-noir-8oz',
  'amber-noir-12oz',
  'cedar-sage-8oz',
  'vanilla-oak-8oz',
  'sea-salt-driftwood-8oz',
  'fireside-ember-8oz',
  'golden-hour-8oz',
  'white-tea-ginger-8oz',
  'lavender-fields-melts',
  'citrus-basil-melts',
  'eucalyptus-mint-spray-4oz',
  'linen-breeze-spray-4oz',
  'teakwood-diffuser-6oz',
  'fig-cassis-diffuser-6oz',
  'seasonal-trio-gift-set',
  'relaxation-gift-set',
]

export const CATALOG_SLUGS = [
  'amber-noir-8oz',
  'amber-noir-12oz',
  'cedar-sage-8oz',
  'vanilla-oak-8oz',
  'sea-salt-driftwood-8oz',
  'fireside-ember-8oz',
  'golden-hour-8oz',
  'white-tea-ginger-8oz',
  'lavender-fields-melts',
  'citrus-basil-melts',
  'eucalyptus-mint-spray-4oz',
  'linen-breeze-spray-4oz',
  'teakwood-diffuser-6oz',
  'fig-cassis-diffuser-6oz',
  'seasonal-trio-gift-set',
  'relaxation-gift-set',
] as const

export const NEEDS_CONFIRMATION_SLUGS: string[] = []

export const ALL_PRODUCT_SLUGS = [...CONFIRMED_SLUGS, ...NEEDS_CONFIRMATION_SLUGS]

// ─── Query Helpers ───────────────────────────────────────────

export function getProductsByCategory(category: string): Product[] {
  const all = getAllPublicProducts()
  if (category === 'All') return all
  return all.filter((p) => p.category === category)
}

export function getAllPublicProducts(): Product[] {
  return CATALOG_SLUGS.map((slug) => PRODUCTS[slug]).filter(Boolean)
}

export function getCatalogDisplayProducts(): Product[] {
  const seenVariantGroups = new Set<string>()

  return getAllPublicProducts().filter((product) => {
    if (!product.variantGroup) return true
    if (seenVariantGroups.has(product.variantGroup)) return false
    seenVariantGroups.add(product.variantGroup)
    return true
  })
}


export function getPendingConfirmationProducts(): Product[] {
  return Object.values(PRODUCTS).filter((p) => p.publishStatus === 'needs_confirmation')
}

export function getAdminCatalogProducts(): Product[] {
  // Admin view: includes confirmed + needs_confirmation, excludes only on_hold
  return Object.values(PRODUCTS).filter((p) => p.publishStatus !== 'on_hold')
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS[slug]
}

export function getConfirmedProducts(): Product[] {
  return Object.values(PRODUCTS).filter((p) => p.publishStatus === 'confirmed')
}

export function getFeaturedProducts(): Product[] {
  return SITE_SETTINGS.featuredProductSlugs.map((s) => PRODUCTS[s]).filter(Boolean)
}

export const PRODUCT_VARIANT_FAMILIES: Record<string, string[]> = {
  'amber-noir': ['amber-noir-8oz', 'amber-noir-12oz'],
}

export function getProductVariants(productOrSlug: Product | string): Product[] {
  const product =
    typeof productOrSlug === 'string' ? PRODUCTS[productOrSlug] : productOrSlug

  if (!product?.variantGroup) return []

  return (PRODUCT_VARIANT_FAMILIES[product.variantGroup] ?? [])
    .map((slug) => PRODUCTS[slug])
    .filter(Boolean)
}

// ─── Atmospheric Banner Assets ─────────────────────────────────
// Wide 4:1 banner visuals for product detail page atmosphere.
// heroBanner: top-of-page hero support (high energy, full opacity)
// sectionDivider: between sections at lower opacity
// Keys are category slugs; per-product overrides can be added by slug.
// ────────────────────────────────────────────────────────────────

export const BANNER_ASSETS: Record<string, { heroBanner: string; sectionDivider: string }> = {
  __default: {
    heroBanner: '/banners/candles.png',
    sectionDivider: '/banners/candles.png',
  },
  candles: {
    heroBanner: '/banners/candles.png',
    sectionDivider: '/banners/candles.png',
  },
  wax_melts: {
    heroBanner: '/banners/wax_melts.png',
    sectionDivider: '/banners/wax_melts.png',
  },
  room_sprays: {
    heroBanner: '/banners/room_sprays.png',
    sectionDivider: '/banners/room_sprays.png',
  },
  diffusers: {
    heroBanner: '/banners/diffusers.png',
    sectionDivider: '/banners/diffusers.png',
  },
  gift_sets: {
    heroBanner: '/banners/gift_sets.png',
    sectionDivider: '/banners/gift_sets.png',
  },
  accessories: {
    heroBanner: '/banners/accessories.png',
    sectionDivider: '/banners/accessories.png',
  },
}

export function getProductBannerSrc(slug: string, type: 'heroBanner' | 'sectionDivider'): string {
  if (BANNER_ASSETS[slug]?.[type]) {
    return BANNER_ASSETS[slug][type]
  }
  const category = PRODUCTS[slug]?.category
  if (category && BANNER_ASSETS[category]?.[type]) {
    return BANNER_ASSETS[category][type]
  }
  return BANNER_ASSETS.__default[type]
}

// ─── Image Resolution ──────────────────────────────────────────
// Centralized image resolution for all product imagery.
// Uses PRODUCT_IMAGES map as the source of truth for file paths.
// Falls back to product.image for any products not yet in the map.
// hoverSpinFrames come from PRODUCT_IMAGES — add to that map to enable.
// ──────────────────────────────────────────────────────────────

export function getProductImageSrc(product: Product): string {
  if (product.image && !product.image.includes('REQUIRED') && product.image !== PLACEHOLDER_PRODUCT_IMAGE) {
    return product.image
  }
  if (PRODUCT_IMAGES[product.slug]?.front) {
    return PRODUCT_IMAGES[product.slug].front
  }
  if (PLACEHOLDER_RENDER_SLUGS.includes(product.slug)) {
    return PLACEHOLDER_PRODUCT_IMAGE
  }
  if (product.image && !product.image.includes('REQUIRED')) {
    return product.image
  }
  return PLACEHOLDER_PRODUCT_IMAGE
}

export function getProductSideSrc(product: Product): string {
  return PRODUCT_IMAGES[product.slug]?.side || ''
}

export function getProductHoverSpinFrames(product: Product): string[] {
  return PRODUCT_IMAGES[product.slug]?.hoverSpinFrames ?? []
}

export function isPlaceholderProductImage(product: Product): boolean {
  return getProductImageSrc(product) === PLACEHOLDER_PRODUCT_IMAGE
}

export function usesPhotoStyleProductImage(product: Product): boolean {
  const src = getProductImageSrc(product)
  if (!src || src === PLACEHOLDER_PRODUCT_IMAGE) return true
  if (TRANSPARENT_CUTOUT_IMAGE_SLUGS.has(product.slug)) return false
  return true
}
