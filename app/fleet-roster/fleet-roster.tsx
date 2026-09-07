"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteFooter, SiteHeader, publicAsset, useRevealAnimations } from "../site-chrome";
import fleetData from "../../data/fleet.json";

type Bus = { bin: string; plate: string; route: string; tier: string };
type Coach = {
  bin: string;
  plate: string;
  corridor: string;
  corporation: string;
  corporationName: string;
  serviceClass: string;
  serviceClassName: string;
};

const buses = fleetData.buses as Bus[];
const coaches = fleetData.coaches as Coach[];

// The same board flow every QR sticker on /stickers/ opens - see
// app/stickers/stickers.tsx's BOARD_URL. A BIN here links out to it rather
// than this page claiming to know whether that vehicle is on the road.
const BOARD_URL = "https://app.tatak.tech/board";

// The fleet service's own resolve endpoint - the one /stickers/ and the
// board flow both read from. Cross-origin reads are allowed
// (access-control-allow-origin: *, confirmed against fleet.tatak.tech), but
// this page only ever calls it for the seven demo picks below: 813 requests
// on page load would be a bad citizen of that API for a number nobody
// scrolling the roster asked for, and duty status changes minute to minute
// regardless, so a baked-in number would go stale before this page's own
// cache does.
const RESOLVE_URL = "https://fleet.tatak.tech/fleet/resolve";

// The seven codes printed on Tatak's sticker sheets (docs: BMTC sheet and
// Karnataka Sarige sheet), in the order the task that added this page named
// them. These are not derived from the generated data - they are a fact
// about what got printed, the same literals app/stickers/stickers.tsx mints
// its stickers from.
const DEMO_PICKS: readonly { readonly bin: string; readonly sheet: string }[] = [
  { bin: "BLR-05465", sheet: "BMTC sheet" },
  { bin: "BLR-08484", sheet: "BMTC sheet" },
  { bin: "BLR-07408", sheet: "BMTC sheet" },
  { bin: "HUB-01181", sheet: "Karnataka Sarige sheet" },
  { bin: "MYS-01010", sheet: "Karnataka Sarige sheet" },
  { bin: "KBS-01032", sheet: "Karnataka Sarige sheet" },
  { bin: "MDK-01010", sheet: "Karnataka Sarige sheet" },
];

const DEMO_BINS = new Set(DEMO_PICKS.map((pick) => pick.bin));

type ResolveState =
  | { readonly kind: "loading" }
  | { readonly kind: "error" }
  | { readonly kind: "ok"; readonly trackingState: string; readonly dutyStatus: string };

/**
 * Fires the seven demo picks at `/fleet/resolve` once, in the browser, and
 * degrades to a muted "unavailable" pill rather than a broken page whenever
 * the fleet service is asleep, slow or unreachable - it is a demo fixture,
 * not a production dependency this page can lean on.
 */
function useDemoLiveStatus(bins: readonly string[]): Record<string, ResolveState> {
  const [statuses, setStatuses] = useState<Record<string, ResolveState>>(() =>
    Object.fromEntries(bins.map((bin) => [bin, { kind: "loading" as const }])),
  );

  useEffect(() => {
    let cancelled = false;

    for (const bin of bins) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      fetch(`${RESOLVE_URL}?code=${encodeURIComponent(bin)}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error(`resolve ${bin}: ${response.status}`);
          return response.json();
        })
        .then((body) => {
          if (cancelled) return;
          const trackingState = body?.tracking?.state;
          const dutyStatus = body?.duty?.status;
          if (typeof trackingState !== "string" || typeof dutyStatus !== "string") {
            throw new Error(`resolve ${bin}: unexpected shape`);
          }
          setStatuses((previous) => ({ ...previous, [bin]: { kind: "ok", trackingState, dutyStatus } }));
        })
        .catch(() => {
          if (cancelled) return;
          setStatuses((previous) => ({ ...previous, [bin]: { kind: "error" } }));
        })
        .finally(() => clearTimeout(timeout));
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bins.join(",")]);

  return statuses;
}

function LivePill({ state }: { state: ResolveState | undefined }) {
  if (state === undefined || state.kind === "loading") {
    return <span className="live-pill is-muted">Checking&hellip;</span>;
  }
  if (state.kind === "error") {
    return <span className="live-pill is-muted">Live status unavailable</span>;
  }
  if (state.trackingState === "live") {
    return (
      <span className="live-pill is-live">
        <i aria-hidden="true" />On the road
      </span>
    );
  }
  if (state.trackingState === "stale" || state.trackingState === "dark") {
    return (
      <span className="live-pill is-stale">
        <i aria-hidden="true" />Signal {state.trackingState}
      </span>
    );
  }
  return (
    <span className="live-pill is-muted">
      <i aria-hidden="true" />
      {state.dutyStatus === "out_of_service" ? "Off duty" : "Not tracked"}
    </span>
  );
}

function matchText(query: string, ...values: readonly string[]): boolean {
  if (query === "") return true;
  return values.some((value) => value.toLowerCase().includes(query));
}

/** First-seen order, so groups render in the same order the generator wrote them in - route number order for buses, corridor id order for coaches. */
function orderedKeys<T>(rows: readonly T[], keyOf: (row: T) => string): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const row of rows) {
    const key = keyOf(row);
    if (!seen.has(key)) {
      seen.add(key);
      order.push(key);
    }
  }
  return order;
}

export function FleetRosterPage() {
  useRevealAnimations();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const demoStatuses = useDemoLiveStatus(DEMO_PICKS.map((pick) => pick.bin));

  const busByBin = useMemo(() => new Map(buses.map((bus) => [bus.bin, bus])), []);
  const coachByBin = useMemo(() => new Map(coaches.map((coach) => [coach.bin, coach])), []);

  const filteredBuses = useMemo(
    () => buses.filter((bus) => matchText(normalizedQuery, bus.bin, bus.plate, bus.route, bus.tier)),
    [normalizedQuery],
  );
  const filteredCoaches = useMemo(
    () =>
      coaches.filter((coach) =>
        matchText(
          normalizedQuery,
          coach.bin,
          coach.plate,
          coach.corridor,
          coach.corporation,
          coach.corporationName,
          coach.serviceClassName,
        ),
      ),
    [normalizedQuery],
  );

  const busRoutes = useMemo(() => orderedKeys(filteredBuses, (bus) => bus.route), [filteredBuses]);
  const coachCorridors = useMemo(() => orderedKeys(filteredCoaches, (coach) => coach.corridor), [filteredCoaches]);

  const searching = normalizedQuery !== "";
  const totalMatches = filteredBuses.length + filteredCoaches.length;

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <SiteHeader />

      <section className="fleet-roster-page route-section" id="main-content" aria-labelledby="fleet-roster-title">
        <header className="section-intro compact" data-reveal>
          <div className="section-label"><span>01</span> Fleet roster</div>
          <h1 id="fleet-roster-title">Every vehicle in the fixture fleet.</h1>
          <p>
            {buses.length} BMTC buses across {busRoutesTotal()} routes and {coaches.length} intercity coaches
            across {coachCorridorsTotal()} corridors - the full roster the fleet simulator tracks, generated
            straight from its own fleet-generation code rather than typed out by hand. See{" "}
            <code>scripts/generate-fleet-data.mts</code> for exactly how, and how to re-run it.
          </p>
        </header>

        <p className="mcp-note" data-reveal>
          This is the roster, not a live map. Every BIN below is a real, deterministically generated vehicle
          identity - what to reach for when you need a bus or coach for a demo - but which of them is actually
          out on a duty changes minute to minute, and this page does not bake that in as a fact it cannot keep
          current. The seven demo picks below check their own live status when the page loads; nothing else on
          this page does. Tap any BIN to open it in Tatak&apos;s board flow, the same one every QR sticker opens.
        </p>

        <h2 className="page-subhead" data-reveal>Demo picks</h2>
        <p className="fleet-copy" data-reveal>
          The seven codes printed on Tatak&apos;s sticker sheets - see <a href={publicAsset("/stickers/")}>QR
          stickers</a> for the printed versions. These are the ones worth reaching for on camera.
        </p>
        <div className="fleet-table-wrap" data-reveal>
          <table className="fleet-table">
            <caption>Printed sticker sheet vehicles</caption>
            <thead>
              <tr>
                <th scope="col">BIN</th>
                <th scope="col">Sheet</th>
                <th scope="col">Plate</th>
                <th scope="col">Route / corridor</th>
                <th scope="col">Class / tier</th>
                <th scope="col">Live status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_PICKS.map((pick) => {
                const bus = busByBin.get(pick.bin);
                const coach = coachByBin.get(pick.bin);
                const vehicle = bus ?? coach;
                return (
                  <tr key={pick.bin}>
                    <th scope="row">
                      <a href={`${BOARD_URL}?code=${pick.bin}`} target="_blank" rel="noreferrer">
                        {pick.bin}
                      </a>
                    </th>
                    <td>{pick.sheet}</td>
                    <td>{vehicle?.plate ?? "Unknown"}</td>
                    <td>{bus ? bus.route : coach ? coach.corridor : "Unknown"}</td>
                    <td>{bus ? bus.tier : coach ? coach.serviceClassName : "Unknown"}</td>
                    <td><LivePill state={demoStatuses[pick.bin]} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h2 className="page-subhead" data-reveal>Search the roster</h2>
        <div className="roster-search" data-reveal>
          <label htmlFor="roster-query" className="roster-search-label">Search by BIN, plate, route, corridor, tier or class</label>
          <input
            id="roster-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. BLR-0546, 500-D, Airavat, KKRTC"
            autoComplete="off"
          />
          <span className="roster-search-count">
            {searching ? `${totalMatches} of ${buses.length + coaches.length}` : `${buses.length + coaches.length} vehicles`}
          </span>
        </div>

        <h2 className="page-subhead" data-reveal>BMTC city buses</h2>
        <p className="fleet-copy" data-reveal>
          Grouped by route. Tier is read off the route number the way the app reads it: no prefix is Ordinary,{" "}
          <code>V-</code>/<code>VW-</code> is Vajra (AC), <code>KIA-</code> is Vayu Vajra (airport).
        </p>
        {busRoutes.length === 0 ? (
          <p className="fleet-copy" data-reveal>No routes match &ldquo;{query}&rdquo;.</p>
        ) : (
          busRoutes.map((route) => {
            const rows = filteredBuses.filter((bus) => bus.route === route);
            const tier = rows[0]?.tier ?? "";
            return (
              <details key={`${route}-${searching ? "open" : "closed"}`} className="roster-group" open={searching} data-reveal>
                <summary>
                  <strong>{route}</strong>
                  <span className="fleet-tag">{tier}</span>
                  <small>{rows.length} bus{rows.length === 1 ? "" : "es"}</small>
                </summary>
                <div className="fleet-table-wrap">
                  <table className="fleet-table">
                    <thead>
                      <tr>
                        <th scope="col">BIN</th>
                        <th scope="col">Plate</th>
                        <th scope="col">Demo pick</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((bus) => (
                        <tr key={bus.bin}>
                          <th scope="row">
                            <a href={`${BOARD_URL}?code=${bus.bin}`} target="_blank" rel="noreferrer">{bus.bin}</a>
                          </th>
                          <td>{bus.plate}</td>
                          <td>{DEMO_BINS.has(bus.bin) ? <span className="roster-demo-star" title="On the printed sticker sheet">&#9733;</span> : null}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })
        )}

        <h2 className="page-subhead" data-reveal>Intercity coaches</h2>
        <p className="fleet-copy" data-reveal>
          Grouped by corridor. Class and operator are per coach, not per corridor - a corridor runs several
          service classes and, on a bidirectional corridor, a second operator on the reverse leg.
        </p>
        {coachCorridors.length === 0 ? (
          <p className="fleet-copy" data-reveal>No corridors match &ldquo;{query}&rdquo;.</p>
        ) : (
          coachCorridors.map((corridor) => {
            const rows = filteredCoaches.filter((coach) => coach.corridor === corridor);
            return (
              <details key={`${corridor}-${searching ? "open" : "closed"}`} className="roster-group" open={searching} data-reveal>
                <summary>
                  <strong>{corridor}</strong>
                  <small>{rows.length} coach{rows.length === 1 ? "" : "es"}</small>
                </summary>
                <div className="fleet-table-wrap">
                  <table className="fleet-table">
                    <thead>
                      <tr>
                        <th scope="col">BIN</th>
                        <th scope="col">Plate</th>
                        <th scope="col">Class</th>
                        <th scope="col">Operator</th>
                        <th scope="col">Demo pick</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((coach) => (
                        <tr key={coach.bin}>
                          <th scope="row">
                            <a href={`${BOARD_URL}?code=${coach.bin}`} target="_blank" rel="noreferrer">{coach.bin}</a>
                          </th>
                          <td>{coach.plate}</td>
                          <td>{coach.serviceClassName}</td>
                          <td>{coach.corporation}</td>
                          <td>{DEMO_BINS.has(coach.bin) ? <span className="roster-demo-star" title="On the printed sticker sheet">&#9733;</span> : null}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })
        )}

        <p className="mcp-note" data-reveal>
          Every BIN on this page is generated, not typed - <code>data/fleet.json</code> is the committed output
          of <code>scripts/generate-fleet-data.mts</code>, which imports the fleet simulator&apos;s own{" "}
          <code>generateFleet</code> and <code>generateCoachFleet</code> rather than reimplementing them. Re-run
          it whenever the route list, corridor list or seed changes, and this page changes with it.
        </p>

        <a className="contact-back" href={publicAsset("/")}><span aria-hidden="true">&larr;</span> Back to Tatak</a>
      </section>

      <SiteFooter />
    </main>
  );
}

function busRoutesTotal(): number {
  return new Set(buses.map((bus) => bus.route)).size;
}

function coachCorridorsTotal(): number {
  return new Set(coaches.map((coach) => coach.corridor)).size;
}
