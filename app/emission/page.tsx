import type { Metadata } from "next";
import { EmissionPage } from "./emission";

export const metadata: Metadata = {
  title: "How the emission figure is worked out - Tatak",
  description:
    "The published factors, the straight-line distance and the tree comparison behind the kilogram of CO2 a Tatak ticket says a journey avoided.",
};

export default function Emission() {
  return <EmissionPage />;
}
