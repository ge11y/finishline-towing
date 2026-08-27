import { NextResponse } from 'next/server'
import { hasAdminSession } from '@/lib/admin-auth'
import { logMessageSent } from '@/lib/tow-requests'
import { MESSAGE_TEMPLATES } from '@/lib/tow-fields'

// Records that the owner opened a text to the customer. The message itself
// goes from his phone, not from here — this is only the note that he did it.

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })
  }

  const { id } = await params
  const body = (await request.json().catch(() => null)) as { kind?: unknown } | null
  const kind = typeof body?.kind === 'string' ? body.kind : ''

  const known = MESSAGE_TEMPLATES.some((template) => template.kind === kind)
  if (!known) {
    return NextResponse.json({ ok: false, error: 'Unknown message.' }, { status: 400 })
  }

  const updated = await logMessageSent(id, kind)
  if (!updated) {
    return NextResponse.json({ ok: false, error: 'Could not record that.' }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}
