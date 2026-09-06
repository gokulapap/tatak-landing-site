import type { Metadata } from "next";
import { StickersPage } from "./stickers";

export const metadata: Metadata = {
  title: "QR stickers - Tatak",
  description:
    "Sample QR stickers for BMTC and intercity boarding, grouped by every service class Tatak's fleet data covers. Moved here from app.tatak.tech so the sticker sheets live with the rest of the site.",
};

export default function Stickers() {
  return <StickersPage />;
}
