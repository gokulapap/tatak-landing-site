"use client";

import { SiteFooter, SiteHeader, publicAsset, useRevealAnimations } from "../site-chrome";

// Every row below is read from the Tatak codebase rather than from an
// operator brochure. The six coach classes are `src/intercity/classes.ts`
// (names, air conditioning, layout, reservation, fare multiplier, senior
// basis, Shakti) with Ambaari Utsav from the fleet simulator's
// `src/fleet/serviceClass.ts`, which is the only class table that carries
// it. The bus tiers and the metro fares are `src/city/bengaluru.ts`
// (`SERVICE_TIER_PREFIXES`, `BUS_FARES`, `NAMMA_METRO_FARES`).
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
    id: "ambaari-utsav",
    name: "Ambaari Utsav",
    coach: "AC 2+1 sleeper, 40 berths. KSRTC only.",
    boarding: "Reserved",
    walkUp: false,
    fare: "Not modelled",
    senior: "Not eligible",
    shakti: "No",
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
          <h1 id="fleet-title">Ten kinds of vehicle, <em>two ways to board one.</em></h1>
          <p>Tatak plans over six intercity coach classes, three tiers of BMTC city bus and three metro lines. The division that decides what you can actually do at a stop is not the operator on the livery. It is whether the vehicle is sold by the seat.</p>
        </header>

        <h2 className="page-subhead" data-reveal>Reserved or walk-up</h2>
        <p className="fleet-copy" data-reveal>Karnataka Sarige is run by KSRTC, NWKRTC and KKRTC, the same three corporations that run Airavat and Pallakki, and it is boarded exactly like a BMTC bus: you get on, you pay, there is no seat with your name against it. The other five coach classes are numbered-seat products that cannot be boarded without a prior transaction. The split therefore cuts across the operators rather than along them, and Tatak keys the boarding gate to the service class and never to the corporation. The app&apos;s own spec says why in as many words: gating by operator &ldquo;would block a plain mofussil bus from ever appearing as a walk-up option&rdquo;.</p>
        <p className="fleet-copy" data-reveal>One row below is walk-up. Read the table down that column first, and the rest of it makes sense.</p>

        <div className="fleet-table-wrap" data-reveal>
          <table className="fleet-table">
            <caption>The six intercity coach classes</caption>
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
        <p className="fleet-note" data-reveal>The fare column is a multiplier over the same corridor&apos;s ordinary-class fare, and it is illustrative rather than published. It is the one column in the class table with no tariff behind it, and the app&apos;s source file says so where it defines it. Ambaari Utsav carries no multiplier at all: it is in the fleet roster and not in the fare table.</p>

        <h2 className="page-subhead" data-reveal>Two rules riders find out at the counter</h2>
        <ul className="note-list" data-reveal>
          <li><strong>Shakti free travel reaches Karnataka Sarige and nothing else.</strong> The scheme covers ordinary and express service, so a woman boarding a Rajahamsa, an Airavat, a Pallakki or an Ambaari pays the full fare. It is a rule about the class of coach, not about the corporation running it or the person boarding.</li>
          <li><strong>The senior concession is 25 per cent, up to Rajahamsa.</strong> It applies on Karnataka Sarige and Rajahamsa Executive, and a source places Airavat, Airavat Club Class and Ambaari Utsav above its stated ceiling of Rajahamsa and lower. Pallakki is the open case: nothing puts a non-AC sleeper inside that ceiling or outside it, so Tatak publishes no rate for it rather than picking one. An unresolved cell and an ineligible cell are different facts, and the app keeps them apart.</li>
        </ul>

        <h2 className="page-subhead" data-reveal>City buses</h2>
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
