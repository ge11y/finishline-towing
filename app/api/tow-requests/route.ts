import { NextResponse } from 'next/server'
import { createTowRequest, findRecentByPhone, markNotified } from '@/lib/tow-requests'
import { SITUATIONS, VEHICLE_FLAGS, splitVehicle } from '@/lib/tow-fields'
import { notifyOwner } from '@/lib/notify-owner'

// Public intake for "Request a tow". Anyone may create a request; only the
// admin routes may read or change one. Persist first, notify second: if the
// notification fails the customer is still in the book, and Josh still finds
// them in the admin list.

export const dynamic = 'force-dynamic'

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** "Yes" / "No" from the form; anything else means they didn't say. */
function tri(value: unknown): boolean | null {
  const raw = str(value).toLowerCase()
  if (raw === 'yes' || raw === 'true') return true
  if (raw === 'no' || raw === 'false') return false
  return null
}

/** Only values the form actually offers get through — this is public input. */
function fromAllowed(value: unknown, allowed: readonly string[]): string[] {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
  const set = new Set<string>(allowed)
  return raw.map((entry) => str(entry)).filter((entry) => set.has(entry))
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null
  // Forms post either a flat object or `{ fields: {...} }`; accept both so an
  // older cached client bundle doesn't start dropping requests mid-deploy.
  const body = (payload && typeof payload.fields === 'object' && payload.fields !== null
    ? (payload.fields as Record<string, unknown>)
    : payload) as Record<string, unknown> | null

  if (!body) {
    return NextResponse.json({ ok: false, error: 'Nothing was submitted.' }, { status: 400 })
  }

  const name = str(body.name)
  const phone = str(body.phone)
  if (!name || !phone) {
    return NextResponse.json(
      { ok: false, error: 'A name and a phone number are required.' },
      { status: 400 },
    )
  }

  // Server-side half of the double-submit guard; the button disabling itself is
  // the other half, and neither is sufficient alone on a flaky roadside signal.
  try {
    const duplicate = await findRecentByPhone(phone)
    if (duplicate) return NextResponse.json({ ok: true, id: duplicate.id, duplicate: true })
  } catch {
    // A failed duplicate check must not block a real request.
  }

  let created
  try {
    created = await createTowRequest({
      name,
      phone,
      email: str(body.email),
      serviceType: str(body.service) || str(body.serviceType),
      pickup: str(body.pickup),
      dropoff: str(body.dropoff),
      ...(str(body.vehicle)
        ? splitVehicle(str(body.vehicle))
        : {
            vehicleYear: str(body.vehicleYear),
            vehicleMake: str(body.vehicleMake),
            vehicleModel: str(body.vehicleModel),
          }),
      runs: tri(body.runs),
      vehicleFlags: fromAllowed(body.vehicleFlags, VEHICLE_FLAGS),
      situation: fromAllowed(body.situation, SITUATIONS),
      whenNeeded: str(body.whenNeeded),
      notes: str(body.notes) || str(body.details),
    })
  } catch (error) {
    // The customer is told plainly, and pointed at the phone — which always works.
    console.error('[tow-requests] could not save a request:', error)
    return NextResponse.json(
      { ok: false, error: 'We could not save that. Please call instead — it always works.' },
      { status: 500 },
    )
  }

  // A stepped form finishes in PATCH, and that is where the notification goes
  // out — one complete email instead of two halves. A single-shot submission
  // (no JavaScript, or an older cached bundle) still notifies from here.
  if (str(body.stage) === 'partial') {
    return NextResponse.json({ ok: true, id: created.id, partial: true })
  }

  const result = await notifyOwner(created)
  if (result.sms === 'sent' || result.email === 'sent') {
    await markNotified(created.id)
  }

  return NextResponse.json({ ok: true, id: created.id })
}
