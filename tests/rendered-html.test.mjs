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
    /<title>Tatak — One search for every way across Bengaluru<\/title>/i,
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
  assert.match(html, /Purple, Green and Yellow/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});
