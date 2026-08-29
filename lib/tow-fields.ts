/**
 * Field values shared by the public form and the server's allowlist.
 *
 * These live apart from lib/tow-requests.ts because that module imports the
 * Supabase admin client, and the form is a client component. More importantly
 * they must be one list, not two: the API rejects any checkbox value it does
 * not recognise, so a form label that drifts by a character — a typographic
 * apostrophe against a straight one, say — makes the answer vanish silently
 * on submit with nothing in the logs.
 */

/** What he will find when he arrives. The owner's own phone intake list. */
export const SITUATIONS = [
  'On its roof or side',
  'In a ditch or off the road',
  'Won’t roll',
  'Wheel or tire off',
  'Accident damage',
] as const

/** How he will have to load it. */
export const VEHICLE_FLAGS = ['All-wheel drive', 'Lowered', 'Classic'] as const

/**
 * Where a job came from. Yard meeting 2026-08-28: the work is word of mouth —
 * neighbors, shops, and people who call him directly. NOT AAA or membership
 * clubs, and AAA never goes on the public page. The 'aaa' option stays only
 * so the odd club job and any rows already saved with it remain recordable.
 */
export const SOURCES = ['web', 'phone', 'aaa', 'other'] as const
export type TowSource = (typeof SOURCES)[number]

export const SOURCE_LABELS: Record<TowSource, string> = {
  web: 'Website',
  phone: 'Phone call',
  aaa: 'AAA',
  other: 'Other',
}

/**
 * "2016 Subaru Outback" typed as one field, split into three.
 *
 * Typing one line is meaningfully faster than tabbing three boxes, and he is
 * doing this at the end of a long day off a sheet of paper. A leading
 * four-digit year is taken as the year; whatever follows is make then model.
 * Anything that does not fit that shape lands in the make, so nothing is lost.
 */
export function splitVehicle(input: string): {
  vehicleYear: string
  vehicleMake: string
  vehicleModel: string
} {
  const parts = input.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return { vehicleYear: '', vehicleMake: '', vehicleModel: '' }

  let vehicleYear = ''
  if (/^(19|20)\d{2}$/.test(parts[0]!)) vehicleYear = parts.shift()!

  const vehicleMake = parts.shift() ?? ''
  const vehicleModel = parts.join(' ')
  return { vehicleYear, vehicleMake, vehicleModel }
}

/**
 * Texts he sends the customer from his own phone.
 *
 * These are not sent by the server. Tapping one opens his Messages app with
 * the number and the wording already filled in, and he presses send — so it
 * genuinely comes from his number and the reply genuinely lands in his inbox.
 * Routing it through an API would mean hosting his number on a carrier
 * platform, which takes inbound texts away from his phone: the opposite of
 * what he wants.
 *
 * The wording is his voice, not a company's. Short, plain, no "your service
 * professional has been dispatched".
 */
export const MESSAGE_TEMPLATES = [
  {
    kind: 'on_my_way',
    label: 'On my way',
    body: (name: string) =>
      `${name ? `${name} — ` : ''}Josh from Finish Line Towing. I'm on my way to you now.`,
  },
  {
    kind: 'running_late',
    label: 'Running behind',
    body: (name: string) =>
      `${name ? `${name} — ` : ''}Josh from Finish Line Towing. Running a bit behind, I haven't forgotten you. I'll text when I'm close.`,
  },
  {
    kind: 'here',
    label: "I'm here",
    body: (name: string) =>
      `${name ? `${name} — ` : ''}Josh from Finish Line Towing. I'm here.`,
  },
  {
    kind: 'confirm',
    label: 'Confirm the booking',
    body: (name: string) =>
      `${name ? `${name} — ` : ''}Josh from Finish Line Towing confirming your tow. Any change, just reply to this.`,
  },
] as const

export type MessageKind = (typeof MESSAGE_TEMPLATES)[number]['kind']

/**
 * `sms:` link that opens the phone's own messaging app with the number and
 * body already in place.
 *
 * iOS and Android disagree about the separator before the body — one wants
 * `&`, the other `?`. `?&` is the form both accept, and it is the reason this
 * looks like a typo and is not one.
 */
export function smsHref(phone: string, body: string): string {
  return `sms:${phone.replace(/[^+\d]/g, '')}?&body=${encodeURIComponent(body)}`
}
