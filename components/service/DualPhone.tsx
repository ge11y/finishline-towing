import {
  DAY_CELL,
  DAY_CELL_CTA,
  DAY_CELL_WHEN,
  NIGHT_PAGER,
  NIGHT_PAGER_CTA,
  NIGHT_PAGER_WHEN,
  telHref,
} from '@/lib/contact'

type DualPhoneVariant = 'hero' | 'header' | 'callbar' | 'stack' | 'inline'

const LINES = [
  {
    href: telHref(DAY_CELL),
    tone: 'hs-dual-day',
    kicker: DAY_CELL_CTA,
    headerKicker: 'Day cell',
    number: DAY_CELL,
    when: DAY_CELL_WHEN,
  },
  {
    href: telHref(NIGHT_PAGER),
    tone: 'hs-dual-night',
    kicker: NIGHT_PAGER_CTA,
    headerKicker: 'Night pager',
    number: NIGHT_PAGER,
    when: NIGHT_PAGER_WHEN,
  },
] as const

/**
 * Both dispatch numbers, labeled by time. Big CTAs must not imply the pager
 * is the only all-day line. 24/7 is the service claim, not a single number.
 *
 * `header` is a pair of compact chips (label + number, hours on a second
 * short line) so Quote / phones / menu share one bar height. Other variants
 * stay as stacked cards where they have the room.
 */
export function DualPhone({ variant }: { variant: DualPhoneVariant }) {
  const compact = variant === 'header'

  return (
    <div className={`hs-dual hs-dual--${variant}`} data-testid={`dual-phone-${variant}`}>
      {LINES.map((line) => (
        <a
          key={line.number}
          href={line.href}
          className={`hs-dual-phone ${line.tone}`}
          aria-label={`${line.kicker} ${line.number}. ${line.when}`}
        >
          <span className="hs-dual-row">
            <span className="hs-dual-kicker">{compact ? line.headerKicker : line.kicker}</span>
            <strong>{line.number}</strong>
          </span>
          <small>{line.when}</small>
        </a>
      ))}
    </div>
  )
}
