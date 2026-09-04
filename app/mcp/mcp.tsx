"use client";

import { AppLink, CONTACT_EMAIL, SiteFooter, SiteHeader, publicAsset, useRevealAnimations } from "../site-chrome";

const mcpTools = [
  {
    id: "plan",
    label: "Plan a trip",
    prompt: "Plan a trip from Indiranagar to Jayanagar.",
  },
  {
    id: "last-service",
    label: "Last service home",
    prompt: "What's the last service from MG Road to Whitefield tonight?",
  },
  {
    id: "meet",
    label: "Meet in the middle",
    prompt: "I'm in HSR Layout, a friend is in Hebbal. Where should we meet?",
  },
];

// The nine tools and the question each one answers, in the order
// docs/CONNECT-MCP.md lists them.
const toolCatalogue = [
  { name: "plan_journey", answers: "A to B by bus and metro" },
  { name: "next_departures", answers: "What leaves one stop next" },
  { name: "describe_route", answers: "What a route does, terminal to terminal" },
  { name: "last_service_home", answers: "The last service of the day on a journey" },
  { name: "plan_to_airport", answers: "To or from Kempegowda International" },
  { name: "stops_near_place", answers: "Stops within walking range of a named place" },
  { name: "when_should_i_leave", answers: "Works backwards from an arrival time" },
  { name: "reachable_within", answers: "Where you can get to inside a time budget" },
  { name: "meet_in_the_middle", answers: "Somewhere two people can both reach" },
];

const desktopConfig = `{
  "mcpServers": {
    "tatak": {
      "type": "http",
      "url": "https://app.tatak.tech/api/mcp",
      "headers": { "Authorization": "Bearer YOUR-TOKEN" }
    }
  }
}`;

export function McpPage() {
  useRevealAnimations();

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <SiteHeader />

      <section className="mcp-page route-section" id="main-content" aria-labelledby="mcp-title">
        <header className="section-intro compact" data-reveal>
          <div className="section-label"><span>01</span> MCP server</div>
          <h1 id="mcp-title">Point any assistant <em>at the same planner.</em></h1>
          <p>Tatak&apos;s route planner is also an MCP server, so an AI assistant can query Bengaluru&apos;s bus and metro network on its own, without the app open. Nine read-only tools. None of them books, buys, holds or pays for anything.</p>
        </header>

        <div className="mcp-panel" data-reveal>
          <div className="mcp-field">
            <span>Endpoint</span>
            <div>
              <code>https://app.tatak.tech/api/mcp</code>
              <p>One <code>POST</code> per JSON-RPC message, over the Streamable HTTP transport. A client that only speaks stdio needs a bridge such as <code>mcp-remote</code>; this server is HTTP only and has no stdio mode.</p>
            </div>
          </div>
          <div className="mcp-field">
            <span>Authorization</span>
            <p>Send the token as <code>Authorization: Bearer &lt;token&gt;</code> or as <code>x-api-key: &lt;token&gt;</code>. claude.ai&apos;s custom connector form reserves the Authorization header for its own sign-in, so use <code>x-api-key</code> there.</p>
          </div>
          <div className="mcp-field">
            <span>Claude Code</span>
            <pre className="mcp-code"><code>{`claude mcp add --transport http tatak https://app.tatak.tech/api/mcp \\
  --header "Authorization: Bearer YOUR-TOKEN"`}</code></pre>
          </div>
          <div className="mcp-field">
            <span>Claude Desktop</span>
            <div>
              <pre className="mcp-code"><code>{desktopConfig}</code></pre>
              <p>Any client that takes a JSON config takes this shape.</p>
            </div>
          </div>
          <div className="mcp-field">
            <span>Connecting from claude.ai</span>
            <ol className="mcp-steps">
              <li>Add a custom connector with the endpoint above.</li>
              <li>Choose “None” for the OAuth client - the form recommends it for a server that uses an API key.</li>
              <li>Add a header named <code>x-api-key</code> and paste the token as its value.</li>
            </ol>
          </div>
          <div className="mcp-field mcp-token-field">
            <span>Token</span>
            <code className="mcp-token">Issued by email. Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> for one.</code>
          </div>
          <div className="mcp-field">
            <span>If it answers 503</span>
            <p>The endpoint is gated by <code>MCP_ENABLED</code>, which defaults to off. With the flag unset or false a deployment answers <code>503 mcp-disabled</code> before it reads the body, before it checks the token and before it loads the graph. With the flag on and no token configured it answers <code>mcp-unconfigured</code> and refuses everybody. Either way the switch is the operator&apos;s, not your client&apos;s.</p>
          </div>
          <p className="mcp-legacy">Older clients that speak the earlier 2024-11-05 HTTP+SSE transport have a fallback at <code>https://app.tatak.tech/api/mcp/sse</code>, though that endpoint isn&apos;t live in production yet. Everything else about it is the same: same flag, same token, same nine tools.</p>
        </div>

        <h2 className="page-subhead" data-reveal>Ask it like this</h2>
        <div className="mcp-tool-grid">
          {mcpTools.map((tool) => (
            <article className="mcp-tool" key={tool.id} data-reveal>
              <small>{tool.label}</small>
              <p>“{tool.prompt}”</p>
            </article>
          ))}
        </div>

        <h2 className="page-subhead" data-reveal>The nine tools</h2>
        <dl className="tool-catalogue" data-reveal>
          {toolCatalogue.map((tool) => (
            <div className="tool-row" key={tool.name}>
              <dt><code>{tool.name}</code></dt>
              <dd>{tool.answers}</dd>
            </div>
          ))}
        </dl>

        <h2 className="page-subhead" data-reveal>Before you rely on it</h2>
        <ul className="note-list" data-reveal>
          <li><strong>No coordinates, ever.</strong> Every tool takes a place name and resolves it server-side. A tool that took a coordinate would copy the user&apos;s location into the assistant vendor&apos;s transcript as well as into this app.</li>
          <li><strong>A refusal is a successful result whose body says no</strong>, not a protocol error. An assistant should read and relay it rather than reporting that the tool failed. Ask about HSR Layout, which has more than one match in Bengaluru, and the answer names the candidates instead of picking one for you.</li>
          <li><strong>Estimated waits are never dressed as clock times.</strong> Where the feed publishes no timetable, a response says <code>not_published</code> and gives a frequency instead.</li>
          <li><strong>Rate limits arrive as tool results</strong>, carrying <code>retry_after_seconds</code>, not as HTTP 429. The per-key burst is small; an exploratory turn that calls many tools can reach it.</li>
          <li><strong>Live vehicle positions are deliberately not exposed.</strong> A tool response is a frozen snapshot whose age is already wrong by the time a model writes a sentence around it. Ask the app, not the assistant, where a bus is.</li>
        </ul>

        <p className="mcp-note" data-reveal>The same planner answers in the browser, with the live, published and estimated labels intact. <AppLink className="mcp-inline-link" label="Open Tatak" /></p>

        <a className="contact-back" href={publicAsset("/")}><span aria-hidden="true">←</span> Back to Tatak</a>
      </section>

      <SiteFooter />
    </main>
  );
}
