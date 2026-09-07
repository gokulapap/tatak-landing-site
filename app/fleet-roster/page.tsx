import type { Metadata } from "next";
import { FleetRosterPage } from "./fleet-roster";

export const metadata: Metadata = {
  title: "Fleet roster - Tatak",
  description:
    "Every vehicle Tatak's fixture fleet tracks: 644 BMTC buses across 69 routes and 169 intercity coaches across 12 corridors, generated from the simulator's own fleet code, not hand-typed.",
};

export default function FleetRoster() {
  return <FleetRosterPage />;
}
