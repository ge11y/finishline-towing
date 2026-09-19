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

/**
 * Both dispatch numbers, labeled by time. Big CTAs must not imply the pager
 * is the only all-day line. 24/7 is the service claim, not a single number.
 */
export function DualPhone({ variant }: { variant: DualPhoneVariant }) {
  return (
    <div className={`hs-dual hs-dual--${variant}`} data-testid={`dual-phone-${variant}`}>
      <a href={telHref(DAY_CELL)} className="hs-dual-phone hs-dual-day">
        <span className="hs-dual-kicker">{DAY_CELL_CTA}</span>
        <strong>{DAY_CELL}</strong>
        <small>{DAY_CELL_WHEN}</small>
      </a>
      <a href={telHref(NIGHT_PAGER)} className="hs-dual-phone hs-dual-night">
        <span className="hs-dual-kicker">{NIGHT_PAGER_CTA}</span>
        <strong>{NIGHT_PAGER}</strong>
        <small>{NIGHT_PAGER_WHEN}</small>
      </a>
    </div>
  )
}
