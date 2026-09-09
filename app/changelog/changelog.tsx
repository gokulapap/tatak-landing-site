"use client";

import { SiteFooter, SiteHeader, publicAsset, useRevealAnimations } from "../site-chrome";
import { releaseAnchor, releases } from "./entries";

/**
 * A bullet is plain text apart from the literals the app prints verbatim - a
 * badge, a stamp - which `entries.ts` marks with backticks. Splitting on those
 * keeps the data module free of JSX and this page free of a markdown parser.
 */
function inline(text: string) {
  return text
    .split(/`([^`]+)`/)
    .map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : part));
}

export function ChangelogPage() {
  useRevealAnimations();

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <SiteHeader />

      <section className="changelog-page route-section" id="main-content" aria-labelledby="changelog-title">
        <header className="section-intro compact" data-reveal>
          <div className="section-label"><span>01</span> Changelog</div>
          <h1 id="changelog-title">What&apos;s new <em>in Tatak.</em></h1>
          <p className="changelog-lede">
            Newest first. Every ticket and pass Tatak issues is a <strong>specimen</strong>,
            marked <code>SPECIMEN - NOT VALID FOR TRAVEL</code>.
          </p>
        </header>

        <div className="changelog-list">
          {releases.map((release, index) => {
            const id = releaseAnchor(release);

            return (
              <section
                className={`changelog-release${index === 0 ? " is-latest" : ""}`}
                id={id}
                key={id}
                aria-labelledby={`${id}-headline`}
                data-reveal
              >
                <p className="changelog-eyebrow">
                  {/* The date links to its own section, so a link can be
                      copied off the page and point at one release. */}
                  <a className="changelog-date" href={`#${id}`}>{release.date}</a>
                  {release.version ? <span className="changelog-version">{release.version}</span> : null}
                  {index === 0 ? <span className="changelog-latest-tag">Latest</span> : null}
                </p>
                <h2 className="changelog-headline" id={`${id}-headline`}>{release.headline}</h2>
                <ul className="changelog-points">
                  {release.bullets.map((bullet) => (
                    <li key={bullet}>{inline(bullet)}</li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <p className="mcp-note" data-reveal>
          Tatak is an independent prototype and is not affiliated with BMTC, BMRCL, KSRTC or any
          government body. Nothing listed here moves money or issues a ticket an operator will
          honour. The build these notes describe is at{" "}
          <a href={publicAsset("/android/")}>Android app</a>, and the walkthroughs are on{" "}
          <a href={publicAsset("/judges/")}>Instructions for judges</a>.
        </p>

        <a className="contact-back" href={publicAsset("/")}><span aria-hidden="true">←</span> Back to Tatak</a>
      </section>

      <SiteFooter />
    </main>
  );
}
