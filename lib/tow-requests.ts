import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SITUATIONS, SOURCES, VEHICLE_FLAGS, type TowSource } from '@/lib/tow-fields'

/**
 * Tow requests — the scheduled-job intake behind "Request a tow".
 *
 * Storage is Supabase, with no local-file fallback on purpose. The store this
 * replaced wrote JSON under `process.cwd()`, which works on a laptop and throws
 * EROFS on Vercel, so every request submitted on the live site was answered
 * with a 500 and lost. A fallback that only works in development is worse than
 * no fallback: it hides the failure exactly where it costs a customer.
 *
 * Table: docs/supabase-tow-requests.sql (RLS on, no policies — service role only).
 */

export const TOW_REQUEST_STATUSES = ['new', 'called', 'booked', 'done', 'spam'] as const
export type TowRequestStatus = (typeof TOW_REQUEST_STATUSES)[number]

export { SITUATIONS, SOURCES, SOURCE_LABELS, VEHICLE_FLAGS } from '@/lib/tow-fields'
export type { TowSource } from '@/lib/tow-fields'

export type TowRequest = {
  id: string
  createdAt: string
  status: TowRequestStatus
  name: string
  phone: string
  email: string
  serviceType: string
  pickup: string
  dropoff: string
  vehicleYear: string
  vehicleMake: string
  vehicleModel: string
  runs: boolean | null
  vehicleFlags: string[]
  situation: string[]
  whenNeeded: string
  notes: string
  adminNote: string
  notifiedAt: string | null
  /** ISO timestamp once the job is booked for a slot; null while unscheduled. */
  scheduledFor: string | null
  source: TowSource
  /** Texts already sent to this customer: kind and when. */
  messages: { kind: string; at: string }[]
}

/** What the public form may set. Everything past name and phone is optional. */
export type TowRequestInput = {
  name?: string
  phone?: string
  email?: string
  serviceType?: string
  pickup?: string
  dropoff?: string
  vehicleYear?: string
  vehicleMake?: string
  vehicleModel?: string
  runs?: boolean | null
  vehicleFlags?: string[]
  situation?: string[]
  whenNeeded?: string
  notes?: string
  /** Set when the owner enters a job himself; the public form leaves it 'web'. */
  source?: TowSource
  /** The owner books straight into a slot; a web request is scheduled later. */
  scheduledFor?: string | null
}

type TowRequestRow = {
  id: string
  created_at: string
  status: string
  name: string
  phone: string
  email: string | null
  service_type: string | null
  pickup: string | null
  dropoff: string | null
  vehicle_year: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  runs: boolean | null
  vehicle_flags: unknown
  situation: unknown
  when_needed: string | null
  notes: string | null
  admin_note: string | null
  notified_at: string | null
  scheduled_for: string | null
  source: string | null
  messages: unknown
}

function text(value: unknown, limit = 400): string {
  return typeof value === 'string' ? value.trim().slice(0, limit) : ''
}

function rowToRequest(row: TowRequestRow): TowRequest {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: (TOW_REQUEST_STATUSES as readonly string[]).includes(row.status)
      ? (row.status as TowRequestStatus)
      : 'new',
    name: row.name ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    serviceType: row.service_type ?? '',
    pickup: row.pickup ?? '',
    dropoff: row.dropoff ?? '',
    vehicleYear: row.vehicle_year ?? '',
    vehicleMake: row.vehicle_make ?? '',
    vehicleModel: row.vehicle_model ?? '',
    runs: row.runs,
    vehicleFlags: Array.isArray(row.vehicle_flags) ? (row.vehicle_flags as string[]) : [],
    situation: Array.isArray(row.situation) ? (row.situation as string[]) : [],
    whenNeeded: row.when_needed ?? '',
    notes: row.notes ?? '',
    adminNote: row.admin_note ?? '',
    notifiedAt: row.notified_at,
    scheduledFor: row.scheduled_for,
    source: (SOURCES as readonly string[]).includes(row.source ?? '')
      ? (row.source as TowSource)
      : 'web',
    messages: Array.isArray(row.messages) ? (row.messages as { kind: string; at: string }[]) : [],
  }
}

/**
 * Persist one request. Throws if Supabase is unreachable — the caller turns
 * that into a visible error, because a customer who thinks they have been
 * booked and has not is the single worst outcome on this site.
 */
export async function createTowRequest(input: TowRequestInput): Promise<TowRequest> {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase is not configured — cannot store the request.')

  const name = text(input.name, 120)
  const phone = text(input.phone, 40)
  if (!name || !phone) throw new Error('Name and phone are required.')

  const list = (value: unknown) =>
    Array.isArray(value) ? value.map((entry) => text(entry, 40)).filter(Boolean).slice(0, 8) : []
  const flags = list(input.vehicleFlags)
  const situation = list(input.situation)

  const row = {
    id: `tow_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'new' as const,
    name,
    phone,
    email: text(input.email, 200) || null,
    service_type: text(input.serviceType, 80) || null,
    pickup: text(input.pickup, 400) || null,
    dropoff: text(input.dropoff, 400) || null,
    vehicle_year: text(input.vehicleYear, 10) || null,
    vehicle_make: text(input.vehicleMake, 60) || null,
    vehicle_model: text(input.vehicleModel, 60) || null,
    runs: typeof input.runs === 'boolean' ? input.runs : null,
    vehicle_flags: flags,
    situation,
    when_needed: text(input.whenNeeded, 80) || null,
    notes: text(input.notes, 2000) || null,
    source: input.source && SOURCES.includes(input.source) ? input.source : 'web',
    scheduled_for: input.scheduledFor ? new Date(input.scheduledFor).toISOString() : null,
  }

  const { data, error } = await supabase.from('tow_requests').insert(row).select('*').single()
  if (error) throw new Error(error.message)
  return rowToRequest(data as TowRequestRow)
}

/**
 * The same number submitting twice inside a minute is a double-tap or an
 * impatient retry, not two tows. Returning the first request instead of
 * inserting a second keeps Josh's list clean and stops a second text firing
 * while he is already reading the first.
 */
export async function findRecentByPhone(phone: string, withinSeconds = 60): Promise<TowRequest | null> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  const since = new Date(Date.now() - withinSeconds * 1000).toISOString()
  const { data, error } = await supabase
    .from('tow_requests')
    .select('*')
    .eq('phone', text(phone, 40))
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
  if (error || !data?.length) return null
  return rowToRequest(data[0] as TowRequestRow)
}

/** Newest first — the order Josh's list screen shows them in. */
export async function listTowRequests(): Promise<TowRequest[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('tow_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) throw new Error(error.message)
  return (data as TowRequestRow[]).map(rowToRequest)
}

export async function updateTowRequest(
  id: string,
  patch: { status?: TowRequestStatus; adminNote?: string; scheduledFor?: string | null },
): Promise<TowRequest | null> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  const update: Record<string, unknown> = {}
  if (patch.status && TOW_REQUEST_STATUSES.includes(patch.status)) update.status = patch.status
  if (typeof patch.adminNote === 'string') update.admin_note = text(patch.adminNote, 2000)
  // Explicit null clears the booking and drops it back off the schedule.
  if (patch.scheduledFor !== undefined) {
    update.scheduled_for = patch.scheduledFor ? new Date(patch.scheduledFor).toISOString() : null
  }
  if (!Object.keys(update).length) return null

  const { data, error } = await supabase
    .from('tow_requests')
    .update(update)
    .eq('id', id)
    .select('*')
    .single()
  if (error) return null
  return rowToRequest(data as TowRequestRow)
}

/** Stamped once the owner notification actually went out, so gaps are visible. */
export async function markNotified(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return
  await supabase.from('tow_requests').update({ notified_at: new Date().toISOString() }).eq('id', id)
}

/**
 * Booked work, soonest first. Only rows with a slot and not yet finished —
 * the schedule answers "what is coming", not "what happened".
 */
export async function listScheduled(fromIso?: string): Promise<TowRequest[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []

  const from = fromIso ?? new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('tow_requests')
    .select('*')
    .not('scheduled_for', 'is', null)
    .gte('scheduled_for', from)
    .in('status', ['booked', 'called', 'new'])
    .order('scheduled_for', { ascending: true })
    .limit(200)
  if (error) return []
  return (data as TowRequestRow[]).map(rowToRequest)
}

export async function getTowRequest(id: string): Promise<TowRequest | null> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null
  const { data, error } = await supabase.from('tow_requests').select('*').eq('id', id).single()
  if (error || !data) return null
  return rowToRequest(data as TowRequestRow)
}

/**
 * Fills in the second half of a public request. Only ever writes the fields
 * the customer supplies — status, admin note and booking are not reachable
 * from here, because the caller is the public form.
 *
 * Empty values are skipped rather than written, so re-sending a half-filled
 * step two cannot blank out something already captured.
 */
export async function updateTowRequestDetails(
  id: string,
  input: Omit<TowRequestInput, 'name' | 'phone' | 'serviceType' | 'pickup' | 'source' | 'scheduledFor'>,
): Promise<TowRequest | null> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  const update: Record<string, unknown> = {}
  const put = (column: string, value: string) => {
    if (value) update[column] = value
  }
  put('email', text(input.email, 200))
  put('dropoff', text(input.dropoff, 400))
  put('vehicle_year', text(input.vehicleYear, 10))
  put('vehicle_make', text(input.vehicleMake, 60))
  put('vehicle_model', text(input.vehicleModel, 60))
  put('when_needed', text(input.whenNeeded, 80))
  put('notes', text(input.notes, 2000))
  if (typeof input.runs === 'boolean') update.runs = input.runs
  if (input.vehicleFlags?.length) update.vehicle_flags = input.vehicleFlags
  if (input.situation?.length) update.situation = input.situation

  if (!Object.keys(update).length) return null

  const { data, error } = await supabase
    .from('tow_requests')
    .update(update)
    .eq('id', id)
    .select('*')
    .single()
  if (error || !data) return null
  return rowToRequest(data as TowRequestRow)
}

/**
 * Records that he sent the customer a text. Append-only — he may well send
 * "on my way" twice on a bad day, and the log should say so rather than
 * pretend the second one did not happen.
 */
export async function logMessageSent(id: string, kind: string): Promise<TowRequest | null> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  const existing = await getTowRequest(id)
  if (!existing) return null

  const messages = [...existing.messages, { kind, at: new Date().toISOString() }].slice(-20)
  const { data, error } = await supabase
    .from('tow_requests')
    .update({ messages })
    .eq('id', id)
    .select('*')
    .single()
  if (error || !data) return null
  return rowToRequest(data as TowRequestRow)
}

/**
 * The numbers and the to-do list behind the overview screen.
 *
 * One pass over the same rows rather than a query per figure — this is one
 * truck's work, and the round trips would cost more than the filtering.
 */
export async function getOwnerOverview() {
  const requests = await listTowRequests().catch(() => [] as TowRequest[])

  const zone = 'America/New_York'
  const dayOf = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: zone })
  const today = new Date().toLocaleDateString('en-CA', { timeZone: zone })
  const weekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const waiting = requests.filter((entry) => entry.status === 'new')
  const bookedToday = requests.filter(
    (entry) => entry.scheduledFor && dayOf(entry.scheduledFor) === today && entry.status !== 'done',
  )
  const bookedWeek = requests.filter(
    (entry) =>
      entry.scheduledFor &&
      entry.scheduledFor <= weekEnd &&
      dayOf(entry.scheduledFor) >= today &&
      entry.status !== 'done',
  )
  // Anything he said he would call back but has not booked or closed since.
  const calledNotBooked = requests.filter((entry) => entry.status === 'called' && !entry.scheduledFor)

  return { requests, waiting, bookedToday, bookedWeek, calledNotBooked }
}
