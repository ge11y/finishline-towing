import Image from 'next/image'
import type { Metadata } from 'next'
import { getPublicFactorySettings } from '@/lib/public-factory-settings'
import { MERCH, orderMessage } from '@/lib/merch'
import { smsHref } from '@/lib/tow-fields'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Shirts & Hoodies — FINISHLINE Towing Merch',
    description:
      'Shirts and hoodies from Finish Line Towing in North Haverhill, New Hampshire. Text Josh to order — no checkout, no shipping forms.',
  }
}

/**
 * The merch page.
 *
 * A showcase with a text-to-order button, not a store. Nothing is sold here,
 * so there is no cart, no checkout and no shipping to configure — tapping an
 * item opens the customer's own messages with the item and a size prompt
 * already written, and Josh takes it from there.
 *
 * That is the honest shape right now: the designs are still with the designer
 * and there is no stock. A checkout would also hand a one-truck towing
 * business inventory, payments and refunds to run, which is a different job
 * from towing. Worth revisiting when there are boxes in the garage.
 */
export default async function MerchPage() {
  const settings = await getPublicFactorySettings()
  const phone = settings.companyPhone.trim()

  return (
    <div className="hs-page">
      <section className="hs-section hs-intro">
        <div className="hs-section-head">
          <h2>Shirts and hoodies</h2>
        </div>
        <p className="hs-intro-copy hs-intro-single">
          Same artwork that is on the truck. There is no checkout here on purpose — tap the item,
          it opens a text to Josh with the size prompt already in it, and he sorts the rest out
          with you. New designs are being drawn now, so this list will grow.
        </p>
      </section>

      <section className="hs-section">
        <ul className="mc-grid">
          {MERCH.map((item) => (
            <li key={item.slug} className="mc-card">
              <div className="mc-art">
                <Image
                  src={item.image ?? '/brand/placeholder.png'}
                  alt={item.image ? item.name : ''}
                  width={600}
                  height={600}
                  className={item.image ? undefined : 'mc-art-placeholder'}
                />
                {item.image ? null : <span className="mc-soon">Design in progress</span>}
              </div>
              <div className="mc-body">
                <h3>{item.name}</h3>
                <p>{item.blurb}</p>
                <p className="mc-sizes">{item.sizes}</p>
                {phone ? (
                  <a href={smsHref(phone, orderMessage(item.name))} className="mc-order">
                    Text to order
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="hs-section">
        <p className="hs-area-legal">
          Prices and what is in stock change, so Josh will tell you both when you text. Local
          pickup in North Haverhill, or work it out with him.
        </p>
      </section>
    </div>
  )
}
