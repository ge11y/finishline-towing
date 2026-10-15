/**
 * Town landing pages — New Hampshire only (the owner does not cover Vermont).
 * Copy is deliberately factual: roads and geography, no response times,
 * prices, or claims the owner has not made.
 */
export type Town = {
  slug: string
  name: string
  intro: string
  roads: string[]
  body: string
}

export const TOWNS: Town[] = [
  {
    slug: 'haverhill-nh',
    name: 'Haverhill',
    intro:
      'Finish Line Towing is based in the town of Haverhill, at 585 Benton Rd in North Haverhill. Towing, recovery and roadside help in Haverhill and on its surrounding roads, 24/7.',
    roads: ['NH-10', 'NH-25', 'US-302'],
    body:
      'Haverhill takes in several villages along the Connecticut River — Haverhill Corner, North Haverhill, Woodsville, Pike and Mountain Lakes. Wherever in town you are stuck, the call goes straight to Josh, the owner, not a dispatch center.',
  },
  {
    slug: 'north-haverhill-nh',
    name: 'North Haverhill',
    intro:
      'North Haverhill is home base — the truck is kept at 585 Benton Rd. Flatbed towing, winch-outs and roadside help around North Haverhill, 24/7.',
    roads: ['NH-10 (Dartmouth College Hwy)', 'NH-116', 'Benton Rd'],
    body:
      'Whether it is a no-start in a driveway, a car off the shoulder on NH-10, or a vehicle that needs to go to a local shop, call the day cell or, overnight, the pager.',
  },
  {
    slug: 'woodsville-nh',
    name: 'Woodsville',
    intro:
      'Towing and roadside help in Woodsville, a village of Haverhill, and on the surrounding roads, 24/7.',
    roads: ['US-302', 'NH-10', 'NH-135'],
    body:
      'Woodsville sits where US-302 and NH-10 meet near the Connecticut River. Breakdowns, lockouts, dead batteries and cars that need a flatbed to the shop — call and describe where you are.',
  },
  {
    slug: 'bath-nh',
    name: 'Bath',
    intro: 'Flatbed towing and recovery in Bath, NH and the surrounding roads, 24/7.',
    roads: ['US-302', 'NH-112'],
    body:
      'Bath is a short run up US-302 from Woodsville. Back roads here get soft in mud season and slick in winter — if you have slid off, ask about a winch-out.',
  },
  {
    slug: 'piermont-nh',
    name: 'Piermont',
    intro: 'Towing, winch-outs and roadside help in Piermont, NH, 24/7.',
    roads: ['NH-10', 'NH-25'],
    body:
      'Piermont lies south of Haverhill along NH-10 and the river. From a flat tire on the side of the road to a car that will not start, call with your location and vehicle.',
  },
  {
    slug: 'littleton-nh',
    name: 'Littleton',
    intro: 'Flatbed towing and roadside help in Littleton, NH and the surrounding roads, 24/7.',
    roads: ['I-93', 'US-302', 'NH-18', 'NH-116'],
    body:
      'Littleton is a longer run up US-302 from North Haverhill. Breakdowns on the main roads, no-starts in town, and vehicles that need to ride on a flatbed rather than be dragged.',
  },
  {
    slug: 'franconia-nh',
    name: 'Franconia',
    intro: 'Towing and recovery in Franconia, NH and the surrounding roads, 24/7.',
    roads: ['I-93', 'NH-18', 'NH-116', 'NH-117'],
    body:
      'Franconia covers mountain roads where winter driving can put a car in the ditch. Recovery and winch-outs, flatbed towing and roadside help — call the day cell or the night pager.',
  },
  {
    slug: 'lisbon-nh',
    name: 'Lisbon',
    intro: 'Towing, winch-outs and roadside help in Lisbon, NH, 24/7.',
    roads: ['US-302', 'NH-117'],
    body:
      'Lisbon runs along US-302 and the Ammonoosuc River between Bath and Littleton. Breakdowns, dead batteries, lockouts and flatbed towing to the shop of your choice.',
  },
  {
    slug: 'lincoln-nh',
    name: 'Lincoln',
    intro: 'Flatbed towing and roadside help in Lincoln, NH and the surrounding roads, 24/7.',
    roads: ['I-93', 'NH-112 (Kancamagus Hwy)', 'US-3'],
    body:
      'Lincoln is a longer run from North Haverhill. Visitors and locals alike — if your car is disabled in or around Lincoln, call and describe where you are and what you drive.',
  },
  {
    slug: 'plymouth-nh',
    name: 'Plymouth',
    intro: 'Towing and recovery in Plymouth, NH and the surrounding roads, 24/7.',
    roads: ['I-93', 'NH-25', 'US-3'],
    body:
      'Plymouth sits at the far end of NH-25 from Haverhill. For no-starts, accidents that need a flatbed, or a car off the road, call — longer runs are quoted before the truck rolls.',
  },
  {
    slug: 'lebanon-nh',
    name: 'Lebanon',
    intro: 'Flatbed towing and roadside help in Lebanon, NH and the surrounding roads, 24/7.',
    roads: ['I-89', 'NH-10', 'NH-120', 'US-4'],
    body:
      'Lebanon is a longer run south on NH-10. Breakdowns, lockouts, jump starts and vehicles that need to ride on a flatbed — longer runs are quoted before the truck rolls.',
  },
  {
    slug: 'hanover-nh',
    name: 'Hanover',
    intro: 'Towing and roadside help in Hanover, NH and the surrounding roads, 24/7.',
    roads: ['NH-10', 'NH-120'],
    body:
      'Hanover is reached straight down NH-10. Students, commuters and residents — if your car will not start or needs to go to a shop, call with your location.',
  },
]

export function getTown(slug: string) {
  return TOWNS.find((town) => town.slug === slug)
}
