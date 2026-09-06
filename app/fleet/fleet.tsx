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
/* Split by network, because each pair now sits with the section that
   describes it rather than in one lineup at the top. */
const cityFleet = [
  {
    id: "bmtc-bengaluru-sarige",
    name: "Bengaluru Sarige",
    detail: "BMTC ordinary",
    alt: "A blue BMTC Bengaluru Sarige city bus seen from the front and door side",
  },
  {
    id: "bmtc-vajra-volvo",
    name: "Vajra",
    detail: "BMTC air conditioned Volvo",
    alt: "A deep red BMTC Vajra Volvo air conditioned city bus seen from the front and door side",
  },
];

const intercityFleet = [
  {
    id: "ksrtc-karnataka-sarige",
    name: "Karnataka Sarige",
    detail: "KSRTC inter-city, unreserved",
    alt: "A red and silver KSRTC Karnataka Sarige intercity bus seen from the front and door side",
  },
  {
    id: "nwkrtc-airavat-gold-class",
    name: "Airavat Gold Class",
    detail: "NWKRTC air conditioned coach, reserved",
    alt: "A yellow NWKRTC Airavat Gold Class coach with a blue wave along its flank, seen from the front and door side",
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
        <header className="section-intro compact" data-reveal>
          <div className="section-label"><span>01</span> Fleet</div>
          <h1 id="fleet-title">Fleet types we support</h1>
          <p>Tatak plans over three tiers of BMTC city bus, three Namma Metro lines and sixteen intercity coach classes. Whether you can simply get on and pay is decided by the service class, not by the operator on the livery: only some of these are sold by the seat.</p>
        </header>

        <div className="fleet-row" data-reveal>
          <div className="fleet-row-copy">
            <h2 className="page-subhead">BMTC city buses</h2>
            <p className="fleet-copy">BMTC tiers are read off the route short name in the feed, which is where the network already encodes them. Ordinary and Vajra share one fare shape and differ by a factor of two. The airport coach does not: it is priced by distance rather than by stage, because a run to Kempegowda International is a different product from a ride across town. Majestic to the airport is about 35 km of road and lands around ₹300 to ₹350.</p>
          </div>
        {/* Three-quarter illustrations from the front and door side, as if
            standing in a bus station looking at each vehicle in the same bay.
            Every drawing is projected through one pinhole camera (eye height
            1.6 m, level, one shared pair of vanishing points) onto one
            viewBox, so the horizon and the near front corner sit in the same
            place in all four and the lengths and floor heights compare
            honestly. Drawn from Wikimedia Commons reference photographs.
            Each pair sits with the section that describes it. */}
          <ul className="fleet-pair" data-reveal>
            {cityFleet.map((bus) => (
              <li key={bus.id}>
                <img src={publicAsset(`/fleet/${bus.id}.svg`)} alt={bus.alt} width="626" height="629" loading="lazy" />
                <p>{bus.name} <span>{bus.detail}</span></p>
              </li>
            ))}
          </ul>
        </div>

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
        <p className="fleet-note wide" data-reveal>Bus fares are computed from distance rather than from stop count. On limited-stop routes consecutive stops can sit several kilometres apart, so counting stops would underprice a long express hop.</p>

        <div className="fleet-row" data-reveal>
          <div className="fleet-row-copy">
            <h2 className="page-subhead">Inter-city buses</h2>
            <p className="fleet-copy">Karnataka Sarige is run by KSRTC, NWKRTC and KKRTC, the same three corporations that run Airavat and Pallakki, and it is boarded exactly like a BMTC bus: you get on, you pay, there is no seat with your name against it. The other fifteen coach classes are numbered-seat products that cannot be boarded without a prior transaction - Ashwamedha included, even though its own fare says it is priced like the walk-up class next to it. The split therefore cuts across the operators rather than along them, and Tatak keys the boarding gate to the service class and never to the corporation. The app&apos;s own spec says why in as many words: gating by operator &ldquo;would block a plain mofussil bus from ever appearing as a walk-up option&rdquo;.</p>
            <p className="fleet-copy">One row below is walk-up. Read the table down that column first, and the rest of it makes sense.</p>
          </div>
        {/* Three-quarter illustrations from the front and door side, as if
            standing in a bus station looking at each vehicle in the same bay.
            Every drawing is projected through one pinhole camera (eye height
            1.6 m, level, one shared pair of vanishing points) onto one
            viewBox, so the horizon and the near front corner sit in the same
            place in all four and the lengths and floor heights compare
            honestly. Drawn from Wikimedia Commons reference photographs.
            Each pair sits with the section that describes it. */}
          <ul className="fleet-pair">
            {intercityFleet.map((bus) => (
              <li key={bus.id}>
                <img src={publicAsset(`/fleet/${bus.id}.svg`)} alt={bus.alt} width="626" height="629" loading="lazy" />
                <p>{bus.name} <span>{bus.detail}</span></p>
              </li>
            ))}
          </ul>
        </div>

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
        <p className="fleet-note wide" data-reveal>The fare column is Tatak&apos;s own multiplier over each corridor&apos;s ordinary fare, not a published price. Six classes have no multiplier yet, so they read &ldquo;Not modelled&rdquo; rather than a number backed out of one observation.</p>

        <h2 className="page-subhead" data-reveal>Namma Metro</h2>
        <div className="mcp-panel" data-reveal>
          <div className="mcp-field">
            <span>Lines</span>
            <ul className="metro-lines">
              <li><i className="line-dot is-green" aria-hidden="true" />Green</li>
              <li><i className="line-dot is-purple" aria-hidden="true" />Purple</li>
              <li><i className="line-dot is-yellow" aria-hidden="true" />Yellow</li>
            </ul>
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

        <h2 className="page-subhead" data-reveal>What the published fares settle</h2>
        <p className="fleet-copy wide" data-reveal>Ashwamedha costs the same as the ordinary bus. On four corridors the two fares match to the rupee: 343, 166, 338 and 480. That is why its multiplier is 1, like Karnataka Sarige&apos;s.</p>
        <p className="fleet-copy wide" data-reveal>One coach can carry four different prices. Trip <code>2131BNGMNG</code> is sold on four corridor pages at 612, 569, 952 and 1190 rupees. Fourteen trip codes do this. So Tatak prices each pair of stops, not the distance between them.</p>
        <p className="fleet-note wide" data-reveal>Some classes are better evidenced than others. Airavat Club Class appears in 120 of 490 services. Kalyana Ratha appears in one.</p>

        <h2 className="page-subhead" data-reveal>Two rules riders find out at the counter</h2>
        <ul className="note-list wide" data-reveal>
          <li><strong>Shakti free travel works on Karnataka Sarige and Ashwamedha only.</strong> Every other class pays the full fare. It depends on the class of coach, not on who runs it.</li>
          <li><strong>Seniors get 25 per cent off, up to Rajahamsa.</strong> The classes above that do not qualify. For Pallakki and the non-AC sleepers nobody publishes a rule either way, so Tatak shows nothing rather than guessing. Not knowing and not being eligible are different things.</li>
        </ul>
        <a className="contact-back" href={publicAsset("/")}><span aria-hidden="true">←</span> Back to Tatak</a>
      </section>

      <SiteFooter />
    </main>
  );
}
