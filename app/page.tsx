import { redirect } from 'next/navigation'

/**
 * The site lives at /site, which is where every link, the sitemap and the
 * Google listing point. This only catches someone who typed the bare domain.
 */
export default function RootPage() {
  redirect('/site')
}
