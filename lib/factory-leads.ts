import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import type { FactoryThemePresetId } from '@/lib/admin-settings'
import { ensureCatalogBucket } from '@/lib/catalog-assets'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { FACTORY_THEME_PRESETS, type FactoryTierId } from '@/lib/factory-presets'

export type FactoryLeadStatus = 'new' | 'reviewing' | 'quoted' | 'deposit_pending' | 'won' | 'lost'

export const FACTORY_LEAD_STYLE_VIBES = ['minimal', 'bold', 'soft', 'luxury'] as const

export const MAX_LEAD_PRODUCTS = 20

export type FactoryLeadProduct = {
  name: string
  price: string
  category: string
  description: string
  imageUrl: string
}

export type FactoryLead = {
  id: string
  createdAt: string
  updatedAt: string
  status: FactoryLeadStatus
  businessName: string
  email: string
  website: string
  businessType: string
  annualRevenue: string
  monthlyOrders: string
  itemCount: string
  timeline: string
  needs: string[]
  recommendedTier: FactoryTierId
  selectedTier: FactoryTierId
  notes: string
  summary: string
  ownerNotes: string
  themePreset: FactoryThemePresetId | ''
  primaryColor: string
  accentColor: string
  styleVibes: string[]
  logoUrl: string
  logoDataUrl: string
  headline: string
  aboutLine: string
  supportEmail: string
  supportPhone: string
  socialLinks: string[]
  tonePreference: string
  products: FactoryLeadProduct[]
  hasSpreadsheet: boolean
}

export type FactoryLeadInput = {
  businessName?: string
  email?: string
  website?: string
  businessType?: string
  annualRevenue?: string
  monthlyOrders?: string
  itemCount?: string
  timeline?: string
  needs?: string[]
  recommendedTier?: FactoryTierId
  notes?: string
  summary?: string
  themePreset?: string
  primaryColor?: string
  accentColor?: string
  styleVibes?: string[]
  logoDataUrl?: string
  headline?: string
  aboutLine?: string
  supportEmail?: string
  supportPhone?: string
  socialLinks?: string[]
  tonePreference?: string
  products?: FactoryLeadProduct[]
  hasSpreadsheet?: boolean
}

const LOCAL_DATA_DIR = path.join(process.cwd(), '.factory-data')
const LOCAL_LEADS_PATH = path.join(LOCAL_DATA_DIR, 'leads.json')

const FACTORY_LEAD_LOGO_BUCKET = 'factory-lead-logos'
const LEAD_LOGO_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']
// ~300KB of binary once base64 overhead is included — intake logos stay small; full assets come later.
const MAX_LOGO_DATA_URL_LENGTH = 400_000

function now() {
  return new Date().toISOString()
}

function makeLeadId() {
  return `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanTier(value: unknown): FactoryTierId {
  return value === 'launch_kit' || value === 'custom_ops' || value === 'growth_system' ? value : 'growth_system'
}

function cleanNeeds(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((entry) => cleanString(entry)).filter(Boolean).slice(0, 32)
}

function cleanThemePreset(value: unknown): FactoryThemePresetId | '' {
  return FACTORY_THEME_PRESETS.some((preset) => preset.id === value) ? (value as FactoryThemePresetId) : ''
}

function cleanHexColor(value: unknown) {
  const color = cleanString(value)
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ? color.toLowerCase() : ''
}

function cleanStyleVibes(value: unknown) {
  if (!Array.isArray(value)) return []
  const vibes = value
    .map((entry) => cleanString(entry).toLowerCase())
    .filter((entry) => (FACTORY_LEAD_STYLE_VIBES as readonly string[]).includes(entry))
  return Array.from(new Set(vibes))
}

function cleanSocialLinks(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((entry) => cleanString(entry).slice(0, 200)).filter(Boolean).slice(0, 8)
}

function cleanLogoDataUrl(value: unknown) {
  const data = typeof value === 'string' ? value.trim() : ''
  if (!data.startsWith('data:image/') || data.length > MAX_LOGO_DATA_URL_LENGTH) return ''
  return data
}

export function cleanLeadProducts(value: unknown): FactoryLeadProduct[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      const row = (entry ?? {}) as Record<string, unknown>
      return {
        name: cleanString(row.name).slice(0, 120),
        price: cleanString(row.price).slice(0, 40),
        category: cleanString(row.category).slice(0, 80),
        description: cleanString(row.description).slice(0, 280),
        imageUrl: cleanString(row.imageUrl ?? row.image_url).slice(0, 1000),
      }
    })
    .filter((row) => Boolean(row.name))
    .slice(0, MAX_LEAD_PRODUCTS)
}

function mapRowToLead(row: Record<string, unknown>): FactoryLead {
  const createdAt = cleanString(row.created_at) || cleanString(row.createdAt) || now()
  return {
    id: cleanString(row.id) || makeLeadId(),
    createdAt,
    updatedAt: cleanString(row.updated_at) || cleanString(row.updatedAt) || createdAt,
    status: cleanLeadStatus(row.status),
    businessName: cleanString(row.business_name) || cleanString(row.businessName),
    email: cleanString(row.email),
    website: cleanString(row.website),
    businessType: cleanString(row.business_type) || cleanString(row.businessType),
    annualRevenue: cleanString(row.annual_revenue) || cleanString(row.annualRevenue),
    monthlyOrders: cleanString(row.monthly_orders) || cleanString(row.monthlyOrders),
    itemCount: cleanString(row.item_count) || cleanString(row.itemCount),
    timeline: cleanString(row.timeline),
    needs: cleanNeeds(row.needs),
    recommendedTier: cleanTier(row.recommended_tier || row.recommendedTier),
    selectedTier: cleanTier(row.selected_tier || row.selectedTier || row.recommended_tier || row.recommendedTier),
    notes: cleanString(row.notes),
    summary: cleanString(row.summary),
    ownerNotes: cleanString(row.owner_notes) || cleanString(row.ownerNotes),
    themePreset: cleanThemePreset(row.theme_preset ?? row.themePreset),
    primaryColor: cleanHexColor(row.primary_color ?? row.primaryColor),
    accentColor: cleanHexColor(row.accent_color ?? row.accentColor),
    styleVibes: cleanStyleVibes(row.style_vibes ?? row.styleVibes),
    logoUrl: cleanString(row.logo_url) || cleanString(row.logoUrl),
    logoDataUrl: cleanLogoDataUrl(row.logo_data_url ?? row.logoDataUrl),
    headline: cleanString(row.headline),
    aboutLine: cleanString(row.about_line) || cleanString(row.aboutLine),
    supportEmail: cleanString(row.support_email) || cleanString(row.supportEmail),
    supportPhone: cleanString(row.support_phone) || cleanString(row.supportPhone),
    socialLinks: cleanSocialLinks(row.social_links ?? row.socialLinks),
    tonePreference: cleanString(row.tone_preference) || cleanString(row.tonePreference),
    products: cleanLeadProducts(row.products),
    hasSpreadsheet: row.has_spreadsheet === true || row.hasSpreadsheet === true,
  }
}

function cleanLeadStatus(value: unknown): FactoryLeadStatus {
  if (
    value === 'new' ||
    value === 'reviewing' ||
    value === 'quoted' ||
    value === 'deposit_pending' ||
    value === 'won' ||
    value === 'lost'
  ) {
    return value
  }
  return 'new'
}

function buildLead(input: FactoryLeadInput): FactoryLead {
  const timestamp = now()
  const recommendedTier = cleanTier(input.recommendedTier)
  return {
    id: makeLeadId(),
    createdAt: timestamp,
    updatedAt: timestamp,
    status: 'new',
    businessName: cleanString(input.businessName),
    email: cleanString(input.email),
    website: cleanString(input.website),
    businessType: cleanString(input.businessType),
    annualRevenue: cleanString(input.annualRevenue),
    monthlyOrders: cleanString(input.monthlyOrders),
    itemCount: cleanString(input.itemCount),
    timeline: cleanString(input.timeline),
    needs: cleanNeeds(input.needs),
    recommendedTier,
    selectedTier: recommendedTier,
    notes: cleanString(input.notes),
    summary: cleanString(input.summary),
    ownerNotes: '',
    themePreset: cleanThemePreset(input.themePreset),
    primaryColor: cleanHexColor(input.primaryColor),
    accentColor: cleanHexColor(input.accentColor),
    styleVibes: cleanStyleVibes(input.styleVibes),
    logoUrl: '',
    logoDataUrl: cleanLogoDataUrl(input.logoDataUrl),
    headline: cleanString(input.headline),
    aboutLine: cleanString(input.aboutLine),
    supportEmail: cleanString(input.supportEmail),
    supportPhone: cleanString(input.supportPhone),
    socialLinks: cleanSocialLinks(input.socialLinks),
    tonePreference: cleanString(input.tonePreference),
    products: cleanLeadProducts(input.products),
    hasSpreadsheet: input.hasSpreadsheet === true,
  }
}

async function readLocalLeads(): Promise<FactoryLead[]> {
  try {
    const content = await readFile(LOCAL_LEADS_PATH, 'utf8')
    const parsed = JSON.parse(content) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map((entry) => mapRowToLead(entry as Record<string, unknown>))
  } catch {
    return []
  }
}

async function writeLocalLeads(leads: FactoryLead[]) {
  await mkdir(LOCAL_DATA_DIR, { recursive: true })
  await writeFile(LOCAL_LEADS_PATH, JSON.stringify(leads, null, 2))
}

export async function listFactoryLeads(): Promise<{ ok: true; leads: FactoryLead[]; source: 'supabase' | 'local' } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    const leads = await readLocalLeads()
    return { ok: true, leads: leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), source: 'local' }
  }

  const { data, error } = await supabase.from('factory_leads').select('*').order('created_at', { ascending: false })
  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, leads: (data ?? []).map((row) => mapRowToLead(row as Record<string, unknown>)), source: 'supabase' }
}

// Uploads the intake logo to Supabase storage and returns its public URL,
// or '' so the base64 copy stays on the row as the fallback.
async function uploadLeadLogo(lead: FactoryLead) {
  const supabase = getSupabaseAdmin()
  if (!supabase || !lead.logoDataUrl) return ''
  const match = lead.logoDataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/)
  if (!match) return ''
  const contentType = match[1]
  const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg'
  const storagePath = `${lead.id}/logo.${extension}`
  try {
    await ensureCatalogBucket(FACTORY_LEAD_LOGO_BUCKET, { public: true, allowedMimeTypes: LEAD_LOGO_MIME_TYPES })
    const { error } = await supabase.storage
      .from(FACTORY_LEAD_LOGO_BUCKET)
      .upload(storagePath, Buffer.from(match[2], 'base64'), { upsert: true, contentType })
    if (error) return ''
    return supabase.storage.from(FACTORY_LEAD_LOGO_BUCKET).getPublicUrl(storagePath).data.publicUrl
  } catch {
    return ''
  }
}

export async function createFactoryLead(input: FactoryLeadInput) {
  const lead = buildLead(input)
  if (!lead.businessName || !lead.email) {
    return { ok: false as const, error: 'Business name and email are required.' }
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    const leads = await readLocalLeads()
    const nextLeads = [lead, ...leads]
    await writeLocalLeads(nextLeads)
    return { ok: true as const, lead, source: 'local' as const }
  }

  const uploadedLogoUrl = await uploadLeadLogo(lead)
  if (uploadedLogoUrl) {
    lead.logoUrl = uploadedLogoUrl
    lead.logoDataUrl = ''
  }

  const { data, error } = await supabase
    .from('factory_leads')
    .insert({
      id: lead.id,
      status: lead.status,
      business_name: lead.businessName,
      email: lead.email,
      website: lead.website || null,
      business_type: lead.businessType || null,
      annual_revenue: lead.annualRevenue || null,
      monthly_orders: lead.monthlyOrders || null,
      item_count: lead.itemCount || null,
      timeline: lead.timeline || null,
      needs: lead.needs,
      recommended_tier: lead.recommendedTier,
      selected_tier: lead.selectedTier,
      notes: lead.notes || null,
      summary: lead.summary || null,
      owner_notes: lead.ownerNotes || null,
      theme_preset: lead.themePreset || null,
      primary_color: lead.primaryColor || null,
      accent_color: lead.accentColor || null,
      style_vibes: lead.styleVibes,
      logo_url: lead.logoUrl || null,
      logo_data_url: lead.logoDataUrl || null,
      headline: lead.headline || null,
      about_line: lead.aboutLine || null,
      support_email: lead.supportEmail || null,
      support_phone: lead.supportPhone || null,
      social_links: lead.socialLinks,
      tone_preference: lead.tonePreference || null,
      products: lead.products,
      has_spreadsheet: lead.hasSpreadsheet,
    })
    .select('*')
    .single()

  if (error) {
    return { ok: false as const, error: error.message }
  }

  return { ok: true as const, lead: mapRowToLead(data as Record<string, unknown>), source: 'supabase' as const }
}

export async function updateFactoryLead(
  id: string,
  patch: Partial<Pick<FactoryLead, 'status' | 'selectedTier' | 'ownerNotes'>>,
) {
  if (!id) return { ok: false as const, error: 'Lead id is required.' }
  const timestamp = now()
  const nextStatus = patch.status ? cleanLeadStatus(patch.status) : undefined
  const nextTier = patch.selectedTier ? cleanTier(patch.selectedTier) : undefined
  const nextOwnerNotes = typeof patch.ownerNotes === 'string' ? patch.ownerNotes.trim() : undefined

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    const leads = await readLocalLeads()
    const leadIndex = leads.findIndex((lead) => lead.id === id)
    if (leadIndex < 0) return { ok: false as const, error: 'Lead not found.' }
    const nextLead = {
      ...leads[leadIndex],
      ...(nextStatus ? { status: nextStatus } : {}),
      ...(nextTier ? { selectedTier: nextTier } : {}),
      ...(typeof nextOwnerNotes === 'string' ? { ownerNotes: nextOwnerNotes } : {}),
      updatedAt: timestamp,
    }
    const nextLeads = [...leads]
    nextLeads[leadIndex] = nextLead
    await writeLocalLeads(nextLeads)
    return { ok: true as const, lead: nextLead, source: 'local' as const }
  }

  const updatePatch = {
    ...(nextStatus ? { status: nextStatus } : {}),
    ...(nextTier ? { selected_tier: nextTier } : {}),
    ...(typeof nextOwnerNotes === 'string' ? { owner_notes: nextOwnerNotes || null } : {}),
    updated_at: timestamp,
  }
  const { data, error } = await supabase.from('factory_leads').update(updatePatch).eq('id', id).select('*').single()
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const, lead: mapRowToLead(data as Record<string, unknown>), source: 'supabase' as const }
}
