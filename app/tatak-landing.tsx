"use client";
import { useEffect, useRef, useState } from "react";

const worldChapters = [
  {
    label: "One search",
    eyebrow: "Door to door",
    title: "Start where you are. End where you need to be.",
    body: "Tatak plans from the doorstep, through each transfer, to the right station exit—not merely from stop to stop.",
    tags: ["Origin to destination", "Every walking link"],
  },
  {
    label: "Every mode",
    eyebrow: "The network, connected",
    title: "Bus, metro and walking belong to one journey.",
    body: "BMTC, Namma Metro and the walks between them are searched together, so the answer reflects how the city actually moves.",
    tags: ["BMTC", "Namma Metro", "Walk"],
  },
  {
    label: "Honest data",
    eyebrow: "Clarity over certainty",
    title: "Live when it is live. Clear when it is not.",
    body: "A current vehicle, a published departure and a calculated estimate each use a distinct signal. Tatak never invents certainty.",
    tags: ["Live", "Published", "~ Estimated"],
  },
  {
    label: "Your best route",
    eyebrow: "Useful trade-offs",
    title: "Fastest, lowest fare or fewer changes.",
    body: "Compare complete journeys and choose what best means today, with total time, fare and transfers visible before you leave.",
    tags: ["60 min", "₹41 total", "1 change"],
  },
];

const preferences = [
  { id: "fastest", label: "Fastest", headline: "60 min · ₹41 · 1 change", body: "The quickest complete route, with every fare and transfer visible before you leave." },
  { id: "fare", label: "Lowest fare", headline: "Price, leg by leg", body: "Compare the full journey cost—not a partial fare that changes halfway through." },
  { id: "changes", label: "Fewer changes", headline: "Simpler when it matters", body: "See every transfer up front and choose a calmer route when speed is not the only priority." },
];

const routeLegs = [
  { mode: "WALK", className: "walk", title: "Walk to Hebbala Bridge", detail: "940 m · 13 min", status: "On foot" },
  { mode: "500-A", className: "bus", title: "BMTC to Tin Factory", detail: "13 stops · published 09:50", status: "No tracker" },
  { mode: "PURPLE", className: "metro", title: "Metro to Indiranagar", detail: "3 stops · ~8 min wait", status: "Live train" },
];

const publicAsset = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

export function TatakLanding() {
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [preference, setPreference] = useState("fastest");
  const [activeWorld, setActiveWorld] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      navRef.current?.classList.toggle("is-scrolled", window.scrollY > 10);
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
      { threshold: 0.1, rootMargin: "0px 0px -6%" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const steps = Array.from(document.querySelectorAll<HTMLElement>("[data-world-step]"));
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveWorld(Number((entry.target as HTMLElement).dataset.worldStep));
      }),
      { rootMargin: "-38% 0px -38% 0px", threshold: 0 },
    );
    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen]);

  const activePreference = preferences.find((item) => item.id === preference) ?? preferences[0];
  const worldChapter = worldChapters[activeWorld];

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header ref={navRef} className="site-nav">
        <a className="wordmark" href="#top" aria-label="Tatak home"><span className="wordmark-mark" aria-hidden="true">ತ</span><span>Tatak</span><small className="kn">ತಟಕ್</small></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#why">Why Tatak</a><a href="#journey">Sample journey</a><a href="#principles">How it works</a>
        </nav>
        <a className="nav-cta" href="#journey">Explore a route <span aria-hidden="true">→</span></a>
        <button type="button" className="menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((value) => !value)}><span /><span /></button>
        <nav id="mobile-navigation" className={`mobile-nav ${menuOpen ? "is-open" : ""}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
          <a href="#why" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Why Tatak <span>01</span></a>
          <a href="#journey" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Sample journey <span>02</span></a>
          <a href="#principles" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>How it works <span>03</span></a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-intro" id="main-content" data-reveal>
          <div><span className="eyebrow">Multimodal journey planning for Bengaluru</span><h1>The whole city.<br /><em>One honest journey.</em></h1></div>
          <div className="hero-summary">
            <p>Tatak connects BMTC, Namma Metro and every walk in between—then shows what is live, what is published and what is only an estimate.</p>
            <div className="hero-actions"><a className="button button-primary" href="#why">See how Tatak works <span aria-hidden="true">↓</span></a><a className="button button-quiet" href="#journey">View a route</a></div>
          </div>
        </div>
        <div className="hero-metrics" aria-label="Network coverage" data-reveal>
          <span>Built for the complete journey</span><div><strong>9,100+</strong><small>transit stops</small></div><div><strong>34,000+</strong><small>walk links</small></div><div><strong>3</strong><small>connected modes</small></div>
        </div>
      </section>

      <section className="scroll-world" id="why" aria-label="Explore Tatak through Bengaluru">
        <div className="world-layout">
          <div className="world-chapters">
            {worldChapters.map((chapter, index) => (
              <article key={chapter.label} data-world-step={index} className={activeWorld === index ? "is-active" : ""}>
                <span className="chapter-count">0{index + 1} / 04</span>
                <small>{chapter.eyebrow}</small>
                <h2>{chapter.title}</h2>
                <p>{chapter.body}</p>
                <div>{chapter.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </article>
            ))}
          </div>

          <div className={`world-visual chapter-${activeWorld + 1}`}>
            <div className="world-image-frame">
              <picture><source type="image/webp" srcSet={`${publicAsset("/tatak-world-960.webp")} 960w, ${publicAsset("/tatak-world.webp")} 1536w`} sizes="(max-width: 860px) 100vw, 58vw" /><img src={publicAsset("/tatak-world.png")} alt="" width="1536" height="1024" fetchPriority="high" /></picture>
            </div>
            <div className="world-readout" aria-live="polite">
              <header><span>0{activeWorld + 1} / 04</span><b>{worldChapter.label}</b></header>
              <strong>{worldChapter.eyebrow}</strong>
              <div>{worldChapter.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            <div className="world-progress" aria-hidden="true"><i style={{ width: `${((activeWorld + 1) / worldChapters.length) * 100}%` }} /></div>
          </div>
        </div>
      </section>

      <section className="journey-section" id="journey">
        <header className="journey-heading" data-reveal>
          <div className="section-label"><span>02</span> One real answer</div>
          <h2>Hebbala to Indiranagar.<br /><em>Nothing hand-waved.</em></h2>
          <p>The first-ranked route at 09:37, with every leg, change and confidence level in view.</p>
        </header>
        <div className="journey-layout">
          <aside className="journey-controls" data-reveal>
            <span>RANK THIS JOURNEY BY</span>
            <div className="preference-picker" role="group" aria-label="Journey ranking preference">
              {preferences.map((item, index) => <button type="button" key={item.id} className={preference === item.id ? "is-active" : ""} aria-pressed={preference === item.id} onClick={() => setPreference(item.id)}><span>0{index + 1}</span>{item.label}</button>)}
            </div>
            <div className="preference-note" aria-live="polite"><strong>{activePreference.headline}</strong><p>{activePreference.body}</p></div>
          </aside>
          <article className="journey-board" data-reveal aria-label="Detailed sample journey">
            <header className="board-header"><div><span>FROM</span><strong>Hebbala <small className="kn">ಹೆಬ್ಬಾಳ</small></strong></div><i aria-hidden="true">→</i><div><span>TO</span><strong>Indiranagar <small className="kn">ಇಂದಿರಾನಗರ</small></strong></div><b>{activePreference.label.toUpperCase()}</b></header>
            <div className="board-summary"><div><strong>60</strong><span>minutes</span><small>09:37 → ~10:37 · 1 change</small></div><div><strong>₹41</strong><span>total fare</span></div></div>
            <div className="board-legs">{routeLegs.map((leg, index) => <div className="board-leg" key={leg.mode}><span className="leg-number">0{index + 1}</span><span className={`mode ${leg.className}`}>{leg.mode}</span><div><strong>{leg.title}</strong><small>{leg.detail}</small></div><em className={index === 2 ? "is-live" : ""}>{leg.status}</em></div>)}</div>
            <div className={`board-trust ${detailsOpen ? "is-open" : ""}`} id="journey-proof" aria-hidden={!detailsOpen}>
              <div><i className="live-dot" /><span><b>Live</b><small>Vehicle position received now</small></span></div><div><i className="published-dot" /><span><b>Published</b><small>Official timetable departure</small></span></div><div><i className="estimate-dot">~</i><span><b>Estimated</b><small>Calculated and clearly marked</small></span></div>
            </div>
            <button className="board-disclosure" type="button" onClick={() => setDetailsOpen((value) => !value)} aria-expanded={detailsOpen} aria-controls="journey-proof">{detailsOpen ? "Hide how Tatak knows" : "See how Tatak knows"}<span aria-hidden="true">{detailsOpen ? "−" : "+"}</span></button>
          </article>
        </div>
      </section>

      <section className="truth-section" id="principles" aria-labelledby="truth-title">
        <header data-reveal><div className="section-label light"><span>03</span> A clearer signal</div><h2 id="truth-title">Truth, in three states.</h2><p>Green is reserved for live data. Published times look published. Every estimate carries its tilde.</p></header>
        <div className="truth-grid">
          <article data-reveal><span className="truth-symbol"><i className="live-dot" /></span><small>LIVE</small><h3>Moving now</h3><p>A current vehicle position with a visible update time.</p></article>
          <article data-reveal><span className="truth-symbol published">09:50</span><small>PUBLISHED</small><h3>On the timetable</h3><p>An official departure without pretending the vehicle is tracked.</p></article>
          <article data-reveal><span className="truth-symbol estimated">~8</span><small>ESTIMATED</small><h3>Useful, not certain</h3><p>A calculated wait that never masquerades as live information.</p></article>
        </div>
      </section>

      <section className="purpose-section">
        <header data-reveal><div className="section-label"><span>04</span> The whole journey</div><h2>One planner from the first step<br />to the final stop.</h2><p>Tatak removes the seams between modes, without hiding the trade-offs that help you choose.</p></header>
        <div className="purpose-rows">
          <article data-reveal><span>01</span><h3>Start anywhere</h3><p>Plan from an address or landmark, not only from a known transit stop.</p></article>
          <article data-reveal><span>02</span><h3>Change with confidence</h3><p>See where to walk, when to transfer and what each leg will cost.</p></article>
          <article data-reveal><span>03</span><h3>Know before you go</h3><p>Understand total time, fare, changes and data confidence in one view.</p></article>
        </div>
      </section>

      <section className="final-cta" aria-labelledby="cta-title"><span>WHERE TO, THEN?</span><h2 id="cta-title">Know the journey.<br />Then just go.</h2><a href="#journey">Explore the sample journey <span aria-hidden="true">↑</span></a></section>

      <footer className="site-footer">
        <div><a className="wordmark footer-mark" href="#top" aria-label="Tatak home"><span className="wordmark-mark" aria-hidden="true">ತ</span><span>Tatak</span><small className="kn">ತಟಕ್</small></a><p>One calm answer for a city in motion.</p></div>
        <nav aria-label="Footer navigation"><a href="#why">Why Tatak</a><a href="#journey">Sample journey</a><a href="#principles">How it works</a></nav>
        <small>Concept app · Built from real published transit data</small>
      </footer>
    </main>
  );
}
