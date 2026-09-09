"use client";

import { SiteFooter, SiteHeader, publicAsset, useRevealAnimations } from "../site-chrome";
import { releaseAnchor, releases } from "./entries";

/**
 * A body is plain text apart from the literals the app prints verbatim - a
 * badge, a stamp - which `entries.ts` marks with backticks. Splitting on those
 * keeps the data module free of JSX and this page free of a markdown parser.
 */
function inline(text: string) {
  return text
    .split(/`([^`]+)`/)
    .map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : part));
}

/**
 * The changelog is drawn as the app's own itinerary rail.
 *
 * Tatak's answer to "how do I get there" is a vertical line with a ring at
 * every place you change and a dot at every step in between
 * (app/plan/ItineraryDetail.tsx, `.legrail` in app/styles/results.css). This
 * page asks the same question of the project, so it gets the same drawing: one
 * line down the left, an interchange ring for each release, a filled dot for
 * each change on it, and a terminal dot where the line stops.
 *
 * The marks are decorative by contract - `aria-hidden`, and the release's
 * accessible name is its version and date - because a screen reader is
 * already reading a nested list and does not need the geometry described.
 */
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

        {/* The rail itself never reveals. The observer in `useRevealAnimations`
            fires at a threshold of 0.08, and this container is taller than
            twelve viewports, so it could never reach 8% visible and would
            simply stay at opacity 0. The releases on it reveal instead, and
            globals.css takes the translate off that reveal so a ring can never
            leave the line it sits on. */}
        <div className="changelog-rail">
          {releases.map((release, index) => {
            const id = releaseAnchor(release);

            return (
              <section
                className={`changelog-release${index === 0 ? " is-latest" : ""}`}
                id={id}
                key={id}
                aria-labelledby={`${id}-stop`}
                data-reveal
              >
                <span className="changelog-ring" aria-hidden="true" />
                <h2 className="changelog-stop" id={`${id}-stop`}>
                  {release.version ? (
                    <span className="changelog-version">{release.version}</span>
                  ) : null}
                  {/* The date links to its own section, so a link can be
                      copied off the page and point at one release. */}
                  <a className="changelog-date" href={`#${id}`}>{release.date}</a>
                  {index === 0 ? <span className="changelog-latest-tag">Latest</span> : null}
                </h2>

                <ol className="changelog-changes">
                  {release.changes.map((change) => (
                    <li className="changelog-change" key={change.title}>
                      <span className="changelog-dot" aria-hidden="true" />
                      <h3 className="changelog-change-title">{change.title}</h3>
                      <p className="changelog-change-body">{inline(change.body)}</p>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}

          {/* The last stop. The app draws one at the end of every itinerary,
              and without it the line would stop at a change rather than at
              the end of the journey. */}
          <p className="changelog-terminus">
            <span className="changelog-term" aria-hidden="true" />
            Where Tatak started.
          </p>
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
