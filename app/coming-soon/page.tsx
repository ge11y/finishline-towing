import type { Metadata } from 'next'
import { ComingSoonLanding } from '@/components/ComingSoonLanding'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicFactorySettings()
  const phone = settings.companyPhone.trim() || '(603) 615-6750'
  return {
    title: {
      absolute: `Coming Soon | ${settings.businessName} | 24/7 ${phone}`,
    },
    description: `${settings.businessName} — Twin States towing and recovery out of North Haverhill, NH. 24/7 ${phone}.`,
    robots: { index: true, follow: true },
  }
}

export default async function ComingSoonPage() {
  const settings = await getPublicFactorySettings()
  return <ComingSoonLanding settings={settings} />
}
