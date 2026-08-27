// ============================================================
// Storefront CRM Factory — Site Settings
// Centralized demo defaults. Client builds should source these from admin settings.
// ============================================================

import type { SiteSettings, NavLink } from './types'

export const SITE_SETTINGS: SiteSettings = {
  businessName: 'Demo Store',
  tagline: 'Small-batch candles, melts and sprays, poured by hand in Oregon.',
  heroHeadline: 'Fill your home with warmth',
  heroSubheadline:
    'A reusable foundation for founder-led catalog, checkout, CRM, promo, affiliate, and order workflows — shown here as a demo home-fragrance shop.',
  heroPrimaryCta: 'View Catalog',
  heroSecondaryCta: 'Contact Support',
  heroDisclaimer: 'Replace demo business and legal copy before launching a client build.',
  trustSignals: [
    { label: 'Configurable Storefront', icon: 'catalog' },
    { label: 'Admin CRM', icon: 'batch' },
    { label: 'Checkout Workflows', icon: 'document' },
    { label: 'Launch Checklist', icon: 'flask' },
  ],
  featuredProductSlugs: [
    'amber-noir-8oz',
    'cedar-sage-8oz',
    'teakwood-diffuser-6oz',
    'seasonal-trio-gift-set',
    'eucalyptus-mint-spray-4oz',
    'vanilla-oak-8oz',
  ],
  footerDisclaimer:
    'Demo storefront. Replace business, legal, payment, and support copy before launching a client build.',
  institutionalEmail: 'hello@example.com',
  businessAddress: '',
  companyRegistration: '',
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Shop Candles', href: '/products?group=candles' },
  { label: 'Shop Diffusers', href: '/products?group=diffusers' },
  { label: 'Accessories', href: '/add-ons' },
  { label: 'Affiliate', href: '/affiliate' },
]

export const FOOTER_LINKS = {
  company: [
    { label: 'About', href: '/about' },
    { label: 'Quality Reports', href: '/testing' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Disclaimer', href: '/disclaimer' },
  ],
  catalog: [
    { label: 'View Catalog', href: '/products' },
    { label: 'View Quality Reports', href: '/testing' },
  ],
}
