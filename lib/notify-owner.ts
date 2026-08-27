import { getPublicFactorySettings } from '@/lib/public-factory-settings'
import type { TowRequest } from '@/lib/tow-requests'
import { emailHtml } from '@/lib/notify-email'

/**
 * Owner notification for a new tow request: a text so Josh knows within
 * seconds, and an email carrying the full detail he'll want when he calls back.
 *
 * Nothing in here throws. The request is already saved by the time this runs,
 * and a Twilio outage must never turn into a customer being told their request
 * failed — it turns into a logged warning and a row Josh can still see in the
 * admin. Each channel is independently guarded so a missing Twilio account
 * doesn't suppress the email, or the reverse.
 */

export type NotifyChannelResult = 'sent' | 'skipped' | 'failed'
export type NotifyResult = { sms: NotifyChannelResult; email: NotifyChannelResult }

/** US 10-digit numbers to E.164, which is the only form Twilio accepts. */
function toE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (raw.trim().startsWith('+') && digits.length > 6) return `+${digits}`
  return null
}

async function resolveOwnerContact() {
  // Settings carry the client's own phone and email, so this file stays
  // client-neutral; the env vars are an override for testing against a
  // different endpoint without editing the applied client.
  let companyPhone = ''
  let companyEmail = ''
  let businessName = ''
  try {
    const settings = await getPublicFactorySettings()
    companyPhone = settings.companyPhone
    companyEmail = settings.companyEmail
    businessName = settings.businessName
  } catch {
    // Settings unavailable — env alone still gets the message out.
  }
  return {
    smsTo: process.env.OWNER_SMS_TO || companyPhone,
    emailTo: process.env.OWNER_EMAIL_TO || companyEmail,
    businessName: businessName || 'FINISHLINE Towing',
  }
}

function smsBody(request: TowRequest): string {
  // The spec's template. Deliberately does not include an admin URL — this
  // text is short-lived on a lock screen, and admin links stay out of messages.
  const service = request.serviceType || 'Tow request'
  const pickup = request.pickup || 'not given'
  return `FINISH LINE: New request from ${request.name} ${request.phone}. ${service}. Pickup: ${pickup}. Open admin to view.`
}

function emailBody(request: TowRequest): { subject: string; text: string } {
  const vehicle = [request.vehicleYear, request.vehicleMake, request.vehicleModel]
    .filter(Boolean)
    .join(' ')
  // The first line is what shows in the phone's notification preview under the
  // subject, so it carries the two things that decide whether he stops what he
  // is doing: what they want and where it is.
  const lines = [
    `${request.serviceType || 'Tow request'}${request.pickup ? ` — ${request.pickup}` : ''}`,
    // Second line, so it is still inside the notification preview: what he is
    // driving into. This is the difference between bringing the winch and not.
    request.situation.length ? request.situation.join(' · ') : null,
    '',
    `Phone:      ${request.phone}`,
    request.email ? `Email:      ${request.email}` : null,
    `When:       ${request.whenNeeded || '—'}`,
    '',
    `Pickup:     ${request.pickup || '—'}`,
    `Drop-off:   ${request.dropoff || '—'}`,
    '',
    `Vehicle:    ${vehicle || '—'}`,
    `Runs:       ${request.runs === null ? '—' : request.runs ? 'Yes' : 'No'}`,
    request.situation.length ? `Situation:  ${request.situation.join(', ')}` : null,
    request.vehicleFlags.length ? `Vehicle is: ${request.vehicleFlags.join(', ')}` : null,
    '',
    request.notes ? `What they said:\n${request.notes}` : null,
    '',
    `Received ${new Date(request.createdAt).toLocaleString('en-US', { timeZone: 'America/New_York' })}`,
  ].filter((line) => line !== null)

  return {
    subject: `New tow request — ${request.name}, ${request.phone}`,
    text: lines.join('\n'),
  }
}

async function sendSms(request: TowRequest, to: string): Promise<NotifyChannelResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) return 'skipped'

  const destination = toE164(to)
  if (!destination) {
    console.warn(`[notify] owner SMS number is not dialable: ${to}`)
    return 'failed'
  }

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: destination, From: from, Body: smsBody(request) }),
    })
    if (!response.ok) {
      // Twilio returns the reason in the body; it's the only way to tell an
      // unverified number from an empty balance.
      console.warn(`[notify] Twilio rejected ${request.id}: ${response.status} ${await response.text()}`)
      return 'failed'
    }
    return 'sent'
  } catch (error) {
    console.warn(`[notify] Twilio unreachable for ${request.id}:`, error)
    return 'failed'
  }
}

async function sendEmail(
  request: TowRequest,
  to: string,
  businessName: string,
): Promise<NotifyChannelResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from || !to) return 'skipped'

  const { subject, text } = emailBody(request)
  const html = emailHtml(request, businessName)
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // EMAIL_FROM is sometimes a bare address and sometimes already a full
        // "Name <address>" — the factory's other clients store it both ways.
        // Wrapping a value that already has a display name yields
        // "Business <Name <addr>>", which Resend rejects outright.
        from: from.includes('<') ? from : `${businessName} <${from}>`,
        to: [to],
        // So Josh can hit reply and reach the customer directly.
        reply_to: request.email || undefined,
        subject,
        html,
        // Plain-text alternative for clients that will not render HTML, and
        // for the notification preview on locked phones.
        text,
      }),
    })
    if (!response.ok) {
      console.warn(`[notify] Resend rejected ${request.id}: ${response.status} ${await response.text()}`)
      return 'failed'
    }
    return 'sent'
  } catch (error) {
    console.warn(`[notify] Resend unreachable for ${request.id}:`, error)
    return 'failed'
  }
}

export async function notifyOwner(request: TowRequest): Promise<NotifyResult> {
  const { smsTo, emailTo, businessName } = await resolveOwnerContact()

  // Both at once — the text is the one that wakes him up, and it shouldn't
  // wait on an email API round trip.
  const [sms, email] = await Promise.all([
    sendSms(request, smsTo),
    sendEmail(request, emailTo, businessName),
  ])

  if (sms !== 'sent' && email !== 'sent') {
    console.warn(`[notify] ${request.id} reached nobody (sms: ${sms}, email: ${email})`)
  }
  return { sms, email }
}
