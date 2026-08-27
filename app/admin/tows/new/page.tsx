import Link from 'next/link'
import { NewJobForm } from '@/components/admin/NewJobForm'

export const dynamic = 'force-dynamic'

/**
 * Writing up the day's jobs.
 *
 * His method today is chicken scratch on paper during the call, rewritten
 * clean at night. This replaces the rewrite, not the paper — he cannot type or
 * dictate with the phone against his ear, so the scribble stays. What changes
 * is that the evening's transcription produces a calendar instead of a second
 * sheet of paper.
 */
export default function NewJobPage() {
  return (
    <div className="tow-page">
      <header className="tow-head">
        <Link href="/admin/tows" className="tow-back">
          ← Requests
        </Link>
        <h1>Write up a job</h1>
      </header>
      <NewJobForm />
    </div>
  )
}
