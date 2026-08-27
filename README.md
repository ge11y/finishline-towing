# FINISHLINE Towing — client site + owner admin

Live: <https://finishline-towing.vercel.app>
Client: Finish Line Towing, LLC — Joshua Aldrich, 585 Benton Road, North Haverhill, NH 03774.
Built by Elite Solutions. Signed and paid; this is a delivered project, not a demo.

Next.js 16 (App Router) · React 19 · Turbopack · Supabase Postgres · Resend · Vercel.

---

## The whole site

Public:

| Route | What it is |
|---|---|
| `/site` | Home — hero, call bar, the paged request form, services, service area. Canonical; `/` redirects here. |
| `/services/[slug]` | One page per service, generated from the catalog. Six of them. |
| `/racing` | Kiptyn Aldrich's #74 programme, sponsor banner, sponsorship application. |
| `/merch` | Showcase only. Ordering opens a text message to Josh; there is no checkout. |
| `/about` · `/faq` · `/service-area` · `/contact` · `/terms` · `/privacy` | Supporting pages. |

Owner admin, all behind auth — `/admin` redirects to `/admin/overview`:

`/admin/overview` · `/admin/tows` · `/admin/tows/[id]` · `/admin/tows/new` · `/admin/schedule` · `/admin/sponsors`

That is the entire surface. 32 routes, and the build output is the list.

## Where the logic lives

```
lib/tow-requests.ts    request store; getOwnerOverview() powers the dashboard
lib/tow-fields.ts      one source of truth for situations, flags, sources, SMS templates —
                       shared by the form and the API allowlist so they cannot drift
lib/sponsors.ts        sponsor applications, and who is already on the truck
lib/merch.ts           merch items; image:null renders a placeholder, not a broken product
lib/admin-auth.ts      HMAC-SHA256 signed session cookie (Web Crypto)
lib/data-legal.ts      terms + privacy copy
proxy.ts               gates /admin/*, redirects /admin -> /admin/overview
components/service/QuoteForm.tsx    the five-page request form
components/admin/                   AdminNav (rail on desktop, strip on phone), TowShell
app/api/tow-requests/               public: POST partial, PATCH to complete
app/api/admin/tows/                 owner: list, update, send a message
app/api/sponsorships/               public: sponsorship applications
```

## Data

Two Supabase tables, `tow_requests` and `sponsor_applications`. Schemas in `docs/`; apply with
`node scripts/apply-schema.mjs`.

**RLS is on with no policies on both.** Deliberate: nothing reaches them but the service role,
server-side. There is no anon read path and there should not be one.

The request form saves in two steps. Page one — name and phone, the only required fields — POSTs a
partial row straight away; the final page PATCHes the rest. Someone who starts and wanders off
still leaves a name and a number, which is the entire point of it.

## Environment

Values live in Vercel and never in the repo. `.env.example` lists the names.

```
ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY, RESEND_FROM_EMAIL, OWNER_EMAIL_TO
NOINDEX          # 1 keeps a deploy out of search; absent = indexable
```

`OWNER_EMAIL_TO` is currently pointed at the agency inbox on all three environments so test
submissions never page Josh at two in the morning. **Remove it at handover** or he will never get
a notification.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000/site
npm run build        # authoritative — the dev server serves stale CSS
npm run lint
```

Deploys are CLI-driven (`vercel --prod`), not connected to this repo. Pushing here does not ship.

Dev and production still share one Supabase database, so local testing writes rows Josh sees.
Splitting them is outstanding.

## Two traps that cost real hours

- **`npm run build` is the authority.** The dev server serves stale CSS, and reading a computed
  style during a transition returns the in-flight value rather than the final one.
- **Screenshots race image decode.** A photo that looks blank in a browser screenshot is usually
  one that has not decoded yet. `await img.decode()` before concluding anything about it.

## Open items

- **NAP conflict.** The site and its JSON-LD use the pager, (603) 615-6750. Every existing citation
  — NH Secretary of State, FMCSA, Yelp, MapQuest, Facebook, and the truck itself — carries
  (603) 252-5568. Inconsistent NAP suppresses local ranking. Settle it before the Google listing
  verifies.
- Sponsor names in `lib/sponsors.ts` were read off photographs of the truck. A decal is evidence,
  not permission. Needs Josh's sign-off before it stays public.
- Merch items are plausible placeholders. Only the Legal Hooker design actually exists.
- Three service photos (roadside, motorcycle, junk car) are missing and fall back to a placeholder.
- `serviceSite.badges` is empty, so the trust strip renders nothing.
- Four of five racing photos are 414px thumbnails; the originals would be better.

Left out on purpose, and not to be "fixed" without asking: the veteran discount (offered, not
advertised), the forthcoming *American Towman* article (not published yet), and any claim of
interstate service — the USDOT authority is intrastate-only.
