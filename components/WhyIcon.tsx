// ---------------------------------------------------------------------------
// Symbol for a whyChooseUs differentiator.
//
// Client data names an icon; this maps the name to a component. Names are
// validated in lib/service-site.ts before they reach here, so an unknown or
// missing name has already degraded to 'check'. Nothing trade-specific lives in
// this file — the names describe what a line is about, not any one business.
// ---------------------------------------------------------------------------
import {
  Award,
  Calendar,
  CarFront,
  Check,
  Clock,
  Droplet,
  Flame,
  Leaf,
  Link2,
  Lock,
  MapPin,
  PhoneCall,
  Route,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Truck,
  Wallet,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  check: Check,
  clock: Clock,
  phone: PhoneCall,
  shield: ShieldCheck,
  award: Award,
  truck: Truck,
  car: CarFront,
  route: Route,
  wrench: Wrench,
  leaf: Leaf,
  flame: Flame,
  droplet: Droplet,
  bolt: Zap,
  lock: Lock,
  money: Wallet,
  thumbsUp: ThumbsUp,
  calendar: Calendar,
  mapPin: MapPin,
  link: Link2,
  sparkle: Sparkles,
}

export function WhyIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = ICONS[name] ?? Check
  return <Icon size={size} strokeWidth={2.5} aria-hidden="true" />
}
