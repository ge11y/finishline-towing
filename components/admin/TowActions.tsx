'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { TowRequest, TowRequestStatus } from '@/lib/tow-requests'

/**
 * The whole detail screen's interaction, in one place.
 *
 * Every status is a single tap with no confirmation dialog — the spec's rule is
 * that changing a status is immediate, because the alternative is a modal on a
 * phone held in one hand in the cold. Nothing here is destructive, and picking
 * the wrong one is fixed by tapping the right one.
 */

const STATUS_ACTIONS: { value: TowRequestStatus; label: string }[] = [
  { value: 'called', label: 'Called back' },
  { value: 'booked', label: 'Booked' },
  { value: 'done', label: 'Done' },
  { value: 'spam', label: 'Spam' },
]

/** `datetime-local` wants local wall-clock time, not an ISO instant. */
function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function TowActions({ request }: { request: TowRequest }) {
  const router = useRouter()
  const [status, setStatus] = useState<TowRequestStatus>(request.status)
  const [note, setNote] = useState(request.adminNote)
  const [when, setWhen] = useState(toLocalInput(request.scheduledFor))
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function patch(body: Record<string, unknown>, label: string) {
    setBusy(label)
    setError('')
    try {
      const response = await fetch(`/api/admin/tows/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error('failed')
      router.refresh()
    } catch {
      setError('That did not save. Try again.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="tow-actions">
      <div className="tow-statusrow" role="group" aria-label="Status">
        {STATUS_ACTIONS.map((action) => (
          <button
            key={action.value}
            type="button"
            className={`tow-statusbtn${status === action.value ? ' is-on' : ''}`}
            disabled={busy !== null}
            onClick={() => {
              setStatus(action.value)
              void patch({ status: action.value }, action.value)
            }}
          >
            {busy === action.value ? '…' : action.label}
          </button>
        ))}
      </div>

      <div className="tow-field">
        <label htmlFor="tow-when">Book it for</label>
        <input
          id="tow-when"
          type="datetime-local"
          value={when}
          onChange={(event) => setWhen(event.target.value)}
        />
        <div className="tow-field-actions">
          <button
            type="button"
            className="tow-btn"
            disabled={busy !== null || !when}
            onClick={() => {
              // Booking a slot implies the job is booked; saying so here saves
              // him a second tap he would otherwise forget.
              setStatus('booked')
              void patch({ scheduledFor: when, status: 'booked' }, 'schedule')
            }}
          >
            {busy === 'schedule' ? 'Saving…' : 'Put on schedule'}
          </button>
          {request.scheduledFor ? (
            <button
              type="button"
              className="tow-btn tow-btn-quiet"
              disabled={busy !== null}
              onClick={() => {
                setWhen('')
                void patch({ scheduledFor: null }, 'unschedule')
              }}
            >
              {busy === 'unschedule' ? '…' : 'Clear'}
            </button>
          ) : null}
        </div>
      </div>

      <div className="tow-field">
        <label htmlFor="tow-note">Your note</label>
        <textarea
          id="tow-note"
          rows={2}
          value={note}
          placeholder="Quoted $180, en route"
          onChange={(event) => setNote(event.target.value)}
        />
        <div className="tow-field-actions">
          <button
            type="button"
            className="tow-btn"
            disabled={busy !== null}
            onClick={() => void patch({ adminNote: note }, 'note')}
          >
            {busy === 'note' ? 'Saving…' : 'Save note'}
          </button>
        </div>
      </div>

      {error ? (
        <p className="tow-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
