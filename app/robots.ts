import type { MetadataRoute } from 'next'

function siteUrl(): string {
  const explicit = process.env.SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`
  return 'https://finishline-towing.vercel.app'
}

export default function robots(): MetadataRoute.Robots {
  // The owner's admin and the API are disallowed — the admin is behind a login
  // anyway, but there is nothing to gain from a crawler finding the door.
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/api/'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
