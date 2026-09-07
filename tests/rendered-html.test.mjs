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

  // The hero's second call to action points at the judges walkthrough now,
  // not at the in-page #journey anchor it used to scroll to.
  assert.match(html, /href="\/judges\/"/);
  assert.match(html, /Instructions for judges/);
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
