import type { Metadata } from "next";
import { ChangelogPage } from "./changelog";

export const metadata: Metadata = {
  title: "Changelog - Tatak",
  description:
    "Every Tatak release, newest first: the Android build, statewide coach booking, passes, carbon on the ticket, accounts and the first search, each one written as what changed for a rider.",
};

export default function Changelog() {
  return <ChangelogPage />;
}
