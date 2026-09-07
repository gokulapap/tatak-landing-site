// Regenerates data/fleet.json - the full roster behind /fleet-roster/ -
// from the transit-fleet-sim simulator's own fleet-generation code, rather
// than by hand-typing 813 rows that would be wrong the moment the fleet
// config changes.
//
// WHAT THIS RUNS
//
// This mirrors the exact boot sequence `transit-fleet-sim`'s own
// `src/index.ts` runs to build the live fleet:
//
//   loadGtfs -> computeRouteRosterSizes -> generateFleet          (buses)
//   loadIntercity -> coachSlotsFor -> generateCoachFleet          (coaches)
//
// by importing those functions directly from the simulator's source, rather
// than reimplementing (and risking drifting from) their logic here. It does
// not probe the live fleet.tatak.tech HTTP API - that would mean 813 requests
// for data the simulator can produce locally and deterministically from the
// same seed.
//
// PRODUCTION CONFIG THIS WAS GENERATED FROM
//
// The five environment variables below were captured from the running
// service. They are the only fleet-shaping inputs that are not the
// simulator's own defaults (everything else - BUS_ROSTER_MIN_PER_ROUTE,
// BUS_TERMINAL_LAYOVER_SECONDS, INTERCITY_ROSTER_DAYS, and so on - is left
// at whatever `transit-fleet-sim/src/config.ts` defaults to, exactly as
// production leaves it). SIM_SEED makes every plate and hub-serial pairing
// reproducible; BUS_ROUTES/BUSES_PER_ROUTE size the BMTC roster (actual
// per-route counts come from each route's real GTFS timetable, not a flat
// count - see computeRouteRosterSizes); INTERCITY_CORRIDORS selects which of
// the simulator's corridors run coaches at all.
//
// HOW TO RE-RUN THIS
//
// This script imports `transit-fleet-sim`'s TypeScript source directly, so
// it has to run under that project's own `tsx`, with that project's
// directory as the working directory (its config resolves `data/bundle/...`
// relative to `process.cwd()`). From a checkout of transit-fleet-sim next to
// this repo:
//
//   cd /path/to/transit-fleet-sim && \
//   BUS_ROUTES="<paste from PROD_CONFIG.BUS_ROUTES below, comma-joined>" \
//   BUSES_PER_ROUTE=6 \
//   INTERCITY_CORRIDORS="BNG-HSP,BNG-MYS,BNG-MNG,BNG-CKM,MYS-MDK,MYS-MNG,MNG-KWR,DND-ANK,BNG-BJP,BNG-BDM,BNG-BGK,BNG-HBL" \
//   SIM_SEED=1 \
//   METRO_LINES="purple,green,yellow" \
//   npx tsx /path/to/tatak-landing-site/scripts/generate-fleet-data.mts \
//     /path/to/transit-fleet-sim > /path/to/tatak-landing-site/data/fleet.json
//
// The first CLI argument is the transit-fleet-sim checkout to import from;
// it defaults to `../transit-fleet-sim` (a sibling checkout) when omitted.
// Re-run this whenever BUS_ROUTES, BUSES_PER_ROUTE, INTERCITY_CORRIDORS,
// SIM_SEED or the simulator itself changes, and commit the resulting
// data/fleet.json alongside this script.
//
// This file was generated against transit-fleet-sim commit
// 7910041ea6b9251123d4a300d69f2f093de7b6a6, run from
// /Users/srivathsanv/Documents/Personal/transit-fleet-sim.

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const PROD_CONFIG = {
  SIM_SEED: 1,
  BUSES_PER_ROUTE: 6,
  BUS_ROUTES: [
    "335-E", "401-K", "500-A", "500-AD", "500-BA", "500-BC", "500-C", "500-CA",
    "500-CD", "500-CF", "500-CH", "500-CK", "500-CS", "500-D", "500-DG",
    "500-DJ", "500-EB", "500-F", "500-FB", "500-HC", "500-HG", "500-HK",
    "500-J", "500-L", "500-LA", "500-Q", "500-QA", "500-QB", "500-QD",
    "500-QG", "500-QK", "500-QN", "500-QP", "500-TA", "G-4", "KIA-10",
    "KIA-15", "KIA-15A", "KIA-4", "KIA-4A", "KIA-7", "KIA-7A", "KIA-8",
    "KIA-8A", "KIA-8C", "KIA-8D", "KIA-8E", "KIA-8EW", "KIA-8H", "KIA-9",
    "V-331A", "V-333E", "V-335E", "V-342F", "V-500A", "V-500BC", "V-500CA",
    "V-500CK", "V-500D", "V-500DP", "V-500E", "V-500F", "V-500FA", "V-500HS",
    "V-500L", "V-MF1C", "V-MF1D", "V-MF6", "VW-226HSR",
  ],
  INTERCITY_CORRIDORS: [
    "BNG-HSP", "BNG-MYS", "BNG-MNG", "BNG-CKM", "MYS-MDK", "MYS-MNG",
    "MNG-KWR", "DND-ANK", "BNG-BJP", "BNG-BDM", "BNG-BGK", "BNG-HBL",
  ],
  METRO_LINES: ["purple", "green", "yellow"],
};

process.env.SIM_SEED = String(PROD_CONFIG.SIM_SEED);
process.env.BUSES_PER_ROUTE = String(PROD_CONFIG.BUSES_PER_ROUTE);
process.env.BUS_ROUTES = PROD_CONFIG.BUS_ROUTES.join(",");
process.env.INTERCITY_CORRIDORS = PROD_CONFIG.INTERCITY_CORRIDORS.join(",");
process.env.METRO_LINES = PROD_CONFIG.METRO_LINES.join(",");

// The shape this script actually reads off a FleetVehicle (see
// transit-fleet-sim's src/fleet/registry.ts for the real interface) - kept
// local rather than imported so the type import does not itself require a
// hardcoded simulator path.
interface GeneratedVehicle {
  readonly bin: string;
  readonly corporation?: string | null;
  readonly serviceClass?: string | null;
  readonly homeRouteNumber: string;
  readonly plates: readonly { readonly display: string }[];
}

interface RouteRosterSize {
  readonly routeNumber: string;
  readonly vehicles: number;
}

const simulatorPath = resolve(process.argv[2] ?? "../transit-fleet-sim");
const src = (path: string) => pathToFileURL(resolve(simulatorPath, "src", path)).href;

const { config } = await import(src("config.js"));
const { generateCoachFleet, generateFleet } = await import(src("fleet/generate.js"));
const { CORPORATION_NAMES } = await import(src("fleet/corporation.js"));
const { serviceClassById } = await import(src("fleet/serviceClass.js"));
const { loadGtfs } = await import(src("geometry/loadGtfs.js"));
const { computeRouteRosterSizes } = await import(src("sim/busRoster.js"));
const { createClock } = await import(src("sim/clock.js"));
const { defaultScheduleProfile } = await import(src("sim/coachProfiles.js"));
const { coachSlotsFor, loadIntercity } = await import(src("sim/world.js"));

// BMTC's three service tiers, read off the route number's own prefix - the
// same rule `app/fleet/fleet.tsx` and `app/stickers/stickers.tsx` document:
// no prefix is Ordinary, `V-`/`VW-` is the AC service (Vajra), `KIA-` is the
// airport coach (Vayu Vajra). Not something the simulator's fleet records
// carry per vehicle (a bus only carries its route number), so it is derived
// here rather than invented per row.
function busTier(route: string): string {
  if (route.startsWith("KIA-")) return "Airport (Vayu Vajra)";
  if (route.startsWith("V-") || route.startsWith("VW-")) return "AC (Vajra)";
  return "Ordinary";
}

const gtfs = await loadGtfs();
const busRosterSizes = computeRouteRosterSizes(gtfs, config.busRoutes, {
  turnaroundSeconds: config.busTerminalLayoverSeconds,
  minimumPerRoute: config.busRosterMinPerRoute,
  scale: config.busRosterScale,
});
const usedPlates = new Set<string>();
const generatedBuses: readonly GeneratedVehicle[] = generateFleet({
  usedPlates,
  busesPerRouteByRoute: new Map(
    [...(busRosterSizes as Map<string, RouteRosterSize>).values()].map((size) => [
      size.routeNumber,
      size.vehicles,
    ]),
  ),
});

const intercity = await loadIntercity();
const generatedCoaches: readonly GeneratedVehicle[] =
  intercity === null
    ? []
    : generateCoachFleet({
        usedPlates,
        slots: coachSlotsFor(
          intercity,
          config.intercityCorridors,
          createClock(config.simClock).now(),
          config.intercityRosterDays,
          defaultScheduleProfile,
        ),
      });

const buses = generatedBuses
  .map((vehicle) => ({
    bin: vehicle.bin,
    plate: vehicle.plates[0]!.display,
    route: vehicle.homeRouteNumber,
    tier: busTier(vehicle.homeRouteNumber),
  }))
  .sort((a, b) => a.route.localeCompare(b.route) || a.bin.localeCompare(b.bin));

const coaches = generatedCoaches
  .map((vehicle) => {
    const corporation = vehicle.corporation ?? "";
    const serviceClass = serviceClassById(vehicle.serviceClass);
    return {
      bin: vehicle.bin,
      plate: vehicle.plates[0]!.display,
      corridor: vehicle.homeRouteNumber,
      corporation,
      corporationName: CORPORATION_NAMES[corporation as keyof typeof CORPORATION_NAMES] ?? corporation,
      serviceClass: vehicle.serviceClass ?? "",
      serviceClassName: serviceClass?.name ?? vehicle.serviceClass ?? "",
    };
  })
  .sort((a, b) => a.corridor.localeCompare(b.corridor) || a.bin.localeCompare(b.bin));

const output = {
  generatedAt: new Date().toISOString(),
  source: {
    simulator: "transit-fleet-sim",
    simulatorCommit: "7910041ea6b9251123d4a300d69f2f093de7b6a6",
    generatedFrom: "scripts/generate-fleet-data.mts",
    config: PROD_CONFIG,
  },
  counts: {
    buses: buses.length,
    coaches: coaches.length,
    routes: new Set(buses.map((b) => b.route)).size,
    corridors: new Set(coaches.map((c) => c.corridor)).size,
  },
  buses,
  coaches,
};

process.stdout.write(JSON.stringify(output, null, 2) + "\n");
process.stderr.write(
  `fleet data: ${output.counts.buses} buses / ${output.counts.routes} routes, ` +
    `${output.counts.coaches} coaches / ${output.counts.corridors} corridors\n`,
);
