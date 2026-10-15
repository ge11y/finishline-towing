import {
  ADDRESS_LINE,
  BUSINESS_NAME,
  DAY_CELL,
  DAY_CELL_WHEN,
  MAP_EMBED_SRC,
  MAP_LINK,
  NIGHT_PAGER,
  NIGHT_PAGER_WHEN,
  telHref,
} from '@/lib/contact'

/**
 * Visible name / address / phone, matching the citations and the JSON-LD
 * exactly, plus the embedded map. Both lines stay labeled by time.
 */
export function NapBlock({ heading = 'Call or find us' }: { heading?: string }) {
  return (
    <section className="hs-section" aria-labelledby="nap-heading">
      <div className="hs-section-head">
        <h2 id="nap-heading">{heading}</h2>
      </div>
      <address className="hs-intro-copy" style={{ fontStyle: 'normal' }}>
        <strong>{BUSINESS_NAME}</strong>
        <br />
        <a href={MAP_LINK} target="_blank" rel="noreferrer">
          {ADDRESS_LINE}
        </a>
        <br />
        Day cell: <a href={telHref(DAY_CELL)}>{DAY_CELL}</a> ({DAY_CELL_WHEN.toLowerCase()})
        <br />
        Night pager: <a href={telHref(NIGHT_PAGER)}>{NIGHT_PAGER}</a> ({NIGHT_PAGER_WHEN.replace('Pager · ', '')})
        <br />
        Open 24/7
      </address>
      <div className="hs-area-map" style={{ marginTop: 16 }}>
        <iframe
          src={MAP_EMBED_SRC}
          title={`Map: ${BUSINESS_NAME}, ${ADDRESS_LINE}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  )
}
