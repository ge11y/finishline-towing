'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { SITUATIONS, SOURCE_LABELS, SOURCES, VEHICLE_FLAGS } from '@/lib/tow-fields'

/**
 * Owner job entry, built for the way he actually works.
 *
 * He takes the call, scribbles it on paper, and rewrites the lot clean at
 * night. This replaces the rewrite: he sits down once with the stack and types
 * it in, and what comes out is a calendar instead of another sheet of paper.
 *
 * That makes it a batch task, and batch tasks live or die on what happens
 * after Save. "Save and add another" keeps him on the form with the date still
 * set, so a stack of six jobs is six entries rather than six round trips
 * through a list screen. The running count is there so he can see the pile
 * going down.
 *
 * Fields are in the order they end up on his paper — who, number, where, what,
 * when — so his eye moves down the page in step with the form. Only the
 * callback number is required; he fills what he wrote down and no more.
 */

const SERVICES = [
  'Flatbed Towing',
  'Recovery & Winch-Outs',
  'Roadside Assistance',
  'Motorcycle Towing',
  'Hauling & Transport',
  'Junk Car Removal',
  'Something else',
]

export function NewJobForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [saving, setSaving] = useState<'again' | 'done' | null>(null)
  const [savedCount, setSavedCount] = useState(0)
  const [error, setError] = useState('')
  // Held across entries: at night he is working through one evening's worth of
  // jobs, and re-picking the same date six times is the kind of friction that
  // sends him back to paper.
  const [when, setWhen] = useState('')

  async function save(mode: 'again' | 'done') {
    const form = formRef.current
    if (!form || !form.reportValidity()) return

    const body: Record<string, unknown> = {}
    for (const [key, value] of new FormData(form).entries()) {
      if (typeof value !== 'string' || !value.trim()) continue
      if (key === 'situation' || key === 'vehicleFlags') {
        body[key] = [...((body[key] as string[] | undefined) ?? []), value]
      } else {
        body[key] = value.trim()
      }
    }

    setSaving(mode)
    setError('')
    try {
      const response = await fetch('/api/admin/tows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; id?: string; error?: string }
        | null
      if (!response.ok || !result?.ok) throw new Error(result?.error || 'Could not save that.')

      if (mode === 'done') {
        router.push('/admin/schedule')
        router.refresh()
        return
      }

      form.reset()
      setWhen(when)
      setSavedCount((count) => count + 1)
      form.querySelector<HTMLInputElement>('#job-name')?.focus()
      setSaving(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save that.')
      setSaving(null)
    }
  }

  return (
    <form ref={formRef} className="tow-form" onSubmit={(event) => event.preventDefault()}>
      {savedCount ? (
        <p className="tow-saved" role="status">
          {savedCount} {savedCount === 1 ? 'job' : 'jobs'} written up.{' '}
          <a href="/admin/schedule">See the calendar</a>
        </p>
      ) : null}

      <div className="tow-field">
        <label htmlFor="job-name">Who</label>
        <input id="job-name" name="name" type="text" autoComplete="off" placeholder="Their name" />
      </div>

      <div className="tow-field">
        <label htmlFor="job-phone">Number</label>
        <input
          id="job-phone"
          name="phone"
          type="tel"
          required
          autoComplete="off"
          placeholder="Callback number"
        />
      </div>

      <div className="tow-field">
        <label htmlFor="job-pickup">Where</label>
        <input
          id="job-pickup"
          name="pickup"
          type="text"
          autoComplete="off"
          placeholder="Address, intersection, or mile marker"
        />
      </div>

      <div className="tow-field">
        <label htmlFor="job-dropoff">Going to</label>
        <input id="job-dropoff" name="dropoff" type="text" autoComplete="off" placeholder="Shop, home, yard" />
      </div>

      <div className="tow-field">
        <label htmlFor="job-vehicle">Vehicle</label>
        <input id="job-vehicle" name="vehicle" type="text" autoComplete="off" placeholder="2016 Subaru Outback" />
      </div>

      <div className="tow-field">
        <label htmlFor="job-service">What</label>
        <select id="job-service" name="service" defaultValue="">
          <option value="">—</option>
          {SERVICES.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div className="tow-field">
        <label htmlFor="job-when">When</label>
        <input
          id="job-when"
          name="scheduledFor"
          type="datetime-local"
          value={when}
          onChange={(event) => setWhen(event.target.value)}
        />
        <p className="tow-hint">Give it a time and it lands on the calendar. The date stays put for the next one.</p>
      </div>

      <fieldset className="tow-fieldset">
        <legend>What to expect</legend>
        <div className="tow-choices">
          {SITUATIONS.map((item) => (
            <label key={item} className="tow-choice">
              <input type="checkbox" name="situation" value={item} />
              {item}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="tow-fieldset">
        <legend>Vehicle is</legend>
        <div className="tow-choices">
          {VEHICLE_FLAGS.map((flag) => (
            <label key={flag} className="tow-choice">
              <input type="checkbox" name="vehicleFlags" value={flag} />
              {flag}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="tow-field">
        <label htmlFor="job-source">Came from</label>
        <select id="job-source" name="source" defaultValue="phone">
          {SOURCES.filter((entry) => entry !== 'web').map((entry) => (
            <option key={entry} value={entry}>
              {SOURCE_LABELS[entry]}
            </option>
          ))}
        </select>
      </div>

      <div className="tow-field">
        <label htmlFor="job-notes">Notes</label>
        <textarea
          id="job-notes"
          name="notes"
          rows={3}
          placeholder="Anything else off the paper"
        />
      </div>

      <button
        type="button"
        className="tow-btn tow-btn-wide"
        disabled={saving !== null}
        onClick={() => void save('again')}
      >
        {saving === 'again' ? 'Saving…' : 'Save and add another'}
      </button>

      <button
        type="button"
        className="tow-btn tow-btn-quiet tow-btn-wide"
        disabled={saving !== null}
        onClick={() => void save('done')}
      >
        {saving === 'done' ? 'Saving…' : 'Save and finish'}
      </button>

      {error ? (
        <p className="tow-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
