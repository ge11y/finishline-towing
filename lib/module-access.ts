import type { ModuleSettings } from '@/lib/admin-settings'

export type AdminNavigationLink = {
  href: string
  label: string
  module?: keyof ModuleSettings
}

export const ADMIN_MODULE_LABELS: Record<keyof ModuleSettings, string> = {
  storefront: 'Storefront',
  crm: 'Admin CRM',
  customerAccounts: 'Customer Accounts',
  inventory: 'Inventory',
  promos: 'Promos',
  affiliates: 'Affiliates',
  documents: 'Documents',
  addOns: 'Add-ons',
  supplyTracking: 'Supply Tracking',
  videos: 'Video/Media',
  emails: 'Emails',
}

export const ADMIN_NAVIGATION_LINKS: AdminNavigationLink[] = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/factory', label: 'Factory' },
  { href: '/admin/applications', label: 'Applications' },
  { href: '/admin/builds', label: 'Builds' },
  { href: '/admin/business', label: 'Business Details' },
  { href: '/admin/catalog', label: 'Catalog', module: 'storefront' },
  { href: '/admin/emails', label: 'Emails', module: 'emails' },
  { href: '/admin/inventory', label: 'Inventory', module: 'inventory' },
  { href: '/admin/assets', label: 'Image Library' },
  { href: '/admin/supply', label: 'Supply', module: 'supplyTracking' },
  { href: '/admin/add-ons', label: 'Add-ons', module: 'addOns' },
  { href: '/admin/orders', label: 'Orders', module: 'crm' },
  { href: '/admin/clients', label: 'Clients', module: 'crm' },
  { href: '/admin/leads', label: 'Leads', module: 'crm' },
  { href: '/admin/inbox', label: 'Inbox', module: 'crm' },
  { href: '/admin/affiliates', label: 'Affiliates', module: 'affiliates' },
  { href: '/admin/promos', label: 'Promos', module: 'promos' },
]

export function isAdminLinkEnabled(link: AdminNavigationLink, modules: ModuleSettings | null | undefined) {
  if (!link.module || !modules) return true
  return Boolean(modules[link.module])
}

export function getVisibleAdminLinks(modules: ModuleSettings | null | undefined) {
  return ADMIN_NAVIGATION_LINKS.filter((link) => isAdminLinkEnabled(link, modules))
}

export function getHiddenAdminLinks(modules: ModuleSettings | null | undefined) {
  if (!modules) return []
  return ADMIN_NAVIGATION_LINKS.filter((link) => !isAdminLinkEnabled(link, modules))
}

export function getModuleLabel(module: keyof ModuleSettings) {
  return ADMIN_MODULE_LABELS[module] ?? module
}
