"use client";

import { CONTACT_EMAIL, SiteFooter, SiteHeader, publicAsset, useRevealAnimations } from "../site-chrome";

export function ContactPage() {
  useRevealAnimations();

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <SiteHeader />

      <section className="contact-section" id="main-content" aria-labelledby="contact-title">
        <header className="section-intro compact" data-reveal>
          <div className="section-label"><span>01</span> Contact</div>
          <h2 id="contact-title">Behind Tatak.</h2>
        </header>

        <div className="mcp-panel contact-panel" data-reveal>
          <div className="mcp-field">
            <span>Vathsan</span>
            <p><a href="https://vathsan.vercel.app/" target="_blank" rel="noreferrer">vathsan.vercel.app</a></p>
          </div>
          <div className="mcp-field">
            <span>Gokul</span>
            <p><a href="https://gokulap.me/" target="_blank" rel="noreferrer">gokulap.me</a></p>
          </div>
          <div className="mcp-field">
            <span>Email</span>
            <p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
          </div>
        </div>

        <a className="contact-back" href={publicAsset("/")}><span aria-hidden="true">←</span> Back to Tatak</a>
      </section>

      <SiteFooter />
    </main>
  );
}
