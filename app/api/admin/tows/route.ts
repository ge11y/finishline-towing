import { NextResponse } from 'next/server'
import { hasAdminSession } from '@/lib/admin-auth'
import { createTowRequest, updateTowRequest } from '@/lib/tow-requests'
import { SITUATIONS, SOURCES, VEHICLE_FLAGS, splitVehicle, type TowSource } from '@/lib/tow-fields'

/**
 * Owner-entered jobs — the ones that arrived by phone or through AAA.
 *
 * Notification is deliberately not fired here. He is the one entering it; a
 * text telling him about a job he just typed in is noise, and noise is how a
 * notification stops being read.
 */

export const dynamic = 'force-dynamic'

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function fromAllowed(value: unknown, allowed: readonly string[]): string[] {
  const raw = Array.isArray(value) ? value : []
  const set = new Set<string>(allowed)
  return raw.map((entry) => str(entry)).filter((entry) => set.has(entry))
}

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ ok: false, error: 'Nothing submitted.' }, { status: 400 })

  // Only the callback number is required on an owner-entered job. He is often
  // typing this in the half minute after hanging up, off a scribble, and a
  // job with a number and a sentence is worth infinitely more than a job he
  // abandoned because the form wanted a surname he did not catch.
  const phone = str(body.phone)
  if (!phone) {
    return NextResponse.json({ ok: false, error: 'A callback number is required.' }, { status: 400 })
  }
  const name = str(body.name) || 'Phone job'

  const rawSource = str(body.source)
  const source = (SOURCES as readonly string[]).includes(rawSource)
    ? (rawSource as TowSource)
    : 'phone'

  let scheduledFor: string | null = null
  if (str(body.scheduledFor)) {
    const when = new Date(str(body.scheduledFor))
    if (Number.isNaN(when.getTime())) {
      return NextResponse.json({ ok: false, error: 'That date did not parse.' }, { status: 400 })
    }
    scheduledFor = when.toISOString()
  }

  try {
    const created = await createTowRequest({
      name,
      phone,
      email: str(body.email),
      serviceType: str(body.service),
      pickup: str(body.pickup),
      dropoff: str(body.dropoff),
      ...splitVehicle(str(body.vehicle)),
      situation: fromAllowed(body.situation, SITUATIONS),
      vehicleFlags: fromAllowed(body.vehicleFlags, VEHICLE_FLAGS),
      whenNeeded: str(body.whenNeeded),
      notes: str(body.notes),
      source,
      scheduledFor,
    })

    // A job he is writing up with a time on it is already booked — he is
    // transcribing something that happened, not triaging an enquiry.
    if (scheduledFor) await updateTowRequest(created.id, { status: 'booked' })

    return NextResponse.json({ ok: true, id: created.id })
  } catch (error) {
    console.error('[admin/tows] could not save an owner-entered job:', error)
    return NextResponse.json({ ok: false, error: 'Could not save that job.' }, { status: 500 })
  }
}
