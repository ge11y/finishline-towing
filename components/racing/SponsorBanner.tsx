import { CURRENT_SPONSORS } from '@/lib/sponsors'

/**
 * The names already carried on the #74, scrolling past.
 *
 * The list is duplicated once in the markup so the strip can loop seamlessly —
 * the animation translates by exactly half its width, which lands the copy
 * where the original started. The duplicate is hidden from assistive tech so a
 * screen reader hears each sponsor once, and the whole thing stops moving
 * under prefers-reduced-motion, where a marquee is genuinely unpleasant.
 *
 * Text rather than logo images for now: real sponsor logos have to come from
 * the sponsors, and a row of grey placeholder boxes would look worse than
 * their names set properly.
 */
export function SponsorBanner() {
  if (!CURRENT_SPONSORS.length) return null

  const names = CURRENT_SPONSORS.map((sponsor) => sponsor.name)

  return (
    <section className="rc-banner" aria-label="Sponsors of the number 74">
      <div className="rc-banner-track">
        <ul className="rc-banner-list">
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <ul className="rc-banner-list" aria-hidden="true">
          {names.map((name) => (
            <li key={`dup-${name}`}>{name}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
