"use client";

import { SiteFooter, SiteHeader, publicAsset, useRevealAnimations } from "../site-chrome";
import { accounts, DEMO_PASSWORD } from "../sample-users/sample-users";

// Reused, not copied. /sample-users/ is the one place this list is typed
// out; leading with a single account here and linking across keeps this
// page from drifting out of sync with that one if it changes.
const judgeAccount = accounts.find((account) => account.email === "judges@tatak.tech")!;

// The seven codes printed on the sticker sheet, the same literals
// app/stickers/stickers.tsx and app/fleet-roster/fleet-roster.tsx mint
// their stickers and demo picks from - see those files for where the
// plate, route and corridor details come from.
const stickerCodes = [
  { bin: "BLR-05465", note: "BMTC Ordinary, route 500-D" },
  { bin: "BLR-08484", note: "BMTC Vajra (AC), route V-335E" },
  { bin: "BLR-07408", note: "BMTC Vayu Vajra (airport), route KIA-15" },
  { bin: "HUB-01181", note: "Karnataka Sarige coach" },
  { bin: "MYS-01010", note: "Karnataka Sarige coach" },
  { bin: "KBS-01032", note: "Karnataka Sarige coach" },
  { bin: "MDK-01010", note: "Karnataka Sarige coach" },
];

export function JudgesPage() {
  useRevealAnimations();

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <SiteHeader />

      <section className="judges-page route-section" id="main-content" aria-labelledby="judges-title">
        <header className="section-intro compact" data-reveal>
          <div className="section-label"><span>01</span> Instructions for judges</div>
          <h1 id="judges-title">Six things that work, <em>verified today.</em></h1>
          <p>
            Sign in below, then follow these in whatever order suits you. Every step on this page
            ran on production the day it was written, on the vehicles and services named here.
            Nothing is invented and nothing is a guess at what should work.
          </p>
        </header>

        <div className="mcp-panel" data-reveal>
          <div className="mcp-field">
            <span>Sign in</span>
            <div>
              <code>{judgeAccount.email}</code>
              <p>
                {judgeAccount.note} The full set of sample accounts, including the concession and
                operator-console flows, is at <a href={publicAsset("/sample-users/")}>Sample users</a>.
              </p>
            </div>
          </div>
          <div className="mcp-field mcp-token-field">
            <span>Password</span>
            <code className="mcp-token">{DEMO_PASSWORD}</code>
          </div>
        </div>

        <p className="mcp-note" data-reveal>
          Two things below will look broken and are not. A departure inside roughly the next 45
          minutes stops being offered, because the operator closes reservations before departure -
          if a service you expect is missing, pick a later one or tomorrow. And a Sarige coach
          caught between two workings reports itself parked and sells nothing - that is the real
          roster, not a fault, so try another code from the table below.
        </p>

        <h2 className="page-subhead" data-reveal>1. Scan a sticker, buy an on-board ticket</h2>
        <p className="fleet-copy" data-reveal>
          The printed sheet is at <a href={publicAsset("/stickers/")}>QR stickers</a>. All seven
          codes there are real vehicles. No phone camera handy? Type a code by hand at{" "}
          <code>app.tatak.tech/board</code> instead of scanning it.
        </p>
        <div className="fleet-table-wrap" data-reveal>
          <table className="fleet-table">
            <caption>Codes to scan or type</caption>
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Vehicle</th>
              </tr>
            </thead>
            <tbody>
              {stickerCodes.map((code) => (
                <tr key={code.bin}>
                  <th scope="row"><code>{code.bin}</code></th>
                  <td>{code.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="page-subhead" data-reveal>2. Change stops on a Sarige coach, watch the fare move</h2>
        <p className="fleet-copy" data-reveal>
          Board any of the four Karnataka Sarige codes above. The boarding and alighting pickers
          offer only the stops that coach actually calls at, in order, and the fare shown is the
          operator&apos;s published fare for that exact pair. Change the alighting stop and the
          fare changes with it.
        </p>

        <h2 className="page-subhead" data-reveal>3. Plan a journey, city or statewide</h2>
        <p className="fleet-copy" data-reveal>
          One search box for both. Anything inside Bengaluru works, and so does Kundalahalli Gate
          to Chikkamagaluru, Hubballi, Mysuru or Mangaluru.
        </p>

        <h2 className="page-subhead" data-reveal>4. Book a reserved seat to a real PNR</h2>
        <p className="fleet-copy" data-reveal>This exact path was run end to end and produced a booking:</p>
        <ol className="mcp-steps" data-reveal>
          <li>Plan a journey from Kundalahalli Gate to Hubballi.</li>
          <li>
            Take the 18:30 Airavat from Majestic - service <code>1830BNGDVG</code>. Inside the
            45-minute cutoff above? Pick a later departure or tomorrow instead.
          </li>
          <li>Choose a boarding point.</li>
          <li>Pick a seat off the seat map.</li>
          <li>Enter a passenger and confirm.</li>
        </ol>
        <p className="fleet-copy" data-reveal>
          That run produced <code>PNR SPECIMEN-KSRTC-C5D85B31</code>. Yours will carry a different one.
        </p>

        <h2 className="page-subhead" data-reveal>5. Look at a seat map</h2>
        <p className="fleet-copy" data-reveal>
          Every one of the fifteen coach classes draws its real layout, sent by the operator
          rather than guessed - 2+2 seaters, 3+2 seaters and sleeper berths all render. Walkthrough
          4 puts one in front of you; any other reserved-class booking will too.
        </p>

        <h2 className="page-subhead" data-reveal>6. The fleet roster</h2>
        <p className="fleet-copy" data-reveal>
          <a href={publicAsset("/fleet-roster/")}>Fleet roster</a> lists all 813 tracked vehicles,
          with live status checked against the seven demo picks above.
        </p>

        <p className="mcp-note" data-reveal>
          Tatak also answers as an MCP server, so an assistant can query the same planner directly -
          see <a href={publicAsset("/mcp/")}>MCP server</a>. It is token-gated, so there is nothing
          on that page a judge can try without one being issued first.
        </p>

        <a className="contact-back" href={publicAsset("/")}><span aria-hidden="true">←</span> Back to Tatak</a>
      </section>

      <SiteFooter />
    </main>
  );
}
