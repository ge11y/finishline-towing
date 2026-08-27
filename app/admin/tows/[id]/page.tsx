import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Phone } from 'lucide-react'
import { getTowRequest } from '@/lib/tow-requests'
import { TowActions } from '@/components/admin/TowActions'
import { TextCustomer } from '@/components/admin/TextCustomer'

export const dynamic = 'force-dynamic'

/**
 * Screen C — one request, everything on it, and Call as the biggest thing on
 * the page. Two taps from the list to a ringing phone is the number that
 * matters here.
 */

function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="tow-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export default async function TowRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const request = await getTowRequest(id)
  if (!request) notFound()

  const vehicle = [request.vehicleYear, request.vehicleMake, request.vehicleModel]
    .filter(Boolean)
    .join(' ')
  const received = new Date(request.createdAt).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  const booked = request.scheduledFor
    ? new Date(request.scheduledFor).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : ''

  return (
    <div className="tow-page">
      <header className="tow-head">
        <Link href="/admin/tows" className="tow-back">
          ← Requests
        </Link>
        <h1>{request.name}</h1>
        <span className={`tow-badge tow-badge-${request.status}`}>{request.status}</span>
      </header>

      <a href={telHref(request.phone)} className="tow-callbig">
        <Phone size={22} aria-hidden="true" />
        Call {request.phone}
      </a>

      <dl className="tow-rows">
        <Row label="Situation" value={request.situation.join(', ')} />
        <Row label="Service" value={request.serviceType} />
        <Row label="When they need it" value={request.whenNeeded} />
        <Row label="Pickup" value={request.pickup} />
        <Row label="Drop-off" value={request.dropoff} />
        <Row label="Vehicle" value={vehicle} />
        <Row label="Runs" value={request.runs === null ? '' : request.runs ? 'Yes' : 'No'} />
        <Row label="Vehicle is" value={request.vehicleFlags.join(', ')} />
        <Row label="Email" value={request.email} />
        <Row label="What they said" value={request.notes} />
        <Row label="Booked for" value={booked} />
        <Row label="Received" value={received} />
      </dl>

      <TextCustomer request={request} />

      <TowActions request={request} />
    </div>
  )
}
