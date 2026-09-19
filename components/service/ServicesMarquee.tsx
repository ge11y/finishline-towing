import Link from 'next/link'

/**
 * Thin looping service-name strip. CSS animation only — no JS init — so
 * back-forward / bfcache restore still shows the names. ScrollReveal
 * restarts the animation on pageshow via [data-restart-animation].
 */
export function ServicesMarquee({
  services,
}: {
  services: { slug: string; displayName: string }[]
}) {
  if (services.length === 0) return null

  const loop = [...services, ...services]

  return (
    <div className="hs-services-marquee" aria-label="Services">
      <div className="hs-services-marquee-track" data-restart-animation>
        {loop.map((service, index) => (
          <Link key={`${service.slug}-${index}`} href={`/services/${service.slug}`}>
            {service.displayName}
          </Link>
        ))}
      </div>
    </div>
  )
}
