import {
  PRODUCTS,
  PUBLIC_SLUGS,
  getProductImageSrc,
  isPlaceholderProductImage,
} from '@/lib/data-products'
import { cache } from 'react'
import { SITE_SETTINGS } from '@/lib/data-site'
import { getProductCoALink } from '@/lib/data-testing'
import type { Product } from '@/lib/types'
import type { CatalogInventoryRecord, CatalogInventoryOverride } from '@/lib/catalog-admin'
import { readLocalCustomCatalogRecords } from '@/lib/catalog-import'
import { getCatalogAssetSnapshots, getCatalogImageProxyUrl, getCatalogUploadedImageSlugSet } from '@/lib/catalog-assets'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { applyPromosToProduct, getActiveSitePromos } from '@/lib/site-promos'
import { getInventoryStatusFromCount } from '@/lib/inventory-state'

type CatalogSourceRow = Partial<CatalogInventoryRecord> & {
  sku?: string
  display_name?: string
  full_name?: string
  research_category?: string
  format_type?: string
  summary_short?: string
  summary_full?: string
  research_focus_points?: unknown
  listing_notes?: unknown
  coa_not_required?: boolean | string | null
  coaNotRequired?: boolean | string | null
  variant_group?: string
  variant_label?: string
  public_visible?: string | boolean
  inventory_on_hand?: string | number | null
  low_stock_threshold?: string | number | null
  price_each?: string
  promo_label?: string
  promo_detail?: string
  featured?: boolean | string | null
  featured_order?: string | number | null
  featuredOrder?: string | number | null
  image_url?: string
  image_source?: CatalogInventoryRecord['imageSource']
  coa_url?: string | null
  coa_source?: CatalogInventoryRecord['coaSource']
  strength_value?: string | number | null
  unit?: string
  collection?: CatalogInventoryRecord['collection']
  custom_product?: boolean
  archived?: boolean
  updated_at?: string
  updatedAt?: string
}

type CatalogSourcePayload =
  | CatalogSourceRow[]
  | {
      records?: CatalogSourceRow[]
    }

type SupabaseCatalogRow = {
  slug: string
  sku: string | null
  display_name: string
  full_name: string
  strength_value: number | null
  unit: string | null
  collection: CatalogInventoryRecord['collection'] | null
  research_category: string | null
  format_type: string | null
  summary_short: string | null
  summary_full: string | null
  research_focus_points: unknown
  listing_notes: unknown
  coa_not_required: boolean | null
  variant_group: string | null
  variant_label: string | null
  status: CatalogInventoryRecord['status']
  price_each: string | null
  inventory_on_hand: number | null
  low_stock_threshold: number | null
  promo_label: string | null
  promo_detail: string | null
  featured: boolean | null
  featured_order: number | null
  image_url: string | null
  image_source: string | null
  coa_url: string | null
  coa_source: string | null
  public_visible: boolean | null
  custom_product: boolean | null
  archived: boolean | null
  updated_at: string | null
}

function normalizeFamilyKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getStrengthLabelCandidates(product: Pick<Product, 'strength' | 'unit'> & { variantLabel?: string }) {
  const candidates = new Set<string>()
  const rawVariantLabel = product.variantLabel?.trim()
  if (rawVariantLabel) {
    candidates.add(rawVariantLabel)
    candidates.add(rawVariantLabel.replace(/^(\d+(?:\.\d+)?)([a-zA-Z]+)/, '$1 $2').trim())
    candidates.add(rawVariantLabel.replace(/\s+/g, ''))
  }

  const compactStrengthLabel = `${product.strength}${product.unit}`.trim()
  const spacedStrengthLabel = `${product.strength} ${product.unit}`.trim()
  if (compactStrengthLabel) candidates.add(compactStrengthLabel)
  if (spacedStrengthLabel) candidates.add(spacedStrengthLabel)

  return [...candidates].filter(Boolean)
}

function stripTrailingStrengthLabel(value: string, product: Pick<Product, 'strength' | 'unit'> & { variantLabel?: string }) {
  const trimmedValue = value.trim()
  if (!trimmedValue) return trimmedValue

  for (const candidate of getStrengthLabelCandidates(product)) {
    if (!candidate) continue
    const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`(?:[\\s_-]+)?${escaped}$`, 'i')
    if (pattern.test(trimmedValue)) {
      return trimmedValue.replace(pattern, '').trim()
    }
  }

  return trimmedValue
}

function getProductFamilyName(product: Pick<Product, 'displayName' | 'strength' | 'unit'> & { variantLabel?: string }) {
  const displayName = product.displayName.trim()
  return stripTrailingStrengthLabel(displayName, product)
}

function getNormalizedVariantGroup(
  product: Pick<Product, 'variantGroup' | 'displayName' | 'strength' | 'unit'> & { variantLabel?: string },
) {
  const rawVariantGroup = product.variantGroup?.trim()
  if (!rawVariantGroup) return ''

  const familyName = getProductFamilyName(product)
  const strippedVariantGroup = stripTrailingStrengthLabel(rawVariantGroup, product)
  const normalizedFamilyName = normalizeFamilyKey(familyName)
  const normalizedStrippedVariantGroup = normalizeFamilyKey(strippedVariantGroup)
  const normalizedRawVariantGroup = normalizeFamilyKey(rawVariantGroup)

  if (!normalizedRawVariantGroup) return normalizedFamilyName
  if (normalizedStrippedVariantGroup && normalizedStrippedVariantGroup === normalizedFamilyName) {
    return normalizedStrippedVariantGroup
  }

  return normalizedRawVariantGroup
}

function getProductFamilyKey(
  product: Pick<Product, 'variantGroup' | 'displayName' | 'strength' | 'unit'> & { variantLabel?: string },
) {
  return getNormalizedVariantGroup(product) || normalizeFamilyKey(getProductFamilyName(product))
}

function getCanonicalProductSlug(product: Pick<Product, 'displayName' | 'strength' | 'unit'> & { variantLabel?: string }) {
  const familyName = normalizeFamilyKey(getProductFamilyName(product))
  const strengthPart = normalizeFamilyKey(String(product.strength))
  const unitPart = normalizeFamilyKey(product.unit)
  return `${familyName}-${strengthPart}${unitPart}`
}

function getRepresentativeFamilyProduct(products: Product[]) {
  return [...products].sort((a, b) => {
    const familyNameComparison = getProductFamilyName(a).localeCompare(getProductFamilyName(b))
    if (familyNameComparison !== 0) return familyNameComparison
    if (a.strength !== b.strength) return a.strength - b.strength
    return a.displayName.localeCompare(b.displayName)
  })[0] ?? null
}

function getRepresentativeFamilyName(products: Product[]) {
  return [...products]
    .map((product) => getProductFamilyName(product))
    .filter(Boolean)
    .sort((a, b) => a.length - b.length || a.localeCompare(b))[0] ?? ''
}

function getRepresentativeFamilyImageProduct(products: Product[]) {
  return [...products].sort((a, b) => {
    const aUploaded = a.image?.startsWith('/api/catalog-assets/image/') ? 1 : 0
    const bUploaded = b.image?.startsWith('/api/catalog-assets/image/') ? 1 : 0
    if (aUploaded !== bUploaded) return bUploaded - aUploaded

    if (aUploaded && bUploaded) {
      const aUpdatedAt = Date.parse(a.updatedAt ?? '')
      const bUpdatedAt = Date.parse(b.updatedAt ?? '')
      if (Number.isFinite(aUpdatedAt) || Number.isFinite(bUpdatedAt)) {
        return (Number.isFinite(bUpdatedAt) ? bUpdatedAt : 0) - (Number.isFinite(aUpdatedAt) ? aUpdatedAt : 0)
      }
    }

    const aPlaceholder = isPlaceholderProductImage(a) ? 1 : 0
    const bPlaceholder = isPlaceholderProductImage(b) ? 1 : 0
    if (aPlaceholder !== bPlaceholder) return aPlaceholder - bPlaceholder

    if (a.strength !== b.strength) return a.strength - b.strength
    return a.displayName.localeCompare(b.displayName)
  })[0] ?? null
}

function getRepresentativeFamilyCoAProduct(products: Product[]) {
  return [...products].filter((product) => !product.coaNotRequired).sort((a, b) => {
    const aUploaded = a.coaUrl?.startsWith('/quality-reports/') ? 1 : 0
    const bUploaded = b.coaUrl?.startsWith('/quality-reports/') ? 1 : 0
    if (aUploaded !== bUploaded) return bUploaded - aUploaded

    if (aUploaded && bUploaded) {
      const aUpdatedAt = Date.parse(a.updatedAt ?? '')
      const bUpdatedAt = Date.parse(b.updatedAt ?? '')
      if (Number.isFinite(aUpdatedAt) || Number.isFinite(bUpdatedAt)) {
        return (Number.isFinite(bUpdatedAt) ? bUpdatedAt : 0) - (Number.isFinite(aUpdatedAt) ? aUpdatedAt : 0)
      }
    }

    const aHasCoA = a.coaUrl ? 1 : 0
    const bHasCoA = b.coaUrl ? 1 : 0
    if (aHasCoA !== bHasCoA) return bHasCoA - aHasCoA

    if (a.strength !== b.strength) return a.strength - b.strength
    return a.displayName.localeCompare(b.displayName)
  })[0] ?? null
}

function harmonizeFamilyImages(products: Product[]) {
  const familyMap = new Map<string, Product[]>()

  for (const product of products) {
    const familyKey = getProductFamilyKey(product)
    const existing = familyMap.get(familyKey)
    if (existing) {
      existing.push(product)
    } else {
      familyMap.set(familyKey, [product])
    }
  }

  return [...familyMap.values()].flatMap((familyProducts) => {
    const familyImageProduct = getRepresentativeFamilyImageProduct(familyProducts)
    if (!familyImageProduct?.image) return familyProducts

    return familyProducts.map((product) => ({
      ...product,
      image: familyImageProduct.image,
    }))
  })
}

function harmonizeFamilyCoAs(products: Product[]) {
  const familyMap = new Map<string, Product[]>()

  for (const product of products) {
    const familyKey = getProductFamilyKey(product)
    const existing = familyMap.get(familyKey)
    if (existing) {
      existing.push(product)
    } else {
      familyMap.set(familyKey, [product])
    }
  }

  return [...familyMap.values()].flatMap((familyProducts) => {
    const familyCoAProduct = getRepresentativeFamilyCoAProduct(familyProducts)
    if (!familyCoAProduct?.coaUrl) return familyProducts

    return familyProducts.map((product) =>
      product.coaNotRequired
        ? product
        : {
            ...product,
            coaUrl: familyCoAProduct.coaUrl,
            coaStatus: familyCoAProduct.coaStatus,
          },
    )
  })
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function toBoolean(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['yes', 'true', '1', 'live'].includes(normalized)) return true
    if (['no', 'false', '0', 'hidden'].includes(normalized)) return false
  }
  return fallback
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string').map((entry) => entry.trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.filter((entry): entry is string => typeof entry === 'string').map((entry) => entry.trim()).filter(Boolean)
      }
    } catch {
      return value
        .split('\n')
        .map((entry) => entry.trim())
        .filter(Boolean)
    }
  }
  return []
}

const CATALOG_COLLECTION_VALUES: readonly CatalogInventoryRecord['collection'][] = [
  'candles',
  'wax_melts',
  'room_sprays',
  'diffusers',
  'gift_sets',
  'accessories',
]

function inferCollectionFromFormatType(formatType: string): CatalogInventoryRecord['collection'] {
  const normalized = formatType.toLowerCase()
  if (normalized.includes('melt')) return 'wax_melts'
  if (normalized.includes('spray')) return 'room_sprays'
  if (normalized.includes('diffuser')) return 'diffusers'
  if (normalized.includes('set')) return 'gift_sets'
  if (normalized.includes('accessor') || normalized.includes('case')) return 'accessories'
  return 'candles'
}

function normalizeCollectionValue(
  value: CatalogInventoryRecord['collection'] | string | null | undefined,
  formatType: string,
): CatalogInventoryRecord['collection'] {
  if (value && (CATALOG_COLLECTION_VALUES as readonly string[]).includes(value)) {
    return value as CatalogInventoryRecord['collection']
  }
  return inferCollectionFromFormatType(formatType)
}

function normalizeCatalogRecord(row: CatalogSourceRow): CatalogInventoryRecord | null {
  const slug = typeof row.slug === 'string' ? row.slug : ''
  const base = PRODUCTS[slug]
  const customProduct = Boolean(row.customProduct ?? row.custom_product)
  if (!base && !customProduct) return null

  const fallbackVisible = PUBLIC_SLUGS.includes(slug as (typeof PUBLIC_SLUGS)[number])
  const fallbackCollection = base
    ? normalizeCollectionValue(base.category, base.formatType)
    : 'candles'

  const normalizedInventoryOnHand = toNullableNumber(row.inventoryOnHand ?? row.inventory_on_hand)

  return {
    slug,
    sku: typeof row.sku === 'string' ? row.sku : base?.sku || slug.toUpperCase(),
    displayName: typeof row.displayName === 'string' ? row.displayName : row.display_name || base?.displayName || slug,
    fullName: typeof row.fullName === 'string' ? row.fullName : row.full_name || base?.fullName || slug,
    strength: toNullableNumber(row.strength ?? row.strength_value) ?? base?.strength ?? 0,
    unit: typeof row.unit === 'string' ? row.unit : base?.unit || 'oz',
    collection: normalizeCollectionValue(
      row.collection ?? fallbackCollection,
      typeof row.formatType === 'string' ? row.formatType : row.format_type || base?.formatType || 'candle',
    ),
    researchCategory:
      typeof row.researchCategory === 'string' ? row.researchCategory : row.research_category || base?.researchCategory || 'candles',
    formatType: typeof row.formatType === 'string' ? row.formatType : row.format_type || base?.formatType || 'candle',
    summaryShort:
      typeof row.summaryShort === 'string' ? row.summaryShort : row.summary_short || base?.summaryShort || '',
    summaryFull:
      typeof row.summaryFull === 'string' ? row.summaryFull : row.summary_full || base?.summaryFull || '',
    researchFocusPoints:
      row.researchFocusPoints !== undefined
        ? toStringArray(row.researchFocusPoints)
        : row.research_focus_points !== undefined
          ? toStringArray(row.research_focus_points)
          : (base?.researchFocusPoints ?? []),
    listingNotes:
      row.listingNotes !== undefined
        ? toStringArray(row.listingNotes)
        : row.listing_notes !== undefined
          ? toStringArray(row.listing_notes)
          : (base?.listingNotes ?? []),
    coaNotRequired: toBoolean(row.coaNotRequired ?? row.coa_not_required, Boolean(base?.coaNotRequired)),
    variantGroup:
      typeof row.variantGroup === 'string' ? row.variantGroup : row.variant_group || base?.variantGroup || undefined,
    variantLabel:
      typeof row.variantLabel === 'string' ? row.variantLabel : row.variant_label || base?.variantLabel || undefined,
    status: getInventoryStatusFromCount(
      normalizedInventoryOnHand,
      (row.status as CatalogInventoryRecord['status']) ?? 'out_of_stock',
    ),
    priceEach: typeof row.priceEach === 'string' ? row.priceEach : row.price_each || base?.priceEach || '',
    inventoryOnHand: normalizedInventoryOnHand,
    lowStockThreshold: toNullableNumber(row.lowStockThreshold ?? row.low_stock_threshold),
    promoLabel: typeof row.promoLabel === 'string' ? row.promoLabel : row.promo_label || '',
    promoDetail: typeof row.promoDetail === 'string' ? row.promoDetail : row.promo_detail || '',
    featured: toBoolean(row.featured, false),
    featuredOrder: toNullableNumber(row.featuredOrder ?? row.featured_order),
    publicVisible: toBoolean(row.publicVisible ?? row.public_visible, fallbackVisible),
    imageUrl:
      typeof row.imageUrl === 'string'
        ? row.imageUrl
        : typeof row.image_url === 'string'
          ? row.image_url
          : base
            ? getProductImageSrc(base)
            : '/products/front.png',
    imageSource:
      row.imageSource === 'uploaded' || row.imageSource === 'catalog' || row.imageSource === 'placeholder'
        ? row.imageSource
        : row.image_source === 'uploaded' || row.image_source === 'catalog' || row.image_source === 'placeholder'
          ? row.image_source
          : base
            ? (isPlaceholderProductImage(base) ? 'placeholder' : 'catalog')
            : 'placeholder',
    coaUrl:
      row.coaUrl !== undefined
        ? row.coaUrl
        : row.coa_url !== undefined
          ? row.coa_url
          : base
            ? getProductCoALink(base)
            : null,
    coaSource:
      row.coaSource === 'uploaded' || row.coaSource === 'packet' || row.coaSource === 'none'
        ? row.coaSource
        : row.coa_source === 'uploaded' || row.coa_source === 'packet' || row.coa_source === 'none'
          ? row.coa_source
          : base && getProductCoALink(base)
            ? 'packet'
            : 'none',
    customProduct,
    archived: Boolean(row.archived),
    updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : row.updated_at,
  }
}

function recordsToOverrides(records: CatalogInventoryRecord[]): Record<string, CatalogInventoryOverride> {
  return Object.fromEntries(
    records.map((record) => [
      record.slug,
      {
        displayName: record.displayName,
        fullName: record.fullName,
        sku: record.sku,
        strength: record.strength,
        unit: record.unit,
        collection: record.collection,
        researchCategory: record.researchCategory,
        formatType: record.formatType,
        summaryShort: record.summaryShort,
        summaryFull: record.summaryFull,
        researchFocusPoints: record.researchFocusPoints,
        listingNotes: record.listingNotes,
        coaNotRequired: record.coaNotRequired,
        variantGroup: record.variantGroup,
        variantLabel: record.variantLabel,
        status: record.status,
        priceEach: record.priceEach,
        inventoryOnHand: record.inventoryOnHand,
        lowStockThreshold: record.lowStockThreshold,
        promoLabel: record.promoLabel,
        promoDetail: record.promoDetail,
        featured: record.featured,
        featuredOrder: record.featuredOrder,
        publicVisible: record.publicVisible,
        customProduct: record.customProduct,
        archived: record.archived,
        updatedAt: record.updatedAt,
      },
    ]),
  )
}

export function applyCatalogOverrideToProduct(product: Product, override?: CatalogInventoryOverride): Product {
  const nextInventoryOnHand =
    override?.inventoryOnHand !== undefined ? override.inventoryOnHand : (product.inventoryOnHand ?? null)
  const fallbackStatus =
    override?.status ?? (product.status === 'incoming' ? 'out_of_stock' : product.status)

  if (!override) {
    return {
      ...product,
      status: getInventoryStatusFromCount(nextInventoryOnHand, fallbackStatus),
      inventoryOnHand: nextInventoryOnHand,
      sku: product.sku ?? product.slug.toUpperCase(),
      publicVisible: product.publicVisible ?? PUBLIC_SLUGS.includes(product.slug as (typeof PUBLIC_SLUGS)[number]),
      customProduct: product.customProduct ?? false,
      archived: product.archived ?? false,
      updatedAt: product.updatedAt,
    }
  }

  return {
    ...product,
    sku: typeof override.sku === 'string' ? override.sku : product.sku,
    displayName: typeof override.displayName === 'string' ? override.displayName : product.displayName,
    fullName: typeof override.fullName === 'string' ? override.fullName : product.fullName,
    category: typeof override.collection === 'string' ? override.collection : product.category,
    strength: typeof override.strength === 'number' ? override.strength : product.strength,
    unit: typeof override.unit === 'string' ? override.unit : product.unit,
    researchCategory: typeof override.researchCategory === 'string' ? override.researchCategory : product.researchCategory,
    formatType: typeof override.formatType === 'string' ? override.formatType : product.formatType,
    summaryShort: typeof override.summaryShort === 'string' ? override.summaryShort : product.summaryShort,
    summaryFull: typeof override.summaryFull === 'string' ? override.summaryFull : product.summaryFull,
    researchFocusPoints: Array.isArray(override.researchFocusPoints) ? override.researchFocusPoints : product.researchFocusPoints,
    listingNotes: Array.isArray(override.listingNotes) ? override.listingNotes : product.listingNotes,
    coaNotRequired: override.coaNotRequired ?? product.coaNotRequired ?? false,
    variantGroup: typeof override.variantGroup === 'string' ? override.variantGroup : product.variantGroup,
    variantLabel: typeof override.variantLabel === 'string' ? override.variantLabel : product.variantLabel,
    status: getInventoryStatusFromCount(nextInventoryOnHand, fallbackStatus),
    priceEach: typeof override.priceEach === 'string' ? override.priceEach : product.priceEach,
    inventoryOnHand: nextInventoryOnHand,
    lowStockThreshold:
      override.lowStockThreshold !== undefined ? override.lowStockThreshold : (product.lowStockThreshold ?? null),
    promoLabel: typeof override.promoLabel === 'string' ? override.promoLabel : product.promoLabel,
    promoDetail: typeof override.promoDetail === 'string' ? override.promoDetail : product.promoDetail,
    publicVisible:
      override.publicVisible !== undefined
        ? override.publicVisible
        : (product.publicVisible ?? PUBLIC_SLUGS.includes(product.slug as (typeof PUBLIC_SLUGS)[number])),
    customProduct: override.customProduct ?? product.customProduct,
    archived: override.archived ?? product.archived,
    updatedAt: typeof override.updatedAt === 'string' ? override.updatedAt : product.updatedAt,
  }
}

function createProductFromCatalogRecord(record: CatalogInventoryRecord): Product {
  return {
    slug: record.slug,
    sku: record.sku,
    displayName: record.displayName,
    fullName: record.fullName,
    alias: record.displayName,
    category: record.collection,
    researchCategory: record.researchCategory,
    structureType: record.formatType || 'candle',
    strength: record.strength,
    unit: record.unit,
    formatType: record.formatType,
    status: record.status,
    coaStatus: record.coaNotRequired ? 'not_available' : record.coaUrl ? 'available' : 'pending',
    coaUrl: record.coaUrl ?? '',
    verificationUrl: '',
    batchNumber: '',
    testingLab: '',
    purityPercent: '',
    summaryShort:
      record.summaryShort || `${record.displayName} is a demo catalog listing in the ${record.researchCategory.toLowerCase().replace(/_/g, ' ')} collection.`,
    summaryFull:
      record.summaryFull || `${record.displayName} is presented as a ${record.formatType} listing for teams organizing a product catalog by collection, format, and documentation.`,
    researchFocusPoints: record.researchFocusPoints,
    listingNotes: record.listingNotes,
    priceEach: record.priceEach,
    inventoryOnHand: record.inventoryOnHand,
    lowStockThreshold: record.lowStockThreshold,
    publicVisible: record.publicVisible,
    promoLabel: record.promoLabel,
    promoDetail: record.promoDetail,
    features: ['Standardized label format', 'Demo catalog presentation', 'Quality-report-linked workflow'],
    accentColor: 'warm sandstone',
    accentColorHex: '#B49B7F',
    image: record.imageUrl,
    hoverSpinFrames: [],
    publishStatus: 'confirmed',
    needsFounderConfirmation: false,
    variantGroup: record.variantGroup,
    variantLabel: record.variantLabel ?? `${record.strength} ${record.unit}`,
    customProduct: true,
    archived: record.archived,
    updatedAt: record.updatedAt,
  }
}

function applyCatalogAssetsToProduct(
  product: Product,
  asset?: { imageUrl: string; coaUrl: string | null; coaSource: 'uploaded' | 'packet' | 'none' },
): Product {
  if (!asset) return product

  return {
    ...product,
    image: asset.imageUrl,
    coaUrl: product.coaNotRequired ? '' : asset.coaUrl ?? product.coaUrl,
    coaStatus: product.coaNotRequired ? 'not_available' : asset.coaUrl ? 'available' : product.coaStatus,
  }
}

const getSupabaseCatalogRecords = cache(async (): Promise<CatalogInventoryRecord[]> => {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []

  const fullSelect =
    'slug, sku, display_name, full_name, strength_value, unit, collection, research_category, format_type, summary_short, summary_full, research_focus_points, listing_notes, coa_not_required, variant_group, variant_label, status, price_each, inventory_on_hand, low_stock_threshold, promo_label, promo_detail, featured, featured_order, image_url, image_source, coa_url, coa_source, public_visible, custom_product, archived, updated_at'
  const legacySelect =
    'slug, sku, display_name, full_name, strength_value, unit, collection, research_category, format_type, variant_group, variant_label, status, price_each, inventory_on_hand, low_stock_threshold, promo_label, promo_detail, public_visible, custom_product, archived'

  const fullResponse = await supabase
    .from('catalog_products')
    .select(fullSelect)
  let data = fullResponse.data as SupabaseCatalogRow[] | null
  let error = fullResponse.error

  if (
    error &&
    (error.message.toLowerCase().includes('summary_short') ||
      error.message.toLowerCase().includes('summary_full') ||
      error.message.toLowerCase().includes('research_focus_points') ||
      error.message.toLowerCase().includes('listing_notes') ||
      error.message.toLowerCase().includes('coa_not_required') ||
      error.message.toLowerCase().includes('image_url') ||
      error.message.toLowerCase().includes('image_source') ||
      error.message.toLowerCase().includes('coa_url') ||
      error.message.toLowerCase().includes('coa_source') ||
      error.message.toLowerCase().includes('featured') ||
      error.message.toLowerCase().includes('updated_at'))
  ) {
    const fallback = await supabase.from('catalog_products').select(legacySelect)
    data = fallback.data as SupabaseCatalogRow[] | null
    error = fallback.error
  }

  if (error || !data) return []

  return (data as SupabaseCatalogRow[])
    .map((row) =>
      normalizeCatalogRecord({
        slug: row.slug,
        sku: row.sku ?? '',
        display_name: row.display_name,
        full_name: row.full_name,
        strength_value: row.strength_value ?? 0,
        unit: row.unit ?? 'oz',
        collection: row.collection ?? 'candles',
        research_category: row.research_category ?? 'candles',
        format_type: row.format_type ?? 'candle',
        summary_short: row.summary_short ?? '',
        summary_full: row.summary_full ?? '',
        research_focus_points: row.research_focus_points ?? [],
        listing_notes: row.listing_notes ?? [],
        coa_not_required: row.coa_not_required ?? false,
        variant_group: row.variant_group ?? '',
        variant_label: row.variant_label ?? '',
        status: row.status,
        price_each: row.price_each ?? '',
        inventory_on_hand: row.inventory_on_hand,
        low_stock_threshold: row.low_stock_threshold,
        promo_label: row.promo_label ?? '',
        promo_detail: row.promo_detail ?? '',
        featured: row.featured ?? false,
        featured_order: row.featured_order,
        image_url: row.image_url ?? '',
        image_source: (row.image_source as CatalogInventoryRecord['imageSource'] | undefined) ?? undefined,
        coa_url: row.coa_url ?? null,
        coa_source: (row.coa_source as CatalogInventoryRecord['coaSource'] | undefined) ?? undefined,
        public_visible: row.public_visible ?? true,
        custom_product: row.custom_product ?? false,
        archived: row.archived ?? false,
        updated_at: row.updated_at ?? undefined,
      }),
    )
    .filter((record): record is CatalogInventoryRecord => record !== null)
})

export const getSharedCatalogRecords = cache(async (): Promise<CatalogInventoryRecord[]> => {
  const supabaseRecords = await getSupabaseCatalogRecords()
  if (supabaseRecords.length > 0) return supabaseRecords

  const sourceUrl = process.env.CATALOG_SOURCE_URL
  if (!sourceUrl) return []

  try {
    const response = await fetch(sourceUrl, { cache: 'no-store' })
    if (!response.ok) return []

    const payload = (await response.json()) as CatalogSourcePayload
    const rows = Array.isArray(payload) ? payload : payload.records ?? []
    return rows
      .map(normalizeCatalogRecord)
      .filter((record): record is CatalogInventoryRecord => record !== null)
  } catch {
    return []
  }
})

export const getSharedCatalogOverrides = cache(async () => {
  const records = await getSharedCatalogRecords()
  return recordsToOverrides(records)
})

// Custom products imported in local mode (no Supabase) live in
// .factory-data/catalog-products.json and win over base records on slug clash.
const getLocalCustomCatalogRecords = cache(async (): Promise<CatalogInventoryRecord[]> => {
  return readLocalCustomCatalogRecords()
})

function mergeLocalCustomRecords(baseRecords: CatalogInventoryRecord[], localCustomRecords: CatalogInventoryRecord[]) {
  if (!localCustomRecords.length) return baseRecords
  // Local custom records are the applied client's catalog. In a single-client
  // copy the seed demo records are not theirs to show, so the client's catalog
  // replaces the demo baseline instead of stacking on top of it.
  return localCustomRecords
}

const getPendingSupplySlugSet = cache(async () => {
  const supabase = getSupabaseAdmin()
  if (!supabase) return new Set<string>()

  const { data, error } = await supabase
    .from('inventory_purchase_logs')
    .select('slug')
    .eq('status', 'ordered')
    .is('inventory_applied_at', null)

  if (error || !data) return new Set<string>()
  return new Set(data.map((row) => row.slug as string))
})

function applyDerivedInventoryStates(records: CatalogInventoryRecord[], pendingSupplySlugs: Set<string>) {
  return records.map((record) => ({
    ...record,
    status: (
      record.inventoryOnHand !== null && record.inventoryOnHand !== undefined && record.inventoryOnHand > 0
        ? 'in_stock'
        : pendingSupplySlugs.has(record.slug)
          ? 'incoming'
          : 'out_of_stock'
    ) as CatalogInventoryRecord['status'],
  }))
}

function applyUploadedImageUrls(records: CatalogInventoryRecord[], uploadedImageSlugs: Set<string>) {
  return records.map((record) => {
    const hasVersionedProxyUrl = record.imageUrl.startsWith('/api/catalog-assets/image/') && record.imageUrl.includes('?')
    const hasUploadedImage =
      uploadedImageSlugs.has(record.slug) ||
      record.imageSource === 'uploaded' ||
      record.imageUrl.startsWith('/api/catalog-assets/image/')

    if (!hasUploadedImage) return record

    return {
      ...record,
      imageUrl: hasVersionedProxyUrl ? record.imageUrl : getCatalogImageProxyUrl(record.slug, record.updatedAt ?? undefined),
      imageSource: 'uploaded' as const,
    }
  })
}

export const getLiveCatalogInventoryRecords = cache(async (): Promise<CatalogInventoryRecord[]> => {
  const records = await getSharedCatalogRecords()
  const [pendingSupplySlugs, uploadedImageSlugs, localCustomRecords] = await Promise.all([
    getPendingSupplySlugSet(),
    getCatalogUploadedImageSlugSet(),
    getLocalCustomCatalogRecords(),
  ])
  const baseRecords = mergeLocalCustomRecords(
    records.length > 0
      ? records
      : await (async () => {
          const { getCatalogInventoryRecords } = await import('@/lib/catalog-admin')
          return getCatalogInventoryRecords()
        })(),
    localCustomRecords,
  )

  return applyUploadedImageUrls(applyDerivedInventoryStates(baseRecords, pendingSupplySlugs), uploadedImageSlugs)
    .filter((record) => !record.archived)
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
})

export const getAdminCatalogInventoryRecords = cache(async (): Promise<CatalogInventoryRecord[]> => {
  const records = await getSharedCatalogRecords()
  const [pendingSupplySlugs, localCustomRecords] = await Promise.all([getPendingSupplySlugSet(), getLocalCustomCatalogRecords()])
  const baseRecords = mergeLocalCustomRecords(
    records.length > 0
      ? records
      : await (async () => {
          const { getCatalogInventoryRecords } = await import('@/lib/catalog-admin')
          return getCatalogInventoryRecords()
        })(),
    localCustomRecords,
  )

  const assetSnapshots = await getCatalogAssetSnapshots(baseRecords.map((record) => record.slug))

  return applyDerivedInventoryStates(baseRecords, pendingSupplySlugs)
    .map((record) => ({
      ...record,
      imageUrl: assetSnapshots[record.slug]?.imageUrl ?? record.imageUrl,
      imageSource: assetSnapshots[record.slug]?.imageSource ?? record.imageSource,
      coaUrl: assetSnapshots[record.slug]?.coaUrl ?? record.coaUrl,
        coaSource: assetSnapshots[record.slug]?.coaSource ?? record.coaSource,
        coaNotRequired: record.coaNotRequired,
    }))
    .sort((a, b) => {
      if (a.archived !== b.archived) return a.archived ? 1 : -1
      return a.displayName.localeCompare(b.displayName)
    })
})

export const getLiveCatalogProducts = cache(async (): Promise<Product[]> => {
  const records = await getLiveCatalogInventoryRecords()
  const overrides = await getSharedCatalogOverrides()
  const promos = await getActiveSitePromos()

  const products = records
    .filter((record) => record.publicVisible && !record.archived)
    .map((record) =>
      applyPromosToProduct(
        applyCatalogAssetsToProduct(
          PRODUCTS[record.slug]
            ? applyCatalogOverrideToProduct(PRODUCTS[record.slug], overrides[record.slug])
            : createProductFromCatalogRecord(record),
          {
            imageUrl: record.imageUrl,
            coaUrl: record.coaUrl,
            coaSource: record.coaSource,
          },
        ),
        promos,
      ),
    )

  return harmonizeFamilyCoAs(harmonizeFamilyImages(products))
})

export const getLiveCatalogDisplayProducts = cache(async (): Promise<Product[]> => {
  const products = await getLiveCatalogProducts()
  const familyMap = new Map<string, Product[]>()

  for (const product of products) {
    const familyKey = getProductFamilyKey(product)
    const existing = familyMap.get(familyKey)
    if (existing) {
      existing.push(product)
    } else {
      familyMap.set(familyKey, [product])
    }
  }

  return [...familyMap.values()]
    .map((familyProducts) => {
      const representative = getRepresentativeFamilyProduct(familyProducts)
      if (!representative) return null
      const familyName = getRepresentativeFamilyName(familyProducts) || representative.displayName
      const familyFullName =
        [...familyProducts]
          .map((product) => product.fullName?.trim())
          .filter(Boolean)
          .sort((a, b) => a!.length - b!.length || a!.localeCompare(b!))[0] ?? representative.fullName

      const familyRepresentative = {
        ...representative,
        displayName: familyName,
        fullName: familyFullName,
      }

      const hasMixedAvailability =
        familyProducts.length > 1 &&
        familyProducts.some(
          (product) =>
            product.status !== representative.status ||
            (product.inventoryOnHand ?? null) !== (representative.inventoryOnHand ?? null),
        )

      if (!hasMixedAvailability) return familyRepresentative

      return {
        ...familyRepresentative,
        listingAvailabilityLabel: 'Varying Availability',
        listingAvailabilityTone: 'blue' as const,
        inventoryOnHand: null,
        lowStockThreshold: null,
      }
    })
    .filter((product): product is Product => product !== null)
    .sort((a, b) => getProductFamilyName(a).localeCompare(getProductFamilyName(b)))
})

export const getLiveFeaturedProducts = cache(async (): Promise<Product[]> => {
  const records = await getLiveCatalogInventoryRecords()
  const adminFeaturedSlugs = records
    .filter((record) => record.featured && record.publicVisible && !record.archived)
    .sort((a, b) => {
      const orderA = a.featuredOrder ?? Number.MAX_SAFE_INTEGER
      const orderB = b.featuredOrder ?? Number.MAX_SAFE_INTEGER
      if (orderA !== orderB) return orderA - orderB
      return a.displayName.localeCompare(b.displayName)
    })
    .map((record) => record.slug)

  const featuredSlugs =
    adminFeaturedSlugs.length > 0
      ? adminFeaturedSlugs
      : SITE_SETTINGS.featuredProductSlugs.filter((slug) => PRODUCTS[slug])
  const products = await getLiveCatalogProducts()
  const productBySlug = new Map(products.map((product) => [product.slug, product]))

  return featuredSlugs
    .map((slug) => productBySlug.get(slug))
    .filter((product): product is Product => Boolean(product && product.publicVisible !== false))
})

export const getLiveProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const products = await getLiveCatalogProducts()
  const exact = products.find((product) => product.slug === slug)
  if (exact) return exact

  const normalizedSlug = normalizeFamilyKey(slug)
  const normalizedMatch =
    products.find((product) => normalizeFamilyKey(product.slug) === normalizedSlug) ??
    products.find((product) => getCanonicalProductSlug(product) === normalizedSlug)

  if (normalizedMatch) return normalizedMatch

  const familyMatches = products.filter((product) => getProductFamilyKey(product) === normalizedSlug)
  if (familyMatches.length === 0) return null

  return (
    [...familyMatches].sort((a, b) => {
      const statusRank = (status: Product['status']) => {
        if (status === 'in_stock') return 0
        if (status === 'incoming') return 1
        return 2
      }
      const statusComparison = statusRank(a.status) - statusRank(b.status)
      if (statusComparison !== 0) return statusComparison
      if (a.strength !== b.strength) return a.strength - b.strength
      return a.displayName.localeCompare(b.displayName)
    })[0] ?? null
  )
})

export async function getLiveProductVariants(productOrSlug: Product | string): Promise<Product[]> {
  const baseProduct = typeof productOrSlug === 'string' ? await getLiveProductBySlug(productOrSlug) : productOrSlug
  if (!baseProduct) return []

  const products = await getLiveCatalogProducts()
  const familyKey = getProductFamilyKey(baseProduct)
  const familyVariants = products.filter(
    (product) => getProductFamilyKey(product) === familyKey && product.publicVisible !== false,
  )

  return familyVariants.length > 1
    ? [...familyVariants].sort((a, b) => {
        if (a.strength !== b.strength) return a.strength - b.strength
        return a.displayName.localeCompare(b.displayName)
      })
    : []
}
