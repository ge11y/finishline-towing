import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import type { CatalogCollection, CatalogInventoryRecord } from '@/lib/catalog-admin'
import type { FactoryLeadProduct } from '@/lib/factory-leads'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const LOCAL_DATA_DIR = path.join(process.cwd(), '.factory-data')
const LOCAL_CUSTOM_CATALOG_PATH = path.join(LOCAL_DATA_DIR, 'catalog-products.json')

// Imported client products start purchasable with a small assumed stock the
// owner corrects in Inventory; 0 would hide the buy path minutes after launch.
const IMPORTED_PRODUCT_STARTING_STOCK = 10

function slugifyName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function mapCategoryToCollection(category: string): CatalogCollection {
  const normalized = slugifyName(category).replace(/-/g, '_')
  if (
    normalized === 'candles' ||
    normalized === 'wax_melts' ||
    normalized === 'room_sprays' ||
    normalized === 'diffusers' ||
    normalized === 'gift_sets' ||
    normalized === 'accessories'
  ) {
    return normalized
  }
  if (normalized.includes('candle')) return 'candles'
  if (normalized.includes('melt')) return 'wax_melts'
  if (normalized.includes('spray')) return 'room_sprays'
  if (normalized.includes('diffus')) return 'diffusers'
  if (normalized.includes('set') || normalized.includes('bundle')) return 'gift_sets'
  return 'accessories'
}

// The .svg suffix matters: next/image auto-renders .svg sources unoptimized,
// so the generated placeholder bypasses the image optimizer (which blocks SVG).
export function getImportedProductPlaceholderUrl(slug: string) {
  return `/api/catalog-assets/placeholder/${slug}.svg`
}

export function draftProductsToCatalogRecords(draftProducts: FactoryLeadProduct[]): CatalogInventoryRecord[] {
  const timestamp = new Date().toISOString()
  const usedSlugs = new Set<string>()

  return draftProducts
    .filter((draft) => draft.name.trim())
    .map((draft) => {
      const baseSlug = slugifyName(draft.name) || 'client-product'
      let slug = baseSlug
      let suffix = 2
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${suffix}`
        suffix += 1
      }
      usedSlugs.add(slug)

      const collection = mapCategoryToCollection(draft.category)
      const imageUrl = draft.imageUrl.trim()
      return {
        slug,
        sku: slug.toUpperCase(),
        displayName: draft.name.trim(),
        fullName: draft.name.trim(),
        strength: 0,
        unit: '',
        collection,
        researchCategory: collection,
        formatType: 'listing',
        summaryShort: draft.description,
        summaryFull: draft.description,
        researchFocusPoints: [],
        listingNotes: [],
        coaNotRequired: true,
        variantGroup: undefined,
        variantLabel: undefined,
        status: 'in_stock',
        priceEach: draft.price,
        inventoryOnHand: IMPORTED_PRODUCT_STARTING_STOCK,
        lowStockThreshold: 5,
        promoLabel: '',
        promoDetail: '',
        featured: false,
        featuredOrder: null,
        publicVisible: true,
        imageUrl: imageUrl || getImportedProductPlaceholderUrl(slug),
        // App-served static paths (e.g. /clients/<slug>/photo.jpg) must not be
        // proxied through the uploaded-asset endpoint — mark them 'none' so the
        // read path serves them directly.
        imageSource: imageUrl ? (imageUrl.startsWith('/') && !imageUrl.startsWith('/api/') ? 'catalog' : 'uploaded') : 'placeholder',
        coaUrl: null,
        coaSource: 'none',
        customProduct: true,
        archived: false,
        updatedAt: timestamp,
      } satisfies CatalogInventoryRecord
    })
}

export async function readLocalCustomCatalogRecords(): Promise<CatalogInventoryRecord[]> {
  try {
    const content = await readFile(LOCAL_CUSTOM_CATALOG_PATH, 'utf8')
    const parsed = JSON.parse(content) as unknown
    if (!Array.isArray(parsed)) return []
    return (parsed as CatalogInventoryRecord[]).filter((record) => Boolean(record?.slug && record?.displayName))
  } catch {
    return []
  }
}

async function upsertLocalCustomCatalogRecords(records: CatalogInventoryRecord[]) {
  const existing = await readLocalCustomCatalogRecords()
  const incomingSlugs = new Set(records.map((record) => record.slug))
  const nextRecords = [...existing.filter((record) => !incomingSlugs.has(record.slug)), ...records]
  await mkdir(LOCAL_DATA_DIR, { recursive: true })
  await writeFile(LOCAL_CUSTOM_CATALOG_PATH, JSON.stringify(nextRecords, null, 2))
  return nextRecords.length
}

export async function importDraftCatalogProducts(
  draftProducts: FactoryLeadProduct[],
): Promise<{ ok: true; imported: number; source: 'supabase' | 'local' } | { ok: false; error: string }> {
  const records = draftProductsToCatalogRecords(draftProducts)
  if (!records.length) return { ok: true, imported: 0, source: 'local' }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    await upsertLocalCustomCatalogRecords(records)
    return { ok: true, imported: records.length, source: 'local' }
  }

  const legacyRows = records.map((record) => ({
    slug: record.slug,
    sku: record.sku,
    display_name: record.displayName,
    full_name: record.fullName,
    strength_value: record.strength,
    unit: record.unit,
    collection: record.collection,
    research_category: record.researchCategory,
    format_type: record.formatType,
    variant_group: null,
    variant_label: null,
    status: record.status,
    price_each: record.priceEach,
    inventory_on_hand: record.inventoryOnHand,
    low_stock_threshold: record.lowStockThreshold,
    promo_label: record.promoLabel,
    promo_detail: record.promoDetail,
    public_visible: record.publicVisible,
    custom_product: record.customProduct,
    archived: record.archived,
  }))
  const fullRows = records.map((record, index) => ({
    ...legacyRows[index],
    summary_short: record.summaryShort,
    summary_full: record.summaryFull,
    research_focus_points: record.researchFocusPoints,
    listing_notes: record.listingNotes,
    coa_not_required: record.coaNotRequired,
    featured: record.featured,
    featured_order: record.featuredOrder,
    image_url: record.imageUrl,
    image_source: record.imageSource,
    coa_url: record.coaUrl,
    coa_source: record.coaSource,
    updated_at: record.updatedAt,
  }))

  let { error } = await supabase.from('catalog_products').upsert(fullRows, { onConflict: 'slug' })
  if (error) {
    // Older client schemas miss the newer copy/asset columns — same fallback as /api/catalog-sync.
    const retry = await supabase.from('catalog_products').upsert(legacyRows, { onConflict: 'slug' })
    error = retry.error
  }
  if (error) return { ok: false, error: error.message }

  return { ok: true, imported: records.length, source: 'supabase' }
}
