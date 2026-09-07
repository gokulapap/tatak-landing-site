import type { Metadata } from "next";
import { JudgesPage } from "./judges";

export const metadata: Metadata = {
  title: "Instructions for judges - Tatak",
  description:
    "Sample credentials and six walkthroughs, every one of them run on production today: scan a sticker and buy an on-board ticket, watch a Karnataka Sarige fare change with the alighting stop, plan a city or statewide journey, book a reserved seat to a real PNR, check a seat map, and browse the fleet roster.",
};

export default function Judges() {
  return <JudgesPage />;
}
