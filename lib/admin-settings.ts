import type { ManualPaymentMethod } from '@/lib/manual-orders'
import { DEFAULT_SERVICE_SITE, normalizeServiceSite, type ServiceSiteSettings } from '@/lib/service-site'

export type InventoryDefaultsSettings = {
  lowStockThreshold: number
}

export type CheckoutOperationsSettings = {
  shippingMode: 'manual_review' | 'flat_rate' | 'tiered_placeholder'
  flatRate: string
  freeShippingEnabled: boolean
  freeShippingThreshold: string
  taxMode: 'pending_review' | 'not_charging' | 'collect_at_checkout'
  taxRate: string
  notes: string
}

export type BusinessPaymentMethodSettings = {
  method: ManualPaymentMethod
  label: string
  destination: string
  link: string
  detail: string
  enabled: boolean
}

export type BusinessSocialLinkSettings = {
  label: string
  url: string
}

export type BusinessDetailsSettings = {
  businessName: string
  publicSiteUrl: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  contactInfo: string
  supportNote: string
  socials: BusinessSocialLinkSettings[]
  paymentMethods: BusinessPaymentMethodSettings[]
}

export type FactoryThemePresetId =
  | 'clean_professional'
  | 'luxury_dark'
  | 'bright_retail'
  | 'boutique_soft'
  | 'clinical_trust'
  | 'service_pro'
  | 'road_conspicuity'

export type BrandSettings = {
  logoUrl: string
  navLogoUrl: string
  heroLogoUrl: string
  primaryColor: string
  accentColor: string
  backgroundColor: string
  themePreset: FactoryThemePresetId
  /** Optional brand character/mascot, exposed to CSS as --client-mascot. */
  mascotUrl: string
  fontPreset: 'system' | 'modern_sans' | 'editorial' | 'clinical' | 'road_sign'
}

export type SiteContentSettings = {
  homepageHeadline: string
  homepageSubheadline: string
  /** Scannable trust facts, separated by " · " (e.g. "Est. 2011 · Licensed · 5.0 on Thumbtack"). */
  proofPoints: string
  primaryCtaLabel: string
  secondaryCtaLabel: string
  aboutCopy: string
  faqCopy: string
  legalSupportCopy: string
  footerDisclaimer: string
}

export type ModuleSettings = {
  storefront: boolean
  crm: boolean
  customerAccounts: boolean
  inventory: boolean
  promos: boolean
  affiliates: boolean
  documents: boolean
  addOns: boolean
  supplyTracking: boolean
  videos: boolean
  emails: boolean
}

export type CheckoutSettings = {
  checkoutMode: 'manual' | 'stripe' | 'hybrid'
  stripeEnabled: boolean
  manualPaymentsEnabled: boolean
  collectBillingAddress: boolean
  paymentInstructionsHeadline: string
  paymentInstructionsNote: string
}

export type CatalogSettings = {
  catalogMode: 'products' | 'services' | 'hybrid'
  productLabel: string
  serviceLabel: string
  addOnLabel: string
  categoryLabels: Record<string, string>
}

export type EmailSettings = {
  senderName: string
  senderEmail: string
  replyToEmail: string
  orderConfirmationSubject: string
  paymentInstructionsIntro: string
  shipmentSubject: string
  supportSignature: string
}

export type FactoryWorkflowSettings = {
  targetTier: 'launch_kit' | 'growth_system' | 'custom_ops'
  intakeBusinessType: string
  estimatedAnnualRevenue: string
  expectedMonthlyOrders: string
  productOrServiceCount: string
  customWorkflowNotes: string
  identityComplete: boolean
  brandingComplete: boolean
  checkoutReady: boolean
  catalogReady: boolean
  emailsReady: boolean
  domainReady: boolean
  testOrderPassed: boolean
  assetsReceived: boolean
  depositReceived: boolean
  ownerTrainingComplete: boolean
}

export type { ServiceSiteSettings }

export type AdminSettingsPayload = {
  inventoryDefaults: InventoryDefaultsSettings
  checkoutOperations: CheckoutOperationsSettings
  businessDetails: BusinessDetailsSettings
  brandSettings: BrandSettings
  siteContent: SiteContentSettings
  moduleSettings: ModuleSettings
  checkoutSettings: CheckoutSettings
  catalogSettings: CatalogSettings
  emailSettings: EmailSettings
  serviceSite: ServiceSiteSettings
  factoryWorkflow: FactoryWorkflowSettings
}

const DEFAULT_SETTINGS: AdminSettingsPayload = {
  inventoryDefaults: {
    lowStockThreshold: 4,
  },
  checkoutOperations: {
    shippingMode: 'manual_review',
    flatRate: '',
    freeShippingEnabled: true,
    freeShippingThreshold: '300',
    taxMode: 'pending_review',
    taxRate: '',
    notes: '',
  },
  businessDetails: {
    businessName: 'Demo Store',
    publicSiteUrl: 'https://example.com',
    companyEmail: 'hello@example.com',
    companyPhone: '',
    companyAddress: '',
    contactInfo: '',
    supportNote: 'We usually respond within 1-2 business days.',
    socials: [
      { label: 'Instagram', url: '' },
      { label: 'Facebook', url: '' },
      { label: 'TikTok', url: '' },
    ],
    paymentMethods: [
      {
        method: 'bank_transfer',
        label: 'Bank Transfer / Wire',
        destination: 'Account details provided with your order confirmation',
        link: '',
        detail: 'Send the order total by bank transfer (ACH/wire) using the account details shown with your order confirmation.',
        enabled: true,
      },
      {
        method: 'invoice',
        label: 'Invoice',
        destination: 'Invoice emailed after order review',
        link: '',
        detail: 'Your order is reviewed and a formal invoice is emailed with payment options. Fulfillment begins once the invoice is paid.',
        enabled: true,
      },
      {
        method: 'zelle',
        label: 'Zelle',
        destination: 'payments@example.com',
        link: '',
        detail: 'Send the full order amount through Zelle using the destination shown above.',
        enabled: false,
      },
      {
        method: 'paypal',
        label: 'PayPal',
        destination: 'billing@example.com',
        link: '',
        detail: 'Send the full order amount through PayPal using the payment account shown above.',
        enabled: false,
      },
      {
        method: 'cashapp',
        label: 'Cash App',
        destination: '$yourcashapp',
        link: '',
        detail: 'Send the full order amount through Cash App using the destination shown above.',
        enabled: false,
      },
      {
        method: 'venmo',
        label: 'Venmo',
        destination: '@yourvenmo',
        link: '',
        detail: 'Send the full order amount through Venmo using the handle shown above.',
        enabled: false,
      },
      {
        method: 'crypto',
        label: 'Crypto',
        destination: 'Wallet details provided after order review',
        link: '',
        detail: 'For businesses that accept it: wallet and chain instructions are shared during order review.',
        enabled: false,
      },
      {
        method: 'other',
        label: 'Other',
        destination: 'Details provided after order review',
        link: '',
        detail: 'Use the payment destination and instructions shown here for this order.',
        enabled: false,
      },
    ],
  },
  brandSettings: {
    logoUrl: '/brand/demo-logo.png',
    navLogoUrl: '/brand/demo-logo-nav.png',
    heroLogoUrl: '/brand/demo-logo-hero.png',
    primaryColor: '#155E75',
    accentColor: '#C084FC',
    backgroundColor: '#FBF8FF',
    themePreset: 'boutique_soft',
    mascotUrl: '',
    fontPreset: 'editorial',
  },
  siteContent: {
    homepageHeadline: 'Fill your home with warmth',
    proofPoints: '',
    homepageSubheadline:
      'Small-batch candles, melts and sprays, poured by hand in Oregon.',
    primaryCtaLabel: 'Shop Catalog',
    secondaryCtaLabel: 'Contact Support',
    aboutCopy:
      'This demo store shows the factory baseline: public storefront, account flow, order tracking, product management, CRM, promos, affiliates, and launch-ready business controls.',
    faqCopy:
      'Use this section for the four to eight questions customers need answered before buying, booking, or contacting the business.',
    legalSupportCopy:
      'Add market-specific policy language, support expectations, fulfillment terms, and checkout disclaimers before launch.',
    footerDisclaimer: 'Demo storefront. Replace all sample copy before launching a client build.',
  },
  moduleSettings: {
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
  checkoutSettings: {
    checkoutMode: 'manual',
    stripeEnabled: false,
    manualPaymentsEnabled: true,
    collectBillingAddress: true,
    paymentInstructionsHeadline: 'Complete payment using the selected method.',
    paymentInstructionsNote:
      'Include the order ID exactly as shown. Do not include product names or item details in the payment note.',
  },
  catalogSettings: {
    catalogMode: 'products',
    productLabel: 'Products',
    serviceLabel: 'Services',
    addOnLabel: 'Add-ons',
    categoryLabels: {
      candles: 'Candles',
      wax_melts: 'Wax Melts',
      room_sprays: 'Room Sprays',
      diffusers: 'Reed Diffusers',
      gift_sets: 'Gift Sets',
      accessories: 'Accessories',
    },
  },
  emailSettings: {
    senderName: 'Demo Business',
    senderEmail: 'hello@example.com',
    replyToEmail: 'hello@example.com',
    orderConfirmationSubject: 'We received your order',
    paymentInstructionsIntro: 'Your order is saved. Follow the payment instructions on the checkout page.',
    shipmentSubject: 'Your order has shipped',
    supportSignature: 'The team',
  },
  serviceSite: DEFAULT_SERVICE_SITE,
  factoryWorkflow: {
    targetTier: 'growth_system',
    intakeBusinessType: 'Founder-led ecommerce/product business',
    estimatedAnnualRevenue: '',
    expectedMonthlyOrders: '',
    productOrServiceCount: '',
    customWorkflowNotes: '',
    identityComplete: false,
    brandingComplete: false,
    checkoutReady: false,
    catalogReady: false,
    emailsReady: false,
    domainReady: false,
    testOrderPassed: false,
    assetsReceived: false,
    depositReceived: false,
    ownerTrainingComplete: false,
  },
}

function cloneSettings(settings: AdminSettingsPayload): AdminSettingsPayload {
  return JSON.parse(JSON.stringify(settings)) as AdminSettingsPayload
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function getString(record: Record<string, unknown> | undefined, key: string, fallback: string) {
  const value = record?.[key]
  return typeof value === 'string' ? value : fallback
}

function getBoolean(record: Record<string, unknown> | undefined, key: string, fallback: boolean) {
  const value = record?.[key]
  return typeof value === 'boolean' ? value : fallback
}

function getNumber(record: Record<string, unknown> | undefined, key: string, fallback: number) {
  const value = record?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function getOneOf<T extends string>(record: Record<string, unknown> | undefined, key: string, fallback: T, values: readonly T[]) {
  const value = record?.[key]
  return typeof value === 'string' && values.includes(value as T) ? (value as T) : fallback
}

function getStringRecord(record: Record<string, unknown> | undefined, key: string, fallback: Record<string, string>) {
  const value = record?.[key]
  if (!isRecord(value)) return fallback
  const cleaned: Record<string, string> = {}
  for (const [entryKey, entryValue] of Object.entries(value)) {
    if (typeof entryValue === 'string') {
      cleaned[entryKey] = entryValue
    }
  }
  return {
    ...fallback,
    ...cleaned,
  }
}

function normalizeBusinessDetails(value: unknown, fallback = DEFAULT_SETTINGS.businessDetails): BusinessDetailsSettings {
  const record = isRecord(value) ? value : undefined
  const savedPaymentMethods = Array.isArray(record?.paymentMethods) ? record.paymentMethods : []
  const paymentMethods = fallback.paymentMethods.map((method) => {
    const saved = savedPaymentMethods.find((entry) => isRecord(entry) && entry.method === method.method)
    const savedRecord = isRecord(saved) ? saved : undefined
    return {
      ...method,
      label: getString(savedRecord, 'label', method.label),
      destination: getString(savedRecord, 'destination', method.destination),
      link: getString(savedRecord, 'link', method.link),
      detail: getString(savedRecord, 'detail', method.detail),
      enabled: getBoolean(savedRecord, 'enabled', method.enabled),
    }
  })

  const savedSocials = Array.isArray(record?.socials) ? record.socials : []
  const socials = fallback.socials.map((social) => {
    const saved = savedSocials.find((entry) => isRecord(entry) && entry.label === social.label)
    const savedRecord = isRecord(saved) ? saved : undefined
    return {
      label: getString(savedRecord, 'label', social.label),
      url: getString(savedRecord, 'url', social.url),
    }
  })

  return {
    businessName: getString(record, 'businessName', fallback.businessName),
    publicSiteUrl: getString(record, 'publicSiteUrl', fallback.publicSiteUrl),
    companyEmail: getString(record, 'companyEmail', fallback.companyEmail),
    companyPhone: getString(record, 'companyPhone', fallback.companyPhone),
    companyAddress: getString(record, 'companyAddress', fallback.companyAddress),
    contactInfo: getString(record, 'contactInfo', fallback.contactInfo),
    supportNote: getString(record, 'supportNote', fallback.supportNote),
    socials,
    paymentMethods,
  }
}

export function normalizeAdminSettings(values: Map<string, unknown>): AdminSettingsPayload {
  const defaults = getDefaultAdminSettings()
  const inventoryDefaults = isRecord(values.get('inventory_defaults')) ? (values.get('inventory_defaults') as Record<string, unknown>) : undefined
  const checkoutOperations = isRecord(values.get('checkout_operations')) ? (values.get('checkout_operations') as Record<string, unknown>) : undefined
  const brandSettings = isRecord(values.get('brand_settings')) ? (values.get('brand_settings') as Record<string, unknown>) : undefined
  const siteContent = isRecord(values.get('site_content')) ? (values.get('site_content') as Record<string, unknown>) : undefined
  const moduleSettings = isRecord(values.get('module_settings')) ? (values.get('module_settings') as Record<string, unknown>) : undefined
  const checkoutSettings = isRecord(values.get('checkout_settings')) ? (values.get('checkout_settings') as Record<string, unknown>) : undefined
  const catalogSettings = isRecord(values.get('catalog_settings')) ? (values.get('catalog_settings') as Record<string, unknown>) : undefined
  const emailSettings = isRecord(values.get('email_settings')) ? (values.get('email_settings') as Record<string, unknown>) : undefined
  const factoryWorkflow = isRecord(values.get('factory_workflow')) ? (values.get('factory_workflow') as Record<string, unknown>) : undefined

  return {
    inventoryDefaults: {
      lowStockThreshold: getNumber(inventoryDefaults, 'lowStockThreshold', defaults.inventoryDefaults.lowStockThreshold),
    },
    checkoutOperations: {
      shippingMode: getOneOf(checkoutOperations, 'shippingMode', defaults.checkoutOperations.shippingMode, [
        'manual_review',
        'flat_rate',
        'tiered_placeholder',
      ]),
      flatRate: getString(checkoutOperations, 'flatRate', defaults.checkoutOperations.flatRate),
      freeShippingEnabled: getBoolean(checkoutOperations, 'freeShippingEnabled', defaults.checkoutOperations.freeShippingEnabled),
      freeShippingThreshold: getString(checkoutOperations, 'freeShippingThreshold', defaults.checkoutOperations.freeShippingThreshold),
      taxMode: getOneOf(checkoutOperations, 'taxMode', defaults.checkoutOperations.taxMode, [
        'pending_review',
        'not_charging',
        'collect_at_checkout',
      ]),
      taxRate: getString(checkoutOperations, 'taxRate', defaults.checkoutOperations.taxRate),
      notes: getString(checkoutOperations, 'notes', defaults.checkoutOperations.notes),
    },
    businessDetails: normalizeBusinessDetails(values.get('business_details'), defaults.businessDetails),
    brandSettings: {
      logoUrl: getString(brandSettings, 'logoUrl', defaults.brandSettings.logoUrl),
      navLogoUrl: getString(brandSettings, 'navLogoUrl', defaults.brandSettings.navLogoUrl),
      heroLogoUrl: getString(brandSettings, 'heroLogoUrl', defaults.brandSettings.heroLogoUrl),
      primaryColor: getString(brandSettings, 'primaryColor', defaults.brandSettings.primaryColor),
      accentColor: getString(brandSettings, 'accentColor', defaults.brandSettings.accentColor),
      backgroundColor: getString(brandSettings, 'backgroundColor', defaults.brandSettings.backgroundColor),
      themePreset: getOneOf(brandSettings, 'themePreset', defaults.brandSettings.themePreset, [
        'clean_professional',
        'luxury_dark',
        'bright_retail',
        'boutique_soft',
        'clinical_trust',
        'service_pro',
        'road_conspicuity',
      ]),
      mascotUrl: getString(brandSettings, 'mascotUrl', defaults.brandSettings.mascotUrl),
      fontPreset: getOneOf(brandSettings, 'fontPreset', defaults.brandSettings.fontPreset, [
        'system',
        'modern_sans',
        'editorial',
        'clinical',
        'road_sign',
      ]),
    },
    siteContent: {
      homepageHeadline: getString(siteContent, 'homepageHeadline', defaults.siteContent.homepageHeadline),
      homepageSubheadline: getString(siteContent, 'homepageSubheadline', defaults.siteContent.homepageSubheadline),
      proofPoints: getString(siteContent, 'proofPoints', defaults.siteContent.proofPoints),
      primaryCtaLabel: getString(siteContent, 'primaryCtaLabel', defaults.siteContent.primaryCtaLabel),
      secondaryCtaLabel: getString(siteContent, 'secondaryCtaLabel', defaults.siteContent.secondaryCtaLabel),
      aboutCopy: getString(siteContent, 'aboutCopy', defaults.siteContent.aboutCopy),
      faqCopy: getString(siteContent, 'faqCopy', defaults.siteContent.faqCopy),
      legalSupportCopy: getString(siteContent, 'legalSupportCopy', defaults.siteContent.legalSupportCopy),
      footerDisclaimer: getString(siteContent, 'footerDisclaimer', defaults.siteContent.footerDisclaimer),
    },
    moduleSettings: {
      storefront: getBoolean(moduleSettings, 'storefront', defaults.moduleSettings.storefront),
      crm: getBoolean(moduleSettings, 'crm', defaults.moduleSettings.crm),
      customerAccounts: getBoolean(moduleSettings, 'customerAccounts', defaults.moduleSettings.customerAccounts),
      inventory: getBoolean(moduleSettings, 'inventory', defaults.moduleSettings.inventory),
      promos: getBoolean(moduleSettings, 'promos', defaults.moduleSettings.promos),
      affiliates: getBoolean(moduleSettings, 'affiliates', defaults.moduleSettings.affiliates),
      documents: getBoolean(moduleSettings, 'documents', defaults.moduleSettings.documents),
      addOns: getBoolean(moduleSettings, 'addOns', defaults.moduleSettings.addOns),
      supplyTracking: getBoolean(moduleSettings, 'supplyTracking', defaults.moduleSettings.supplyTracking),
      videos: getBoolean(moduleSettings, 'videos', defaults.moduleSettings.videos),
      emails: getBoolean(moduleSettings, 'emails', defaults.moduleSettings.emails),
    },
    checkoutSettings: {
      checkoutMode: getOneOf(checkoutSettings, 'checkoutMode', defaults.checkoutSettings.checkoutMode, ['manual', 'stripe', 'hybrid']),
      stripeEnabled: getBoolean(checkoutSettings, 'stripeEnabled', defaults.checkoutSettings.stripeEnabled),
      manualPaymentsEnabled: getBoolean(checkoutSettings, 'manualPaymentsEnabled', defaults.checkoutSettings.manualPaymentsEnabled),
      collectBillingAddress: getBoolean(checkoutSettings, 'collectBillingAddress', defaults.checkoutSettings.collectBillingAddress),
      paymentInstructionsHeadline: getString(
        checkoutSettings,
        'paymentInstructionsHeadline',
        defaults.checkoutSettings.paymentInstructionsHeadline,
      ),
      paymentInstructionsNote: getString(checkoutSettings, 'paymentInstructionsNote', defaults.checkoutSettings.paymentInstructionsNote),
    },
    catalogSettings: (() => {
      const catalogMode = getOneOf(catalogSettings, 'catalogMode', defaults.catalogSettings.catalogMode, [
        'products',
        'services',
        'hybrid',
      ])
      return {
        catalogMode,
        productLabel: getString(catalogSettings, 'productLabel', defaults.catalogSettings.productLabel),
        serviceLabel: getString(catalogSettings, 'serviceLabel', defaults.catalogSettings.serviceLabel),
        addOnLabel: getString(catalogSettings, 'addOnLabel', defaults.catalogSettings.addOnLabel),
        // A service client's categories are their own trades; merging the demo
        // product categories in would leak sample labels into their site.
        categoryLabels: getStringRecord(catalogSettings, 'categoryLabels', catalogMode === 'services' ? {} : defaults.catalogSettings.categoryLabels),
      }
    })(),
    emailSettings: {
      senderName: getString(emailSettings, 'senderName', defaults.emailSettings.senderName),
      senderEmail: getString(emailSettings, 'senderEmail', defaults.emailSettings.senderEmail),
      replyToEmail: getString(emailSettings, 'replyToEmail', defaults.emailSettings.replyToEmail),
      orderConfirmationSubject: getString(emailSettings, 'orderConfirmationSubject', defaults.emailSettings.orderConfirmationSubject),
      paymentInstructionsIntro: getString(emailSettings, 'paymentInstructionsIntro', defaults.emailSettings.paymentInstructionsIntro),
      shipmentSubject: getString(emailSettings, 'shipmentSubject', defaults.emailSettings.shipmentSubject),
      supportSignature: getString(emailSettings, 'supportSignature', defaults.emailSettings.supportSignature),
    },
    serviceSite: normalizeServiceSite(values.get('service_site'), defaults.serviceSite),
    factoryWorkflow: {
      targetTier: getOneOf(factoryWorkflow, 'targetTier', defaults.factoryWorkflow.targetTier, [
        'launch_kit',
        'growth_system',
        'custom_ops',
      ]),
      intakeBusinessType: getString(factoryWorkflow, 'intakeBusinessType', defaults.factoryWorkflow.intakeBusinessType),
      estimatedAnnualRevenue: getString(factoryWorkflow, 'estimatedAnnualRevenue', defaults.factoryWorkflow.estimatedAnnualRevenue),
      expectedMonthlyOrders: getString(factoryWorkflow, 'expectedMonthlyOrders', defaults.factoryWorkflow.expectedMonthlyOrders),
      productOrServiceCount: getString(factoryWorkflow, 'productOrServiceCount', defaults.factoryWorkflow.productOrServiceCount),
      customWorkflowNotes: getString(factoryWorkflow, 'customWorkflowNotes', defaults.factoryWorkflow.customWorkflowNotes),
      identityComplete: getBoolean(factoryWorkflow, 'identityComplete', defaults.factoryWorkflow.identityComplete),
      brandingComplete: getBoolean(factoryWorkflow, 'brandingComplete', defaults.factoryWorkflow.brandingComplete),
      checkoutReady: getBoolean(factoryWorkflow, 'checkoutReady', defaults.factoryWorkflow.checkoutReady),
      catalogReady: getBoolean(factoryWorkflow, 'catalogReady', defaults.factoryWorkflow.catalogReady),
      emailsReady: getBoolean(factoryWorkflow, 'emailsReady', defaults.factoryWorkflow.emailsReady),
      domainReady: getBoolean(factoryWorkflow, 'domainReady', defaults.factoryWorkflow.domainReady),
      testOrderPassed: getBoolean(factoryWorkflow, 'testOrderPassed', defaults.factoryWorkflow.testOrderPassed),
      assetsReceived: getBoolean(factoryWorkflow, 'assetsReceived', defaults.factoryWorkflow.assetsReceived),
      depositReceived: getBoolean(factoryWorkflow, 'depositReceived', defaults.factoryWorkflow.depositReceived),
      ownerTrainingComplete: getBoolean(factoryWorkflow, 'ownerTrainingComplete', defaults.factoryWorkflow.ownerTrainingComplete),
    },
  }
}

export function getDefaultAdminSettings(): AdminSettingsPayload {
  return cloneSettings(DEFAULT_SETTINGS)
}

export function mergeAdminSettings(current: AdminSettingsPayload, patch: Partial<AdminSettingsPayload>): AdminSettingsPayload {
  const values = new Map<string, unknown>([
    ['inventory_defaults', patch.inventoryDefaults ? { ...current.inventoryDefaults, ...patch.inventoryDefaults } : current.inventoryDefaults],
    ['checkout_operations', patch.checkoutOperations ? { ...current.checkoutOperations, ...patch.checkoutOperations } : current.checkoutOperations],
    ['business_details', patch.businessDetails ? { ...current.businessDetails, ...patch.businessDetails } : current.businessDetails],
    ['brand_settings', patch.brandSettings ? { ...current.brandSettings, ...patch.brandSettings } : current.brandSettings],
    ['site_content', patch.siteContent ? { ...current.siteContent, ...patch.siteContent } : current.siteContent],
    ['module_settings', patch.moduleSettings ? { ...current.moduleSettings, ...patch.moduleSettings } : current.moduleSettings],
    ['checkout_settings', patch.checkoutSettings ? { ...current.checkoutSettings, ...patch.checkoutSettings } : current.checkoutSettings],
    ['catalog_settings', patch.catalogSettings ? { ...current.catalogSettings, ...patch.catalogSettings } : current.catalogSettings],
    ['email_settings', patch.emailSettings ? { ...current.emailSettings, ...patch.emailSettings } : current.emailSettings],
    ['service_site', patch.serviceSite ? { ...current.serviceSite, ...patch.serviceSite } : current.serviceSite],
    ['factory_workflow', patch.factoryWorkflow ? { ...current.factoryWorkflow, ...patch.factoryWorkflow } : current.factoryWorkflow],
  ])

  return normalizeAdminSettings(values)
}
