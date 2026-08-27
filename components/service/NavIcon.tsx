import {
  Anchor,
  BatteryCharging,
  Bike,
  Container,
  Flag,
  House,
  MapPin,
  PhoneCall,
  Recycle,
  Shirt,
  Truck,
  type LucideIcon,
} from 'lucide-react'

/**
 * Symbol for a navigation tab.
 *
 * Keyed by the service slug, which comes from the catalog, so a service added
 * later simply arrives without one rather than breaking the row.
 *
 * These are a scanning aid, not decoration: ten tabs of similar-length words
 * read as a wall, and a shape beside each gives the eye somewhere to land
 * before it starts reading. They are marked aria-hidden throughout — the tab
 * text already says what the tab is, and a screen reader announcing "truck,
 * Flatbed Towing" is noise.
 */
const ICONS: Record<string, LucideIcon> = {
  home: House,
  'flatbed-towing': Truck,
  'hauling-transport': Container,
  'junk-car-removal': Recycle,
  'motorcycle-towing': Bike,
  'recovery-winch-outs': Anchor,
  'roadside-assistance': BatteryCharging,
  racing: Flag,
  merch: Shirt,
  'service-area': MapPin,
  contact: PhoneCall,
}

export function NavIcon({ name, size = 15 }: { name: string; size?: number }) {
  const Icon = ICONS[name]
  if (!Icon) return null
  return <Icon size={size} aria-hidden="true" className="hs-tab-icon" />
}
