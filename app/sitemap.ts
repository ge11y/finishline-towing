import type { MetadataRoute } from 'next'
import { getLiveCatalogDisplayProducts } from '@/lib/catalog-live'
import { TOWNS } from '@/lib/towns'

function siteUrl(): string {
  const explicit = process.env.SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`
  return 'https://finishlinetowing.org'
}

/**
 * Only the pages a customer should land on. The service pages come from the
 * live catalog rather than a hand-kept list, so adding a service puts it in
 * the sitemap without anyone remembering to.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const now = new Date()

  const fixed: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/service-area`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    ...TOWNS.map((town) => ({
      url: `${base}/towing/${town.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/racing`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/merch`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  try {
    const services = await getLiveCatalogDisplayProducts()
    return [
      ...fixed,
      ...services
        .filter((service) => service.publicVisible !== false)
        .map((service) => ({
          url: `${base}/services/${service.slug}`,
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.9,
        })),
    ]
  } catch {
    // A sitemap missing the service pages beats a sitemap that fails to build.
    return fixed
  }
}
