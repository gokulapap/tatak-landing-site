"use client";

import { SiteFooter, SiteHeader, publicAsset, useRevealAnimations } from "../site-chrome";

// Every factor below is quoted from `src/carbon/index.ts` in the Tatak app,
// which is the file the app actually computes with. Nothing here is a
// general-knowledge emission factor; if a number is not in that file or in
// `docs/specs/carbon-credits.md`, it is not on this page.
const factors = [
  {
    id: "car",
    mode: "Car",
    value: "0.130 kg CO2 / km",
    detail: "A petrol hatchback under 1400 CC - the segment most of Bengaluru's cars sit in.",
    source: "India Specific Road Transport Emission Factors, India GHG Program (WRI India / CII / TERI), 2015, section 5.3.1, row 5.",
    href: "https://indiaghgp.org/road-transport-emission-factors",
    hrefLabel: "indiaghgp.org/road-transport-emission-factors",
  },
  {
    id: "bus",
    mode: "Bus",
    value: "0.015161 kg CO2 / passenger-km",
    detail: "A passenger-km weighted average over the State Road Transport Undertakings' own published fuel efficiency, revenue-km and passenger-km. The document is explicit that this is intracity bus and does not apply to BRTS or intercity services, which is what a BMTC leg is.",
    source: "Same document, section 5.4.1.",
    href: "https://indiaghgp.org/road-transport-emission-factors",
    hrefLabel: "indiaghgp.org/road-transport-emission-factors",
  },
  {
    id: "metro",
    mode: "Metro",
    value: "0.025 kg CO2e / passenger-km",
    detail: "Borrowed, and labelled as borrowed: Namma Metro publishes no per-passenger-km factor this app could find, so the figure is a life-cycle result from a Mumbai study, where auxiliary power dominates at 25 g CO2-eq per passenger-km.",
    source: "Environmental life cycle assessment of underground metro rail: a case study in Mumbai Metropolitan Region, India, 2024.",
    href: "https://www.sciencedirect.com/science/article/pii/S019592552400088X",
    hrefLabel: "sciencedirect.com/science/article/pii/S019592552400088X",
  },
];

export function EmissionPage() {
  useRevealAnimations();

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <SiteHeader />

      <section className="emission-page route-section" id="main-content" aria-labelledby="emission-title">
        <header className="section-intro compact" data-reveal>
          <div className="section-label"><span>01</span> Emission method</div>
          <h1 id="emission-title">The kilogram on your ticket, <em>worked out in public.</em></h1>
          <p>The app prints the figure and nothing else. This is the page that shows what it was measured against, which published factors it used, and where it is deliberately conservative.</p>
        </header>

        <div className="claim-sample" data-reveal>
          <span>What a ticket says</span>
          <strong>1.13 kg less CO2 than driving a car.</strong>
          <p>What one mature tree absorbs in about 20 days, at 21 kg a year on average.</p>
          <small>Thanks for taking the bus instead of a cab.</small>
        </div>
        <p className="emission-copy" data-reveal>That is the whole claim as a rider sees it - a figure to two decimal places, with no hedge word in front of it. Two decimals rather than a rounded &ldquo;about a kilo&rdquo; because the arithmetic is reproducible: the distance comes off real geometry and the factors are published, so anyone with the same inputs gets 1.13 back. What that precision costs is that the factors themselves are national averages carrying roughly two significant figures of real accuracy, so the number reads as more measured than it is. Everything below is the correction to that.</p>

        <p className="emission-copy" data-reveal>A second line used to travel with the figure on the ticket face: <q>Measured on the straight line between the two ends against a small petrol car, on published 2015 India GHG Program factors. A real drive is longer than that line.</q> It left the app because a ticket is not the place to argue a method. It did not leave the project; it is the rest of this page.</p>

        <h2 className="page-subhead" data-reveal>The three factors</h2>
        <div className="mcp-panel" data-reveal>
          {factors.map((factor) => (
            <div className="mcp-field" key={factor.id}>
              <span>{factor.mode}</span>
              <div>
                <code>{factor.value}</code>
                <p>{factor.detail}</p>
                <p className="factor-source">
                  {factor.source}{" "}
                  <a href={factor.href} target="_blank" rel="noreferrer">{factor.hrefLabel}</a>
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="emission-copy" data-reveal>The bus figure is one blended intracity average for every tier. There is no published India-specific factor separating AC from non-AC buses, so Ordinary, AC and Vayu Vajra all price off 0.015161 rather than off a number the app invented.</p>

        <h2 className="page-subhead" data-reveal>The distance is a straight line</h2>
        <p className="emission-copy" data-reveal>The car is charged with the straight line between the journey&apos;s two ends. The transit side is measured along the real geometry each leg follows. That asymmetry is on purpose and it is the largest conservative choice in the calculation: charging the car with the distance the bus actually covered would credit the rider for the detour the bus made. A real drive over Bengaluru&apos;s road network is typically 20 to 40 per cent longer than the crow flies, and no detour factor is applied on top. So the avoided figure is a floor, not an estimate - a real drive is always at least that long.</p>

        <h2 className="page-subhead" data-reveal>Every close call, made smaller</h2>
        <ul className="note-list" data-reveal>
          <li><strong>The car factor is the un-uplifted one.</strong> The same table publishes each factor twice, plain and with an 8 per cent real-world uplift on the laboratory fuel economy. The uplifted figure for this segment is 0.140. The app uses the plain 0.130, which understates the car.</li>
          <li><strong>The metro factor is the larger candidate.</strong> The alternative was 0.00795 kg CO2 per passenger-km, the suburban electric rail factor from the India GHG Program&apos;s companion rail document - a third of the number used, and the better apples-to-apples comparison against the car&apos;s tailpipe-only factor. Taking the larger one overstates the metro side of the subtraction and understates what was avoided.</li>
          <li><strong>A journey that avoided nothing prints nothing.</strong> The figure never goes negative: a transit journey longer than the drive it replaces has avoided nothing, and zero is the honest floor.</li>
          <li><strong>Under 0.1 kg there is no figure at all.</strong> Below that, one significant figure stops being a number and starts being a rounding artefact - a two-stop hop &ldquo;avoiding 0.06 kg&rdquo; is a claim about a car journey nobody would have made.</li>
          <li><strong>An unpriced mode voids the whole figure.</strong> If a journey contains a leg the app has no published factor for, it shows no figure rather than a total quietly computed over the legs it happened to recognise.</li>
        </ul>

        <h2 className="page-subhead" data-reveal>Adding them up</h2>
        <p className="emission-copy" data-reveal>A running total sums the unrounded figures and rounds once, at the end - rounding each ticket first and then adding would compound the rounding into the total. A ticket under 0.1 kg still counts toward that sum even though it prints no figure of its own; the floor governs what is worth printing, not what happened. Twelve two-stop hops are a real kilogram. And a ticket the app could not price excludes itself and is counted separately, so a wallet says how many it left out rather than showing a total that looks complete and quietly is not.</p>

        <h2 className="page-subhead" data-reveal>The tree is a comparison, not a unit</h2>
        <p className="emission-copy" data-reveal>A tree absorbs CO2 per year; a ticket avoids CO2 once. So &ldquo;you saved 0.05 trees&rdquo; divides a one-off quantity by a rate and prints the result as a count, which is a category error rather than merely an ugly number. The line is shaped around what the rate means instead: how long one tree would take to do the same job, or - once the figure is worth at least a tree-year - how many trees&apos; worth of a full year it represents.</p>
        <div className="tree-forms" data-reveal>
          <p>What one mature tree absorbs in about 20 days, at 21 kg a year on average.</p>
          <p>A year&apos;s absorption by about 3 mature trees, at 21 kg a year on average.</p>
        </div>
        <p className="emission-copy" data-reveal>The rate is 21 kg CO2 a year, the common central figure for a mature tree. Published estimates range roughly 10 to 40 kg a year depending on species, age and growing conditions - a far wider band than any transport factor above, which is why the rate is stated every time it is used and called an average. It never enters the arithmetic: the kilogram is the number, the tree is only the intuition next to it.</p>

        <h2 className="page-subhead" data-reveal>Modelled from published factors, never measured</h2>
        <p className="emission-copy" data-reveal>This is the distinction the app is built around. Elsewhere in Tatak, green means a measurement read off a vehicle right now - a tracked arrival, a live badge. A carbon figure is never that. It is arithmetic over national averages, so it gets its own green, close enough to read as a good number and different enough that a rider is never taught to confuse the two. Nothing on this page was weighed at a tailpipe.</p>

        <h2 className="page-subhead" data-reveal>What the sources do not settle</h2>
        <ul className="note-list" data-reveal>
          <li><strong>No tier split exists for Indian buses.</strong> A search for a citable AC versus non-AC factor returned nothing usable, so one blended figure covers every tier. The tier is still recorded on each ticket, so historical tickets can be repriced if a split is ever published.</li>
          <li><strong>An airport coach is the weakest application of the bus factor.</strong> The India GHG Program is explicit that its intracity figure excludes intercity coaches, and a Vayu Vajra run to Kempegowda International is closer to the excluded case than to a city bus.</li>
          <li><strong>The metro factor is not Bengaluru&apos;s.</strong> It is a Mumbai life-cycle result standing in until Namma Metro publishes one of its own.</li>
          <li><strong>The counterfactual is one person driving one car.</strong> No occupancy divisor is applied, because the sentence on the ticket says driving a car and a rider reading it is imagining themselves at the wheel. A shared car would avoid less. This is an assumption, not a cited source, and it is the one input on this page with no document behind it.</li>
        </ul>

        <a className="contact-back" href={publicAsset("/")}><span aria-hidden="true">←</span> Back to Tatak</a>
      </section>

      <SiteFooter />
    </main>
  );
}
