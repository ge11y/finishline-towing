// ============================================================
// Demo Storefront — Quality & Safety Reports Data
// Batch-by-batch product quality test records — populated when
// batches are tested. A product's TESTING_RECORDS entry must exist
// AND have status='available' AND a valid coaUrl for any report
// link to appear publicly. All records with placeholder data
// (including status='pending') are excluded from the public-facing
// documentation panel.
// ============================================================

import type { TestingRecord, TestingLab } from './types'

// ─── Quality Labs ─────────────────────────────────────────────
// Populate when the quality lab is confirmed. All fields required
// before any lab info is shown publicly.
// ─────────────────────────────────────────────────────────────
export const TESTING_LABS: Record<string, TestingLab> = {
  primary: {
    name: 'Demo Quality Lab',
    accreditationBody: '',
    accreditationNumber: '',
    website: '',
  },
}

// ─── Batch Quality Records ────────────────────────────────────
// Map each product slug to its quality report record(s).
// Rules for public display:
//   status === 'available' AND coaUrl is a real URL  → report link shown
//   status === 'pending'                             → no link, badge shows Pending
//   no entry for slug                                → empty state shown
// ─────────────────────────────────────────────────────────────
export const TESTING_RECORDS: Record<string, TestingRecord[]> = {
  'amber-noir-8oz': [
    {
      productSlug: 'amber-noir-8oz',
      batchNumber: 'DEMO-001',
      testingLab: 'Demo Quality Lab',
      labAccreditation: '',
      testDate: '2026-05-12',
      purityPercent: '',
      methodology: ['Burn Test', 'Fragrance Load Analysis', 'IFRA Compliance Review'],
      coaUrl: '/documents/demo-quality-report.pdf#page=1',
      inlinePreview: false,
      status: 'available',
    },
  ],
  'teakwood-diffuser-6oz': [
    {
      productSlug: 'teakwood-diffuser-6oz',
      batchNumber: 'DEMO-013',
      testingLab: 'Demo Quality Lab',
      labAccreditation: '',
      testDate: '2026-05-19',
      purityPercent: '',
      methodology: ['Evaporation Rate Test', 'Fragrance Load Analysis', 'IFRA Compliance Review'],
      coaUrl: '/documents/demo-quality-report.pdf#page=2',
      inlinePreview: false,
      status: 'available',
    },
  ],
}

// ─── Helpers ─────────────────────────────────────────────────
export function getTestingRecordsForProduct(slug: string): TestingRecord[] {
  return TESTING_RECORDS[slug] ?? []
}

export function hasPublishedCoA(slug: string): boolean {
  const records = getTestingRecordsForProduct(slug)
  return records.some(
    (r) => r.status === 'available' && r.coaUrl && !r.coaUrl.startsWith('[')
  )
}

export function getPrimaryPublishedCoAUrl(slug: string): string | null {
  const record = getTestingRecordsForProduct(slug).find(
    (r) => r.status === 'available' && r.coaUrl && !r.coaUrl.startsWith('[')
  )
  return record?.coaUrl ?? null
}

export function getPrimaryPublishedCoAPage(slug: string): number | null {
  const url = getPrimaryPublishedCoAUrl(slug)
  if (!url) return null
  const match = url.match(/#page=(\d+)/i)
  return match ? Number(match[1]) : null
}

export function getProductCoALink(product: { slug: string; coaUrl?: string | null }): string | null {
  if (product.coaUrl && !product.coaUrl.startsWith('[')) {
    if (product.coaUrl.startsWith('/api/catalog-assets/coa/') || product.coaUrl.startsWith('/quality-reports/')) {
      return `/quality-reports/${product.slug}`
    }
    return product.coaUrl
  }
  return hasPublishedCoA(product.slug) ? `/quality-reports/${product.slug}` : null
}
