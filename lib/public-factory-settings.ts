import { getAdminSettings } from '@/lib/admin-settings-server'
import type { BrandSettings, BusinessSocialLinkSettings, CatalogSettings, ModuleSettings, ServiceSiteSettings, SiteContentSettings } from '@/lib/admin-settings'

export type PublicFactorySettings = {
  businessName: string
  publicSiteUrl: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  supportNote: string
  socials: BusinessSocialLinkSettings[]
  brandSettings: BrandSettings
  siteContent: SiteContentSettings
  moduleSettings: ModuleSettings
  catalogSettings: CatalogSettings
  serviceSite: ServiceSiteSettings
}

export async function getPublicFactorySettings(): Promise<PublicFactorySettings> {
  const settings = await getAdminSettings()

  return {
    businessName: settings.businessDetails.businessName,
    publicSiteUrl: settings.businessDetails.publicSiteUrl,
    companyEmail: settings.businessDetails.companyEmail,
    companyPhone: settings.businessDetails.companyPhone,
    companyAddress: settings.businessDetails.companyAddress,
    socials: settings.businessDetails.socials.filter((social) => social.url.trim().length > 0),
    supportNote: settings.businessDetails.supportNote || settings.businessDetails.contactInfo,
    brandSettings: settings.brandSettings,
    siteContent: settings.siteContent,
    moduleSettings: settings.moduleSettings,
    catalogSettings: settings.catalogSettings,
    serviceSite: settings.serviceSite,
  }
}
