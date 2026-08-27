import 'server-only'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import {
  getDefaultAdminSettings,
  normalizeAdminSettings,
  type AdminSettingsPayload,
} from '@/lib/admin-settings'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const LOCAL_DATA_DIR = path.join(process.cwd(), '.factory-data')
const LOCAL_SETTINGS_PATH = path.join(LOCAL_DATA_DIR, 'settings.json')

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

async function readLocalAdminSettings(): Promise<AdminSettingsPayload> {
  try {
    const content = await readFile(LOCAL_SETTINGS_PATH, 'utf8')
    const parsed = JSON.parse(content) as unknown
    if (!isRecord(parsed)) return getDefaultAdminSettings()

    const values = new Map<string, unknown>([
      ['inventory_defaults', parsed.inventoryDefaults ?? parsed.inventory_defaults],
      ['checkout_operations', parsed.checkoutOperations ?? parsed.checkout_operations],
      ['business_details', parsed.businessDetails ?? parsed.business_details],
      ['brand_settings', parsed.brandSettings ?? parsed.brand_settings],
      ['site_content', parsed.siteContent ?? parsed.site_content],
      ['module_settings', parsed.moduleSettings ?? parsed.module_settings],
      ['checkout_settings', parsed.checkoutSettings ?? parsed.checkout_settings],
      ['catalog_settings', parsed.catalogSettings ?? parsed.catalog_settings],
      ['email_settings', parsed.emailSettings ?? parsed.email_settings],
      ['service_site', parsed.serviceSite ?? parsed.service_site],
      ['factory_workflow', parsed.factoryWorkflow ?? parsed.factory_workflow],
    ])

    return normalizeAdminSettings(values)
  } catch {
    return getDefaultAdminSettings()
  }
}

async function writeLocalAdminSettings(settings: AdminSettingsPayload) {
  await mkdir(LOCAL_DATA_DIR, { recursive: true })
  await writeFile(LOCAL_SETTINGS_PATH, JSON.stringify(settings, null, 2))
}

export async function getAdminSettings(): Promise<AdminSettingsPayload> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return readLocalAdminSettings()

  const { data, error } = await supabase.from('app_settings').select('key, value_json')

  // A database that is reachable but empty, or briefly unreachable, must never
  // downgrade a client's live site to the generic demo storefront — that reads
  // as the site being replaced rather than as an outage. The checked-in client
  // config is the right thing to serve while the database is unavailable, and
  // the failure is logged loudly rather than papered over.
  if (error || !data?.length) {
    console.error(
      `[settings] Supabase returned no settings (${error?.message ?? 'empty table'}) — serving the local client config. Run scripts/seed-settings.mjs against this database.`,
    )
    return readLocalAdminSettings()
  }

  const map = new Map<string, unknown>()
  for (const row of data) {
    map.set(row.key as string, row.value_json)
  }

  return normalizeAdminSettings(map)
}

export async function saveAdminSettings(settings: AdminSettingsPayload) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    await writeLocalAdminSettings(settings)
    return { ok: true as const, source: 'local' as const }
  }

  const rows = [
    {
      key: 'inventory_defaults',
      value_json: settings.inventoryDefaults,
      updated_at: new Date().toISOString(),
    },
    {
      key: 'checkout_operations',
      value_json: settings.checkoutOperations,
      updated_at: new Date().toISOString(),
    },
    {
      key: 'business_details',
      value_json: settings.businessDetails,
      updated_at: new Date().toISOString(),
    },
    {
      key: 'brand_settings',
      value_json: settings.brandSettings,
      updated_at: new Date().toISOString(),
    },
    {
      key: 'site_content',
      value_json: settings.siteContent,
      updated_at: new Date().toISOString(),
    },
    {
      key: 'module_settings',
      value_json: settings.moduleSettings,
      updated_at: new Date().toISOString(),
    },
    {
      key: 'checkout_settings',
      value_json: settings.checkoutSettings,
      updated_at: new Date().toISOString(),
    },
    {
      key: 'catalog_settings',
      value_json: settings.catalogSettings,
      updated_at: new Date().toISOString(),
    },
    {
      key: 'email_settings',
      value_json: settings.emailSettings,
      updated_at: new Date().toISOString(),
    },
    {
      key: 'service_site',
      value_json: settings.serviceSite,
      updated_at: new Date().toISOString(),
    },
    {
      key: 'factory_workflow',
      value_json: settings.factoryWorkflow,
      updated_at: new Date().toISOString(),
    },
  ]

  const { error } = await supabase.from('app_settings').upsert(rows, { onConflict: 'key' })
  if (error) {
    return { ok: false as const, error: error.message }
  }

  return { ok: true as const, source: 'supabase' as const }
}
