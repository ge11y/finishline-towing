'use client'

import { useState } from 'react'
import { SPONSOR_LEVELS } from '@/lib/sponsors'

/**
 * Sponsorship enquiry form.
 *
 * Short on purpose. This is the start of a conversation between two small
 * businesses, not an application to be assessed — the only things it truly
 * needs are who you are and how Josh reaches you back. Everything else helps
 * him prepare for the call.
 *
 * No prices anywhere. Josh has not set any, and putting numbers on the page
 * would have him answering for figures he never agreed to.
 */
export function SponsorForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  if (status === 'sent') {
    return (
      <div className="rc-form rc-form-done" role="status">
        <h3>Thanks — that’s in.</h3>
        <p>
          Josh will get back to you himself. If you’d rather just talk it through, the number is at
          the top of the page.
        </p>
      </div>
    )
  }

  return (
    <form
      className="rc-form"
      onSubmit={async (event) => {
        event.preventDefault()
        const form = event.currentTarget
        if (!form.reportValidity()) return

        const body: Record<string, string> = {}
        for (const [key, value] of new FormData(form).entries()) {
          if (typeof value === 'string' && value.trim()) body[key] = value.trim()
        }

        setStatus('sending')
        setError('')
        try {
          const response = await fetch('/api/sponsorships', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          const result = (await response.json().catch(() => null)) as
            | { ok?: boolean; error?: string }
            | null
          if (!response.ok || !result?.ok) throw new Error(result?.error || 'That didn’t send.')
          setStatus('sent')
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : 'That didn’t send.')
          setStatus('error')
        }
      }}
    >
      <h3 className="rc-form-title">Back the 74</h3>

      <label className="rc-label" htmlFor="sp-company">
        Business name
      </label>
      <input className="rc-input" id="sp-company" name="company" type="text" required autoComplete="organization" />

      <label className="rc-label" htmlFor="sp-name">
        Your name
      </label>
      <input className="rc-input" id="sp-name" name="contactName" type="text" autoComplete="name" />

      <label className="rc-label" htmlFor="sp-email">
        Email
      </label>
      <input className="rc-input" id="sp-email" name="email" type="email" autoComplete="email" />

      <label className="rc-label" htmlFor="sp-phone">
        Phone
      </label>
      <input className="rc-input" id="sp-phone" name="phone" type="tel" autoComplete="tel" />
      <p className="rc-hint">Either one is fine — whichever you’d rather be reached on.</p>

      <label className="rc-label" htmlFor="sp-website">
        Website <span className="rc-optional">optional</span>
      </label>
      <input className="rc-input" id="sp-website" name="website" type="text" placeholder="yourbusiness.com" />

      <label className="rc-label" htmlFor="sp-level">
        What did you have in mind?
      </label>
      <select className="rc-input" id="sp-level" name="level" defaultValue="">
        <option value="">Select one</option>
        {SPONSOR_LEVELS.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>

      <label className="rc-label" htmlFor="sp-message">
        Anything else
      </label>
      <textarea className="rc-input rc-textarea" id="sp-message" name="message" rows={3} />

      <button type="submit" className="rc-submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send it over'}
      </button>

      {status === 'error' ? (
        <p className="rc-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
