'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { MESSAGE_TEMPLATES, smsHref } from '@/lib/tow-fields'
import type { TowRequest } from '@/lib/tow-requests'

/**
 * Texting the customer.
 *
 * Nothing is sent from the server. Each button opens his own Messages app with
 * the number and the wording already in it, and he presses send — so it comes
 * from his number and the reply lands in his inbox alongside every other text
 * he gets. Sending it through an API would mean hosting his number on a
 * carrier platform, and hosting takes inbound texts away from his phone.
 *
 * The one extra tap buys both halves of what he asked for. It also means he
 * reads the message before it goes, which on a bad night is worth having.
 *
 * We log it after the link opens, not after it sends, because the phone never
 * tells us what happened next. So this records "he opened this message",
 * shown as "sent" because that is what it means in practice — and if he backs
 * out, the worst case is a line saying he texted when he did not, which is
 * why the log is a note to himself rather than anything the customer sees.
 */
export function TextCustomer({ request }: { request: TowRequest }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  const firstName = request.name.split(/\s+/)[0] ?? ''
  const sentKinds = new Set(request.messages.map((entry) => entry.kind))

  async function record(kind: string) {
    setBusy(kind)
    try {
      await fetch(`/api/admin/tows/${request.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind }),
      })
      router.refresh()
    } catch {
      // The text still opened; a missing log line is not worth an error here.
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="tow-textblock">
      <h2 className="tow-textblock-title">
        <MessageSquare size={17} aria-hidden="true" />
        Text them
      </h2>
      <p className="tow-hint">
        Opens your messages with it written out. Comes from your number, and they reply to you.
      </p>

      <div className="tow-textgrid">
        {MESSAGE_TEMPLATES.map((template) => (
          <a
            key={template.kind}
            href={smsHref(request.phone, template.body(firstName))}
            className={`tow-textbtn${sentKinds.has(template.kind) ? ' is-sent' : ''}`}
            onClick={() => void record(template.kind)}
          >
            {busy === template.kind ? '…' : template.label}
            {sentKinds.has(template.kind) ? <span aria-hidden="true"> ✓</span> : null}
          </a>
        ))}
      </div>

      {request.messages.length ? (
        <p className="tow-textlog">
          Last:{' '}
          {new Date(request.messages[request.messages.length - 1]!.at).toLocaleString('en-US', {
            timeZone: 'America/New_York',
            hour: 'numeric',
            minute: '2-digit',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      ) : null}
    </section>
  )
}
