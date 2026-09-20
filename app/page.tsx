import type { Metadata } from 'next'
import { ComingSoonLanding } from '@/components/ComingSoonLanding'
import { DAY_CELL, NIGHT_PAGER } from '@/lib/contact'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicFactorySettings()
  return {
    title: {
      absolute: `Coming Soon | ${settings.businessName} | 24/7 service`,
    },
    description: `${settings.businessName} — Twin States towing and recovery out of North Haverhill, NH. 24/7 service. Day cell ${DAY_CELL} (through ~8pm). Night pager ${NIGHT_PAGER} (8pm–5am).`,
    robots: { index: true, follow: true },
  }
}

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ bad?: string }>
}) {
  const settings = await getPublicFactorySettings()
  const { bad } = await searchParams
  return <ComingSoonLanding settings={settings} badPassword={bad === '1'} />
}
