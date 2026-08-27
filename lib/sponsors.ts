import { getSupabaseAdmin } from '@/lib/supabase-admin'

/**
 * Sponsorship enquiries for the #74 race programme, and the list of who is
 * already on the truck.
 *
 * Table: docs/supabase-sponsors.sql (RLS on, no policies — service role only).
 */

export const SPONSOR_STATUSES = ['new', 'contacted', 'accepted', 'declined'] as const
export type SponsorStatus = (typeof SPONSOR_STATUSES)[number]

/**
 * What a sponsor is asking about. Deliberately vague about money: Josh has not
 * set prices, and inventing tiers on his behalf would have him fielding calls
 * about numbers he never agreed to. These describe placement, and the figure
 * is a conversation.
 */
export const SPONSOR_LEVELS = [
  'A decal on the truck',
  'A panel on the truck',
  'Primary sponsor',
  'Something in kind — parts, fuel, services',
  'Not sure yet — let’s talk',
] as const

/**
 * Businesses carried on the #74.
 *
 * Read off the owner's own photographs of the truck, where each of these is
 * painted or decalled in full view — the victory-lane shot and the detail
 * frames he supplied. That is good evidence they are real sponsors. It is
 * still not the same as their permission to appear on a website, so this is
 * worth walking through with Josh before it goes in front of anyone.
 *
 * Deliberately excluded: ACT and White Mountain Motorsports Park, which are
 * the sanctioning body and the track rather than his sponsors, and one decal
 * whose wording could not be read with confidence.
 *
 * Logos would be better than text and have to come from the sponsors
 * themselves. Their names set properly beat a row of grey placeholder boxes.
 */
export const CURRENT_SPONSORS: { name: string }[] = [
  { name: 'Bobcat of Woodsville' },
  { name: 'Boudreault Septic' },
  { name: 'Watson’s Garage' },
  { name: 'Milton CAT' },
  { name: 'Sunoco Race Fuels' },
  { name: 'Longacre Racing Products' },
  { name: 'Fireside Hearth & Leisure' },
  { name: 'McKean Builders' },
  { name: 'FINISHLINE Towing' },
]

/** Where he races, and the page he posts from. Both owner-supplied. */
export const RACE_TRACK = 'White Mountain Motorsports Park'
export const RACE_FACEBOOK = 'https://www.facebook.com/profile.php?id=61550086003881'

export type SponsorApplication = {
  id: string
  createdAt: string
  status: SponsorStatus
  company: string
  contactName: string
  email: string
  phone: string
  website: string
  level: string
  message: string
  ownerNote: string
}

export type SponsorApplicationInput = {
  company?: string
  contactName?: string
  email?: string
  phone?: string
  website?: string
  level?: string
  message?: string
}

type Row = {
  id: string
  created_at: string
  status: string
  company: string
  contact_name: string | null
  email: string | null
  phone: string | null
  website: string | null
  level: string | null
  message: string | null
  owner_note: string | null
}

function text(value: unknown, limit = 400): string {
  return typeof value === 'string' ? value.trim().slice(0, limit) : ''
}

function rowTo(row: Row): SponsorApplication {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: (SPONSOR_STATUSES as readonly string[]).includes(row.status)
      ? (row.status as SponsorStatus)
      : 'new',
    company: row.company ?? '',
    contactName: row.contact_name ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    website: row.website ?? '',
    level: row.level ?? '',
    message: row.message ?? '',
    ownerNote: row.owner_note ?? '',
  }
}

export async function createSponsorApplication(
  input: SponsorApplicationInput,
): Promise<SponsorApplication> {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase is not configured.')

  const company = text(input.company, 160)
  if (!company) throw new Error('A company name is required.')

  // One of email or phone, so there is a way to answer them.
  const email = text(input.email, 200)
  const phone = text(input.phone, 40)
  if (!email && !phone) throw new Error('An email address or a phone number is required.')

  const row = {
    id: `spn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'new' as const,
    company,
    contact_name: text(input.contactName, 120) || null,
    email: email || null,
    phone: phone || null,
    website: text(input.website, 300) || null,
    level: text(input.level, 80) || null,
    message: text(input.message, 3000) || null,
  }

  const { data, error } = await supabase
    .from('sponsor_applications')
    .insert(row)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return rowTo(data as Row)
}

export async function listSponsorApplications(): Promise<SponsorApplication[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('sponsor_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)
  if (error) return []
  return (data as Row[]).map(rowTo)
}

export async function updateSponsorApplication(
  id: string,
  patch: { status?: SponsorStatus; ownerNote?: string },
): Promise<SponsorApplication | null> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  const update: Record<string, unknown> = {}
  if (patch.status && SPONSOR_STATUSES.includes(patch.status)) update.status = patch.status
  if (typeof patch.ownerNote === 'string') update.owner_note = text(patch.ownerNote, 2000)
  if (!Object.keys(update).length) return null

  const { data, error } = await supabase
    .from('sponsor_applications')
    .update(update)
    .eq('id', id)
    .select('*')
    .single()
  if (error || !data) return null
  return rowTo(data as Row)
}
