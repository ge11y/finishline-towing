import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
