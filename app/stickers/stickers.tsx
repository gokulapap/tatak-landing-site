"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppLink, SiteFooter, SiteHeader, publicAsset, useRevealAnimations } from "../site-chrome";
import { mintBin } from "./bin";
import { qrMatrix, qrSvgRects } from "./qr";

// The address every QR on this page encodes, and every "Open in Tatak" link
// points at. Copied character for character from `BOARD_URL` in the app
// repository's `scripts/build-intercity-stickers.ts`, because a sticker that
// does not resolve against the real board flow is worse than no sticker.
const BOARD_URL = "https://app.tatak.tech/board";

function payloadFor(bin: string): string {
  return `${BOARD_URL}?code=${bin}`;
}

type Sticker = {
  id: string;
  corporation: string;
  corporationName: string;
  hub: string;
  serial: string;
  className: string;
  boarding: "Walk-up" | "Reserved" | null;
  layout: string;
  route: string;
  plate: string;
};

// BMTC: three tiers, read off the route short name the way the app itself
// does in `src/city/bengaluru.ts` (`SERVICE_TIER_PREFIXES`) - no prefix is
// Ordinary, `V-`/`VW-` is AC (branded Vajra), `KIA-` is the airport coach
// (branded Vayu Vajra). All three board the same way: walk up, tap on, no
// reservation, so this group carries no "Reserved" chip at all.
const bmtcStickers: Sticker[] = [
  {
    id: "ordinary",
    corporation: "BMTC",
    corporationName: "Bengaluru Metropolitan Transport Corporation",
    hub: "BLR",
    serial: "1042",
    className: "Ordinary",
    boarding: "Walk-up",
    layout: "Non-AC. Stage fare.",
    route: "500-D, Majestic to Silk Board via HSR Layout",
    plate: "KA-01-ZZ-4127",
  },
  {
    id: "ac-vajra",
    corporation: "BMTC",
    corporationName: "Bengaluru Metropolitan Transport Corporation",
    hub: "BLR",
    serial: "2093",
    className: "AC (Vajra)",
    boarding: "Walk-up",
    layout: "AC. Stage fare, roughly double Ordinary.",
    route: "V-500, Majestic to Whitefield",
    plate: "KA-41-ZZ-2258",
  },
  {
    id: "airport-vayu-vajra",
    corporation: "BMTC",
    corporationName: "Bengaluru Metropolitan Transport Corporation",
    hub: "BLR",
    serial: "3087",
    className: "Airport (Vayu Vajra)",
    boarding: "Walk-up",
    layout: "AC. Priced by distance, not by stage.",
    route: "KIA-9, Majestic to Kempegowda International Airport",
    plate: "KA-50-ZZ-9931",
  },
];

// Intercity: the nine classes named in `src/intercity/classes.ts` that are
// wired to a corridor. Karnataka Sarige is the one unreserved class KSRTC,
// NWKRTC and KKRTC all run - board it and pay like a city bus. Every other
// class here is a numbered seat bought before boarding, and a rider showing
// up at the door with no ticket cannot use one the way a Sarige rider can.
const intercityStickers: Sticker[] = [
  // Four Sarige coaches rather than one. A single sticker is only scannable
  // while that one vehicle happens to be on a working, and a rider or a judge
  // holding the sheet at four in the afternoon would get "between duties" and
  // nothing to buy. These four are chained onto real rostered workings so that
  // at any point between six in the morning and eleven at night at least three
  // of them are carrying passengers and will sell a ticket. Plates, hubs and
  // corporations are read off the fleet server, not invented here.
  {
    id: "karnataka-sarige-hub",
    corporation: "NWKRTC",
    corporationName: "North Western Karnataka Road Transport Corporation",
    hub: "HUB",
    serial: "0118",
    className: "Karnataka Sarige",
    boarding: "Walk-up",
    layout: "Non-AC, 3+2 seater, non-reclining.",
    route: "Badami to Bengaluru, then Bengaluru to Mangaluru",
    plate: "KA-25-ZZ-6108",
  },
  {
    id: "karnataka-sarige-mys",
    corporation: "KSRTC",
    corporationName: "Karnataka State Road Transport Corporation",
    hub: "MYS",
    serial: "0101",
    className: "Karnataka Sarige",
    boarding: "Walk-up",
    layout: "Non-AC, 3+2 seater, non-reclining.",
    route: "Mangaluru to Bengaluru, then Mysuru and Chikkamagaluru",
    plate: "KA-01-ZZ-7749",
  },
  {
    id: "karnataka-sarige-kbs",
    corporation: "KSRTC",
    corporationName: "Karnataka State Road Transport Corporation",
    hub: "KBS",
    serial: "0103",
    className: "Karnataka Sarige",
    boarding: "Walk-up",
    layout: "Non-AC, 3+2 seater, non-reclining.",
    route: "Mangaluru to Bengaluru, then Bengaluru to Hosapete",
    plate: "KA-01-ZZ-9883",
  },
  {
    id: "karnataka-sarige-mdk",
    corporation: "KSRTC",
    corporationName: "Karnataka State Road Transport Corporation",
    hub: "MDK",
    serial: "0101",
    className: "Karnataka Sarige",
    boarding: "Walk-up",
    layout: "Non-AC, 3+2 seater, non-reclining.",
    route: "Bengaluru to Mysuru and back, then on to Mangaluru",
    plate: "KA-01-ZZ-9089",
  },
  {
    id: "rajahamsa-executive",
    corporation: "KSRTC",
    corporationName: "Karnataka State Road Transport Corporation",
    hub: "KBS",
    serial: "0212",
    className: "Rajahamsa Executive",
    boarding: "Reserved",
    layout: "Non-AC, 2+2 seater, reclining.",
    route: "Bengaluru to Mysuru",
    plate: "KA-01-ZZ-5588",
  },
  {
    id: "airavat",
    corporation: "KSRTC",
    corporationName: "Karnataka State Road Transport Corporation",
    hub: "KBS",
    serial: "0323",
    className: "Airavat",
    boarding: "Reserved",
    layout: "AC, 2+2 semi-sleeper.",
    route: "Bengaluru to Mysuru",
    plate: "KA-01-ZZ-7743",
  },
  {
    id: "airavat-club-class",
    corporation: "KSRTC",
    corporationName: "Karnataka State Road Transport Corporation",
    hub: "KBS",
    serial: "0434",
    className: "Airavat Club Class",
    boarding: "Reserved",
    layout: "AC, 2+2 semi-sleeper, multi-axle.",
    route: "Bengaluru to Mangaluru",
    plate: "KA-01-ZZ-8821",
  },
  {
    id: "ambaari-utsav",
    corporation: "KSRTC",
    corporationName: "Karnataka State Road Transport Corporation",
    hub: "KBS",
    serial: "0545",
    className: "Ambaari Utsav",
    boarding: "Reserved",
    layout: "AC, 2+1 sleeper, 40 berths.",
    route: "Bengaluru to Mangaluru",
    plate: "KA-01-ZZ-6094",
  },
  {
    id: "pallakki",
    corporation: "KSRTC",
    corporationName: "Karnataka State Road Transport Corporation",
    hub: "KBS",
    serial: "0656",
    className: "Pallakki",
    boarding: "Reserved",
    layout: "Non-AC, 2+1 sleeper, 30 berths.",
    route: "Bengaluru to Mangaluru",
    plate: "KA-01-ZZ-4470",
  },
  {
    id: "kalyana-ratha",
    corporation: "KKRTC",
    corporationName: "Kalyana Karnataka Road Transport Corporation",
    hub: "HSP",
    serial: "0117",
    className: "Kalyana Ratha",
    boarding: "Reserved",
    layout: "AC sleeper, multi-axle.",
    route: "Bengaluru to Vijayapura",
    plate: "KA-32-ZZ-1189",
  },
  {
    id: "amoghavarsha",
    corporation: "KKRTC",
    corporationName: "Kalyana Karnataka Road Transport Corporation",
    hub: "HSP",
    serial: "0228",
    className: "Amoghavarsha",
    boarding: "Reserved",
    layout: "Non-AC, 2+1 sleeper.",
    route: "Bengaluru to Vijayapura",
    plate: "KA-32-ZZ-2276",
  },
  {
    id: "ac-sleeper",
    corporation: "NWKRTC",
    corporationName: "North Western Karnataka Road Transport Corporation",
    hub: "HUB",
    serial: "0339",
    className: "AC Sleeper",
    boarding: "Reserved",
    layout: "AC, 2+1 sleeper.",
    route: "Bengaluru to Hubballi",
    plate: "KA-25-ZZ-3365",
  },
];

const unreservedIntercity = intercityStickers.filter((s) => s.boarding === "Walk-up");

// The sticker's own colour, not the site's. BMTC keys it by tier
// (Ordinary/Vajra/Vayu Vajra); every printed BMTC sticker in
// public/stickers.html uses exactly these three hex values.
const bmtcColor: Record<string, string> = {
  ordinary: "#c62828",
  "ac-vajra": "#1565c0",
  "airport-vayu-vajra": "#6a1b9a",
};

// The intercity sheet (public/stickers-intercity.html) keys colour by
// operator rather than by class, because the walk-up Karnataka Sarige
// sticker is the only class it printed. The five reserved classes below
// are not in that sheet at all, so they inherit their operator's colour
// rather than inventing a fourth palette - KSRTC, KKRTC and NWKRTC coaches
// already read as themselves regardless of which class they're running.
const operatorColor: Record<string, string> = {
  KSRTC: "#8e2323",
  NWKRTC: "#0f5f66",
  KKRTC: "#3b3b8f",
};

// The BMTC sheet's skyline: a bus stop, a tree, a tower and an office block
// sitting along the sticker's bottom edge at 10% opacity. Ported verbatim
// from the `.sky` svg in public/stickers.html.
function BusSkyline() {
  return (
    <svg
      className="sticker-sky"
      viewBox="0 0 390 78"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <g fill="currentColor">
        <rect x="26" y="58" width="3" height="20" />
        <path d="M27.5 40c11 0 19 6 19 12 0 3.4-3.2 6-8 6H16.5c-4.8 0-8-2.6-8-6 0-6 8-12 19-12Z" />
        <path d="M58 78V44h4v-6h3v-5h2v5h3v6h4v34Z" />
        <rect x="82" y="62" width="34" height="16" />
        <g opacity=".55">
          <rect x="86" y="62" width="2" height="16" />
          <rect x="94" y="62" width="2" height="16" />
          <rect x="102" y="62" width="2" height="16" />
          <rect x="110" y="62" width="2" height="16" />
        </g>
        <g transform="translate(126,0)">
          <path d="M46 30h-2v-4h-1.6v-2H44v-3h4v3h1.6v2H48v4h-2Z" transform="translate(-1,0)" />
          <path d="M31 34c0-8 6.7-14 15-14s15 6 15 14Z" />
          <rect x="28" y="34" width="36" height="5" />
          <rect x="18" y="39" width="56" height="10" />
          <rect x="10" y="49" width="72" height="4" />
          <g>
            <rect x="14" y="53" width="4" height="17" />
            <rect x="24" y="53" width="4" height="17" />
            <rect x="34" y="53" width="4" height="17" />
            <rect x="44" y="53" width="4" height="17" />
            <rect x="54" y="53" width="4" height="17" />
            <rect x="64" y="53" width="4" height="17" />
            <rect x="74" y="53" width="4" height="17" />
          </g>
          <rect x="0" y="44" width="10" height="26" />
          <rect x="82" y="44" width="10" height="26" />
          <path d="M5 38l5 6H0Z" />
          <path d="M87 38l5 6h-10Z" />
          <rect x="-4" y="70" width="100" height="4" />
          <rect x="-10" y="74" width="112" height="4" />
        </g>
        <rect x="240" y="60" width="3" height="18" />
        <path d="M241.5 44c9.5 0 16.5 5.2 16.5 10.4 0 3-2.8 5.6-7 5.6h-19c-4.2 0-7-2.6-7-5.6C225 49.2 232 44 241.5 44Z" />
        <g transform="translate(268,0)">
          <rect x="0" y="52" width="122" height="7" />
          <rect x="10" y="59" width="9" height="19" />
          <rect x="58" y="59" width="9" height="19" />
          <rect x="106" y="59" width="9" height="19" />
          <path d="M14 52V38.6c0-2.6 2.1-4.6 4.6-4.6h66.8c2.5 0 4.6 2 4.6 4.6V52Z" />
          <g fill="#131518" opacity=".55">
            <rect x="20" y="39" width="13" height="7" rx="1.6" />
            <rect x="38" y="39" width="13" height="7" rx="1.6" />
            <rect x="56" y="39" width="13" height="7" rx="1.6" />
            <rect x="74" y="39" width="10" height="7" rx="1.6" />
          </g>
        </g>
      </g>
    </svg>
  );
}

// The intercity sheet's skyline: a highway shoulder and two ridgelines,
// standing in for the ghat roads these coaches actually run. Ported
// verbatim from the `.sky` svg in public/stickers-intercity.html.
function RouteSkyline() {
  return (
    <svg className="sticker-sky" viewBox="0 0 390 78" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <g fill="currentColor">
        <path d="M0 78V56c22-16 40-6 58-18s34-20 56-6 30 26 52 18 34-26 58-16 38 30 62 22 42-22 62-10 30 20 42 16V78Z" />
        <g opacity=".5">
          <path d="M0 78V70c30-4 52 6 78 2s44-14 72-12 46 12 74 8 46-14 76-10 60 12 90 8V78Z" />
        </g>
        <g opacity=".9">
          <rect x="0" y="74" width="390" height="4" />
          <rect x="10" y="71" width="26" height="2" opacity=".55" />
          <rect x="60" y="71" width="26" height="2" opacity=".55" />
          <rect x="110" y="71" width="26" height="2" opacity=".55" />
          <rect x="160" y="71" width="26" height="2" opacity=".55" />
          <rect x="210" y="71" width="26" height="2" opacity=".55" />
          <rect x="260" y="71" width="26" height="2" opacity=".55" />
          <rect x="310" y="71" width="26" height="2" opacity=".55" />
          <rect x="360" y="71" width="26" height="2" opacity=".55" />
        </g>
      </g>
    </svg>
  );
}

function StickerCard({ sticker, accent }: { sticker: Sticker; accent: "bmtc" | "intercity" }) {
  const bin = mintBin(sticker.hub, sticker.serial);
  const digits = bin.slice(sticker.hub.length + 1);
  const payload = payloadFor(bin);
  const matrix = qrMatrix(payload);
  const color = accent === "bmtc" ? bmtcColor[sticker.id] : operatorColor[sticker.corporation];
  const vehicleNoun = accent === "bmtc" ? "bus" : "coach";
  const [headLine1, headLine2] =
    accent === "bmtc" ? ["Book a ticket", "on this bus"] : ["Board and buy", "on this coach"];

  // Tapping a sticker opens it large, the way the printed sheets did. A code
  // read off a laptop at arm's length is the whole point of the page, and at
  // grid size the QR is smaller than a phone camera likes.
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const figure = () => (
    <figure className="sticker-figure" style={{ background: color }}>
        <div className="sticker-sweep" aria-hidden="true" />
        {accent === "bmtc" ? <BusSkyline /> : <RouteSkyline />}
        <div className="sticker-inner">
          <div className="sticker-top">
            <div className="sticker-head">
              {headLine1}
              <br />
              <span>{headLine2}</span>
            </div>
            <div className="sticker-brand">
              <span className="sticker-brand-name">Tatak</span>
              <span className="sticker-brand-kn" lang="kn">ತಟಕ್</span>
            </div>
          </div>
          <div className="sticker-body">
            <div className="sticker-codeblock">
              <div className="sticker-rail" aria-hidden="true">
                <i className="sticker-rail-dot" />
                <i className="sticker-rail-line" />
                <i className="sticker-rail-dot" />
              </div>
              <div className="sticker-hub">{sticker.hub}</div>
              <div className="sticker-digits">{digits}</div>
            </div>
            <div className="sticker-qrwrap">
              <div className="sticker-qr">
                <svg
                  viewBox={`0 0 ${matrix.length} ${matrix.length}`}
                  shapeRendering="crispEdges"
                  fill="#1a1c1f"
                  role="img"
                  aria-label={`QR code for ${vehicleNoun} ${bin}`}
                  dangerouslySetInnerHTML={{ __html: qrSvgRects(matrix) }}
                />
              </div>
              <div className="sticker-qrcap">or scan</div>
            </div>
          </div>
          <div className="sticker-rule" aria-hidden="true" />
          <div className="sticker-foot">
            <div className="sticker-kn" lang="kn">ಟಟಕ್‌ನಲ್ಲಿ ಈ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ</div>
            <div className="sticker-foot-right">
              <span className="sticker-tier-chip">{sticker.className}</span>
              <span className="sticker-plate-chip">{sticker.plate}</span>
            </div>
          </div>
          <div className="sticker-mark">SPECIMEN · PROTOTYPE · NOT A {sticker.corporation} NOTICE</div>
        </div>
    </figure>
  );

  return (
    <div className="sticker-unit" data-reveal>
      {/* The sticker: a solid-colour block with white ink, not a content
          card. This markup and every class name under .sticker-figure is
          a direct port of the printed sheet - see public/stickers.html
          and public/stickers-intercity.html in the app repository. */}
      <button
        type="button"
        className="sticker-open-zoom"
        onClick={show}
        aria-label={`Enlarge the ${sticker.className} sticker, ${bin}`}
      >
        {figure()}
      </button>

      <dialog ref={dialogRef} className="sticker-zoom" onClose={hide} onClick={hide}>
        {/* Clicking the backdrop closes; clicking the sticker itself must not,
            so the shell stops the event before it reaches the dialog. */}
        <div className="sticker-zoom-shell" onClick={(e) => e.stopPropagation()}>
          {figure()}
          <p className="sticker-zoom-note">
            Point a phone camera at the code.
            <span>{bin} &middot; {sticker.className}</span>
          </p>
          <div className="sticker-zoom-actions">
            <a href={payload} target="_blank" rel="noreferrer">Open in Tatak</a>
            <button type="button" onClick={hide}>Close</button>
          </div>
        </div>
      </dialog>

      {/* Everything below the sticker is the page, not the artefact - it
          stays in the landing site's own type and spacing. */}
      <div className="sticker-about">
        <div className="sticker-about-head">
          <h3 className="sticker-class">{sticker.className}</h3>
          {sticker.boarding === "Reserved" ? (
            <span className="fleet-tag">Reserved</span>
          ) : (
            <span className="fleet-tag is-walk-up">Walk-up</span>
          )}
        </div>
        <p className="sticker-bin">{bin} &middot; {sticker.corporationName}</p>
        <p className="sticker-detail">{sticker.layout}</p>
        <dl className="sticker-meta">
          <div>
            <dt>Corridor</dt>
            <dd>{sticker.route}</dd>
          </div>
          <div>
            <dt>Plate</dt>
            <dd>{sticker.plate}</dd>
          </div>
        </dl>
        <a className="sticker-open" href={payload} target="_blank" rel="noreferrer">
          Open in Tatak <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}

export function StickersPage() {
  useRevealAnimations();

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <SiteHeader />

      <section className="stickers-page route-section" id="main-content" aria-labelledby="stickers-title">
        <header className="section-intro compact" data-reveal>
          <div className="section-label"><span>01</span> QR stickers</div>
          <h1 id="stickers-title">QR stickers, by category.</h1>
          <p>These used to be two separate pages at app.tatak.tech, one for BMTC and one for Karnataka Sarige only. They are on this site now, and every service class Tatak&apos;s fleet data covers is on the page, not just one tier of each. Every BIN below carries a real Damm check character, and every QR opens the same board flow at app.tatak.tech/board.</p>
        </header>

        <div className="mcp-panel" data-reveal>
          <div className="mcp-field">
            <span>Sign in first</span>
            <p>Boarding needs a signed-in account. Demo accounts are on the <a href={publicAsset("/sample-users/")}>Sample users</a> page.</p>
          </div>
          <div className="mcp-field">
            <span>On a phone</span>
            <p>Tap <code>Open in Tatak</code> under any sticker.</p>
          </div>
          <div className="mcp-field">
            <span>On a laptop</span>
            <p>Point your phone&apos;s camera at the QR code next to the sticker you want.</p>
          </div>
          <div className="mcp-field">
            <span>Not valid for travel</span>
            <p>Every code on this page is a sample vehicle in Tatak&apos;s fixture fleet, not a bus on the road.</p>
          </div>
        </div>

        <h2 className="page-subhead" data-reveal>BMTC</h2>
        <p className="fleet-copy" data-reveal>BMTC tiers are read off the route short name the way the app reads it: no prefix is Ordinary, <code>V-</code> or <code>VW-</code> is AC, <code>KIA-</code> is the airport coach. Every tier boards the same way - no reservation, no seat number.</p>
        <div className="sticker-grid" data-reveal>
          {bmtcStickers.map((sticker) => (
            <StickerCard key={sticker.id} sticker={sticker} accent="bmtc" />
          ))}
        </div>

        <h2 className="page-subhead" data-reveal>Intercity</h2>
        <p className="fleet-copy" data-reveal>Karnataka Sarige is the one unreserved intercity class, so it is the only one with a sticker: board it and pay like a city bus. Every other coach is sold by numbered seat before boarding and has no ticket to buy on board. Fares, layouts and the full class list are on the <a href={publicAsset("/fleet/")}>Fleet</a> page.</p>
        <p className="fleet-copy" data-reveal>Four coaches are printed rather than one, because a coach can only sell a ticket while it is actually running a working. Between roughly 6am and 11pm at least three of the four are carrying passengers at any moment; the odd one out is standing at a bus station between workings and will say so when scanned. Try the next sticker on the sheet.</p>

        {/* Only the unreserved class. A sticker exists so somebody standing at
            a bus can buy the ride they are about to take, and a reserved coach
            has nothing to sell there: the seat was booked before boarding.
            Printing one would be an invitation to scan and be refused. */}
        <div className="sticker-grid" data-reveal>
          {unreservedIntercity.map((sticker) => (
            <StickerCard key={sticker.id} sticker={sticker} accent="intercity" />
          ))}
        </div>

        <p className="mcp-note" data-reveal>The same board flow is behind every code here. <AppLink className="mcp-inline-link" label="Open Tatak" /></p>

        <a className="contact-back" href={publicAsset("/")}><span aria-hidden="true">←</span> Back to Tatak</a>
      </section>

      <SiteFooter />
    </main>
  );
}
