import type { TowRequest } from '@/lib/tow-requests'

/**
 * The owner notification's HTML body.
 *
 * Kept apart from notify-owner.ts so it can be rendered without pulling in the
 * settings loader, which is server-only — a template you cannot render outside
 * the app is a template nobody checks before it reaches somebody's phone.
 */

/**
 * Where the admin lives, for the deep links in the notification.
 *
 * SITE_URL wins so a custom domain can be pointed at without a code change;
 * otherwise Vercel injects the production hostname at runtime, which keeps the
 * links right through redeploys.
 */
function adminBaseUrl(): string {
  const explicit = process.env.SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`
  return 'https://finishline-towing.vercel.app'
}

/**
 * Everything interpolated below is public form input, so it is escaped. An
 * unescaped angle bracket would break the markup; a crafted anchor would turn
 * his own lead notification into a phishing surface.
 */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function telDigits(phone: string): string {
  return phone.replace(/[^+\d]/g, '')
}

/**
 * The HTML notification — the thing he actually acts on.
 *
 * Built as tables with inline styles because that is what mail clients render;
 * anything modern gets stripped. Three actions, in the order he needs them:
 * call the customer, open the request, look at the day. Colours are explicit
 * rather than inherited so a client's dark mode cannot wash the buttons out.
 */
export function emailHtml(request: TowRequest, businessName: string): string {
  const base = adminBaseUrl()
  const vehicle = [request.vehicleYear, request.vehicleMake, request.vehicleModel]
    .filter(Boolean)
    .join(' ')

  const row = (label: string, value: string) =>
    value
      ? `<tr>
           <td style="padding:9px 0;color:#5A6B85;font-size:13px;width:38%;vertical-align:top;">${esc(label)}</td>
           <td style="padding:9px 0;color:#0B1220;font-size:15px;font-weight:600;">${esc(value)}</td>
         </tr>`
      : ''

  const situation = request.situation.length
    ? `<tr><td style="padding:0 0 18px;">
         <div style="background:#FEF2F2;border-left:4px solid #EB0122;padding:12px 14px;">
           <div style="color:#7A1020;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">What to expect</div>
           <div style="color:#0B1220;font-size:16px;font-weight:700;padding-top:4px;">${esc(request.situation.join(' · '))}</div>
         </div>
       </td></tr>`
    : ''

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#EEF2F6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF2F6;padding:18px 12px;">
 <tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:10px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

   <tr><td style="background:#003F86;padding:16px 20px;">
     <div style="color:#9AD201;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">${esc(businessName)}</div>
     <div style="color:#FFFFFF;font-size:20px;font-weight:800;padding-top:2px;">New request</div>
   </td></tr>

   <tr><td style="padding:20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

     <tr><td style="padding:0 0 4px;color:#0B1220;font-size:22px;font-weight:800;">${esc(request.name)}</td></tr>
     <tr><td style="padding:0 0 16px;color:#33415C;font-size:15px;">${esc(request.serviceType || 'Tow request')}</td></tr>

     ${situation}

     <tr><td style="padding:0 0 10px;">
       <a href="tel:${esc(telDigits(request.phone))}"
          style="display:block;background:#9AD201;color:#0B1220;text-decoration:none;text-align:center;padding:16px;border-radius:8px;font-size:18px;font-weight:800;">
         Call ${esc(request.phone)}
       </a>
     </td></tr>

     <tr><td style="padding:0 0 20px;">
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
         <td style="padding-right:5px;">
           <a href="${base}/admin/tows/${esc(request.id)}"
              style="display:block;background:#003F86;color:#FFFFFF;text-decoration:none;text-align:center;padding:13px 8px;border-radius:8px;font-size:14px;font-weight:700;">
             Open request
           </a>
         </td>
         <td style="padding-left:5px;">
           <a href="${base}/admin/schedule"
              style="display:block;background:#FFFFFF;color:#003F86;text-decoration:none;text-align:center;padding:12px 8px;border-radius:8px;font-size:14px;font-weight:700;border:2px solid #D5DDE5;">
             View schedule
           </a>
         </td>
       </tr></table>
     </td></tr>

     <tr><td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E4EAF0;">
        ${row('When they need it', request.whenNeeded)}
        ${row('Pickup', request.pickup)}
        ${row('Drop-off', request.dropoff)}
        ${row('Vehicle', vehicle)}
        ${row('Runs', request.runs === null ? '' : request.runs ? 'Yes' : 'No')}
        ${row('Vehicle is', request.vehicleFlags.join(', '))}
        ${row('Their email', request.email)}
        ${row('What they said', request.notes)}
      </table>
     </td></tr>

    </table>
   </td></tr>

   <tr><td style="background:#F4F6F8;padding:12px 20px;color:#7A8AA0;font-size:12px;">
     Received ${esc(new Date(request.createdAt).toLocaleString('en-US', { timeZone: 'America/New_York' }))}
   </td></tr>

  </table>
 </td></tr>
</table>
</body></html>`
}
