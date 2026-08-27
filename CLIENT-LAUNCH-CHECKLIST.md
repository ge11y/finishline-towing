# FINISHLINE Towing — Client Launch Checklist

## Setup
- [ ] npm install
- [ ] Copy .env.example to .env.local and fill in values
- [ ] Run SQL from docs/*.sql against the client Supabase project
- [ ] `node --env-file=.env.local scripts/seed-settings.mjs` — **required on any new
      database.** Settings come from `app_settings`, and an empty table makes the
      site serve the generic demo store instead of this client.
- [ ] npm run dev and review the site

## Owner notification
- [ ] Resend domain verified (`mail.elitesolutions.dev`)
- [ ] `EMAIL_FROM` set in Vercel production — bare address, the code adds the display name
- [ ] Real request submitted against production, `notified_at` stamped, mail received
- [ ] SMS is coded and dormant. To switch it on: `TWILIO_ACCOUNT_SID`,
      `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, plus A2P 10DLC registration
      (sole-proprietor path, several days to approve). No code change needed.

## Owner admin
- [ ] `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` set in production
      (login returns 503 until all three exist — it refuses to mint a session
      against a default or absent password)
- [ ] `/admin` opens the request list on his phone, saved to the home screen
- [ ] Walked him through it: text arrives → open → tap Call → tap Called back

## Known constraint — read before building the Phase 4 customer auto-reply
Owner notifications currently send **from `elitesolutions.dev`**, because Josh has
no domain of his own and Resend only sends from a domain you control. That is
fine while the only recipient is Josh.

It stops being fine the moment the customer auto-reply ships: a tow customer
receiving mail from the agency's domain reads as a subcontractor leak. Register
`finishlinetowing.com` (or whatever he wants) **before** that feature, not after.
The same domain would also replace the `vercel.app` URL on his Google Business
Profile, where a platform subdomain reads as temporary.

## Blocking launch — found in the 2026-08-25 audit

- [ ] **/terms and /privacy are live with the wrong industry's copy.** Seven and
      five literal `[PLACEHOLDER — replace before launch]` strings respectively,
      wrapped in e-commerce boilerplate about orders, shipping and "handmade,
      small-batch goods". Publicly reachable and indexable right now. A towing
      customer landing there sees a candle shop's terms.
- [ ] **Three of six services have no photo** — roadside assistance, motorcycle
      towing, junk car removal — so they render the generic Elite Solutions
      placeholder. Josh's own photos beat anything stock.
- [ ] **`serviceSite.badges` is empty**, so the sitewide trust strip from spec
      2.3 has nothing in it.
- [ ] **No JSON-LD** (spec 2.6). No LocalBusiness/TowingService schema anywhere.
- [ ] **No sitemap.ts and no robots.ts.**
- [ ] **Homepage title carries no keywords**: "FINISHLINE Towing — Leading the
      way." Nobody searches that. Spec 2.6 wanted the town and the service in it.
- [ ] **Brand assets still pending** from illeetedesigns@gmail.com.

## NAP conflict — decide before the Google listing verifies

The site now leads with the pager, **(603) 615-6750**. Every existing record —
NH SOS, FMCSA, Yelp, MapQuest, findglocal, Facebook, and the truck itself —
carries **(603) 252-5568**. Name/address/phone consistency is one of the
strongest local ranking signals there is, and right now the site disagrees with
every citation that already exists.

Two coherent answers, and either beats the split:
1. Update the listings to the pager, and accept that the truck stays wrong.
2. Keep the cell as the published NAP number everywhere and treat the pager as
   the on-site call-to-action only.

Do not verify the Google Business Profile before picking one.

## Pre-Launch
- [ ] Business identity, branding, and theme confirmed
- [ ] Domain connected
- [ ] npm run lint && npm run build pass
- [ ] Deposit received, owner training complete

## Still unconfirmed with the owner
From `~/ge11yz/leads/finish-line-towing/dossier.json` — the `askOwner` list. The
ones that affect what is published:
- [ ] Roadside assistance, junk car removal, and recovery are on the site but were
      asserted by the referrer, not by any public listing. Confirm he runs them.
- [ ] Is 24/7 literal, or "call and I usually answer"? It is printed for strangers.
- [ ] The service-area town list is our construction from the build spec — confirm
      he will actually drive to all of them.
- [ ] He has no Google Business Profile at all. Every competitor does.
- [ ] What is his relationship to J&J Auto Care at the same street address?
