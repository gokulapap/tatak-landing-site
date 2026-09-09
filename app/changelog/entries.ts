/**
 * What shipped, in the words a rider or a judge would use.
 *
 * Entries are written for riders and judges, not for the commit log: a bullet
 * says what changed for the person using Tatak, not which module moved. Dates
 * are the day the work shipped, in IST, which is the clock the app, its
 * operators and everyone testing it are on.
 *
 * Newest first, and one object per release, so a new release is one entry
 * added at the top of this array and nothing else edited.
 *
 * Headlines are stored exactly as they were written. Where a release carries a
 * version, the version is lifted into its own field so the page can print it
 * beside the date instead of burying it in the heading, which is why a few
 * headlines read as the second half of a sentence.
 *
 * Backticks inside a bullet mark a literal the app prints verbatim - a badge,
 * a stamp. The page renders those spans as <code>; nothing else in a bullet is
 * markup.
 */
export type Release = {
  /**
   * How the date reads on the page. A release spanning several days is written
   * as a range ("2026-08-22 to 08-25"); the anchor takes the first date.
   */
  date: string;
  version?: string;
  headline: string;
  bullets: string[];
};

/** The id a `/changelog/#2026-09-08` link points at: the leading ISO date. */
export const releaseAnchor = (release: Release) => release.date.slice(0, 10);

export const releases: Release[] = [
  {
    date: "2026-09-08",
    version: "Android 0.10.0-beta.1",
    headline: "the native app catches up with the web",
    bullets: [
      "Get it from tatak.tech/android. The APK is debug-signed, so Android warns about the developer; a published SHA-256 digest lets you check it.",
      "Five tabs, matching the web: Home, Passes, Tickets, Live, Account.",
      "A pass you hold now settles the fare when you scan a bus, or buy a metro ride inside a journey.",
      "Scanning a Karnataka coach works again: those coaches carry no tracker, and a missing position was read as a broken answer.",
      "Maps draw off Carto's edge network rather than a server in Virginia, and stay cached between visits. Keyboards stop covering the forms under them.",
    ],
  },
  {
    date: "2026-09-07",
    headline: "Coaches you can actually book, on a server that is awake",
    bullets: [
      "The seat map is drawn from each coach's own layout, so all fifteen classes reach the seat step. Thirteen of them used to stop there.",
      "A Karnataka Sarige pass, day and monthly. A metro pass is now spent at a metro purchase, the way a bus pass already was.",
      "A scanned Sarige coach sells at its own fare, and you pick where you board and where you get off.",
      "All four services are pinged every twenty minutes, so the day's first request is not an 8 to 19 second wake-up.",
      "Responses are compressed, and the sign-in check is one database round trip instead of two across an ocean.",
    ],
  },
  {
    date: "2026-09-06",
    headline: "Karnataka, not just Bengaluru",
    bullets: [
      "35 intercity corridors share one graph with the city, so a KSRTC coach and a BMTC bus are legs of one journey. Kundalahalli Gate to Hampi is four hops.",
      "Reserving a seat: boarding point, seat map, passengers, review, booking. Cancelling names which berths go back on sale.",
      "Search tells a city bus stop and an intercity stand apart, and shows Majestic once, wearing both networks' badges.",
      "192 of 852 coach workings carry a departure read from the operator's own trip codes. The rest are marked as modelled.",
    ],
  },
  {
    date: "2026-09-05",
    headline: "The phone asks who you are",
    bullets: [
      "Android goes behind the same sign-in as the web, opening on a first-run sheet that says what Tatak is.",
      "Passes sell on Android, over the path the web uses.",
      "One-tap demo sign-in: a rider, a judges account, a student whose concession is verified, and a senior whose concession deliberately is not.",
      "Search suggests as you type and searches on Enter, instead of throwing you at a results page mid-word.",
    ],
  },
  {
    date: "2026-09-04",
    version: "0.10.0-beta.1",
    headline: "the premium round (web)",
    bullets: [
      "Buying a pass is a deliberate act. The price tile used to be the buy button: one tap spent up to Rs.6,750 with no confirmation.",
      "Passes gets a tab, taking the bar to five, and the catalogue becomes scope rows with day, weekly or monthly chosen inside the row.",
      "The account screen leads with what it holds, against what it does not: no IP address, no device fingerprint, no analytics, no record of your searches.",
      "\"Board a bus\" becomes \"Buy a bus ticket\", and signing in survives a release now that accounts live in a hosted database.",
    ],
  },
  {
    date: "2026-09-02",
    headline: "Five features after the Top 250 call",
    bullets: [
      "A change between two lines is drawn as a step with its own walk, not a hidden fee.",
      "Accessibility on stop and station detail. Metro step-free is real for 76 of 83 stations, from OpenStreetMap, badged `REAL - OSM`; the rest say `SYNTHETIC ACCESS DATA - NOT SURVEYED`.",
      "Kannada mode is built, and the toggle stays off screen until every interface string has a reviewed Kannada form.",
      "Buying a metro ticket in advance places a real ONDC order.",
    ],
  },
  {
    date: "2026-08-27",
    headline: "Carbon, and a demo that stays awake",
    bullets: [
      "What a journey did not put into the air, in kilograms to two decimals, frozen onto the ticket, with an Impact view by month and by mode. Every factor is published, and each choice between two defensible numbers takes the smaller.",
      "Where BMTC has no duty on file for the bus you scanned, name the route yourself instead of being stuck.",
      "A bus leg is timed from its own schedule, not a flat citywide speed, and the two rider-facing servers are kept awake.",
    ],
  },
  {
    date: "2026-08-22 to 08-25",
    headline: "Accounts, assistants, step-free journeys, the Metro door",
    bullets: [
      "An account, so tickets outlive a browser. Signing in claims the specimens already on the phone.",
      "Nine read-only tools an AI assistant can call over MCP: plan a journey, next departures, plan to the airport, what is reachable within a time, when to leave to arrive by nine.",
      "Journey detail says whether a day pass would have beaten paying ride by ride, and roughly what the journey saved against driving.",
      "Ask for step-free journeys, and be told what the answer is worth: the walk at either end is not covered.",
      "Live becomes its own tab: what is moving around you now, and how full it is. Disruptions are attached to the journey they disrupt.",
      "The Metro door opens on a station you can walk to, sells a ticket, and says when the next train is.",
    ],
  },
  {
    date: "2026-08-18 to 08-20",
    headline: "Buy a ticket for the bus you are standing on",
    bullets: [
      "Scan the sticker on the bus, or type its code: hub letters, five digits, a check character. The app resolves it to the duty that bus is running.",
      "Destination, then fare, then a ticket, with an honest refusal if the fare cannot be stood behind.",
      "Live vehicle positions on the stop board and on an itinerary leg, counted in stops and seconds, never in minutes.",
      "The airport screen asks where you are going and answers with journeys, in place of a directory of eleven corridors.",
      "An offline Android flavour carrying its own transit engine.",
    ],
  },
  {
    date: "2026-08-08",
    version: "0.9.0-beta.1",
    headline: "the v2 redesign",
    bullets: [
      "Sampige Akka joins: a BMTC conductor from Shivajinagara depot. She appears at empty, loading, error and success, never on a board you are reading.",
      "Stop detail says exactly four honest things: soon, later, estimate, finished. Metro shows its published frequency, never a fake clock time.",
      "Tickets became physical objects with a live validity countdown, fixing a bug where a ticket never flipped to expired on screen.",
    ],
  },
  {
    date: "2026-08-05 to 08-07",
    version: "0.1.0 to 0.8.0-beta.6",
    headline: "the first app",
    bullets: [
      "BMTC buses and Namma Metro in one search, on real published departures. Six ranked options tagged fastest, cheapest and fewest changes, every leg priced.",
      "Address to address over a 36,000-place index, with the walk at each end costed honestly rather than snapped away.",
      "Trips per day, last departures, thin-service warnings and alternatives on the same hop.",
      "Metro topology rebuilt from OpenStreetMap: the vendor data had a six-station run reversed and four stations missing. Challaghatta to Whitefield fell from a 104-minute zigzag to the right 77-minute single ride.",
      "A native Kotlin Android app, rebuilt over six beta rounds into a hub with universal search and midnight-honest departures.",
    ],
  },
];
