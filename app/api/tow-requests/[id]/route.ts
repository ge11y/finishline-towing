import { NextResponse } from 'next/server'
import { getTowRequest, updateTowRequestDetails } from '@/lib/tow-requests'
import { notifyOwner } from '@/lib/notify-owner'
import { SITUATIONS, VEHICLE_FLAGS } from '@/lib/tow-fields'

/**
 * Second half of the public request form.
 *
 * Step one creates the row so an abandoned step two still leaves the owner a
 * name and a number. This fills in the rest and sends the notification, so he
 * gets one complete email rather than two halves.
 *
 * It is a public endpoint that writes to an existing row, so it is fenced in
 * hard: it can only ever touch the enrichment fields — never status, never the
 * admin note, never the booking — and only on a row that is still `new` and
 * only within a few minutes of being created. Ids carry six random base-36
 * characters on top of a timestamp, so finding one to aim at is impractical;
 * these limits mean that even if you did, all you could do is add detail to a
 * request nobody can read back.
 */

export const dynamic = 'force-dynamic'

const ENRICH_WINDOW_MS = 30 * 60 * 1000

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function tri(value: unknown): boolean | null {
  const raw = str(value).toLowerCase()
  if (raw === 'yes' || raw === 'true') return true
  if (raw === 'no' || raw === 'false') return false
  return null
}

function fromAllowed(value: unknown, allowed: readonly string[]): string[] {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
  const set = new Set<string>(allowed)
  return raw.map((entry) => str(entry)).filter((entry) => set.has(entry))
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ ok: false, error: 'Nothing submitted.' }, { status: 400 })

  const existing = await getTowRequest(id)
  if (!existing) {
    return NextResponse.json({ ok: false, error: 'No such request.' }, { status: 404 })
  }
  if (existing.status !== 'new' || Date.now() - new Date(existing.createdAt).getTime() > ENRICH_WINDOW_MS) {
    // Silently accepted rather than errored: the customer finished their form,
    // and a red error over a request the owner already has in hand would be a
    // lie about what happened.
    return NextResponse.json({ ok: true, id, ignored: true })
  }

  const updated = await updateTowRequestDetails(id, {
    email: str(body.email),
    dropoff: str(body.dropoff),
    vehicleYear: str(body.vehicleYear),
    vehicleMake: str(body.vehicleMake),
    vehicleModel: str(body.vehicleModel),
    runs: tri(body.runs),
    vehicleFlags: fromAllowed(body.vehicleFlags, VEHICLE_FLAGS),
    situation: fromAllowed(body.situation, SITUATIONS),
    whenNeeded: str(body.whenNeeded),
    notes: str(body.notes),
  })

  const record = updated ?? existing
  // Notified here rather than on create, so the email carries the full picture.
  const result = await notifyOwner(record)
  if (result.sms === 'sent' || result.email === 'sent') {
    const { markNotified } = await import('@/lib/tow-requests')
    await markNotified(id)
  }

  return NextResponse.json({ ok: true, id })
}
