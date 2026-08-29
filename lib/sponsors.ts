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

export type CurrentSponsor = {
  name: string
  /** Verified public homepage. Internal paths allowed (FINISHLINE Towing → /site). */
  url?: string
}

/**
 * Businesses carried on the #74.
 *
 * Names were read off the owner's photographs of the truck, then confirmed as
 * the live roster at the 2026-08-28 yard meeting. Deliberately excluded: ACT
 * and White Mountain Motorsports Park (sanctioning body and track, not
 * sponsors), and one decal whose wording could not be read with confidence.
 *
 * `url` is set only when a public homepage could be verified. Watson's Garage
 * and McKean Builders had none, so they are listed unlinked. Facebook pages
 * and directory listings do not count. Logos later, from the sponsors
 * themselves.
 *
 * Bobcat of Woodsville's public homepage is Woodsville Power Equipment, the
 * Bobcat dealer at 4942 Dartmouth College Hwy.
 */
export const CURRENT_SPONSORS: CurrentSponsor[] = [
  { name: 'Bobcat of Woodsville', url: 'https://www.woodsvillepowerequipment.com/' },
  { name: 'Boudreault Septic', url: 'https://boudreaultseptic.com/' },
  { name: 'Watson’s Garage' },
  { name: 'Milton CAT', url: 'https://www.miltoncat.com/' },
  { name: 'Sunoco Race Fuels', url: 'https://www.sunocoracefuels.com/' },
  { name: 'Longacre Racing Products', url: 'https://longacreracing.com/' },
  { name: 'Fireside Hearth & Leisure', url: 'https://www.firesidehearth.net/' },
  { name: 'McKean Builders' },
  { name: 'FINISHLINE Towing', url: '/site' },
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
