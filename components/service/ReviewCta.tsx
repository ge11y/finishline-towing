import { GOOGLE_REVIEW_URL } from '@/lib/contact'

/** Primary ask: a Google review. Facebook stays as a secondary link. */
export function ReviewCta({ facebookUrl }: { facebookUrl?: string }) {
  return (
    <section className="hs-section" aria-labelledby="review-heading">
      <div className="hs-section-head">
        <h2 id="review-heading">Did Josh help you out?</h2>
      </div>
      <p className="hs-intro-copy">
        A quick Google review helps neighbors find a local tow when they need one.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: 12 }}>
        <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className="hs-btn-primary">
          Leave us a Google review
        </a>
        {facebookUrl ? (
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hs-btn-outline">
            Review us on Facebook
          </a>
        ) : null}
      </div>
    </section>
  )
}
