/**
 * Creates app_settings and seeds it from .factory-data/settings.json.
 *
 * Needed because getAdminSettings() switches to Supabase the moment the env
 * vars exist and falls back to the *demo* defaults if the read fails — so a
 * fresh database with no settings row silently turns a client's site into the
 * generic storefront. Run this once per new database, before deploying.
 *
 *   node --env-file=.env.local scripts/seed-settings.mjs
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import postgres from 'postgres'

const url = process.env.POSTGRES_URL || process.env.DATABASE_URL
if (!url) {
  console.error('POSTGRES_URL is not set.')
  process.exit(1)
}

const here = dirname(fileURLToPath(import.meta.url))
const local = JSON.parse(await readFile(join(here, '..', '.factory-data', 'settings.json'), 'utf8'))

// The camelCase keys the local file uses, mapped to the snake_case keys the
// table is read by. Kept in step with readLocalAdminSettings().
const KEYS = {
  inventory_defaults: 'inventoryDefaults',
  checkout_operations: 'checkoutOperations',
  business_details: 'businessDetails',
  brand_settings: 'brandSettings',
  site_content: 'siteContent',
  module_settings: 'moduleSettings',
  checkout_settings: 'checkoutSettings',
  catalog_settings: 'catalogSettings',
  email_settings: 'emailSettings',
  service_site: 'serviceSite',
  factory_workflow: 'factoryWorkflow',
}

const sql = postgres(url, { prepare: false, ssl: 'require', max: 1 })

try {
  await sql`
    create table if not exists public.app_settings (
      key text primary key,
      value_json jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now()
    )
  `
  // Settings are business config, not customer data, but the anon key still has
  // no business reading them directly.
  await sql`alter table public.app_settings enable row level security`

  let seeded = 0
  for (const [dbKey, localKey] of Object.entries(KEYS)) {
    const value = local[localKey]
    if (value === undefined) continue
    await sql`
      insert into public.app_settings (key, value_json)
      values (${dbKey}, ${sql.json(value)})
      on conflict (key) do update set value_json = excluded.value_json, updated_at = now()
    `
    seeded += 1
  }

  const [check] = await sql`select value_json->>'businessName' as name from public.app_settings where key = 'business_details'`
  console.log(`\n\x1b[32m✓\x1b[0m seeded ${seeded} settings keys`)
  console.log(`  business name in database: ${check?.name ?? '\x1b[31mMISSING\x1b[0m'}\n`)
} catch (err) {
  console.error('\x1b[31m✗\x1b[0m seed failed')
  console.error(`  ${err.message}`)
  process.exitCode = 1
} finally {
  await sql.end()
}
