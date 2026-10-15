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
    slug: "haverhill-nh",
    name: "Haverhill",
    intro:
      "Finish Line Towing is based in the town of Haverhill, at 585 Benton Rd in North Haverhill. Towing, recovery and roadside help across Haverhill — including the villages of North Haverhill, Woodsville, Haverhill Corner and Pike — 24/7.",
    roads: ["NH-10", "NH-25", "NH-116", "US-302"],
    body:
      "Haverhill stretches along the Connecticut River, with Woodsville at the junction of US-302 and NH-10 and North Haverhill on NH-10. Wherever in town you are stuck, the call goes straight to Josh, the owner, not a dispatch center.",
  },
  {
    slug: "sugar-hill-nh",
    name: "Sugar Hill",
    intro:
      "Flatbed towing, winch-outs and roadside help in Sugar Hill, NH and the surrounding roads, 24/7.",
    roads: ["NH-117", "NH-18"],
    body:
      "Sugar Hill sits on the hills between Lisbon and Franconia. Steep, winding roads here can put a car in the ditch in winter — call for a winch-out or a flatbed to the shop.",
  },
  {
    slug: "franconia-nh",
    name: "Franconia",
    intro:
      "Towing and recovery in Franconia, NH and the surrounding roads, 24/7.",
    roads: ["I-93", "NH-18", "NH-116", "NH-117"],
    body:
      "Franconia covers mountain roads and the approach to Franconia Notch. Recovery and winch-outs, flatbed towing and roadside help — call the day cell or the night pager.",
  },
  {
    slug: "bath-nh",
    name: "Bath",
    intro:
      "Flatbed towing and recovery in Bath, NH and the surrounding roads, 24/7.",
    roads: ["US-302", "NH-112"],
    body:
      "Bath is a short run up US-302 from Woodsville, with the village of Swiftwater out along NH-112. Back roads here get soft in mud season and slick in winter — if you have slid off, ask about a winch-out.",
  },
  {
    slug: "bethlehem-nh",
    name: "Bethlehem",
    intro:
      "Towing and roadside help in Bethlehem, NH and the surrounding roads, 24/7.",
    roads: ["US-302", "NH-142", "I-93"],
    body:
      "Bethlehem runs along US-302 east of Littleton. Breakdowns, dead batteries, lockouts and vehicles that need to ride on a flatbed rather than be dragged.",
  },
  {
    slug: "lisbon-nh",
    name: "Lisbon",
    intro:
      "Towing, winch-outs and roadside help in Lisbon, NH, 24/7.",
    roads: ["US-302", "NH-117"],
    body:
      "Lisbon runs along US-302 and the Ammonoosuc River between Bath and Littleton. Breakdowns, flat tires and flatbed towing to the shop of your choice.",
  },
  {
    slug: "piermont-nh",
    name: "Piermont",
    intro:
      "Towing, winch-outs and roadside help in Piermont, NH, 24/7.",
    roads: ["NH-10", "NH-25"],
    body:
      "Piermont lies south of Haverhill along NH-10 and the river. From a flat tire on the side of the road to a car that will not start, call with your location and vehicle.",
  },
  {
    slug: "benton-nh",
    name: "Benton",
    intro:
      "Flatbed towing and recovery in Benton, NH and the surrounding roads, 24/7.",
    roads: ["NH-116", "Benton Rd"],
    body:
      "Benton is a small, rural town in the shadow of Mount Moosilauke, right next door to North Haverhill. Dirt and back roads, ditches and soft shoulders — recovery and winch-outs are part of the job.",
  },
  {
    slug: "easton-nh",
    name: "Easton",
    intro:
      "Towing and roadside help in Easton, NH and the surrounding roads, 24/7.",
    roads: ["NH-116"],
    body:
      "Easton runs along NH-116 in the valley between Franconia and Benton. If you are broken down or off the road, call and describe where you are and what you drive.",
  },
  {
    slug: "monroe-nh",
    name: "Monroe",
    intro:
      "Towing, winch-outs and roadside help in Monroe, NH, 24/7.",
    roads: ["NH-135"],
    body:
      "Monroe sits on the Connecticut River along NH-135, north of Woodsville. No-starts, lockouts, jump starts and flatbed towing to the shop of your choice.",
  },
]

/** Former town pages, now folded into Haverhill or the service area. */
export const REMOVED_TOWN_REDIRECTS: Record<string, string> = {
  'woodsville-nh': '/towing/haverhill-nh',
  'north-haverhill-nh': '/towing/haverhill-nh',
  'littleton-nh': '/service-area',
  'lincoln-nh': '/service-area',
  'plymouth-nh': '/service-area',
  'lebanon-nh': '/service-area',
  'hanover-nh': '/service-area',
}

export function getTown(slug: string) {
  return TOWNS.find((town) => town.slug === slug)
}
