import type { Metadata } from "next";
import { qrMatrix, qrSvgRects } from "../stickers/qr";
import { AndroidPage } from "./android";
import { DOWNLOAD_URL } from "./build";

export const metadata: Metadata = {
  title: "Get the Android app - Tatak",
  description:
    "Download the Tatak Android APK: the version, the size, the SHA-256 to check it against, and the three prompts Android shows while sideloading a debug-signed build.",
};

// Encoded here rather than in the page component so the QR encoder runs once,
// at build time, on the server, and never ships to a browser. The component
// receives the finished <rect> runs and the module count, which is all it
// needs to draw the symbol.
const matrix = qrMatrix(DOWNLOAD_URL);

export default function Android() {
  return <AndroidPage qrRects={qrSvgRects(matrix)} qrSize={matrix.length} />;
}
