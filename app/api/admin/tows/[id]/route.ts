import { NextResponse } from 'next/server'
import { hasAdminSession } from '@/lib/admin-auth'
import { updateTowRequest, TOW_REQUEST_STATUSES, type TowRequestStatus } from '@/lib/tow-requests'

// Owner-only. The public route may create a request; only a signed-in session
// may read or change one. Customer names, numbers and pickup addresses live
// behind this.

export const dynamic = 'force-dynamic'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })
  }

  const { id } = await params
  const body = (await request.json().catch(() => null)) as {
    status?: unknown
    adminNote?: unknown
    scheduledFor?: unknown
  } | null
  if (!body) return NextResponse.json({ ok: false, error: 'Nothing to change.' }, { status: 400 })

  const patch: { status?: TowRequestStatus; adminNote?: string; scheduledFor?: string | null } = {}

  if (typeof body.status === 'string') {
    if (!(TOW_REQUEST_STATUSES as readonly string[]).includes(body.status)) {
      return NextResponse.json({ ok: false, error: 'Unknown status.' }, { status: 400 })
    }
    patch.status = body.status as TowRequestStatus
  }

  if (typeof body.adminNote === 'string') patch.adminNote = body.adminNote

  // null clears the booking; a string sets it. `undefined` leaves it alone.
  if (body.scheduledFor === null) {
    patch.scheduledFor = null
  } else if (typeof body.scheduledFor === 'string' && body.scheduledFor.trim()) {
    const when = new Date(body.scheduledFor)
    if (Number.isNaN(when.getTime())) {
      return NextResponse.json({ ok: false, error: 'That date did not parse.' }, { status: 400 })
    }
    patch.scheduledFor = when.toISOString()
  }

  const updated = await updateTowRequest(id, patch)
  if (!updated) {
    return NextResponse.json({ ok: false, error: 'Could not update that request.' }, { status: 400 })
  }
  return NextResponse.json({ ok: true, request: updated })
}
