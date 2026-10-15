import type { MetadataRoute } from 'next'

function siteUrl(): string {
  const explicit = process.env.SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`
  return 'https://finishlinetowing.org'
}

export default function robots(): MetadataRoute.Robots {
  // Only the owner's admin and the API are kept out; every public page is crawlable.
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/admin/', '/api/'] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
