"use client";

import { SiteFooter, SiteHeader, publicAsset, useRevealAnimations } from "../site-chrome";

const DEMO_PASSWORD = "tatak-demo-2026";

// The counter side of the concession flow. Not rider logins, and not the
// same door: /operator holds its own session cookie, so nothing a rider
// carries can be mistaken for staff.
const operators = [
  {
    label: "BMTC counter",
    staffId: "BMTC-MJ-01",
    note: "Kempegowda Bus Station.",
  },
  {
    label: "Metro counter",
    staffId: "BMRCL-MJ-01",
    note: "Majestic metro station.",
  },
];

const accounts = [
  {
    label: "Student",
    email: "student@tatak.tech",
    note: "Concession-verified already, so the discounted fare shows straight away.",
  },
  {
    label: "Senior citizen",
    email: "senior@tatak.tech",
    note: "Not verified yet, so you can run the verification flow yourself.",
  },
  {
    label: "Vathsan",
    email: "vathsan@tatak.tech",
    note: "An ordinary rider.",
  },
  {
    label: "Gokul",
    email: "gokul@tatak.tech",
    note: "An ordinary rider.",
  },
  {
    label: "Judges",
    email: "judges@tatak.tech",
    note: "An ordinary rider, printed on the sticker sheet.",
  },
];

export function SampleUsersPage() {
  useRevealAnimations();

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <SiteHeader />

      <section className="sample-users-page route-section" id="main-content" aria-labelledby="sample-users-title">
        <header className="section-intro compact" data-reveal>
          <div className="section-label"><span>01</span> Sample users</div>
          <h1 id="sample-users-title">A way past <em>the front door.</em></h1>
          <p>Tatak asks for sign-in first now. Use any account below, no registering required.</p>
        </header>

        <div className="mcp-panel" data-reveal>
          {accounts.map((account) => (
            <div className="mcp-field" key={account.email}>
              <span>{account.label}</span>
              <div>
                <code>{account.email}</code>
                <p>{account.note}</p>
              </div>
            </div>
          ))}
          <div className="mcp-field mcp-token-field">
            <span>Password</span>
            <code className="mcp-token">{DEMO_PASSWORD}</code>
          </div>
        </div>

        <p className="mcp-note" data-reveal>Every account here is a demonstration account. None of it is real.</p>

        <header className="section-intro compact" data-reveal>
          <div className="section-label"><span>02</span> Operator console</div>
          <h2>The other <em>side of the counter.</em></h2>
          <p>
            A concession is not something a rider grants themselves. Today a student or a senior
            citizen proves it in person to BMTC or metro staff, and Tatak keeps it that way: the
            rider shows a rotating six-digit code from their account, the person at the counter
            types it in, and the discount is attested against the account rather than against a
            photograph of an ID sitting on a server.
          </p>
          <p>
            The console lives at <code>app.tatak.tech/operator</code> and nothing a rider taps
            leads there. Sign in with a staff id below, then look up the code that
            <code>senior@tatak.tech</code> generates from its account screen. That account is
            deliberately left unverified so the flow has something to do.
          </p>
        </header>

        <div className="mcp-panel" data-reveal>
          {operators.map((operator) => (
            <div className="mcp-field" key={operator.staffId}>
              <span>{operator.label}</span>
              <div>
                <code>{operator.staffId}</code>
                <p>{operator.note}</p>
              </div>
            </div>
          ))}
          <div className="mcp-field mcp-token-field">
            <span>Password</span>
            <code className="mcp-token">{DEMO_PASSWORD}</code>
          </div>
        </div>

        <p className="mcp-note" data-reveal>
          Staff sessions are separate from rider ones and last twelve hours. Attesting a
          concession changes what that rider pays, so it is the one thing on this page that
          writes something you cannot undo.
        </p>

        <a className="contact-back" href={publicAsset("/")}><span aria-hidden="true">←</span> Back to Tatak</a>
      </section>

      <SiteFooter />
    </main>
  );
}
