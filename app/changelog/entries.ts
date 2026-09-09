/**
 * What shipped, in the words a rider or a judge would use.
 *
 * Entries are written for riders and judges, not for the commit log: a change
 * says what changed for the person using Tatak, not which module moved. Dates
 * are the day the work shipped, in IST, which is the clock the app, its
 * operators and everyone testing it are on.
 *
 * Newest first, and one object per release, so a new release is one entry
 * added at the top of this array and nothing else edited.
 *
 * A release has no headline sentence. The page draws the list as the app's own
 * itinerary rail - a ring for the release, a dot for each change - and a
 * marketing line above a row of dots would be the one thing on the rail that
 * is not a stop. What identifies a release is its version and its date, which
 * the page prints as two chips beside the ring.
 *
 * A change `title` names the feature in a few words - six at the outside - the
 * way the app's own leg cards name a leg. It is not a slogan and not a
 * sentence: "Seat map for every coach class", never "Coaches you can actually
 * book". The `body` carries the facts, the numbers and the caveats, in one or
 * two plain sentences.
 *
 * Backticks inside a body mark a literal the app prints verbatim - a badge, a
 * stamp. The page renders those spans as <code>; nothing else in a body is
 * markup.
 */
export type Change = {
  /** A few words naming the feature, six at the outside. Never a slogan. */
  title: string;
  /** One or two plain sentences: what it does, and what it costs to believe. */
  body: string;
};

export type Release = {
  /**
   * How the date reads on the page. A release spanning several days is written
   * as a range ("2026-08-22 to 08-25"); the anchor takes the first date.
   */
  date: string;
  version?: string;
  changes: Change[];
};

/** The id a `/changelog/#2026-09-08` link points at: the leading ISO date. */
export const releaseAnchor = (release: Release) => release.date.slice(0, 10);

export const releases: Release[] = [
  {
    date: "2026-09-08",
    version: "Android 0.10.0-beta.1",
    changes: [
      {
        title: "Android download page",
        body: "Get it from tatak.tech/android. The APK is debug-signed, so Android warns about the developer; a published SHA-256 digest lets you check it.",
      },
      {
        title: "Five tabs on Android",
        body: "Home, Passes, Tickets, Live and Account, matching the web.",
      },
      {
        title: "Pass settles the fare",
        body: "A pass you hold now settles the fare when you scan a bus, or buy a metro ride inside a journey.",
      },
      {
        title: "Scanning a coach works again",
        body: "Karnataka coaches carry no tracker, and a missing position was being read as a broken answer.",
      },
      {
        title: "Maps off the edge network",
        body: "Maps draw off Carto's edge network rather than a server in Virginia, and stay cached between visits.",
      },
      {
        title: "Keyboards clear the form",
        body: "The keyboard no longer covers the fields you are typing into.",
      },
    ],
  },
  {
    date: "2026-09-07",
    changes: [
      {
        title: "Seat map for every coach class",
        body: "The seat map is drawn from each coach's own layout, so all fifteen classes reach the seat step. Thirteen of them used to stop there.",
      },
      {
        title: "Karnataka Sarige pass",
        body: "A day pass and a monthly pass for Sarige services.",
      },
      {
        title: "Metro pass at metro purchase",
        body: "A metro pass is now spent at a metro purchase, the way a bus pass already was.",
      },
      {
        title: "Fare for a scanned coach",
        body: "A scanned Sarige coach sells at its own fare, and you pick where you board and where you get off.",
      },
      {
        title: "All four services kept awake",
        body: "Each one is pinged every twenty minutes, so the day's first request is not an 8 to 19 second wake-up.",
      },
      {
        title: "One round trip at sign-in",
        body: "Responses are compressed, and the sign-in check is one database round trip instead of two across an ocean.",
      },
    ],
  },
  {
    date: "2026-09-06",
    changes: [
      {
        title: "Intercity corridors in one graph",
        body: "35 intercity corridors share one graph with the city, so a KSRTC coach and a BMTC bus are legs of one journey. Kundalahalli Gate to Hampi is four hops.",
      },
      {
        title: "Seat reservation flow",
        body: "Boarding point, seat map, passengers, review, booking. Cancelling names which berths go back on sale.",
      },
      {
        title: "Stands and stops told apart",
        body: "Search tells a city bus stop and an intercity stand apart, and shows Majestic once, wearing both networks' badges.",
      },
      {
        title: "Real coach departure times",
        body: "192 of 852 coach workings carry a departure read from the operator's own trip codes. The rest are marked as modelled.",
      },
    ],
  },
  {
    date: "2026-09-05",
    changes: [
      {
        title: "Sign-in on Android",
        body: "Android goes behind the same sign-in as the web, opening on a first-run sheet that says what Tatak is.",
      },
      {
        title: "Passes sell on Android",
        body: "The same purchase path the web uses.",
      },
      {
        title: "One-tap demo accounts",
        body: "A rider, a judges account, a student whose concession is verified, and a senior whose concession deliberately is not.",
      },
      {
        title: "Search suggests as you type",
        body: "It searches on Enter, instead of throwing you at a results page mid-word.",
      },
    ],
  },
  {
    date: "2026-09-04",
    version: "0.10.0-beta.1",
    changes: [
      {
        title: "Buying a pass takes a confirmation",
        body: "The price tile used to be the buy button: one tap spent up to Rs.6,750 with no confirmation.",
      },
      {
        title: "Passes gets its own tab",
        body: "That takes the bar to five, and the catalogue becomes scope rows with day, weekly or monthly chosen inside the row.",
      },
      {
        title: "What the account holds",
        body: "The account screen leads with what it holds, against what it does not: no IP address, no device fingerprint, no analytics, no record of your searches.",
      },
      {
        title: "Buy a bus ticket",
        body: "\"Board a bus\" was the old wording, and it described the bus rather than the purchase.",
      },
      {
        title: "Sign-in survives a release",
        body: "Accounts live in a hosted database now, so a deploy no longer signs everybody out.",
      },
    ],
  },
  {
    date: "2026-09-02",
    changes: [
      {
        title: "An interchange is a step",
        body: "A change between two lines is drawn as a step with its own walk, not a hidden fee.",
      },
      {
        title: "Step-free access on stop detail",
        body: "Metro step-free is real for 76 of 83 stations, from OpenStreetMap, badged `REAL - OSM`; the rest say `SYNTHETIC ACCESS DATA - NOT SURVEYED`.",
      },
      {
        title: "Kannada mode, held back",
        body: "Kannada mode is built, and the toggle stays off screen until every interface string has a reviewed Kannada form.",
      },
      {
        title: "Metro ticket over ONDC",
        body: "Buying a metro ticket in advance places a real ONDC order.",
      },
    ],
  },
  {
    date: "2026-08-27",
    changes: [
      {
        title: "Carbon on the ticket",
        body: "What a journey did not put into the air, in kilograms to two decimals, frozen onto the ticket, with an Impact view by month and by mode. Every factor is published, and each choice between two defensible numbers takes the smaller.",
      },
      {
        title: "Name the route yourself",
        body: "Where BMTC has no duty on file for the bus you scanned, name the route yourself instead of being stuck.",
      },
      {
        title: "Bus legs timed from schedule",
        body: "A bus leg is timed from its own schedule, not a flat citywide speed.",
      },
      {
        title: "Two rider servers kept awake",
        body: "The two servers a rider actually waits on no longer sleep between visits.",
      },
    ],
  },
  {
    date: "2026-08-22 to 08-25",
    changes: [
      {
        title: "An account for your tickets",
        body: "Tickets outlive a browser now. Signing in claims the specimens already on the phone.",
      },
      {
        title: "Nine tools over MCP",
        body: "Nine read-only tools an AI assistant can call: plan a journey, next departures, plan to the airport, what is reachable within a time, when to leave to arrive by nine.",
      },
      {
        title: "Pass and driving comparison",
        body: "Journey detail says whether a day pass would have beaten paying ride by ride, and roughly what the journey saved against driving.",
      },
      {
        title: "Step-free journey search",
        body: "Ask for step-free journeys, and be told what the answer is worth: the walk at either end is not covered.",
      },
      {
        title: "Live gets its own tab",
        body: "What is moving around you now, and how full it is. Disruptions are attached to the journey they disrupt.",
      },
      {
        title: "The Metro door",
        body: "It opens on a station you can walk to, sells a ticket, and says when the next train is.",
      },
    ],
  },
  {
    date: "2026-08-18 to 08-20",
    changes: [
      {
        title: "Scan the sticker on the bus",
        body: "Or type its code: hub letters, five digits, a check character. The app resolves it to the duty that bus is running.",
      },
      {
        title: "Destination, fare, ticket",
        body: "In that order, with an honest refusal if the fare cannot be stood behind.",
      },
      {
        title: "Live vehicle positions",
        body: "On the stop board and on an itinerary leg, counted in stops and seconds, never in minutes.",
      },
      {
        title: "Airport screen answers with journeys",
        body: "It asks where you are going, in place of a directory of eleven corridors.",
      },
      {
        title: "Offline Android flavour",
        body: "A build carrying its own transit engine.",
      },
    ],
  },
  {
    date: "2026-08-08",
    version: "0.9.0-beta.1",
    changes: [
      {
        title: "Sampige Akka arrives",
        body: "A BMTC conductor from Shivajinagara depot. She appears at empty, loading, error and success, never on a board you are reading.",
      },
      {
        title: "Four honest states on stop detail",
        body: "Soon, later, estimate, finished, and nothing else. Metro shows its published frequency, never a fake clock time.",
      },
      {
        title: "Ticket validity countdown",
        body: "Tickets became physical objects with a live countdown, fixing a bug where a ticket never flipped to expired on screen.",
      },
    ],
  },
  {
    date: "2026-08-05 to 08-07",
    version: "0.1.0 to 0.8.0-beta.6",
    changes: [
      {
        title: "Buses and metro in one search",
        body: "BMTC buses and Namma Metro on real published departures. Six ranked options tagged fastest, cheapest and fewest changes, every leg priced.",
      },
      {
        title: "Address to address",
        body: "A 36,000-place index, with the walk at each end costed honestly rather than snapped away.",
      },
      {
        title: "Thin service warnings",
        body: "Trips per day, last departures, and alternatives on the same hop.",
      },
      {
        title: "Metro topology from OpenStreetMap",
        body: "The vendor data had a six-station run reversed and four stations missing. Challaghatta to Whitefield fell from a 104-minute zigzag to the right 77-minute single ride.",
      },
      {
        title: "The first Android app",
        body: "A native Kotlin Android app, rebuilt over six beta rounds into a hub with universal search and midnight-honest departures.",
      },
    ],
  },
];
