# Client files

One JSON file per lead. `scripts/client-apply.mjs` turns it into a live preview:

```bash
node scripts/client-apply.mjs clients/<slug>.json
```

Every field is optional except `slug`, `businessName`, and at least one entry in
`services`. **Anything left empty hides its section** — a thin client file still
produces a coherent page, so leave a field out rather than inventing a value.

Photos and the logo live in `public/clients/<slug>/` and are referenced by path.

```jsonc
{
  "slug": "h-and-h-tree",                    // folder + file name
  "businessName": "H&H Tree Service",
  "businessType": "Tree service",            // shown on the application only
  "tier": "launch_kit",                      // launch_kit | growth_system | custom_ops
  "theme": "service_pro",                    // most trades; see "Themes" below
  "serviceLabel": "Services",                // heading over the service rows
  "notes": "Where the lead came from, anything to remember.",

  "brand": {
    "primary": "#2F5D3A",                    // buttons, links, accents
    "accent": "#C77A3A",                     // hero CTA
    "background": "#F4EFE7",                 // page ground
    "logo": "/clients/h-and-h-tree/logo.png",
    "hero": "/clients/h-and-h-tree/hero.jpg" // wide shot of finished work
  },

  "contact": {
    "email": "…",                            // identifies the application record
    "publicEmail": "…",                      // optional; "" hides the email card
    "phone": "(555) 555-5555",
    "address": "123 Main St, Town, ST 00000",
    "publicUrl": "https://h-and-h-tree.example.com",
    "supportNote": "Estimates are free. We usually reply within one business day.",
    "socials": [{ "label": "Facebook", "url": "https://facebook.com/…" }]
  },

  "content": {
    "headline": "Big trees down, safely.",
    "subheadline": "One line on what they do and where.",
    "proofPoints": ["Fully insured", "24-hour storm response", "Est. 2014"],
    "primaryCta": "Request a free estimate",
    "secondaryCta": "Call (555) 555-5555",
    "about": "Who runs the crew and how they work. 3–5 sentences, plain voice.",
    "faq": [{ "q": "Do you take emergency calls?", "a": "Yes — …" }],
    "legal": "Estimate and scheduling terms.",
    "footerDisclaimer": "Demo site prepared from public business listings."
  },

  "serviceSite": {
    "ratingValue": "4.9", "ratingCount": "37", "ratingSource": "Google",
    "reviewsUrl": "https://…",
    "serviceAreaLine": "Serving Springfield & the surrounding county",
    "serviceAreaTowns": ["Springfield, ST", "…"],        // footer, local SEO
    "businessHours": [{ "days": "Mon – Fri", "hours": "7:00am – 5:00pm" }],
    "whyChooseUs": ["Fully insured", "Free estimates", "…"],   // 4–6
    "whyChooseUsImage": "/clients/h-and-h-tree/crew.jpg",
    "ctaCards": [{ "title": "…", "body": "…", "actionLine": "…" }],  // 2
    "reviews": [{ "author": "Jane D.", "rating": 5, "date": "Mar 4, 2026",
                  "source": "Google", "text": "…" }],
    "badges": [{ "name": "ISA Certified", "logoUrl": "" }],
    "galleryImages": [{ "src": "/clients/h-and-h-tree/job-1.jpg", "alt": "…" }],
    "quoteFormTitle": "Request a free estimate",
    "quoteFormNote": "No obligation."
  },

  "services": [                               // 4–6; each gets its own page
    {
      "name": "Tree Removal",
      "category": "removal",
      "description": "2–3 sentences a homeowner would recognise.",
      "image": "/clients/h-and-h-tree/removal.jpg"
    }
  ]
}
```

## Differentiator icons

`whyChooseUs` accepts either a plain string or `{ text, icon }`:

```jsonc
"whyChooseUs": [
  "Fully insured",                                    // -> generic check
  { "text": "Same-day callbacks", "icon": "clock" }   // -> its own symbol
]
```

Icon names (anything else falls back to `check`): `check` `clock` `phone`
`shield` `award` `truck` `car` `route` `wrench` `leaf` `flame` `droplet`
`bolt` `lock` `money` `thumbsUp` `calendar` `mapPin` `link` `sparkle`.

Pick by what the line is *about*, not by trade — `shield` for a licence or
safety record, `clock` for availability, `phone` for who answers. The first
three entries also appear in the hero, so lead with the three that sell.

## Themes

`service_pro` is the default and fits most trades — the visitor is deciding over
days, in daylight, on a laptop.

`road_conspicuity` exists for trades whose customer is **stranded and stressed**:
towing, recovery, wrecker, mobile repair, roadside service. It swaps the shared
card language for engineered highway signage — guide-sign field, chevron banding,
hazard diamonds instead of check marks, and a hi-vis call bar sized to be tapped
without aiming. On phones the call bar takes its own full-width row above
everything else, because the call *is* the conversion.

It is fully token-driven: it reads `brand.primary` as the sign field and
`brand.accent` as the hi-vis. It works best when `primary` is dark enough to
carry white legend type and `accent` is a genuinely fluorescent yellow-green —
which is what conspicuity liveries already use, so a roadside client's real
colours usually drop straight in.

## Rules that keep this honest

- **Never invent** reviews, ratings, licences, insurance, certifications, years
  in business, or crew size. Empty is always better than plausible.
- `businessHours` and `serviceAreaTowns` are the two fields most often guessed.
  If you fill them without a source, say so to the owner before anything ships.
- Scraped reviews keep their author, date, and source — and the owner should
  confirm before the site goes public.

## Switching clients

Only one client is live on the skeleton at a time. Applying a client archives
every other client's services; their build stays on file, so switching back is
just re-running their file. When a lead closes, split them into their own copy
with `scripts/create-client-copy.mjs` and deploy that.
