"use client";

import { SiteFooter, SiteHeader, publicAsset, useRevealAnimations } from "../site-chrome";
import { BUILD, DOWNLOAD_URL, RELEASE_URL } from "./build";

export function AndroidPage({ qrRects, qrSize }: { qrRects: string; qrSize: number }) {
  useRevealAnimations();

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <SiteHeader />

      <section className="android-page route-section" id="main-content" aria-labelledby="android-title">
        <header className="section-intro compact" data-reveal>
          <div className="section-label"><span>01</span> Android app</div>
          <h1 id="android-title">The same Tatak, <em>on your phone.</em></h1>
          <p>
            A native Android build of the planner. It is not on the Play Store and is not going to
            be: it is a prototype, signed with a debug key, installed by hand. Everything the web
            app does it does, against the same <code>app.tatak.tech</code> backend and the same
            sample accounts.
          </p>
        </header>

        <div className="android-get" data-reveal>
          <div className="android-get-actions">
            <a className="button button-primary android-download" href={DOWNLOAD_URL}>
              <span>Download the APK</span>
              <span aria-hidden="true">↓</span>
            </a>
            <p className="android-get-note">
              {BUILD.size}, version {BUILD.version}. The link always points at the newest release,
              so it does not go stale.
            </p>
            <a className="mcp-inline-link" href={RELEASE_URL} target="_blank" rel="noreferrer">
              <span>Release notes and checksum file</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <figure className="android-qr">
            <div className="android-qr-panel">
              {/* Encoded at build time by this repository's own QR encoder, the
                  same one the sticker sheet uses. Inline SVG rather than an
                  image request, so the code is in the HTML and no third party
                  is asked what this page links to. */}
              <svg
                viewBox={`0 0 ${qrSize} ${qrSize}`}
                shapeRendering="crispEdges"
                fill="#171815"
                role="img"
                aria-label="QR code for the Tatak APK download link"
                dangerouslySetInnerHTML={{ __html: qrRects }}
              />
            </div>
            <figcaption>Scan to download on the phone itself</figcaption>
          </figure>
        </div>

        <div className="info-panel" data-reveal>
          <div className="mcp-field">
            <span>Version</span>
            <div>
              <code>{BUILD.version}</code>
              <p>The versionName the build itself reports, not a tag name typed by hand.</p>
            </div>
          </div>
          <div className="mcp-field">
            <span>Size</span>
            <div>
              {/* Thousands, not lakhs: a byte count is read against other
                  byte counts, and every tool that prints one groups it this
                  way. */}
              <code>{`${BUILD.bytes.toLocaleString("en-US")} bytes`}</code>
              <p>
                {BUILD.size}. Large because the basemap styles and the offline artifact ship inside
                it rather than being downloaded on first run.
              </p>
            </div>
          </div>
          <div className="mcp-field">
            <span>Signing</span>
            <div>
              <code>Debug key</code>
              <p>
                Not a release key, so Play Protect will say it cannot verify the developer. That
                warning is accurate. Install it only if you got the link from this site.
              </p>
            </div>
          </div>
          <div className="mcp-field mcp-token-field">
            <span>SHA-256</span>
            <code className="mcp-token">{BUILD.sha256}</code>
          </div>
        </div>

        <p className="mcp-note" data-reveal>
          Check the file you downloaded against that digest before installing it. On macOS or Linux
          run <code>shasum -a 256 tatak.apk</code>; on Windows,{" "}
          <code>certutil -hashfile tatak.apk SHA256</code>. The same digest is published as
          <code>tatak-full-{BUILD.version}.apk.sha256</code> beside the download on the release
          page, so it can be compared against a copy this site does not control. If the two do not
          match, do not install the file.
        </p>

        <h2 className="page-subhead" data-reveal>Installing it</h2>
        <ol className="mcp-steps android-steps" data-reveal>
          <li>Chrome will warn that this kind of file can harm your device. Keep it.</li>
          <li>Open the downloaded file. Android asks whether Chrome may install apps. Allow it once.</li>
          <li>Play Protect warns about the debug key. Choose to install anyway.</li>
        </ol>

        <p className="mcp-note" data-reveal>
          First launch shows the onboarding sheet, then sign-in. Any account from{" "}
          <a href={publicAsset("/sample-users/")}>Sample users</a> works, and so does the
          walkthrough on <a href={publicAsset("/judges/")}>Instructions for judges</a>.
        </p>

        <p className="mcp-note" data-reveal>
          Every ticket and PNR this app issues is a specimen. It is not valid for travel, no
          operator will honour it, and no money moves. Tatak is an independent prototype and is not
          affiliated with BMTC, BMRCL, KSRTC or any government body.
        </p>

        <a className="contact-back" href={publicAsset("/")}><span aria-hidden="true">←</span> Back to Tatak</a>
      </section>

      <SiteFooter />
    </main>
  );
}
