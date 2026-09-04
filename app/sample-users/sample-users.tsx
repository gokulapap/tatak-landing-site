"use client";

import { SiteFooter, SiteHeader, publicAsset, useRevealAnimations } from "../site-chrome";

const DEMO_PASSWORD = "tatak-demo-2026";

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

        <a className="contact-back" href={publicAsset("/")}><span aria-hidden="true">←</span> Back to Tatak</a>
      </section>

      <SiteFooter />
    </main>
  );
}
