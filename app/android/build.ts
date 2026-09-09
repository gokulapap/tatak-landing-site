/**
 * What the Android page states about the APK, and where the APK lives.
 *
 * Its own module rather than constants inside the page component, because the
 * server component encodes `DOWNLOAD_URL` into a QR at build time and the
 * client component prints the same string: one literal, read by both, so the
 * code on the page and the link under the button can never disagree.
 *
 * The APK is hosted as a GitHub Release asset on this repository, not
 * committed into it and not on the Tatak app repository either. Three
 * reasons, all hard:
 *
 * - The Tatak app repository is private. A release asset posted there sits
 *   behind GitHub auth, so a direct link 404s for anyone without access -
 *   which is everyone this page is written for.
 * - GitHub Pages serves this site, and Pages does not serve Git LFS objects.
 *   An 87 MB binary committed here without LFS would sit in this repository's
 *   history for good, and every clone would pay for it forever.
 * - app.tatak.tech excludes `releases/**` from its build trace, so the app's
 *   own dyno never has the file to serve either.
 */

/**
 * `/releases/latest/download/<name>` is GitHub's stable redirect to whatever
 * the newest release calls `<name>`, so this page needs no edit when a build
 * ships. The facts below do, and they are stated rather than fetched: a page
 * that fetched them would show nothing while GitHub is slow, and could not be
 * checked at all off a printed copy.
 */
export const DOWNLOAD_URL =
  "https://github.com/gokulapap/tatak-landing-site/releases/latest/download/tatak.apk";

/** The release page carries the checksum file and the notes for the build. */
export const RELEASE_URL = "https://github.com/gokulapap/tatak-landing-site/releases/latest";

/**
 * Read off the build itself, not off a changelog: `aapt dump badging` for the
 * versionName, `shasum -a 256` for the digest, `ls -l` for the byte count.
 * The app repository's `scripts/publish-apk.sh` prints all three when it
 * stages a release, so they can be checked against this page before a push.
 */
export const BUILD = {
  version: "0.10.0-beta.1",
  bytes: 91_139_530,
  size: "87 MB",
  sha256: "73bda26514ddcb2beea483fe43e15120b662fe8973b88a3b07fead2ce0841a80",
} as const;
