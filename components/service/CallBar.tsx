import { DualPhone } from '@/components/service/DualPhone'

/**
 * Fixed call bar, phones only.
 *
 * Two labeled numbers so 615 is not the only all-day tap. Day cell through
 * ~8pm; night pager 8pm–5am. Service is still 24/7.
 *
 * The header numbers scroll away; this does not. Hidden on desktop by CSS,
 * where the header pair is already always visible.
 */
export function CallBar() {
  return (
    <div className="hs-callbar" data-testid="call-bar">
      <DualPhone variant="callbar" />
    </div>
  )
}
