import type { FactoryThemePresetId, ModuleSettings } from '@/lib/admin-settings'

export type FactoryTierId = 'launch_kit' | 'growth_system' | 'custom_ops'

export type FactoryTierPreset = {
  id: FactoryTierId
  label: string
  setupPrice: string
  monthlySupport: string
  bestFor: string
  revisionLimit: string
  includes: string[]
  limits: string[]
  modules: ModuleSettings
}

export type FactoryThemePreset = {
  id: FactoryThemePresetId
  label: string
  description: string
  background: string
  cardStyle: string
  buttonStyle: string
  navStyle: string
  productCardStyle: string
  homepageLayout: string
  fontPairing: string
  accents: string[]
}

export const FACTORY_MODULE_LABELS: Array<{ key: keyof ModuleSettings; label: string; description: string }> = [
  { key: 'storefront', label: 'Storefront', description: 'Public homepage, catalog, details, cart, and checkout path.' },
  { key: 'crm', label: 'Admin CRM', description: 'Owner workspace for orders, clients, fulfillment, and status tracking.' },
  { key: 'customerAccounts', label: 'Customer Accounts', description: 'Customer sign-in, saved profile, order history, and tracking.' },
  { key: 'inventory', label: 'Inventory', description: 'Stock counts, strengths/options, availability labels, and fulfillment deduction.' },
  { key: 'promos', label: 'Promos', description: 'Banners, popups, product promos, BOGO, discounts, and free shipping rules.' },
  { key: 'affiliates', label: 'Affiliates', description: 'Referral links, affiliate codes, attributed orders, and revenue summaries.' },
  { key: 'documents', label: 'Documents', description: 'CoA/docs library, product documents, and availability indicators.' },
  { key: 'addOns', label: 'Add-ons', description: 'Secondary products like cases, accessories, service add-ons, or bundles.' },
  { key: 'supplyTracking', label: 'Supply Tracking', description: 'Vendor orders, incoming stock, landed cost, and received inventory.' },
  { key: 'videos', label: 'Video/Media', description: 'Hero video, media-heavy category cards, and richer visual landing sections.' },
  { key: 'emails', label: 'Emails', description: 'Order, payment, proof, shipment, support, and admin notification email paths.' },
]

export const FACTORY_TIER_PRESETS: FactoryTierPreset[] = [
  {
    id: 'launch_kit',
    label: 'Launch Kit',
    setupPrice: '$1,500-$3,500',
    monthlySupport: '$150-$500/mo optional',
    bestFor: 'Simple businesses that need a clean storefront fast.',
    revisionLimit: '1 revision round',
    includes: [
      'Theme preset',
      'Homepage, about, FAQ, contact, and policy pages',
      'Product or service catalog',
      'Card (Stripe) or invoice checkout',
      'Basic transactional emails',
      'Mobile QA',
      'Domain and payment launch checklist',
    ],
    limits: [
      'No custom CRM workflows',
      'No custom dashboards',
      'No affiliate module',
      'No complex inventory logic',
    ],
    modules: {
      storefront: true,
      crm: false,
      customerAccounts: false,
      inventory: false,
      promos: false,
      affiliates: false,
      documents: false,
      addOns: false,
      supplyTracking: false,
      videos: false,
      emails: true,
    },
  },
  {
    id: 'growth_system',
    label: 'Growth System',
    setupPrice: '$5,000-$12,000',
    monthlySupport: '$500-$1,500/mo',
    bestFor: 'Founder-led stores that need public checkout plus operating tools.',
    revisionLimit: '2 revision rounds',
    includes: [
      'Storefront and admin CRM',
      'Customer accounts and order tracking',
      'Product/inventory management',
      'Promos and affiliate/referral tracking',
      'Email notifications',
      'Business settings',
      'Mobile QA',
      'Owner handoff and training',
    ],
    limits: ['Only existing modules', 'Light workflow customization'],
    modules: {
      storefront: true,
      crm: true,
      customerAccounts: true,
      inventory: true,
      promos: true,
      affiliates: true,
      documents: true,
      addOns: true,
      supplyTracking: false,
      videos: true,
      emails: true,
    },
  },
  {
    id: 'custom_ops',
    label: 'Custom Ops Platform',
    setupPrice: '$15,000-$40,000+',
    monthlySupport: '$1,500-$5,000/mo',
    bestFor: 'Serious clients with custom fulfillment, vendor, team, or integration needs.',
    revisionLimit: 'Quoted manually',
    includes: [
      'Everything in Growth System',
      'Custom workflows',
      'Vendor/supply tracking',
      'Advanced roles',
      'Custom checkout and payment logic',
      'Integrations',
      'Deeper QA',
      'Priority support',
    ],
    limits: ['Requires intake, scope, deposit, and launch checklist before custom work starts'],
    modules: {
      storefront: true,
      crm: true,
      customerAccounts: true,
      inventory: true,
      promos: true,
      affiliates: true,
      documents: true,
      addOns: true,
      supplyTracking: true,
      videos: true,
      emails: true,
    },
  },
]

export const FACTORY_THEME_PRESETS: FactoryThemePreset[] = [
  {
    id: 'clean_professional',
    label: 'Clean Professional',
    description: 'Quiet white-and-blue operating storefront for broad service/product businesses.',
    background: 'White surface with restrained blue tint',
    cardStyle: 'Low-shadow bordered cards',
    buttonStyle: 'Solid primary pill with secondary outline',
    navStyle: 'Compact white nav',
    productCardStyle: 'Image-first cards with minimal metadata',
    homepageLayout: 'Classic hero plus category grid',
    fontPairing: 'System sans',
    accents: ['#2563EB', '#0F172A', '#E0F2FE'],
  },
  {
    id: 'luxury_dark',
    label: 'Luxury Dark',
    description: 'Premium dark storefront with high-contrast product cards and strong visual media.',
    background: 'Navy / near-black gradient',
    cardStyle: 'Deep blue panels with bright accent lines',
    buttonStyle: 'Cyan primary pill',
    navStyle: 'White nav floating over dark shell',
    productCardStyle: 'Dark card, image top, bold price and status',
    homepageLayout: 'Video hero plus hero category cards',
    fontPairing: 'System sans with stronger display weight',
    accents: ['#0B1F46', '#52E0D2', '#FFFFFF'],
  },
  {
    id: 'bright_retail',
    label: 'Bright Retail',
    description: 'Fast, punchy ecommerce layout for boutiques, packaged goods, and impulse browsing.',
    background: 'Bright neutral with saturated category accents',
    cardStyle: 'Flat cards with colorful states',
    buttonStyle: 'High-contrast solid button',
    navStyle: 'Sticky retail nav with search emphasis',
    productCardStyle: 'Large image, visible promo badges, quick add',
    homepageLayout: 'Promo-first retail sections',
    fontPairing: 'Modern sans',
    accents: ['#FF6B35', '#0EA5E9', '#111827'],
  },
  {
    id: 'boutique_soft',
    label: 'Boutique Soft',
    description: 'Soft editorial storefront for beauty, wellness, apparel, and lifestyle brands.',
    background: 'Soft neutral with controlled color blocks',
    cardStyle: 'Airy cards with subtle borders',
    buttonStyle: 'Rounded solid button with soft secondary',
    navStyle: 'Minimal editorial nav',
    productCardStyle: 'Image-led cards with gentle metadata',
    homepageLayout: 'Editorial hero and collection bands',
    fontPairing: 'Editorial display plus sans labels',
    accents: ['#C084FC', '#155E75', '#F8FAFC'],
  },
  {
    id: 'clinical_trust',
    label: 'Clinical/Trust',
    description: 'Compliance-forward layout for labs, clinics, research, supplements, and regulated-feeling markets.',
    background: 'Blue-white clinical surfaces',
    cardStyle: 'Structured panels with clear status states',
    buttonStyle: 'Blue solid button with precise outlines',
    navStyle: 'Trust-first utility nav',
    productCardStyle: 'Documentation-aware cards',
    homepageLayout: 'Trust signals above product categories',
    fontPairing: 'Clinical sans',
    accents: ['#1D4ED8', '#0891B2', '#0F172A'],
  },
  {
    id: 'service_pro',
    label: 'Service Pro',
    description: 'Lead-oriented structure for appointment, quote, contractor, coaching, or local service businesses.',
    background: 'Clean service surface with strong CTA blocks',
    cardStyle: 'Action panels and comparison blocks',
    buttonStyle: 'Primary quote CTA plus contact secondary',
    navStyle: 'Service nav with phone/contact focus',
    productCardStyle: 'Service cards with outcomes and starting price',
    homepageLayout: 'Service hero, packages, proof, contact',
    fontPairing: 'System sans',
    accents: ['#0F766E', '#1E293B', '#F1F5F9'],
  },
  {
    id: 'road_conspicuity',
    label: 'Road Conspicuity',
    description:
      'Engineered highway-signage system for trades that work on the roadside or respond to emergencies — towing, recovery, wrecker, mobile repair, road service. Built for a stressed visitor on a phone: sign-scale contact, hazard-grade colour, no decorative chrome.',
    background: 'Guide-sign field with reflective hazard banding',
    cardStyle: 'Stamped plates and chevron-edged panels instead of soft cards',
    buttonStyle: 'Hazard-grade call bar at sign scale, outlined secondary',
    navStyle: 'Persistent call bar with route-marker nav',
    productCardStyle: 'Numbered service plates with hazard-diamond markers',
    homepageLayout: 'Call bar, credential plate, service plates, proof, contact',
    fontPairing: 'Highway grotesk',
    accents: ['#003F86', '#9AD201', '#EB0122'],
  },
]

export function getTierPreset(id: FactoryTierId) {
  return FACTORY_TIER_PRESETS.find((tier) => tier.id === id) ?? FACTORY_TIER_PRESETS[1]
}
