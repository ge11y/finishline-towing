import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'
import { SponsorDirectory } from '@/components/racing/SponsorDirectory'
import { SponsorForm } from '@/components/racing/SponsorForm'
import { RACE_FACEBOOK, RACE_TRACK } from '@/lib/sponsors'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'The 74 — Kiptyn’s Race Program & Sponsorship',
    description:
      `Finish Line Towing backs the #74 driven by Kiptyn Aldrich at ${RACE_TRACK}. Local businesses can put their name on the truck — see who already has, and get in touch.`,
  }
}

/**
 * The race programme page.
 *
 * The whole page sits on the photo of Kiptyn and the truck rather than being a
 * picture with text stacked underneath it. The point of the page is asking
 * local businesses for money, and the photo is the argument — a kid in a race
 * suit next to the truck their name would go on. Separating the two puts the
 * argument above the fold and the ask below it, where it reads as a form.
 *
 * The scrim is a vertical gradient rather than a flat wash: it stays light
 * across the top so the truck and the boy are actually visible, and deepens
 * under the copy where the photo is bright asphalt and white text would
 * otherwise disappear.
 *
 * Written only from what is known. Kiptyn drives the 74 at White Mountain
 * Motorsports Park. Finish Line Towing is family and a sponsor — the name
 * goes on the truck. Josh does not haul the race car to the track. His class
 * and the season's schedule are absent because nobody has told us, and a
 * racing page that invents a division is worse than one that is short.
 */
export default async function RacingPage() {
  const settings = await getPublicFactorySettings()
  const phone = settings.companyPhone.trim()

  return (
    <div className="rc-page">
      <section className="rc-stage">
        {/* `fill` writes height:100% as an INLINE style, which no stylesheet
            rule can override — so the band height lives on this wrapper and
            the image fills that instead of the whole section. */}
        <div className="rc-stage-media">
          <Image
            src="/clients/finish-line-towing/kiptyn-victory.jpg"
            alt={`Kiptyn Aldrich holding a first-place trophy beside the number 74 in victory lane at ${RACE_TRACK}`}
            fill
            priority
            sizes="100vw"
            className="rc-stage-img"
          />
        </div>
        <div className="rc-stage-scrim" aria-hidden="true" />

        <div className="rc-stage-inner">
          <header className="rc-stage-head">
            <p className="rc-kicker">The 74</p>
            <h1>Kiptyn races. We put the name on the truck.</h1>
            {/* Kiptyn's own words, from a post of his. Left exactly as he wrote
                them — the line breaks are his and they carry the rhythm. This
                is the best writing on the page and it is not ours. */}
            <blockquote className="rc-quote">
              <p>There is something so powerful, yet so peaceful, about this moment.</p>
              <p>
                The world around me is loud, fast, and full of chaos… but inside this race car,
                everything gets quiet.
              </p>
              <p>
                For those few laps, the noise disappears. The stress, the problems, and everything
                weighing on my mind fades away.
              </p>
              <p>It’s just me, the car, and the next lap ahead.</p>
              <p>
                Racing isn’t just about speed or competition. Sometimes it’s the one place where my
                mind can finally slow down.
              </p>
              <cite>Kiptyn Aldrich</cite>
            </blockquote>

            <p className="rc-lead">
              He runs the 74 at {RACE_TRACK}. Finish Line Towing backs the program as family and as
              a sponsor — the name on the truck. A row of local businesses ride along on the door.
            </p>
            <a href={RACE_FACEBOOK} className="rc-fb" target="_blank" rel="noreferrer">
              Follow Kiptyn Ross Aldrich Racing #74 on Facebook
            </a>
          </header>

          <ul className="rc-shots">
            {/* Josh will send pictures of Kiptyn's car. Do not invent or add car
                photos until those arrive. The frames below are the existing
                truck / victory set already on the site. */}
            {[
              { src: 'race-74-side', alt: 'Sponsor decals along the side of the number 74' },
              { src: 'race-74-tail', alt: 'The tailgate of the 74, carrying Boudreault Septic' },
              { src: 'race-74-front', alt: 'The front of the number 74' },
              { src: 'kiptyn-portrait', alt: 'Kiptyn Aldrich in his race suit at the track' },
            ].map((shot) => (
              <li key={shot.src}>
                <Image
                  src={`/clients/finish-line-towing/${shot.src}.jpg`}
                  alt={shot.alt}
                  width={414}
                  height={414}
                />
              </li>
            ))}
          </ul>

          <SponsorDirectory />

          <div className="rc-pitch">
            <h2>Putting your name on the truck</h2>
            <p>
              Sponsoring a local race truck is not national advertising and nobody should pretend
              it is. What it is: your name in front of the people who actually live here, on a
              truck that gets looked at, run by a family your customers already know. It also keeps
              a kid racing.
            </p>
            <p>
              There is no rate card. Some sponsors take a decal, some take a panel, some send parts
              or fuel instead of money. Tell Josh what you had in mind and he will tell you straight
              what it takes.
            </p>
          </div>

          <div className="rc-apply">
            <SponsorForm />
            <aside className="rc-aside">
              <h3>Rather just call?</h3>
              {phone ? (
                <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="rc-aside-call">
                  Call {phone}
                </a>
              ) : null}
              <p className="rc-aside-note">
                It is the same number as the tow line, and it is the same person answering.
              </p>
              <p className="rc-aside-note">
                Looking for a tow instead? <Link href="/site">That way</Link>.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
