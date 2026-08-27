/**
 * Applies a SQL file to the Supabase database behind POSTGRES_URL.
 *
 *   node --env-file=.env.local scripts/apply-schema.mjs
 *   node --env-file=.env.local scripts/apply-schema.mjs --file docs/other.sql
 *
 * Every schema file here is idempotent — `create table if not exists`,
 * `add column if not exists`, guarded `add constraint` — so re-running after an
 * edit is the intended way to apply a change. It only ever creates. It drops
 * nothing and deletes nothing, so it cannot destroy data if pointed at a
 * database that already has some.
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import postgres from 'postgres'

// The Supabase marketplace integration writes POSTGRES_URL; DATABASE_URL is
// accepted too so this works against a plain Postgres if one is ever swapped in.
const url = process.env.POSTGRES_URL || process.env.DATABASE_URL
if (!url) {
  console.error('POSTGRES_URL is not set. Run `vercel env pull` and pass --env-file=.env.local')
  process.exit(1)
}

const here = dirname(fileURLToPath(import.meta.url))
const fileArg = process.argv.indexOf('--file')
const rel = fileArg !== -1 && process.argv[fileArg + 1] ? process.argv[fileArg + 1] : 'docs/supabase-tow-requests.sql'
const schema = await readFile(join(here, '..', rel), 'utf8')

console.log(`\nApplying ${rel}\n  → ${url.replace(/:\/\/[^@]*@/, '://***@')}\n`)

const sql = postgres(url, { prepare: false, ssl: 'require', max: 1 })

try {
  // `unsafe` sends the file as-is. The input is a checked-in file, never user
  // input — this is the one legitimate use of it.
  await sql.unsafe(schema)
  console.log('\x1b[32m✓\x1b[0m schema applied')

  const [table] = await sql`
    select table_name from information_schema.tables
     where table_schema = 'public' and table_name = 'tow_requests'
  `
  console.log(`  table: ${table ? 'tow_requests' : '\x1b[31mMISSING\x1b[0m'}`)

  const [rls] = await sql`
    select relrowsecurity from pg_class where relname = 'tow_requests'
  `
  // RLS on with no policies is the seal; if it ever reads false, the anon key
  // can reach customer phone numbers.
  console.log(`  row level security: ${rls?.relrowsecurity ? 'enabled' : '\x1b[31mOFF — customer data is exposed\x1b[0m'}`)
} catch (err) {
  console.error('\x1b[31m✗\x1b[0m schema failed to apply')
  console.error(`  ${err.message}`)
  process.exitCode = 1
} finally {
  await sql.end()
}
