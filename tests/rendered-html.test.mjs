import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`https://tatak.example${path}`, {
      headers: { accept: "text/html", host: "tatak.example" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete Tatak landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>Tatak - One search for every way across Karnataka<\/title>/i,
  );
  assert.match(html, /One search for every way/);
  assert.match(html, /Plan from door to destination/);
  assert.match(html, /BMTC/);
  assert.match(html, /Namma Metro/);
  assert.match(html, /Hebbala/);
  assert.match(html, /Indiranagar/);
  assert.match(html, /ಹೆಬ್ಬಾಳ/);
  assert.match(html, /https:\/\/app\.tatak\.tech/);
  assert.match(html, /https:\/\/tatak\.example\/og-tatak-premium\.png/);
  assert.match(html, /Independent project/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Starter Project/i);

  // The MCP block is a route of its own, reachable from the nav, and no
  // longer a section of the home page.
  assert.doesNotMatch(html, /class="[^"]*mcp-panel[^"]*"/);
  assert.doesNotMatch(html, /id="mcp"/);
  assert.match(html, /href="\/mcp\/"/);
  assert.match(html, /href="\/fleet\/"/);
  assert.match(html, /href="\/emission\/"/);
  assert.match(html, /href="\/stickers\/"/);
  assert.doesNotMatch(html, /app\.tatak\.tech\/stickers\.html/);

  // The hero has three doors now: the web app, the Android build, and the
  // judges walkthrough. None of them point at the in-page #journey anchor
  // the second button used to scroll to.
  assert.match(html, /href="\/judges\/"/);
  assert.match(html, /Instructions for Judges/);
  assert.match(html, /href="\/android\/"/);
  assert.match(html, /Try Tatak on Android/);
  assert.match(html, /Try Tatak on Web/);
  assert.doesNotMatch(html, /href="#journey"/);
});

test("ships the product stage and accessible interaction structure", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /class="[^"]*product-preview[^"]*"/);
  assert.match(html, /class="[^"]*problem-section[^"]*"/);
  assert.match(html, /class="[^"]*journey-board[^"]*"/);
  assert.match(html, /class="[^"]*signals-section[^"]*"/);
  assert.match(html, /class="[^"]*workflow-list[^"]*"/);
  assert.match(html, /\/tatak-world-960\.webp/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /aria-controls="mobile-navigation"/);
  assert.match(html, /aria-label="Journey ranking preference"/);
  assert.match(html, /aria-controls="journey-proof"/);
  assert.match(html, /See how Tatak knows/);
  assert.match(html, /loading="lazy"/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test("server-renders the MCP route", async () => {
  const response = await render("/mcp");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>MCP server - Tatak<\/title>/i);
  assert.match(html, /https:\/\/app\.tatak\.tech\/api\/mcp/);
  assert.match(html, /claude mcp add --transport http/);
  assert.match(html, /MCP_ENABLED/);
  assert.match(html, /mcp-disabled/);
  assert.match(html, /plan_journey/);
  assert.match(html, /meet_in_the_middle/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test("server-renders the emission route with its cited factors", async () => {
  const response = await render("/emission");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>How the emission figure is worked out - Tatak<\/title>/i);
  assert.match(html, /0\.130 kg CO2/);
  assert.match(html, /0\.015161 kg CO2/);
  assert.match(html, /0\.025 kg CO2e/);
  assert.match(html, /India GHG Program/);
  assert.match(html, /section 5\.3\.1/);
  assert.match(html, /section 5\.4\.1/);
  assert.match(html, /21 kg a year on average/);
  assert.match(html, /straight line between the journey/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test("server-renders the fleet route with figures from the app's own tables", async () => {
  const response = await render("/fleet");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>Every vehicle Tatak plans over - Tatak<\/title>/i);
  assert.match(html, /Karnataka Sarige/);
  assert.match(html, /Rajahamsa Executive/);
  assert.match(html, /Pallakki non-AC sleeper/);
  assert.match(html, /Airavat Club Class/);
  assert.match(html, /Ambaari Utsav/);
  assert.match(html, /Walk-up/);
  assert.match(html, /Unresolved/);
  assert.match(html, /Vayu Vajra/);
  assert.match(html, /KIA-/);
  assert.match(html, /₹10 to ₹90/);
  // The three lines are named beside their own colour rather than in a
  // sentence, so assert the names and the dots that carry the colour.
  for (const line of ["Green", "Purple", "Yellow"]) {
    assert.match(html, new RegExp(`line-dot is-${line.toLowerCase()}[^>]*></i>${line}`));
  }
  // Fleet roster dropped out of the header, so this page carries the only
  // link to it: the individual vehicles behind the classes described here.
  assert.match(html, /href="\/fleet-roster\/"/);
  assert.match(html, /fleet roster/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test("server-renders the stickers route with every category and a working payload", async () => {
  const response = await render("/stickers");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>QR stickers - Tatak<\/title>/i);

  // BMTC tiers - the app's own vocabulary, not invented labels.
  assert.match(html, />Ordinary</);
  assert.match(html, /AC \(Vajra\)/);
  assert.match(html, /Airport \(Vayu Vajra\)/);

  // Karnataka Sarige is the only intercity sticker, because it is the only
  // intercity class you can board and pay on. A sticker on a reserved coach
  // would invite a scan that can only be refused: the seat was sold before
  // boarding and there is nothing to buy at the door.
  assert.match(html, /Karnataka Sarige/);
  assert.match(html, /Walk-up/);
  for (const reserved of [
    "Rajahamsa Executive",
    "Airavat Club Class",
    "Ambaari Utsav",
    "Pallakki",
    "Kalyana Ratha",
    "Amoghavarsha",
    "AC Sleeper",
  ]) {
    assert.ok(!html.includes(reserved), `${reserved} should have no sticker`);
  }

  // Tapping a sticker opens it large, which is how a code gets read off a
  // laptop screen by a phone camera.
  assert.match(html, /class="sticker-open-zoom"/);

  // Every QR encodes a real board payload, and every BIN carries a Damm
  // check character (mintBin computes it, not a hand-typed literal).
  // The four that remain: the three BMTC tiers and Karnataka Sarige. The
  // HSP and HUB codes this used to assert belonged to reserved coaches.
  for (const bin of ["BLR-05465", "BLR-08484", "BLR-07408", "KBS-01032"]) {
    assert.match(html, new RegExp(`https://app\\.tatak\\.tech/board\\?code=${bin}`));
  }
  assert.match(html, /class="[^"]*sticker-qr[^"]*"/);

  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test("server-renders the judges route with verified walkthroughs and no stale credential", async () => {
  const response = await render("/judges");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>Instructions for judges - Tatak<\/title>/i);

  // Leads with one sample-users account rather than a second, driftable
  // copy of the list.
  assert.match(html, /judges@tatak\.tech/);
  assert.match(html, /tatak-demo-2026/);
  assert.match(html, /href="\/sample-users\/"/);

  // The seven sticker-sheet codes, the 45-minute reservation cutoff and the
  // "parked between workings" caveat, and the one verified PNR run.
  for (const bin of ["BLR-05465", "BLR-08484", "BLR-07408", "HUB-01181", "MYS-01010", "KBS-01032", "MDK-01010"]) {
    assert.match(html, new RegExp(bin));
  }
  assert.match(html, /45.minute/);
  // The route pair, not a service id. A named departure falls inside the
  // operator's reservation cutoff a few hours after it is written down and
  // then reads as a broken instruction; the pair stays bookable because its
  // departures run from early morning to late at night.
  assert.match(html, /Kundalahalli Gate/);
  assert.match(html, /Hubballi/);
  assert.match(html, /SPECIMEN-KSRTC-C5D85B31/);
  assert.match(html, /SPECIMEN-KSRTC-C63A2847/);
  assert.match(html, /href="\/fleet-roster\/"/);
  assert.match(html, /href="\/mcp\/"/);

  // Nothing on this repo should still point at the retired demo address.
  assert.doesNotMatch(html, /tatak\.invalid/);

  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test("server-renders the Android route with a checkable build, not a bare download", async () => {
  const response = await render("/android");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>Get the Android app - Tatak<\/title>/i);

  // The stable latest-release redirect, not a per-version asset URL. A
  // versioned link would have to be edited on this site every time a build
  // ships, and would 404 in between.
  assert.match(
    html,
    /https:\/\/github\.com\/gokulapap\/tatak-landing-site\/releases\/latest\/download\/tatak\.apk/,
  );
  assert.match(html, /https:\/\/github\.com\/gokulapap\/tatak-landing-site\/releases\/latest"/);

  // The three facts that make the sideload checkable rather than blind: what
  // it is, how big it is, and what it should hash to. The 2026-08-21 security
  // review flagged a download offered with none of them.
  assert.match(html, /0\.10\.0-beta\.1/);
  assert.match(html, /91,139,530 bytes/);
  assert.match(
    html,
    /73bda26514ddcb2beea483fe43e15120b662fe8973b88a3b07fead2ce0841a80/,
  );
  assert.match(html, /shasum -a 256 tatak\.apk/);

  // Both warnings Android actually shows, named before they appear.
  assert.match(html, /Play Protect/);
  assert.match(html, /can harm your device/);

  // The QR is encoded into the HTML at build time, not fetched at runtime.
  assert.match(html, /class="android-qr-panel"/);
  assert.match(html, /<rect x="\d+" y="\d+" width="\d+" height="1"\/>/);
  assert.doesNotMatch(html, /api\.qrserver\.com|chart\.googleapis\.com/);

  // The caveat the app itself carries.
  assert.match(html, /not valid for travel/);

  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test("server-renders the changelog as a rail of releases and changes", async () => {
  const response = await render("/changelog");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>Changelog - Tatak<\/title>/i);

  // The note that governs everything below it: nothing Tatak issues is a
  // real ticket.
  assert.match(html, /SPECIMEN - NOT VALID FOR TRAVEL/);

  // Eleven stops on one rail, each its own section with an anchor taken from
  // its date, so a link can point at one.
  assert.equal((html.match(/class="changelog-release/g) ?? []).length, 11);
  assert.equal((html.match(/class="changelog-ring"/g) ?? []).length, 11);
  for (const id of [
    "2026-09-08",
    "2026-09-07",
    "2026-09-06",
    "2026-09-05",
    "2026-09-04",
    "2026-09-02",
    "2026-08-27",
    "2026-08-22",
    "2026-08-18",
    "2026-08-08",
    "2026-08-05",
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }

  // A dot per change, on the same rail as the rings, and one terminal dot
  // where the line stops.
  const titles = [...html.matchAll(/class="changelog-change-title">([^<]+)</g)].map(
    (match) => match[1],
  );
  assert.equal(titles.length, 52);
  assert.equal((html.match(/class="changelog-dot"/g) ?? []).length, titles.length);
  assert.equal((html.match(/class="changelog-term"/g) ?? []).length, 1);

  // Four releases shipped under a version and print it as a chip; the other
  // seven lead with the date chip alone. Every release carries a date chip.
  assert.equal((html.match(/class="changelog-version"/g) ?? []).length, 4);
  for (const version of [
    "Android 0.10.0-beta.1",
    "0.10.0-beta.1",
    "0.9.0-beta.1",
    "0.1.0 to 0.8.0-beta.6",
  ]) {
    assert.ok(
      html.includes(`class="changelog-version">${version}</span>`),
      `missing version chip ${version}`,
    );
  }
  assert.equal((html.match(/class="changelog-date"/g) ?? []).length, 11);

  // No headline sentence anywhere: the old page led each release with one, and
  // the rail replaced it with the version and the date.
  assert.doesNotMatch(html, /changelog-headline/);
  assert.doesNotMatch(html, /Coaches you can actually book/);

  // A change title names a feature in a few words, and the body under it keeps
  // the numbers the old bullet carried.
  assert.match(html, /Seat map for every coach class/);
  assert.match(html, /all fifteen classes reach the seat step/);
  assert.match(html, /Pass settles the fare/);
  assert.match(html, /Android download page/);
  // A few words naming a feature, never a sentence. Six is the ceiling because
  // "Seat map for every coach class" is six and is the shape being asked for;
  // anything longer has started arguing rather than naming.
  for (const title of titles) {
    const words = title.trim().split(/\s+/).length;
    assert.ok(words >= 2 && words <= 6, `title is not a short feature name: ${title}`);
    assert.doesNotMatch(title, /[.!?]$/, `title reads as a sentence: ${title}`);
  }

  // Newest release first, oldest last.
  const newest = html.indexOf("Android download page");
  const oldest = html.indexOf("A native Kotlin Android app");
  assert.ok(newest > -1 && oldest > -1 && newest < oldest);
  assert.match(html, /Android 0\.10\.0-beta\.1/);
  assert.match(html, /class="changelog-latest-tag"/);

  // The specimen badges the app prints verbatim survive as <code>.
  assert.match(html, /<code>SYNTHETIC ACCESS DATA - NOT SURVEYED<\/code>/);

  // The 2026-09-05 change used to drop the noun and read "a senior whose
  // deliberately is not".
  assert.match(html, /a senior whose concession deliberately is not/);

  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test("links the changelog from the shared navigation", async () => {
  const html = await (await render()).text();
  assert.match(html, /href="\/changelog\/"/);
  assert.match(html, />Changelog</);
});

test("links the Android page from the footer", async () => {
  const html = await (await render()).text();
  const footerNav = html.match(/<nav aria-label="Footer navigation">[\s\S]*?<\/nav>/)?.[0];
  assert.ok(footerNav, "footer nav not found");
  assert.match(footerNav, /href="\/android\/"/);
  assert.match(footerNav, /Android app/);
});

test("trims the header and mobile nav to seven links, keeping the rest in the footer", async () => {
  const html = await (await render()).text();

  const desktopNav = html.match(/<nav class="desktop-nav"[^>]*>[\s\S]*?<\/nav>/)?.[0];
  const mobileNav = html.match(/<nav id="mobile-navigation"[\s\S]*?<\/nav>/)?.[0];
  const footerNav = html.match(/<nav aria-label="Footer navigation">[\s\S]*?<\/nav>/)?.[0];
  assert.ok(desktopNav, "desktop nav not found");
  assert.ok(mobileNav, "mobile nav not found");
  assert.ok(footerNav, "footer nav not found");

  // Instructions for judges, Android app and Fleet roster are already
  // reachable from the home hero (the first two) and from the Fleet page
  // (the third), so the header drops them.
  for (const dropped of [/href="\/judges\/"/, /href="\/android\/"/, /href="\/fleet-roster\/"/]) {
    assert.doesNotMatch(desktopNav, dropped);
    assert.doesNotMatch(mobileNav, dropped);
  }

  // What is left, in order, numbered 01 through 07 in the mobile nav.
  const kept = ["/changelog/", "/stickers/", "/mcp/", "/fleet/", "/emission/", "/sample-users/", "/contact/"];
  for (const href of kept) {
    assert.match(desktopNav, new RegExp(`href="${href.replace(/\//g, "\\/")}"`));
  }
  kept.forEach((href, index) => {
    const number = String(index + 1).padStart(2, "0");
    assert.match(
      mobileNav,
      new RegExp(`href="${href.replace(/\//g, "\\/")}"[^<]*>[^<]*<span>${number}</span>`),
    );
  });

  // The footer keeps the full ten-link list.
  for (const href of ["/judges/", "/android/", "/fleet-roster/", ...kept]) {
    assert.match(footerNav, new RegExp(`href="${href.replace(/\//g, "\\/")}"`));
  }
});
