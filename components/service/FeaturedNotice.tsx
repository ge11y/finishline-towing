import { Newspaper } from 'lucide-react'
import { hasFeaturedNotice, type ServiceSiteFeaturedNotice } from '@/lib/service-site'

/**
 * Slim homepage press strip. Copy and URL come from serviceSite.featuredNotice;
 * empty config renders nothing.
 */
export function FeaturedNotice({ notice }: { notice?: ServiceSiteFeaturedNotice | null }) {
  if (!hasFeaturedNotice(notice)) return null

  return (
    <aside className="hs-featured" aria-label={notice.label}>
      <div className="hs-featured-inner">
        <p className="hs-featured-copy">
          <Newspaper className="hs-featured-icon" size={15} strokeWidth={2} aria-hidden="true" />
          <strong>{notice.label}</strong>
          {notice.title ? <span className="hs-featured-title">{notice.title}</span> : null}
        </p>
        <a
          className="hs-featured-link"
          href={notice.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {notice.linkLabel}
        </a>
      </div>
    </aside>
  )
}
