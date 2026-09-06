"use client";

import { SiteFooter, SiteHeader, publicAsset, useRevealAnimations } from "../site-chrome";

// Ten more classes below `src/intercity/classes.ts` originally carried. The
// source is the operator's own booking pages: `docs/research/sources/ksrtc-*.tsv`,
// eleven corridor pages the owner pulled from ksrtc.in, 490 services and 339
// trip codes across five corridors and both directions, plus
// `docs/research/ksrtc-domain-research.md` and
// `docs/research/karnataka-corridor-evidence.md` for what the TSVs alone
// don't say (chassis, brand history, the Shakti exclusion list). Four of the
// ten - Ashwamedha, Non-AC Sleeper, Ambaari Dream Class, Airavat Club Class
// 2.0 - already have a `src/intercity/classes.ts` entry built from the same
// evidence, and this page reads their fields from there. The other six - EV
// Power Plus, Flybus, Kalyana Ratha, Amoghavarsha, AC Seater Executive Chair
// and a plain AC Sleeper - are not modelled in the codebase yet, so this page
// carries them straight from the TSVs and research notes and says so in the
// fare cell rather than inventing a multiplier the codebase doesn't have.
//
// The original six coach classes are still `src/intercity/classes.ts`
// (names, air conditioning, layout, reservation, fare multiplier, senior
// basis, Shakti) with Ambaari Utsav from the fleet simulator's
// `src/fleet/serviceClass.ts`, which is the only class table that carries
// it - though Ambaari Utsav's fare multiplier below is now read from
// `classes.ts` too, which has since caught up with a real number (3.14)
// where this page previously said none existed. The bus tiers and the metro
// fares are `src/city/bengaluru.ts` (`SERVICE_TIER_PREFIXES`, `BUS_FARES`,
// `NAMMA_METRO_FARES`).
const coachClasses = [
  {
    id: "karnataka-sarige",
    name: "Karnataka Sarige",
    coach: "Non-AC 3+2 seater, non-reclining. 62 seats.",
    boarding: "Walk-up",
    walkUp: true,
    fare: "1.0",
    senior: "25%",
    shakti: "Yes",
  },
  {
    id: "ashwamedha",
    name: "Ashwamedha (Point to Point Express)",
    coach: "Non-AC 3+2 seater, non-reclining, carried from the Ashwamedha Classic Class research entry - a sibling product under the same brand, not a confirmed match for this “point to point express” variant.",
    boarding: "Reserved",
    walkUp: false,
    fare: "1.0",
    senior: "25%",
    shakti: "Yes",
  },
  {
    id: "rajahamsa-executive",
    name: "Rajahamsa Executive",
    coach: "Non-AC 2+2 seater, reclining. 45 seats.",
    boarding: "Reserved",
    walkUp: false,
    fare: "1.35",
    senior: "25%",
    shakti: "No",
  },
  {
    id: "ev-power-plus",
    name: "EV Power Plus",
    coach: "AC seater, electric bus platform. The operator's own listing says “AC seater” and nothing more; no source gives a seat count or layout.",
    boarding: "Reserved",
    walkUp: false,
    fare: "Not modelled",
    senior: "Unresolved",
    shakti: "No",
  },
  {
    id: "ac-seater-executive-chair",
    name: "AC Seater Executive Chair",
    coach: "AC seater. Two services, both Bengaluru-Hosapete; no source beyond the operator's own class name describes the coach further.",
    boarding: "Reserved",
    walkUp: false,
    fare: "Not modelled",
    senior: "Unresolved",
    shakti: "No",
  },
  {
    id: "pallakki",
    name: "Pallakki non-AC sleeper",
    coach: "Non-AC 2+1 sleeper, 30 berths.",
    boarding: "Reserved",
    walkUp: false,
    fare: "1.55",
    senior: "Unresolved",
    shakti: "No",
  },
  {
    id: "non-ac-sleeper",
    name: "Non-AC Sleeper",
    coach: "Non-AC 2+1 sleeper. Nothing in the operator's own listing distinguishes this coach from Pallakki's - same page, same pair, same day, sold as a separate line item anyway.",
    boarding: "Reserved",
    walkUp: false,
    fare: "2.09",
    senior: "Unresolved",
    shakti: "No",
  },
  {
    id: "amoghavarsha",
    name: "Amoghavarsha (Non-AC Sleeper)",
    coach: "Non-AC 2+1 sleeper. An older KSRTC brand name for the same tier as Pallakki and Non-AC Sleeper, still sold as a live class on some routes.",
    boarding: "Reserved",
    walkUp: false,
    fare: "Not modelled",
    senior: "Unresolved",
    shakti: "No",
  },
  {
    id: "airavat",
    name: "Airavat",
    coach: "AC 2+2 semi-sleeper. 41 seats.",
    boarding: "Reserved",
    walkUp: false,
    fare: "2.0",
    senior: "Not eligible",
    shakti: "No",
  },
  {
    id: "airavat-club-class",
    name: "Airavat Club Class",
    coach: "AC 2+2 semi-sleeper, multi-axle. 53 seats.",
    boarding: "Reserved",
    walkUp: false,
    fare: "2.3",
    senior: "Not eligible",
    shakti: "No",
  },
  {
    id: "airavat-club-class-2",
    name: "Airavat Club Class 2.0",
    coach: "AC 2+2 semi-sleeper, multi-axle, sold alongside plain Airavat Club Class on the same pair and day. Nothing beyond that listing says what the “2.0” changes; layout is carried from Airavat Club Class.",
    boarding: "Reserved",
    walkUp: false,
    fare: "2.62",
    senior: "Not eligible",
    shakti: "No",
  },
  {
    id: "ac-sleeper",
    name: "AC Sleeper",
    coach: "AC sleeper, unbranded. One service, Bengaluru-Mysuru, priced at 480 rupees - Karnataka Sarige's fare on other corridors, an odd price for a class calling itself a sleeper. No further coach detail is sourced.",
    boarding: "Reserved",
    walkUp: false,
    fare: "Not modelled",
    senior: "Unresolved",
    shakti: "No",
  },
  {
    id: "kalyana-ratha",
    name: "Kalyana Ratha (AC Sleeper)",
    coach: "AC 2+1 sleeper, per the research's own account of it as KKRTC's branding of the Ambaari Utsav tier under a separate name. One service observed, Bengaluru-Hosapete; nothing in that listing confirms the berth count.",
    boarding: "Reserved",
    walkUp: false,
    fare: "Not modelled",
    senior: "Unresolved",
    shakti: "No",
  },
  {
    id: "ambaari-dream-class",
    name: "Ambaari Dream Class",
    coach: "AC 2+1 sleeper, multi-axle (Volvo B11R).",
    boarding: "Reserved",
    walkUp: false,
    fare: "2.93",
    senior: "Not eligible",
    shakti: "No",
  },
  {
    id: "ambaari-utsav",
    name: "Ambaari Utsav",
    coach: "AC 2+1 sleeper, 40 berths. KSRTC only - KKRTC runs the same coach under its own name, Kalyana Ratha.",
    boarding: "Reserved",
    walkUp: false,
    fare: "3.14",
    senior: "Not eligible",
    shakti: "No",
  },
  {
    id: "flybus",
    name: "Flybus",
    coach: "AC seater, Volvo B11-R multi-axle, with on-board urinals per the operator's own route description. One pair sourced here (Mysuru-Madikeri, both ways); research also places it connecting Bengaluru's airport to Mysuru, Madikeri, Coimbatore and Kundapura, not confirmed in this corpus.",
    boarding: "Reserved",
    walkUp: false,
    fare: "Not modelled",
    senior: "Unresolved",
    shakti: "No",
  },
];

// The four buses drawn in the intro, in the order the page discusses them:
// the two walk-up services first, then the two air conditioned ones.
const fleetLineup = [
  {
    id: "bmtc-bengaluru-sarige",
    name: "Bengaluru Sarige",
    detail: "BMTC ordinary, walk-up",
    alt: "A blue BMTC Bengaluru Sarige city bus in side profile",
  },
  {
    id: "ksrtc-karnataka-sarige",
    name: "Karnataka Sarige",
    detail: "KSRTC intercity, walk-up",
    alt: "A red and silver KSRTC Karnataka Sarige intercity bus in side profile",
  },
  {
    id: "bmtc-vajra-volvo",
    name: "Vajra",
    detail: "BMTC air conditioned Volvo",
    alt: "A deep red BMTC Vajra Volvo air conditioned city bus in side profile",
  },
  {
    id: "nwkrtc-airavat-gold-class",
    name: "Airavat Gold Class",
    detail: "NWKRTC air conditioned coach, reserved",
    alt: "A yellow NWKRTC Airavat Gold Class coach with a blue wave along its flank, in side profile",
  },
];

const busTiers = [
  {
    id: "ordinary",
    name: "Ordinary",
    prefix: "No prefix",
    pricing: "Stage fare, where a stage is roughly 2 km.",
    floor: "₹6",
    ceiling: "₹30",
  },
  {
    id: "vajra",
    name: "Vajra, the AC service",
    prefix: "V- and VW-",
    pricing: "The same stage structure at roughly double the price at every step.",
    floor: "₹12",
    ceiling: "₹60",
  },
  {
    id: "vayu-vajra",
    name: "Vayu Vajra, the airport coach",
    prefix: "KIA-",
    pricing: "Priced by distance at about ₹10 per km, not by stage.",
    floor: "₹100",
    ceiling: "₹400",
  },
];

export function FleetPage() {
  useRevealAnimations();

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <SiteHeader />

      <section className="fleet-page route-section" id="main-content" aria-labelledby="fleet-title">
        <header className="section-intro compact fleet-intro" data-reveal>
          <div className="section-label"><span>01</span> Fleet</div>
          <div className="fleet-intro-copy">
            <h1 id="fleet-title">Fleet types we support</h1>
            <p>Tatak plans over three tiers of BMTC city bus, three Namma Metro lines and sixteen intercity coach classes. Whether you can simply get on and pay is decided by the service class, not by the operator on the livery: only some of these are sold by the seat.</p>
          </div>
          {/* Side-profile illustrations at one scale, 100 units to the
              metre, drawn from Wikimedia Commons reference photographs of
              each bus. Fronts align on the left, so the lengths and floor
              heights read as a fleet lineup rather than four separate
              pictures. */}
          <ul className="fleet-lineup">
            {fleetLineup.map((bus) => (
              <li key={bus.id}>
                <img src={publicAsset(`/fleet/${bus.id}.svg`)} alt={bus.alt} width="1300" height="400" loading="lazy" />
                <p>{bus.name} <span>{bus.detail}</span></p>
              </li>
            ))}
          </ul>
        </header>

        <h2 className="page-subhead" data-reveal>BMTC city buses</h2>
        <p className="fleet-copy" data-reveal>BMTC tiers are read off the route short name in the feed, which is where the network already encodes them. Ordinary and Vajra share one fare shape and differ by a factor of two. The airport coach does not: it is priced by distance rather than by stage, because a run to Kempegowda International is a different product from a ride across town. Majestic to the airport is about 35 km of road and lands around ₹300 to ₹350.</p>

        <div className="fleet-table-wrap" data-reveal>
          <table className="fleet-table">
            <caption>The three BMTC service tiers</caption>
            <thead>
              <tr>
                <th scope="col">Tier</th>
                <th scope="col">Route prefix</th>
                <th scope="col">How it is priced</th>
                <th scope="col">Floor</th>
                <th scope="col">Ceiling</th>
              </tr>
            </thead>
            <tbody>
              {busTiers.map((tier) => (
                <tr key={tier.id}>
                  <th scope="row">{tier.name}</th>
                  <td><code>{tier.prefix}</code></td>
                  <td>{tier.pricing}</td>
                  <td>{tier.floor}</td>
                  <td>{tier.ceiling}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fleet-note" data-reveal>Bus fares are computed from distance rather than from stop count. On limited-stop routes consecutive stops can sit several kilometres apart, so counting stops would underprice a long express hop.</p>

        <h2 className="page-subhead" data-reveal>Reserved or walk-up</h2>
        <p className="fleet-copy" data-reveal>Karnataka Sarige is run by KSRTC, NWKRTC and KKRTC, the same three corporations that run Airavat and Pallakki, and it is boarded exactly like a BMTC bus: you get on, you pay, there is no seat with your name against it. The other fifteen coach classes are numbered-seat products that cannot be boarded without a prior transaction - Ashwamedha included, even though its own fare says it is priced like the walk-up class next to it. The split therefore cuts across the operators rather than along them, and Tatak keys the boarding gate to the service class and never to the corporation. The app&apos;s own spec says why in as many words: gating by operator &ldquo;would block a plain mofussil bus from ever appearing as a walk-up option&rdquo;.</p>
        <p className="fleet-copy" data-reveal>One row below is walk-up. Read the table down that column first, and the rest of it makes sense.</p>

        <div className="fleet-table-wrap" data-reveal>
          <table className="fleet-table">
            <caption>The sixteen intercity coach classes</caption>
            <thead>
              <tr>
                <th scope="col">Class</th>
                <th scope="col">Coach</th>
                <th scope="col">Boarding</th>
                <th scope="col">Fare</th>
                <th scope="col">Senior</th>
                <th scope="col">Shakti</th>
              </tr>
            </thead>
            <tbody>
              {coachClasses.map((coachClass) => (
                <tr key={coachClass.id}>
                  <th scope="row">{coachClass.name}</th>
                  <td>{coachClass.coach}</td>
                  <td>
                    <span className={`fleet-tag ${coachClass.walkUp ? "is-walk-up" : ""}`.trim()}>
                      {coachClass.boarding}
                    </span>
                  </td>
                  <td>{coachClass.fare}</td>
                  <td>{coachClass.senior}</td>
                  <td>{coachClass.shakti}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fleet-note" data-reveal>The fare column is still Tatak&apos;s own multiplier over the same corridor&apos;s ordinary-class fare, and for most rows it is still illustrative rather than published - the app&apos;s source file says so where it defines it. What changed is everything the multiplier used to stand in for: KSRTC&apos;s own booking pages now give a published rupee fare for every one of these sixteen classes, on real point pairs, across 490 services and 339 trip codes over five corridors and both directions. Six classes below - EV Power Plus, Flybus, Kalyana Ratha, Amoghavarsha, AC Seater Executive Chair and the plain AC Sleeper - have no multiplier in the codebase at all yet, so their fare cell says &ldquo;Not modelled&rdquo; rather than backing one out of a single observed fare. Ambaari Utsav is no longer one of them: its old &ldquo;not modelled&rdquo; reading is gone from the source file, replaced with 3.14, from 1508 rupees Bengaluru to Mangaluru over Karnataka Sarige&apos;s 480 on the same page.</p>

        <h2 className="page-subhead" data-reveal>What the published fares settle</h2>
        <p className="fleet-copy" data-reveal>One relationship in the corpus is exact rather than approximate. On four of the corridors where Ashwamedha and Karnataka Sarige both run - Bengaluru-Chikkamagaluru, Mysuru-Madikeri, Mysuru-Mangaluru and Bengaluru-Mangaluru - Ashwamedha&apos;s published fare equals Sarige&apos;s rupee for rupee: 343, 166, 338, 480. On the fifth, Bengaluru-Udupi, Ashwamedha&apos;s fares run 552 to 555 against Sarige&apos;s flat 555, close enough to read as the same rule with a few rupees of scatter. A &ldquo;point to point express&rdquo; priced the same as the ordinary bus is a fact about what Ashwamedha actually is, and it is why its own multiplier below is 1, the same as Sarige&apos;s.</p>
        <p className="fleet-copy" data-reveal>The other finding is why Tatak prices by point pair rather than by distance. Trip code <code>2131BNGMNG</code> - one coach, one departure, sold on four different corridor pages - carries four different fares: 612 rupees Bengaluru to Mysuru, 569 Mysuru to Madikeri, 952 Mysuru to Mangaluru, and 1190 Bengaluru to Madikeri. Fourteen trip codes in this corpus do the same thing across four or more pairs. A single number keyed to distance cannot produce that; a table keyed to the pair can, which is the table Tatak already builds.</p>
        <p className="fleet-note" data-reveal>The evidence behind these fares is not even, and the table above says so where it can rather than smoothing it out. Airavat Club Class is the best-attested class in the corpus - 120 of the 490 services, sold on every corridor but Dandeli. Kalyana Ratha and AC Seater Executive Chair sit at the other end: one service and two, both on Bengaluru-Hosapete, and nothing beyond those listings describes either coach further.</p>

        <h2 className="page-subhead" data-reveal>Two rules riders find out at the counter</h2>
        <ul className="note-list" data-reveal>
          <li><strong>Shakti free travel reaches Karnataka Sarige and Ashwamedha, and nothing else.</strong> The scheme covers ordinary and express service, and Ashwamedha&apos;s own name carries the word &ldquo;express&rdquo; - a textual match, not an inference from its price. A woman boarding a Rajahamsa, an Airavat, a Pallakki, an Ambaari or any of the other fourteen classes pays the full fare. It is a rule about the class of coach, not about the corporation running it or the person boarding.</li>
          <li><strong>The senior concession is 25 per cent, up to Rajahamsa.</strong> It applies on Karnataka Sarige, Rajahamsa Executive and Ashwamedha - priced at the ordinary floor, Ashwamedha sits squarely inside &ldquo;Rajahamsa and lower&rdquo; even though its own name says &ldquo;express&rdquo;. A source places Airavat, Airavat Club Class, Airavat Club Class 2.0, Ambaari Dream Class and Ambaari Utsav above the concession&apos;s stated ceiling. Pallakki and Non-AC Sleeper are the open case: nothing puts a non-AC sleeper inside that ceiling or outside it, so Tatak publishes no rate for either rather than picking one, and the newer classes with no independent source of their own - EV Power Plus, Flybus, Kalyana Ratha, Amoghavarsha, AC Seater Executive Chair, the plain AC Sleeper - inherit the same open case rather than a guess built off price alone. An unresolved cell and an ineligible cell are different facts, and the app keeps them apart.</li>
        </ul>

        <h2 className="page-subhead" data-reveal>Namma Metro</h2>
        <div className="mcp-panel" data-reveal>
          <div className="mcp-field">
            <span>Lines</span>
            <p>Purple, Green and Yellow. Station order comes from OpenStreetMap route relations rather than from a vendor map, because a map drawn for display is not a map you can route over.</p>
          </div>
          <div className="mcp-field">
            <span>Pricing</span>
            <p>By fare zone, not by distance. The fare rises with the number of zones a journey spans, which is the shape BMRCL&apos;s own slabs take.</p>
          </div>
          <div className="mcp-field">
            <span>Range</span>
            <div>
              <code>₹10 to ₹90</code>
              <p>A floor of ₹10 for any journey and a ceiling of ₹90 across the widest zone span, in steps of ₹10.</p>
            </div>
          </div>
          <div className="mcp-field">
            <span>Boarding</span>
            <p>Walk-up, like an ordinary bus. Nothing on the metro is sold by seat, and the Shakti scheme does not apply to metro fares at all.</p>
          </div>
        </div>

        <a className="contact-back" href={publicAsset("/")}><span aria-hidden="true">←</span> Back to Tatak</a>
      </section>

      <SiteFooter />
    </main>
  );
}
