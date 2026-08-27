import { Phone } from 'lucide-react'

/**
 * Fixed call bar, phones only.
 *
 * It leads with the question rather than the number. "Call (603) 615-6750" is
 * an instruction to somebody already sure they want to ring; "Stranded? Call
 * now!" answers the thing they are actually thinking. The number stays under
 * it, because some people want to see it before they tap and some want to dial
 * it by hand.
 *
 * The site's whole job is that someone on the shoulder of Route 302 reaches
 * the owner in one tap. The header number scrolls away; this does not. It is
 * hidden on desktop by CSS, where the header number is already always visible.
 */
export function CallBar({ phone }: { phone: string }) {
  if (!phone) return null

  return (
    <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="hs-callbar" data-testid="call-bar">
      <Phone size={19} aria-hidden="true" />
      <span>
        <strong>Stranded? Call now!</strong>
        <small>{phone}</small>
      </span>
    </a>
  )
}
