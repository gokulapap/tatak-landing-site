import type { Metadata } from "next";
import { FleetPage } from "./fleet";

export const metadata: Metadata = {
  title: "Every vehicle Tatak plans over - Tatak",
  description:
    "Six intercity coach classes, three tiers of BMTC city bus and three metro lines: what each one is, how it is boarded, and what it costs relative to the others.",
};

export default function Fleet() {
  return <FleetPage />;
}
