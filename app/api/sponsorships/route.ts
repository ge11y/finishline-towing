import { NextResponse } from 'next/server'
import { createSponsorApplication } from '@/lib/sponsors'

// Public intake for sponsorship enquiries. Saved and left for Josh to read —
// deliberately no notification. A sponsorship is a conversation measured in
// weeks, and a text at 2am about a decal would train him to ignore the texts
// that matter.

export const dynamic = 'force-dynamic'

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ ok: false, error: 'Nothing submitted.' }, { status: 400 })

  try {
    const created = await createSponsorApplication({
      company: str(body.company),
      contactName: str(body.contactName),
      email: str(body.email),
      phone: str(body.phone),
      website: str(body.website),
      level: str(body.level),
      message: str(body.message),
    })
    return NextResponse.json({ ok: true, id: created.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save that.'
    // The store's own validation messages are written for a person to read, so
    // they are passed through rather than replaced with something generic.
    const isValidation = /required/i.test(message)
    console.error('[sponsorships] could not save:', error)
    return NextResponse.json({ ok: false, error: isValidation ? message : 'Could not save that.' }, {
      status: isValidation ? 400 : 500,
    })
  }
}
