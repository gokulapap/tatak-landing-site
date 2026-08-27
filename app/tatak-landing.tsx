"use client";

import { useEffect, useRef, useState } from "react";

const APP_URL = "https://app.tatak.tech";

const navigation = [
  { href: "#why", label: "Why Tatak" },
  { href: "#journey", label: "Sample journey" },
  { href: "#signals", label: "Data clarity" },
  { href: "#workflow", label: "How it works" },
  { href: "https://app.tatak.tech/stickers.html", label: "Test QR codes", external: true },
];

const preferences = [
  {
    id: "fastest",
    label: "Fastest",
    headline: "60 min · ₹41 · 1 change",
    body: "Bring the quickest complete journey to the top without hiding its fare or transfer.",
  },
  {
    id: "fare",
    label: "Lowest fare",
    headline: "See the complete cost",
    body: "Compare the fare for the whole journey—not a partial price that changes halfway through.",
  },
  {
    id: "changes",
    label: "Fewer changes",
    headline: "Make transfers a choice",
    body: "Choose a calmer journey when fewer hand-offs matter more than saving a few minutes.",
  },
];

const routeLegs = [
  {
    mode: "Walk",
    badge: "WALK",
    className: "walk",
    title: "Walk to Hebbala Bridge",
    detail: "940 m · 13 min",
    status: "On foot",
    signal: "neutral",
  },
  {
    mode: "Bus",
    badge: "500-A",
    className: "bus",
    title: "BMTC to Tin Factory",
    detail: "13 stops · departure 09:50",
    status: "Published",
    signal: "published",
  },
  {
    mode: "Metro",
    badge: "PURPLE",
    className: "metro",
    title: "Metro to Indiranagar",
    detail: "3 stops · ~8 min wait",
    status: "Live context",
    signal: "live",
  },
];

const signalStates = [
  {
    id: "live",
    label: "Live",
    value: "Now",
    title: "Moving now",
    body: "A current vehicle position with a visible update state.",
  },
  {
    id: "published",
    label: "Published",
    value: "09:50",
    title: "On the timetable",
    body: "An official departure without pretending the vehicle is tracked.",
  },
  {
    id: "estimated",
    label: "Estimated",
    value: "~8",
    title: "Useful, not certain",
    body: "A calculated wait that never masquerades as live information.",
  },
];

const useCases = [
  {
    index: "01",
    eyebrow: "Everyday commute",
    title: "Choose the trade-off that fits today.",
    body: "Put time, fare and changes in one view before leaving home or work.",
    accent: "red",
  },
  {
    index: "02",
    eyebrow: "Unfamiliar cross-city trip",
    title: "Know each hand-off before you go.",
    body: "See the walks, stops and transfers that turn separate modes into one journey.",
    accent: "purple",
  },
  {
    index: "03",
    eyebrow: "Airport connection",
    title: "Find the coach that fits your route.",
    body: "Explore Vayu Vajra airport-coach services alongside Bengaluru transit information.",
    accent: "green",
  },
];

const publicAsset = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

function Brand({ className = "" }: { className?: string }) {
  return (
    <a className={`brand ${className}`.trim()} href="#top" aria-label="Tatak home">
      <span className="brand-mark kn" aria-hidden="true">ತ</span>
      <span className="brand-name">Tatak</span>
      <span className="brand-kn kn" lang="kn">ತಟಕ್</span>
    </a>
  );
}

function AppLink({
  className = "",
  label = "Try Tatak",
  tabIndex,
}: {
  className?: string;
  label?: string;
  tabIndex?: number;
}) {
  return (
    <a
      className={className}
      href={APP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      tabIndex={tabIndex}
    >
      <span>{label}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function RouteList({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`route-list ${compact ? "route-list--compact" : ""}`}>
      {routeLegs.map((leg, index) => (
        <div className="route-leg" key={leg.mode}>
          <div className="route-track" aria-hidden="true">
            <span>{index + 1}</span>
            {index < routeLegs.length - 1 && <i />}
          </div>
          <span className={`mode-badge ${leg.className}`}>{leg.badge}</span>
          <div className="route-leg-copy">
            <strong>{leg.title}</strong>
            <small>{leg.detail}</small>
          </div>
          <span className={`route-status ${leg.signal}`}>
            <i aria-hidden="true" />
            {leg.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function ProductPreview() {
  return (
    <figure className="product-preview" data-reveal>
      <div className="preview-chrome" aria-hidden="true">
        <span /><span /><span />
        <b>app.tatak.tech</b>
        <em>Prototype</em>
      </div>
      <div className="preview-shell">
        <aside className="preview-rail" aria-label="Product sections">
          <span className="preview-rail-mark kn">ತ</span>
          <div className="preview-rail-item is-active"><i>⌁</i><span>Plan</span></div>
          <div className="preview-rail-item"><i>⌕</i><span>Explore</span></div>
          <div className="preview-rail-item"><i>●</i><span>Live</span></div>
          <div className="preview-rail-item"><i>↟</i><span>Airport</span></div>
        </aside>

        <div className="preview-main">
          <header className="preview-header">
            <div>
              <span className="preview-kicker">Plan a journey</span>
              <strong>Where to?</strong>
            </div>
            <span className="preview-city">Bengaluru <i aria-hidden="true" /></span>
          </header>

          <div className="preview-search" aria-label="Sample route search">
            <div><i className="origin-dot" /><span><small>FROM</small><strong>Hebbala</strong><em className="kn">ಹೆಬ್ಬಾಳ</em></span></div>
            <span className="search-link" aria-hidden="true">→</span>
            <div><i className="destination-dot" /><span><small>TO</small><strong>Indiranagar</strong><em className="kn">ಇಂದಿರಾನಗರ</em></span></div>
            <span className="preview-search-action" aria-hidden="true">Plan</span>
          </div>

          <article className="preview-result" aria-label="Top-ranked sample journey">
            <header>
              <div><span>Top journey</span><strong>Fastest complete route</strong></div>
              <span className="confidence-chip"><i /> Mixed signals</span>
            </header>
            <div className="preview-summary">
              <div><strong>60</strong><span>min</span><small>09:37 → ~10:37</small></div>
              <div><strong>₹41</strong><span>fare</span><small>whole journey</small></div>
              <div><strong>1</strong><span>change</span><small>shown upfront</small></div>
            </div>
            <RouteList compact />
          </article>
        </div>

        <aside className="preview-context" aria-label="Data confidence legend">
          <span className="preview-kicker">What Tatak knows</span>
          <h2>Useful context.<br />Honest labels.</h2>
          <div className="context-signal live"><i /><span><strong>Live</strong><small>Vehicle context</small></span></div>
          <div className="context-signal published"><i /><span><strong>Published</strong><small>Official timetable</small></span></div>
          <div className="context-signal estimated"><i>~</i><span><strong>Estimated</strong><small>Clearly calculated</small></span></div>
          <p>Tatak never turns an estimate into a promise.</p>
        </aside>
      </div>
      <figcaption>
        <span>Product preview</span>
        <span>Current prototype · interface may evolve</span>
      </figcaption>
    </figure>
  );
}

export function TatakLanding() {
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [preference, setPreference] = useState("fastest");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      navRef.current?.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    document.documentElement.classList.add("reveal-ready");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add("is-in-view");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.08, rootMargin: "0px 0px -5%" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen]);

  const activePreference =
    preferences.find((item) => item.id === preference) ?? preferences[0];

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header ref={navRef} className="site-nav">
        <Brand />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <AppLink className="nav-cta" />
        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span /><span />
        </button>
        <nav
          id="mobile-navigation"
          className={`mobile-nav ${menuOpen ? "is-open" : ""}`}
          aria-label="Mobile navigation"
          aria-hidden={!menuOpen}
        >
          {navigation.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {item.label}<span>0{index + 1}</span>
            </a>
          ))}
          <AppLink
            className="mobile-app-link"
            label="Open Tatak"
            tabIndex={menuOpen ? 0 : -1}
          />
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy" id="main-content" data-reveal>
          <div className="eyebrow"><i /> Multimodal journey planning for Bengaluru</div>
          <h1>One search for every way <em>across Bengaluru.</em></h1>
          <p>Plan from door to destination across BMTC, Namma Metro and walking. Compare complete routes by time, fare and changes—with every live, published and estimated signal clearly labeled.</p>
          <div className="hero-actions">
            <AppLink className="button button-primary" label="Plan a journey" />
            <a className="button button-secondary" href="#journey"><span>See a real route</span><span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-note">
            <span><i className="live-pulse" /> Live prototype</span>
            <span>Independent project</span>
            <span>Built for Bengaluru</span>
          </div>
        </div>

        <ProductPreview />

        <div className="network-strip" aria-label="Transport modes supported" data-reveal>
          <span>One city journey</span>
          <div><i className="mode-icon walk">01</i><span><strong>Walking</strong><small>First and final mile</small></span></div>
          <div><i className="mode-icon bus">02</i><span><strong>BMTC</strong><small>City bus connections</small></span></div>
          <div><i className="mode-icon metro">03</i><span><strong>Namma Metro</strong><small>Purple and Green lines</small></span></div>
        </div>
      </section>

      <section className="problem-section" id="why" aria-labelledby="problem-title">
        <header className="section-intro" data-reveal>
          <div className="section-label"><span>01</span> Why Tatak</div>
          <h2 id="problem-title">Bengaluru moves in combinations. <em>Your planner should too.</em></h2>
          <p>A useful answer is not a bus number or a metro line. It is the walk to the stop, the transfer in the middle, the fare for the whole trip—and clarity about what the data can actually promise.</p>
        </header>

        <div className="comparison-grid">
          <article className="fragment-card" data-reveal>
            <header><span>Fragmented planning</span><small>Three separate answers</small></header>
            <div className="fragment-list">
              <div><span className="fragment-index">A</span><div><strong>Find a nearby bus</strong><small>But where does it leave you?</small></div><i>?</i></div>
              <div><span className="fragment-index">B</span><div><strong>Check the metro</strong><small>But can you make the transfer?</small></div><i>?</i></div>
              <div><span className="fragment-index">C</span><div><strong>Estimate the walk</strong><small>But is that in the total time?</small></div><i>?</i></div>
            </div>
            <p>Every hand-off becomes your problem.</p>
          </article>

          <article className="connected-card" data-reveal>
            <header><span>The Tatak answer</span><small>One complete journey</small></header>
            <div className="connected-route" aria-label="Connected route from doorstep to destination">
              <div><i className="walk" /><span><strong>Doorstep</strong><small>Walk</small></span></div>
              <b aria-hidden="true" />
              <div><i className="bus" /><span><strong>500-A</strong><small>BMTC</small></span></div>
              <b aria-hidden="true" />
              <div><i className="metro" /><span><strong>Purple</strong><small>Metro</small></span></div>
              <b aria-hidden="true" />
              <div><i className="finish" /><span><strong>Destination</strong><small>Arrive</small></span></div>
            </div>
            <div className="answer-metrics">
              <span><strong>60 min</strong><small>complete time</small></span>
              <span><strong>₹41</strong><small>total fare</small></span>
              <span><strong>1 change</strong><small>shown upfront</small></span>
            </div>
          </article>
        </div>

        <figure className="network-visual" data-reveal>
          <picture>
            <source type="image/webp" srcSet={`${publicAsset("/tatak-world-960.webp")} 960w, ${publicAsset("/tatak-world.webp")} 1536w`} sizes="(max-width: 760px) 100vw, 1240px" />
            <img src={publicAsset("/tatak-world.png")} alt="A Bengaluru journey connecting a doorstep, BMTC bus, Namma Metro and a final walk" width="1536" height="1024" loading="lazy" />
          </picture>
          <figcaption>
            <span className="section-label light"><span>One network</span> Door to destination</span>
            <h3>Not three legs.<br />One decision.</h3>
            <p>Tatak searches the connected journey, then keeps each mode and transfer visible.</p>
          </figcaption>
        </figure>
      </section>

      <section className="capabilities-section" aria-labelledby="capabilities-title">
        <header className="section-intro compact" data-reveal>
          <div className="section-label"><span>02</span> Built for the decision</div>
          <h2 id="capabilities-title">The context you need <em>before you leave.</em></h2>
        </header>

        <div className="capability-grid">
          <article className="capability-card route-capability" data-reveal>
            <span className="card-number">01</span>
            <div><small>Door to door</small><h3>Start with places, not transit jargon.</h3><p>Plan from an address or landmark through every walking link and transfer.</p></div>
            <div className="mini-search" aria-hidden="true"><span><i className="origin-dot" />Hebbala</span><b>→</b><span><i className="destination-dot" />Indiranagar</span></div>
          </article>

          <article className="capability-card compare-capability" data-reveal>
            <span className="card-number">02</span>
            <div><small>Useful trade-offs</small><h3>Best can mean more than fastest.</h3><p>Compare complete journeys by time, total fare or the number of changes.</p></div>
            <div className="mini-ranking" aria-hidden="true"><span className="is-active">Fastest <b>60 min</b></span><span>Lowest fare <b>₹41</b></span><span>Fewer changes <b>1</b></span></div>
          </article>

          <article className="capability-card signal-capability" data-reveal>
            <span className="card-number">03</span>
            <div><small>Data honesty</small><h3>Know what is live—and what is not.</h3><p>Current positions, published times and calculated estimates never look the same.</p></div>
            <div className="mini-signals" aria-hidden="true"><span className="live"><i />Live</span><span className="published"><i />Published</span><span className="estimated"><i>~</i>Estimated</span></div>
          </article>
        </div>
      </section>

      <section className="journey-section" id="journey" aria-labelledby="journey-title">
        <header className="section-intro" data-reveal>
          <div className="section-label"><span>03</span> One real answer</div>
          <h2 id="journey-title">Hebbala to Indiranagar. <em>Nothing hand-waved.</em></h2>
          <p>The top-ranked journey at 09:37, with each leg, change and confidence state visible before departure.</p>
        </header>

        <div className="journey-layout">
          <aside className="journey-controls" data-reveal>
            <span>Rank complete journeys by</span>
            <div className="preference-picker" role="group" aria-label="Journey ranking preference">
              {preferences.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  className={preference === item.id ? "is-active" : ""}
                  aria-pressed={preference === item.id}
                  onClick={() => setPreference(item.id)}
                >
                  <span>0{index + 1}</span>{item.label}<i aria-hidden="true">→</i>
                </button>
              ))}
            </div>
            <div className="preference-note" aria-live="polite">
              <strong>{activePreference.headline}</strong>
              <p>{activePreference.body}</p>
            </div>
          </aside>

          <article className={`journey-board focus-${preference}`} data-reveal aria-label="Detailed sample journey">
            <header className="board-header">
              <div><span>FROM</span><strong>Hebbala <small className="kn">ಹೆಬ್ಬಾಳ</small></strong></div>
              <i aria-hidden="true">→</i>
              <div><span>TO</span><strong>Indiranagar <small className="kn">ಇಂದಿರಾನಗರ</small></strong></div>
              <b>Sorted: {activePreference.label}</b>
            </header>
            <div className="board-summary">
              <div className="summary-time"><strong>60</strong><span>minutes</span><small>09:37 → ~10:37</small></div>
              <div className="summary-fare"><strong>₹41</strong><span>total fare</span><small>across all legs</small></div>
              <div className="summary-changes"><strong>1</strong><span>change</span><small>shown upfront</small></div>
            </div>
            <RouteList />
            <div className={`board-trust ${detailsOpen ? "is-open" : ""}`} id="journey-proof" aria-hidden={!detailsOpen}>
              <div><i className="signal-dot live" /><span><b>Live</b><small>Current vehicle context</small></span></div>
              <div><i className="signal-dot published" /><span><b>Published</b><small>Official timetable departure</small></span></div>
              <div><i className="estimate-mark">~</i><span><b>Estimated</b><small>Calculated and clearly marked</small></span></div>
            </div>
            <button className="board-disclosure" type="button" onClick={() => setDetailsOpen((value) => !value)} aria-expanded={detailsOpen} aria-controls="journey-proof">
              {detailsOpen ? "Hide signal details" : "See how Tatak knows"}<span aria-hidden="true">{detailsOpen ? "−" : "+"}</span>
            </button>
          </article>
        </div>
      </section>

      <section className="signals-section" id="signals" aria-labelledby="signals-title">
        <header className="signals-header" data-reveal>
          <div className="section-label light"><span>04</span> A clearer signal</div>
          <h2 id="signals-title">Truth has a visual language.</h2>
          <p>Green is reserved for current information. Published times look published. Every estimate carries its tilde.</p>
        </header>
        <div className="signal-grid">
          {signalStates.map((state) => (
            <article className={state.id} key={state.id} data-reveal>
              <span className="signal-value">{state.id === "live" && <i />}{state.value}</span>
              <small>{state.label}</small>
              <h3>{state.title}</h3>
              <p>{state.body}</p>
            </article>
          ))}
        </div>
        <div className="signal-principle" data-reveal>
          <span className="kn" aria-hidden="true">ತ</span>
          <p><strong>Clarity over false certainty.</strong> Tatak tells you what the system knows, where it came from and when it is only an estimate.</p>
        </div>
      </section>

      <section className="workflow-section" id="workflow" aria-labelledby="workflow-title">
        <header className="section-intro compact" data-reveal>
          <div className="section-label"><span>05</span> How it works</div>
          <h2 id="workflow-title">From “where to?” to <em>ready to go.</em></h2>
        </header>
        <ol className="workflow-list">
          <li data-reveal><span>01</span><div><small>Set the journey</small><h3>Start where you actually are.</h3><p>Enter an address, place or landmark and the destination you need to reach.</p></div><i aria-hidden="true">A → B</i></li>
          <li data-reveal><span>02</span><div><small>Connect the network</small><h3>Search complete combinations.</h3><p>Tatak joins walking, BMTC and Namma Metro into door-to-door options.</p></div><i aria-hidden="true">●—●—●</i></li>
          <li data-reveal><span>03</span><div><small>Choose with context</small><h3>See the trade-off, then decide.</h3><p>Compare time, fare, changes and signal confidence in one calm answer.</p></div><i aria-hidden="true">60 · ₹41 · 1</i></li>
        </ol>
        <AppLink className="workflow-cta" label="Plan your journey" />
      </section>

      <section className="use-cases-section" aria-labelledby="use-cases-title">
        <header className="section-intro" data-reveal>
          <div className="section-label"><span>06</span> Made for real movement</div>
          <h2 id="use-cases-title">For the journey you make every day—and the one you have never made.</h2>
        </header>
        <div className="use-case-grid">
          {useCases.map((item) => (
            <article className={`use-case ${item.accent}`} key={item.index} data-reveal>
              <span>{item.index}</span><small>{item.eyebrow}</small><h3>{item.title}</h3><p>{item.body}</p><i aria-hidden="true">↗</i>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta" aria-labelledby="cta-title">
        <div data-reveal>
          <span>Where to, then?</span>
          <h2 id="cta-title">Know the whole journey.<br /><em>Then just go.</em></h2>
        </div>
        <div className="final-cta-copy" data-reveal>
          <p>Try the independent Tatak prototype and plan a connected Bengaluru journey.</p>
          <AppLink className="final-cta-link" label="Open Tatak" />
          <small>Opens the live prototype at app.tatak.tech</small>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <div><Brand className="footer-brand" /><p>One calm answer for a city in motion.</p></div>
          <nav aria-label="Footer navigation">
            <span>Explore</span>
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="footer-product"><span>Product</span><AppLink className="footer-app-link" label="Try Tatak" /><a href="#top">Back to top ↑</a></div>
        </div>
        <div className="footer-legal">
          <p>Tatak is an independent hackathon prototype. It is not affiliated with, endorsed by or operated by BMTC, BMRCL or any government body. Tickets shown in the prototype are specimens and are not valid for travel. Two of the five test QR codes are deliberate no-duty cases: scan one to see Tatak ask you to name the route instead of guessing it.</p>
          <span>© 2026 Tatak · Bengaluru</span>
        </div>
      </footer>
    </main>
  );
}
