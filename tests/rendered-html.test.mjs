import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://tatak.example/", {
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
  assert.match(html, /<title>Tatak — One honest journey across Bengaluru<\/title>/i);
  assert.match(html, /Every bus\./);
  assert.match(html, /Every metro\./);
  assert.match(html, /One honest journey\./);
  assert.match(html, /Hebbala to Indiranagar/);
  assert.match(html, /The whole journey/);
  assert.match(html, /ಹೆಬ್ಬಾಳ/);
  assert.match(html, /https:\/\/tatak\.example\/og-editorial\.png/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Starter Project/i);
});

test("ships the product stage and accessible interaction structure", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /class="[^"]*scroll-world[^"]*"/);
  assert.match(html, /data-world-step="0"/);
  assert.match(html, /aria-label="Explore Tatak through Bengaluru"/);
  assert.match(html, /\/tatak-world\.png/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /aria-controls="mobile-navigation"/);
  assert.match(html, /aria-label="Journey ranking preference"/);
  assert.match(html, /aria-controls="journey-proof"/);
  assert.match(html, /See how Tatak knows/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});
