"use client";

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
  {
    id: "karnataka-sarige",
    corporation: "KSRTC",
    corporationName: "Karnataka State Road Transport Corporation",
    hub: "KBS",
    serial: "0101",
    className: "Karnataka Sarige",
    boarding: "Walk-up",
    layout: "Non-AC, 3+2 seater, non-reclining.",
    route: "Bengaluru to Mysuru",
    plate: "KA-01-ZZ-3312",
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
const reservedIntercity = intercityStickers.filter((s) => s.boarding === "Reserved");

function StickerCard({ sticker, accent }: { sticker: Sticker; accent: "bmtc" | "intercity" }) {
  const bin = mintBin(sticker.hub, sticker.serial);
  const digits = bin.slice(sticker.hub.length + 1);
  const payload = payloadFor(bin);
  const matrix = qrMatrix(payload);

  return (
    <article className={`sticker-card is-${accent}`} data-reveal>
      <div className="sticker-card-head">
        <span className="sticker-corp">{sticker.corporation}</span>
        {sticker.boarding === "Reserved" ? (
          <span className="fleet-tag">Reserved</span>
        ) : (
          <span className="fleet-tag is-walk-up">Walk-up</span>
        )}
      </div>
      <div className="sticker-card-body">
        <div className="sticker-code">
          <span className="sticker-hub">{sticker.hub}</span>
          <span className="sticker-digits">{digits}</span>
        </div>
        <div className="sticker-qr">
          <svg
            viewBox={`0 0 ${matrix.length} ${matrix.length}`}
            shapeRendering="crispEdges"
            fill="#171815"
            role="img"
            aria-label={`QR code for ${sticker.className}, ${bin}`}
            dangerouslySetInnerHTML={{ __html: qrSvgRects(matrix) }}
          />
        </div>
      </div>
      <p className="sticker-class">{sticker.className}</p>
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
        <div>
          <dt>Operator</dt>
          <dd>{sticker.corporationName}</dd>
        </div>
      </dl>
      <a className="sticker-open" href={payload} target="_blank" rel="noreferrer">
        Open in Tatak <span aria-hidden="true">↗</span>
      </a>
    </article>
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
        <p className="fleet-copy" data-reveal>Karnataka Sarige is the one unreserved intercity class - board it and pay like a city bus. Every other class here is sold by numbered seat before boarding. Fares, layouts and the full class list are on the <a href={publicAsset("/fleet/")}>Fleet</a> page.</p>

        <h3 className="sticker-subhead" data-reveal>Unreserved</h3>
        <div className="sticker-grid" data-reveal>
          {unreservedIntercity.map((sticker) => (
            <StickerCard key={sticker.id} sticker={sticker} accent="intercity" />
          ))}
        </div>

        <h3 className="sticker-subhead" data-reveal>Reserved</h3>
        <div className="sticker-grid" data-reveal>
          {reservedIntercity.map((sticker) => (
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
