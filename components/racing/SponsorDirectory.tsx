import Link from 'next/link'
import { CURRENT_SPONSORS } from '@/lib/sponsors'

/**
 * The names already carried on the #74, as a directory rather than a marquee.
 *
 * A link is rendered only when the roster has a verified public homepage
 * (or /site for FINISHLINE Towing). Unverified names stay plain text.
 * Logos later, from the sponsors themselves — a row of placeholder boxes
 * would look worse than the names set properly.
 */
export function SponsorDirectory() {
  if (!CURRENT_SPONSORS.length) return null

  return (
    <section className="rc-directory" aria-label="Sponsors of the number 74">
      <h2 className="rc-directory-kicker">On the truck</h2>
      <ul className="rc-directory-list">
        {CURRENT_SPONSORS.map((sponsor) => (
          <li key={sponsor.name}>
            <SponsorName name={sponsor.name} url={sponsor.url} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function SponsorName({ name, url }: { name: string; url?: string }) {
  if (!url) return <span>{name}</span>
  if (url.startsWith('/')) {
    return (
      <Link href={url} className="rc-directory-link">
        {name}
      </Link>
    )
  }
  return (
    <a href={url} className="rc-directory-link" target="_blank" rel="noreferrer">
      {name}
    </a>
  )
}
