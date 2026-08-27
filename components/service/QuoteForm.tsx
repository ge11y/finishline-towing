'use client'

import { useState } from 'react'
import { SITUATIONS } from '@/lib/tow-fields'

/**
 * Scheduled-job request form. Rendered over the hero photo (`variant="hero"`)
 * and inside service detail pages (`variant="panel"`).
 *
 * It pages rather than grows. An earlier version revealed a field at a time,
 * which meant the card got taller as you answered and pushed the page around
 * under you. Now the card holds one size and the questions flip through it, so
 * the layout never moves and each screen is two or three things instead of
 * eight.
 *
 * Page one SAVES before it advances. The form used to hold everything in the
 * browser until the end, so a customer who typed their name and number and then
 * wandered off left nothing at all — no row, no number, no way to call them
 * back. The row is created as soon as page one passes and the last page fills
 * in the rest and sends the owner his email, so abandoning halfway costs detail
 * rather than the whole lead.
 *
 * That save is best-effort: if it fails the form carries on and posts
 * everything at the end instead, because a customer must never be blocked by
 * plumbing they cannot see.
 *
 * Only name and phone are required, and both live on page one — a `required`
 * field on a hidden later page fails validation against a control the browser
 * cannot focus, which presents as a submit button that does nothing.
 *
 * This form is deliberately NOT the path for someone stranded on the shoulder
 * — they get the call button, which is faster and always works.
 */

const DROPOFF_KINDS = ['Home', 'Shop / garage', 'Salvage yard', 'Other'] as const
const WHEN_OPTIONS = ['Now', 'Today', 'Pick a date'] as const
const PAGE_COUNT = 5

function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

function collect(form: HTMLFormElement): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value !== 'string' || !value.trim()) continue
    if (key === 'vehicleFlags' || key === 'situation') {
      body[key] = [...((body[key] as string[] | undefined) ?? []), value]
    } else {
      body[key] = value.trim()
    }
  }
  if (body.whenNeeded === 'Pick a date' && body.whenDate) {
    body.whenNeeded = `On ${body.whenDate as string}`
  }
  delete body.whenDate

  // The kind and the address are two inputs but one answer: "Salvage yard —
  // Currier's, Woodsville" tells him more than either alone.
  const kind = body.dropoffKind as string | undefined
  if (kind) body.dropoff = body.dropoff ? `${kind} — ${body.dropoff as string}` : kind
  delete body.dropoffKind

  return body
}

export function QuoteForm({
  services,
  title,
  note,
  submitLabel,
  variant = 'hero',
  defaultService = '',
  phone = '',
  ownerName = '',
}: {
  services: string[]
  title: string
  note?: string
  submitLabel: string
  variant?: 'hero' | 'panel'
  defaultService?: string
  phone?: string
  ownerName?: string
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [page, setPage] = useState(0)
  const [when, setWhen] = useState('')
  const [sentPhone, setSentPhone] = useState('')
  // Id of the row created at the end of page one; null if that save failed.
  const [requestId, setRequestId] = useState<string | null>(null)

  const isLast = page === PAGE_COUNT - 1

  if (status === 'sent') {
    return (
      <div className={`hs-quote hs-quote-${variant}`}>
        <h2 className="hs-quote-title">Got it</h2>
        <p className="hs-quote-sent" role="status">
          {ownerName ? `${ownerName} will call you` : 'We’ll call you'} at {sentPhone}.
          {phone ? ' If you’re stranded right now, call instead — it’s faster.' : ''}
        </p>
        {phone ? (
          <a href={telHref(phone)} className="hs-quote-callnow">
            Call {phone}
          </a>
        ) : null}
      </div>
    )
  }

  return (
    <form
      className={`hs-quote hs-quote-${variant}`}
      onSubmit={async (event) => {
        event.preventDefault()
        const form = event.currentTarget

        if (!isLast) {
          if (!form.reportValidity()) return
          if (page === 0) {
            setStatus('sending')
            try {
              const response = await fetch('/api/tow-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...collect(form), stage: 'partial' }),
              })
              const result = (await response.json().catch(() => null)) as { id?: string } | null
              if (result?.id) setRequestId(result.id)
            } catch {
              // Best-effort. Everything is posted again at the end.
            }
            setStatus('idle')
          }
          setPage((current) => current + 1)
          return
        }

        const body = collect(form)
        setStatus('sending')
        try {
          const response = requestId
            ? await fetch(`/api/tow-requests/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              })
            : await fetch('/api/tow-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              })
          if (!response.ok) throw new Error('failed')
          setSentPhone(String(body.phone ?? ''))
          setStatus('sent')
          form.reset()
        } catch {
          setStatus('error')
        }
      }}
    >
      <h2 className="hs-quote-title">{title}</h2>

      <p className="hs-quote-step" aria-live="polite">
        Step {page + 1} of {PAGE_COUNT}
      </p>
      <div className="hs-quote-pips" aria-hidden="true">
        {Array.from({ length: PAGE_COUNT }, (_, index) => (
          <span key={index} className={index <= page ? 'is-done' : undefined} />
        ))}
      </div>

      {/* Every page stays mounted so its values survive into the submit, and
          all five sit in the same grid cell so the deck is automatically as
          tall as the tallest of them at any width. Inactive pages are hidden
          with `visibility`, not `display`, so they still occupy that cell —
          and visibility:hidden also takes them out of the tab order. */}
      <div className="hs-quote-deck">
        <div className="hs-quote-panel" data-active={page === 0}>
          <label className="hs-quote-label" htmlFor="quote-name">
            Name
          </label>
          <input className="hs-quote-input" id="quote-name" name="name" type="text" required autoComplete="name" placeholder="Your name" />

          <label className="hs-quote-label" htmlFor="quote-phone">
            Phone
          </label>
          <input className="hs-quote-input" id="quote-phone" name="phone" type="tel" required autoComplete="tel" placeholder="Best number to reach you" />
        </div>

        <div className="hs-quote-panel" data-active={page === 1}>
          <label className="hs-quote-label" htmlFor="quote-pickup">
            Where is it?
          </label>
          <input
            className="hs-quote-input"
            id="quote-pickup"
            name="pickup"
            type="text"
            placeholder="Address, intersection, or mile marker and route"
          />

          <label className="hs-quote-label" htmlFor="quote-vehicle">
            Vehicle
          </label>
          <input className="hs-quote-input" id="quote-vehicle" name="vehicle" type="text" placeholder="Year, make and model" />
        </div>

        <div className="hs-quote-panel" data-active={page === 2}>
          <fieldset className="hs-quote-fieldset">
            <legend className="hs-quote-label">What should he expect when he gets there?</legend>
            <div className="hs-quote-choices">
              {SITUATIONS.map((item) => (
                <label key={item} className="hs-quote-choice">
                  <input type="checkbox" name="situation" value={item} />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="hs-quote-panel" data-active={page === 3}>
          {services.length ? (
            <>
              <label className="hs-quote-label" htmlFor="quote-service">
                What do you need?
              </label>
              <select className="hs-quote-input" id="quote-service" name="service" defaultValue={defaultService}>
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
                <option value="Something else">Something else</option>
              </select>
            </>
          ) : null}

          <label className="hs-quote-label" htmlFor="quote-when">
            When do you need it?
          </label>
          <select
            className="hs-quote-input"
            id="quote-when"
            name="whenNeeded"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
          >
            <option value="">Select one</option>
            {WHEN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {when === 'Pick a date' ? (
            <input className="hs-quote-input" name="whenDate" type="date" aria-label="Date needed" />
          ) : null}
        </div>

        <div className="hs-quote-panel" data-active={page === 4}>
          <label className="hs-quote-label" htmlFor="quote-dropoff-kind">
            Where is it going?
          </label>
          <select className="hs-quote-input" id="quote-dropoff-kind" name="dropoffKind" defaultValue="">
            <option value="">Select one</option>
            {DROPOFF_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>

          <label className="hs-quote-label" htmlFor="quote-email">
            Email <span className="hs-quote-optional">optional</span>
          </label>
          <input className="hs-quote-input" id="quote-email" name="email" type="email" autoComplete="email" placeholder="name@example.com" />

          <label className="hs-quote-label" htmlFor="quote-notes">
            Anything else? <span className="hs-quote-optional">optional</span>
          </label>
          <textarea
            className="hs-quote-input hs-quote-textarea"
            id="quote-notes"
            name="notes"
            rows={2}
            placeholder="Keys, access, where it's parked"
          />
        </div>
      </div>

      <button type="submit" className="hs-quote-submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : isLast ? submitLabel : 'Continue'}
      </button>

      {/* Always rendered, so the card does not lose its height on page one and
          gain it again on page two — the jump paging exists to avoid. */}
      <button
        type="button"
        className="hs-quote-back"
        onClick={() => setPage((current) => current - 1)}
        disabled={page === 0 || status === 'sending'}
        aria-hidden={page === 0}
        tabIndex={page === 0 ? -1 : undefined}
        data-shown={page > 0}
      >
        Back
      </button>

      {status === 'error' ? (
        <p className="hs-quote-error" role="alert">
          That didn’t send.{' '}
          {phone ? (
            <>
              Please call <a href={telHref(phone)}>{phone}</a> — it always works.
            </>
          ) : (
            'Please try again.'
          )}
        </p>
      ) : null}

      {note ? <p className="hs-quote-note">{note}</p> : null}
    </form>
  )
}
