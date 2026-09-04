import type { Metadata } from "next";
import { ContactPage } from "./contact";

export const metadata: Metadata = {
  title: "Contact - Tatak",
  description: "Reach the people building Tatak.",
};

export default function Contact() {
  return <ContactPage />;
}
