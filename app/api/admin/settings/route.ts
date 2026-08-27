import { NextResponse } from 'next/server'
import { mergeAdminSettings, type AdminSettingsPayload } from '@/lib/admin-settings'
import { getAdminSettings, saveAdminSettings } from '@/lib/admin-settings-server'

export async function GET() {
  const settings = await getAdminSettings()
  return NextResponse.json({ ok: true, settings })
}

export async function PATCH(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const record = payload as Partial<AdminSettingsPayload>
  const current = await getAdminSettings()
  const nextSettings = mergeAdminSettings(current, record)

  const result = await saveAdminSettings(nextSettings)
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 })
  }

  return NextResponse.json({ ok: true, settings: nextSettings })
}
