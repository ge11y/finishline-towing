// ============================================================
// Finish Line Towing — legal page content.
//
// These replaced the factory's e-commerce templates, which shipped live on
// this site describing orders, shipping and "handmade, small-batch goods" and
// carried a dozen literal [PLACEHOLDER — replace before launch] markers. None
// of it applied: nothing is sold here, nothing ships, and no payment is taken.
//
// Written in plain language rather than borrowed legalese, and deliberately
// narrow. The site terms govern the SITE. They do not attempt to govern the
// towing work itself — that is a service agreement made at the roadside under
// New Hampshire law and his own insurance, and a web page quietly claiming to
// limit liability for vehicle damage would be both misleading and unlikely to
// hold.
//
// The privacy policy describes what this build actually does, checked against
// the code: the request form's own fields, Supabase for storage, Resend for
// the owner's notification, and PostHog analytics on the public pages.
//
// NOT reviewed by a lawyer. A towing operation carries real liability
// exposure; have counsel read these before relying on them.
// ============================================================

import type { LegalPage } from './types'

const BUSINESS = 'Finish Line Towing, LLC'
const EMAIL = 'finishlinetowing21@gmail.com'
const PHONE = '(603) 615-6750'
const UPDATED = 'August 25, 2026'

export const LEGAL_PAGES: Record<string, LegalPage> = {
  disclaimer: {
    slug: 'disclaimer',
    title: 'Disclaimer',
    lastUpdated: UPDATED,
    content: `
**Information on this site**

We keep this site accurate and current, but nothing on it is a guarantee. Service areas, response times, and what a job involves all depend on weather, road conditions, where the vehicle is, and what else is already booked.

**Nothing here is a price**

No figure on this site is a quote. What a job costs depends on distance, the vehicle, and the conditions, and you will be given the number before the truck rolls.

**If you are in danger, call 911 first**

If you are on a live traffic lane, if anyone is hurt, or if there is fuel leaking or a fire risk, call 911 before you call us.

**Other sites**

Links to other websites are provided for convenience. We do not control them and are not responsible for what they contain.

*Questions about this page: ${EMAIL}*
    `.trim(),
  },

  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    lastUpdated: UPDATED,
    content: `
**The short version**

${BUSINESS} collects what it needs to come and get your vehicle, and nothing else. We do not sell your information, we do not use it for advertising, and we do not send marketing.

**What we collect when you request a tow**

The request form on this site asks for:

- Your name and a phone number to call you back on
- Your email address, which is optional
- Where the vehicle is, and where it is going
- The vehicle's year, make and model
- What condition it is in — whether it runs, whether it rolls, and what the driver should expect on arrival
- When you need it, and anything else you choose to tell us

We ask for these because they are the same things we would ask on the phone. Answering them on the form means one less call.

**Why we hold it**

To call you back, to do the job, and to keep a record of work carried out. That record is also how we know what we quoted and what was agreed.

**Who else touches it**

Your request is stored in a database run by Supabase and the site is hosted by Vercel. When a request comes in, a notification email is sent to the owner through Resend. These companies process the information on our behalf in order to run the site; they are not permitted to use it for anything else.

**Analytics**

The public pages of this site use PostHog to count visits and see which pages people read. It records things like the page visited, rough location from an IP address, and the type of device. It is not connected to your request, and the owner's own admin pages are excluded from it entirely.

**How long we keep it**

Job records are kept while they are useful for running the business and settling any question about work done. If you want your information removed, email ${EMAIL} and say so, and we will delete it unless we are required to keep it.

**Children**

This site is not intended for children and we do not knowingly collect information from them.

**Your choices**

You can ask us what we hold about you, ask us to correct it, or ask us to delete it. Email ${EMAIL}.

**Changes**

If this policy changes, the date at the top of this page changes with it.

*Questions: ${EMAIL} · ${PHONE}*
    `.trim(),
  },

  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    lastUpdated: UPDATED,
    content: `
**What this site is**

This site belongs to ${BUSINESS}, a towing and recovery business based in North Haverhill, New Hampshire, operating under USDOT 3693451. It exists so you can reach the owner and describe what you need.

**Sending a request is not a booking**

Filling in the form tells us you need help. It does not confirm that we are coming, and it does not reserve a time. Nothing is confirmed until you have spoken to the owner. If you are stranded, call ${PHONE} — it is faster and it always works.

**Nothing is bought or paid for here**

No payment is taken through this site. There is no account to open and nothing to check out.

**Prices**

What a job costs depends on distance, the vehicle, and the conditions on the day. You will be told the price before the truck rolls. No figure shown anywhere on this site is a quote.

**Where we go**

The towns and roads listed on the service area page describe where we usually work. They are a guide, not a commitment, and anything outside them is quoted case by case.

**The towing work itself**

These terms cover your use of this website. They do not set the terms of the towing job. That is agreed between you and the owner at the time of service and is governed by New Hampshire law, by our motor carrier obligations, and by our insurance.

**Using the site**

Please do not use the form to send abusive content, to submit requests you do not intend to follow through on, or to attempt to interfere with the site.

**Accuracy**

We keep this site accurate but do not warrant that every detail is complete or current at all times.

**Governing law**

These terms are governed by the laws of the State of New Hampshire.

*Questions: ${EMAIL} · ${PHONE}*
    `.trim(),
  },
}
