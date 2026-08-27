/**
 * Body copy for the six service pages.
 *
 * Kept here rather than in the client JSON because the catalog is served from
 * the database now, so editing the JSON would need a re-apply before anything
 * changed on the site — and this is a one-client build, so there is nothing to
 * generalise for.
 *
 * Written to the build spec's constraints: short sentences, specific, and no
 * claims past what the research actually established. In particular there is
 * no interstate operating authority here, no invented pricing, and nothing
 * about buying junk cars for cash — the owner has not confirmed that.
 */

export type ServiceCopy = {
  lead: string
  sections: { heading: string; body: string }[]
}

export const SERVICE_COPY: Record<string, ServiceCopy> = {
  'flatbed-towing': {
    lead: 'One flatbed, owner-operated. Your car rides on the deck — all four wheels off the road, the whole way.',
    sections: [
      {
        heading: 'Why a flatbed and not a wheel-lift',
        body: 'A wheel-lift picks up one end and drags the other. That is fine for a lot of cars and wrong for plenty of others. On a flatbed nothing touches the pavement, so there is no second set of tires wearing flat, no driveshaft spinning on a dead transmission, and no low front end scraping every crown in the road between here and the shop.',
      },
      {
        heading: 'Low, all-wheel drive, or already damaged',
        body: 'These are the ones that get hurt on the wrong truck. All-wheel drive should not be towed with two wheels turning. Lowered cars catch their front lip on the approach angle. A car that has already been hit has panels that are not where the hooks expect them. The deck ramps down and the winch pulls it on flat, which solves all three.',
      },
      {
        heading: 'Strapped at the wheels',
        body: 'Straps go over the tires, not around the frame or the bumper. Chains on a frame mark it, and on a unibody car they bend what they grab. Josh loads and unloads the truck himself, so there is no handoff where that gets decided by somebody else.',
      },
    ],
  },

  'recovery-winch-outs': {
    lead: 'Off the road is not the same job as broken down. Recovery is getting it back to the pavement before anything else happens.',
    sections: [
      {
        heading: 'Ditches, shoulders, mud and snowbanks',
        body: 'Soft shoulder in mud season, a dirt road that let go in the rain, a slide into the bank in February — the car is usually undamaged and simply somewhere a tow truck cannot just hook and go. The winch does the work, at an angle that pulls it out the way it went in.',
      },
      {
        heading: 'Winched out, or winched out and loaded',
        body: 'Sometimes it comes out, you look it over, and you drive home. Sometimes it comes out and goes straight on the deck. That is a decision made at the scene once the car is somewhere safe to look at, not one you have to make correctly over the phone at eleven at night.',
      },
      {
        heading: 'Tell him what he is coming to',
        body: 'How far off the road, which way it is facing, whether it is on its wheels, and whether anyone is still in it. That decides what gets brought and how fast.',
      },
    ],
  },

  'roadside-assistance': {
    lead: 'Not every call needs the car on the truck. Some of them need ten minutes and the right tool.',
    sections: [
      {
        heading: 'Jump starts, lockouts, flat tires, fuel',
        body: 'A battery that died in a parking lot, keys shut in the car, a flat with a spare in the trunk, or a tank that ran further empty than the gauge admitted. These are the four that come up most, and none of them are a reason to pay for a tow.',
      },
      {
        heading: 'Cheaper than putting it on the deck',
        body: 'A roadside call costs less than a tow because it is less work and less time. If it turns out the problem is bigger than it looked, the truck is already there and the car goes on the deck instead — but it gets tried the cheap way first.',
      },
      {
        heading: 'Rates are quoted before he rolls',
        body: 'What it costs depends on distance and what is actually wrong. You will hear the number on the phone, not afterwards.',
      },
    ],
  },

  'motorcycle-towing': {
    lead: 'Bikes go on the flatbed upright, chocked and strapped soft. Nothing is chained and nothing is dragged.',
    sections: [
      {
        heading: 'Chock and soft straps',
        body: 'The front wheel sits in a chock so the bike stands on its own, and it is tied down with soft straps through the controls or the frame rather than hooks biting into paint and chrome. That is the difference between a bike arriving and a bike arriving with marks on it.',
      },
      {
        heading: 'Never chained by the frame',
        body: 'A chain around a motorcycle frame is how tanks get dented and bodywork gets cracked, and it is not how these go on the truck. Same rule as the cars: hold it by the parts built to be held.',
      },
      {
        heading: 'Down bikes and project bikes too',
        body: 'It does not have to run and it does not have to be whole. If it needs to move from a garage to a shop, or from a purchase to your garage, it moves the same way.',
      },
    ],
  },

  'hauling-transport': {
    lead: 'Scheduled vehicle moves — the ones you plan rather than the ones that happen to you.',
    sections: [
      {
        heading: 'Auction and dealer pickups',
        body: 'A car bought at auction or sitting at a dealer that needs to get to you, or to a shop. This is booked ahead rather than dispatched, so it is the kind of job the form is actually for.',
      },
      {
        heading: 'Project cars and vehicles that do not run',
        body: 'Something that has been in a barn or under a tarp and has not moved under its own power in years still loads onto a flatbed by winch. Tell him whether it rolls, whether it steers, and whether it has brakes — those three decide how long the load takes.',
      },
      {
        heading: 'Longer runs are quoted',
        body: 'Finish Line Towing is USDOT registered and active for motor vehicles and drive-away. Distance work is priced by the job and quoted before the truck rolls.',
      },
    ],
  },

  'junk-car-removal': {
    lead: 'The one that has been sitting in the yard since it stopped being worth fixing.',
    sections: [
      {
        heading: 'Off the lawn or out of the driveway',
        body: 'It does not need to run, hold air, or steer. Flat tires, no battery, grown into the grass — it winches onto the deck and it is gone the same visit.',
      },
      {
        heading: 'Have the year, make and condition ready',
        body: 'Those three things plus where it is parked are enough to tell you over the phone what is involved. Whether it is whole or has already been picked over matters too, so say so.',
      },
      {
        heading: 'Bring up the title when you call',
        body: 'Paperwork for a dead vehicle varies with how long it has been off the road and whose name is still on it. It is worth raising on the phone rather than discovering on the day.',
      },
    ],
  },
}
