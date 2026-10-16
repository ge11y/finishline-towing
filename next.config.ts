import type { NextConfig } from 'next'
import { REMOVED_TOWN_REDIRECTS } from './lib/towns'

const nextConfig: NextConfig = {
  // The real site now lives at /. Old preview paths fold into it.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.finishlinetowing.org' }],
        destination: 'https://finishlinetowing.org/:path*',
        permanent: true,
      },
      { source: '/site', destination: '/', permanent: true },
      { source: '/coming-soon', destination: '/', permanent: true },
      ...Object.entries(REMOVED_TOWN_REDIRECTS).map(([slug, destination]) => ({
        source: `/towing/${slug}`,
        destination,
        permanent: true,
      })),
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // The applied client's settings and services are read from disk at runtime
  // (no Supabase on this copy); without tracing them in, serverless functions
  // fall back to the demo baseline.
  outputFileTracingIncludes: {
    '/': ['./.factory-data/settings.json', './.factory-data/catalog-products.json'],
    '/**': ['./.factory-data/settings.json', './.factory-data/catalog-products.json'],
  },
}

export default nextConfig
